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
    this.posY = options.y;
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.tweenProperties = {
      scaleX: 1,
      scaleY: 1,
      posY: this.posY,
    };

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
    return this.tweenScale(newScaleX, newScaleY, 0);
  }

  close() {
    return this.tweenScale(1, 1, this.posY);
  }

  tweenScale(scaleX, scaleY, posY) {
    gsap.killTweensOf(this.tweenProperties);

    return new Promise((resolve) => {
      gsap.to(this.tweenProperties, {
        scaleX,
        scaleY,
        posY,
        duration: TWEEN_DURATION,
        onUpdate: () => {
          this.mesh.scale.x = this.tweenProperties.scaleX;
          this.mesh.scale.y = this.tweenProperties.scaleY;
          this.position.y = this.tweenProperties.posY;
        },
        onComplete: resolve,
      });
    });
  }
}

export default Slide;
