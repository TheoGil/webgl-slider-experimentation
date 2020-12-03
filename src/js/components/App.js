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
import lerp from "lerp";
import Tweakpane from "tweakpane";
import Stats from "stats-js";
import Slideshow from "./Slideshow";
import Text from "./Text";

const SCROLL_LERP_FACTOR = 0.075;
const SCROLL_LERP_THRESHOLD = 0.01;
const SCROLL_MULTIPLIER = 0.15;
const DEBUG = false;

class App {
  constructor() {
    console.clear();

    /**
     * Context binding
     */
    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
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
    this.scene.add(this.slideshow.mesh);

    this.text = new Text({
      width: this.width,
      height: this.height,
      anisotropy: this.renderer.capabilities.getMaxAnisotropy(),
    });
    this.scene.add(this.text);

    this.text.backCylinder.renderOrder = 0;
    this.slideshow.mesh.renderOrder = 1;
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
    this.postFX.onResize();
  }

  onMouseDown(e) {
    if (this.slideshow.activeSlide) {
      // If a slide is already opened and no transition is running, close active slide, no matter where user clicks
      this.slideshow.close();
    } else {
      // If no slide is open (default state) AND no transition is running, check if mouse is intersecting a slide during click
      if (!this.slideshow.hasTransitionRunning) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.intersects.length = 0;
        this.raycaster.intersectObjects(
          this.slideshow.children,
          true,
          this.intersects
        );

        // If a slide is clicked, open it
        if (this.intersects.length > 0) {
          this.slideshow.open(this.intersects[0].object);
        }
      }
    }
  }

  onScroll(e) {
    this.scroll = e.deltaY * SCROLL_MULTIPLIER;
    this.slideshow.scrollDirection = Math.sign(e.deltaY);
  }

  lerpScroll() {
    if (Math.abs(this.scroll) > SCROLL_LERP_THRESHOLD) {
      this.scroll = lerp(this.scroll, 0, SCROLL_LERP_FACTOR);
    } else {
      this.scroll = 0;
    }
  }

  render() {
    requestAnimationFrame(this.render);

    this.stats.begin();

    this.lerpScroll();

    this.text.update();
    this.slideshow.update(this.scroll);
    // this.postFX.update(this.scroll);
    this.slideshow.render();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }
}

export default App;
