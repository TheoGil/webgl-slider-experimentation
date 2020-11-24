import { Scene, PerspectiveCamera, WebGLRenderer, GridHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import VirtualScroll from "virtual-scroll";
import Tweakpane from "tweakpane";
import DistortionPlane from "./DistortionPlane";
import Slideshow from "./Slideshow";

const DEBUG = true;

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);

    this.init();
    this.setRendererSize();
    this.setCameraAspect();

    window.addEventListener("resize", this.onResize);

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

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;

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
    this.slideshow = new Slideshow();
    this.scene.add(this.slideshow);

    /**
     * Optional debug stuff
     */
    if (DEBUG) {
      const helper = new GridHelper(200, 20);
      helper.rotation.x = 1.5708;
      this.scene.add(helper);
    }

    /**
     * GUI
     */
    this.gui = new Tweakpane();

    /**
     * Scroll handling
     */
    this.vs = new VirtualScroll();
    this.vs.on(this.onScroll, this);
  }

  setRendererSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setCameraAspect() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  onResize() {
    this.setRendererSize();
    this.setCameraAspect();
    // this.distortionPlane.onResize();
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
