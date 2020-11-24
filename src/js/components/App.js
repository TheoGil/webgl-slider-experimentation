import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Tweakpane from "tweakpane";
import DistortionPlane from "./DistortionPlane";

class App {
  constructor() {
    console.clear();

    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);

    this.gui = new Tweakpane();
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.setRendererSize();
    this.addObjects();

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
    new OrbitControls(this.camera, this.renderer.domElement);
  }

  initRenderer() {
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("js-canvas"),
      antialias: true,
    });
    this.renderer.setClearColor(0x263339);
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    this.setRendererSize();
    this.distortionPlane.onResize();
  }

  setRendererSize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addObjects() {
    this.distortionPlane = new DistortionPlane({
      camera: this.camera,
      gui: this.gui,
    });
    this.scene.add(this.distortionPlane);
  }

  render() {
    requestAnimationFrame(this.render);

    this.renderer.render(this.scene, this.camera);
  }
}

export default App;
