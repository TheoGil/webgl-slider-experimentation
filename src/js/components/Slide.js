import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from "three";
import gsap from "gsap";

const SLIDE_GEO_SEGMENTS = 10;
const TWEEN_DURATION = 1;

class Slide extends Object3D {
  constructor(options) {
    super(options);

    this.isFullScreen = false;
    this.width = options.width;
    this.height = options.height;
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    const geometry = new PlaneBufferGeometry(
      this.width,
      this.height,
      SLIDE_GEO_SEGMENTS,
      SLIDE_GEO_SEGMENTS
    );

    const material = new MeshBasicMaterial({
      wireframe: true,
      color: 0x000000,
    });

    this.mesh = new Mesh(geometry, material);

    this.add(this.mesh);
  }

  open() {
    const newScaleX = this.viewportWidth / this.width;
    const newScaleY = this.viewportHeight / this.height;
    return this.tweenScale(newScaleX, newScaleY);
  }

  close() {
    return this.tweenScale(1, 1);
  }

  tweenScale(scaleX, scaleY) {
    gsap.killTweensOf(this.mesh.scale);

    return new Promise((resolve) => {
      gsap.to(this.mesh.scale, {
        x: scaleX,
        y: scaleY,
        duration: TWEEN_DURATION,
        onComplete: resolve,
      });
    });
  }
}

export default Slide;
