import {
  WebGLRenderTarget,
  RGBFormat,
  Mesh,
  Scene,
  ShaderMaterial,
  PlaneBufferGeometry,
} from "three";
import map from "../helpers/map";

import vertexShader from "../../shaders/postfx/vertex.vert";
import fragmentShader from "../../shaders/postfx/fragment.frag";

const SEGMENTS = 25;
const DISTORTION_MAX = 50;
const SCROLL_MAX = 25;

class PostFX {
  constructor(options) {
    this.renderer = options.renderer;
    this.gui = options.gui;
    this.camera = options.camera.clone();

    this.scene = new Scene();

    this.target = new WebGLRenderTarget(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio,
      {
        format: RGBFormat,
        stencilBuffer: false,
        depthBuffer: true,
      }
    );

    this.geometry = new PlaneBufferGeometry(
      options.width,
      options.height,
      SEGMENTS,
      SEGMENTS
    );

    this.material = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        u_scene: { value: this.target.texture },
        u_distortionAmount: { value: 0 },
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);

    this.initGUI();
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.target.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
  }

  update(scroll) {
    const distortionAmount = map(scroll, 0, SCROLL_MAX, 0, DISTORTION_MAX);
    this.mesh.material.uniforms.u_distortionAmount.value = distortionAmount;
  }

  initGUI() {
    const folder = this.gui.addFolder({
      title: "PostFX",
    });

    folder.addInput(this.mesh.material.uniforms.u_distortionAmount, "value", {
      label: "distortion",
      min: 0,
      max: 50,
      step: 0.01,
    });
  }
}

export default PostFX;
