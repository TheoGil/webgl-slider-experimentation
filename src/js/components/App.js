import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  GridHelper,
  Vector2,
  Raycaster,
} from "three";
import VirtualScroll from "virtual-scroll";
import Tweakpane from "tweakpane";
import DistortionPlane from "./DistortionPlane";
import Slideshow from "./Slideshow";

const DEBUG = true;

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
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
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

    /**
     * GUI
     */
    this.gui = new Tweakpane();

    /**
     * Scroll handling
     */
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
    /*
    this.distortionPlane = new DistortionPlane({
      camera: this.camera,
      gui: this.gui,
    });
    this.scene.add(this.distortionPlane);
    */

    /**
     * Slideshow
     */
    this.slideshow = new Slideshow({
      viewportWidth: this.width,
      viewportHeight: this.height,
    });
    this.scene.add(this.slideshow);

    /**
     * Optional debug stuff
     */
    if (DEBUG) {
      const helper = new GridHelper(200, 20);
      helper.rotation.x = 1.5708;
      // this.scene.add(helper);
    }
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
    // this.distortionPlane.onResize();
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
    this.slideshow.onScroll(e);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
