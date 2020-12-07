import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Raycaster,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import VirtualScroll from "virtual-scroll";
import Tweakpane from "tweakpane";
import Stats from "stats-js";
import Slideshow from "./Slideshow";
import Text from "./Text";

const DEBUG = false;

class App {
  constructor() {
    console.clear();

    /**
     * Context binding
     */
    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.render = this.render.bind(this);
    // Note: virtual-scroll takes care of the context binding for the scroll events

    /**
     * Create stuff
     */
    this.init();
    this.setViewportDimensions();
    this.addObjects();
    this.setRendererSize();
    this.setCameraAspect();

    /**
     * Attach events listeners
     */
    window.addEventListener("resize", this.onResize, false);
    window.addEventListener("mousedown", this.onMouseDown, false);
    window.addEventListener("mousemove", this.onMouseMove, false);

    /**
     * Let's go
     */
    this.render();
  }

  init() {
    /**
     * Scene
     */
    this.scene = new Scene();

    /**
     * Renderer
     */
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("js-canvas"),
      antialias: false,
      sortObjects: false,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0xffffff);

    /**
     * Camera
     */
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 100;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enableZoom = false;

    /**
     * GUI
     */
    this.gui = new Tweakpane();
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    /**
     * Scroll handling
     */
    this.scroll = 0;
    this.scrollTarget = 0;
    this.vs = new VirtualScroll();
    this.vs.on(this.onScroll, this);

    /**
     * Mouse interaction
     */
    this.mouse = new Vector2();
    this.raycaster = new Raycaster();
    this.intersects = [];
  }

  addObjects() {
    if (DEBUG) {
      this.scene.add(
        new Mesh(
          new PlaneBufferGeometry(this.width, this.height, 4, 4),
          new MeshBasicMaterial({ color: 0x000000, wireframe: true })
        )
      );
    }

    this.slideshow = new Slideshow({
      renderer: this.renderer,
      camera: this.camera,
      viewportWidth: this.width,
      viewportHeight: this.height,
      gui: this.gui,
    });
    this.scene.add(this.slideshow.postProcessedMesh);

    this.text = new Text({
      width: this.width,
      height: this.height,
      anisotropy: this.renderer.capabilities.getMaxAnisotropy(),
      mask: this.slideshow.postProcessedTarget.texture,
    });
    this.scene.add(this.text);

    this.text.backCylinder.renderOrder = 0;
    this.slideshow.postProcessedMesh.renderOrder = 1;
    this.text.frontCylinder.renderOrder = 2;
  }

  setRendererSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setCameraAspect() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  setViewportDimensions() {
    const distance = this.camera.position.z;
    const aspect = window.innerWidth / window.innerHeight;
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    this.height = 2 * Math.tan(fovInRadians / 2) * distance;
    this.width = this.height * aspect;
  }

  onResize() {
    this.setRendererSize();
    this.setCameraAspect();
    this.setViewportDimensions();
    this.text.onResize(this.width, this.height);
    this.slideshow.onResize(this.width, this.height);
  }

  onMouseDown(e) {
    if (this.slideshow.activeSlide) {
      // If a slide is already opened and no transition is running, close active slide, no matter where user clicks
      this.slideshow.close();
    } else {
      // If user is hovering a slide AND no transition is running
      if (this.slideshow.hoveredSlide && !this.slideshow.hasTransitionRunning) {
        this.slideshow.open(this.slideshow.hoveredSlide);
      }
    }
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects.length = 0;
    this.raycaster.intersectObjects(
      this.slideshow.scene.children,
      true,
      this.intersects
    );

    this.slideshow.hoveredSlide =
      this.intersects.length > 0
        ? (this.hoveredSlide = this.intersects[0].object)
        : null;

    if (this.slideshow.hoveredSlide) {
      document.body.classList.add("hovering");
    } else {
      document.body.classList.remove("hovering");
    }
  }

  onScroll(e) {
    this.slideshow.onScroll(e);
  }

  render() {
    requestAnimationFrame(this.render);

    this.stats.begin();

    this.text.update();
    this.slideshow.update();
    this.slideshow.render();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }
}

export default App;
