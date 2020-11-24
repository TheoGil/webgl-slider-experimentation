import { Scene, PerspectiveCamera, WebGLRenderer, GridHelper } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import VirtualScroll from "virtual-scroll";
import Tweakpane from "tweakpane";
import DistortionPlane from "./DistortionPlane";
import Slideshow from "./Slideshow";

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);

    this.gui = new Tweakpane();

    this.vs = new VirtualScroll();
    this.vs.on(this.onScroll, this);

    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.setRendererSize();
    this.addObjects();

    const helper = new GridHelper(200, 20);
    helper.rotation.x = 1.5708;
    this.scene.add(helper);

    this.render();
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 100;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
  }

  initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("js-canvas"),
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff);
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    this.setRendererSize();
    // this.distortionPlane.onResize();
  }

  onScroll(e) {
    this.slideshow.onScroll(e);
  }

  setRendererSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addObjects() {
    /*
    this.distortionPlane = new DistortionPlane({
      camera: this.camera,
      gui: this.gui,
    });
    this.scene.add(this.distortionPlane);
    */
    this.slideshow = new Slideshow();
    this.scene.add(this.slideshow);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
