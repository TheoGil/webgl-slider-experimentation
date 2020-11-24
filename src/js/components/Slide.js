import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from "three";

const SLIDE_GEO_SEGMENTS = 10;

class Slide extends Object3D {
  constructor(options) {
    super(options);

    const geometry = new PlaneBufferGeometry(
      options.width,
      options.height,
      SLIDE_GEO_SEGMENTS,
      SLIDE_GEO_SEGMENTS
    );

    const material = new MeshBasicMaterial({
      wireframe: false,
      color: 0x000000,
    });

    this.mesh = new Mesh(geometry, material);

    this.add(this.mesh);
  }
}

export default Slide;
