import { PlaneBufferGeometry, ShaderMaterial, Mesh, Object3D } from "three";
import vertexShader from "../../shaders/distortionplane/vertex.vert";
import fragmentShader from "../../shaders/distortionplane/fragment.frag";

class DistortionPlane extends Object3D {
  constructor(options) {
    super(options);

    this.gui = options.gui;
    this.camera = options.camera; // We'll need a reference to camera in order to make the plane fit the viewport.

    this.initMesh();
    this.fitMeshToScreen();
    this.initGUI();
  }

  initMesh() {
    const segments = 50;
    this.geometry = new PlaneBufferGeometry(1, 1, segments, segments);

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_distortionAmount: {
          value: 0.0,
        },
      },
      wireframe: false,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.add(this.mesh);
  }

  fitMeshToScreen() {
    const distance = this.camera.position.z - this.mesh.position.z;
    const aspect = window.innerWidth / window.innerHeight;
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovInRadians / 2) * distance;
    const width = height * aspect;
    this.mesh.scale.set(width, height, 1);
  }

  onResize() {
    this.mesh.material.uniforms.u_aspect.value =
      window.innerHeight / window.innerWidth;

    this.mesh.material.uniforms.u_aspect.value = this.computeResolutionUniform();

    this.fitMeshToScreen();
  }

  initGUI() {
    const folder = this.gui.addFolder({
      title: "Distortion",
    });

    folder.addInput(this.material.uniforms.u_distortionAmount, "value", {
      label: "distortionAmount",
      min: 0,
      max: 100,
      step: 1,
    });
  }
}

export default DistortionPlane;
