import {
  Mesh,
  Object3D,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
} from "three";
import gsap from "gsap";
import vertexShader from "../../shaders/slide/vertex.vert";
import fragmentShader from "../../shaders/slide/fragment.frag";

const SLIDE_GEO_SEGMENTS = 25;
const FORWARD_TWEEN_DURATION = 0.5;
const BACKWARD_TWEEN_DURATION = 0.5;

class Slide extends Object3D {
  constructor(options) {
    super(options);

    this.onScaleUpdate = this.onScaleUpdate.bind(this);
    this.onImgLoad = this.onImgLoad.bind(this);

    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.width = options.width;
    this.height = options.height;
    this.posY = options.y;

    const geometry = new PlaneBufferGeometry(
      this.width,
      this.height,
      SLIDE_GEO_SEGMENTS,
      SLIDE_GEO_SEGMENTS
    );

    const material = new ShaderMaterial({
      wireframe: false,
      vertexShader,
      fragmentShader,
      depthTest: false,
      uniforms: {
        u_distortionAmount: {
          value: 0,
        },
        u_texture: {
          value: null,
        },
        u_resIn: {
          value: [0, 0],
        },
        u_resOut: {
          value: [this.width, this.height],
        },
      },
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(options.x, this.posY, 0);
    this.add(this.mesh);

    this.img = document.createElement("img");
    this.img.onload = this.onImgLoad;

    // We're using two timelines.
    // One for the opening and the other for the closing animation. Even if they are almost identical,
    // we're not using a single timeline with the reverse method because we need finer tuning over the easings of the tweens.
    // For example, we don't want the bouncy effect to run at the start of the closing animation.
    // Using two timelines will be easier to manage and maintain.
    this.initForwardTimeLine();
    this.initBackwardTimeline();
  }

  initForwardTimeLine() {
    this.ftl = gsap.timeline({
      paused: true,
      onStart: () => {
        this.mesh.renderOrder = 1;
      },
    });

    // Bend plane, start right at the beginning
    this.ftl.to(
      this.mesh.material.uniforms.u_distortionAmount,
      {
        value: 50,
        duration: 0.5,
        ease: "power2.out",
      },
      0
    );

    // Increase scale until it fills viewport completely, start right at the beginning
    this.ftl.to(
      this.mesh.scale,
      {
        x: this.viewportWidth / this.width,
        y: this.viewportHeight / this.height,
        onUpdate: this.onScaleUpdate,
        ease: "power2.in",
        duration: FORWARD_TWEEN_DURATION,
      },
      0
    );

    // Align plane vertically to viewport center, start right at the beginning
    this.ftl.to(
      this.mesh.position,
      {
        y: 0,
        duration: FORWARD_TWEEN_DURATION,
      },
      0
    );

    // Create a bouncy effect at the end of the timeline
    this.ftl.to(this.mesh.material.uniforms.u_distortionAmount, {
      value: 0,
      duration: 0.5,
      ease: "back.out(3)",
    });
  }

  initBackwardTimeline() {
    this.btl = gsap.timeline({
      paused: true,
      onComplete: () => {
        this.mesh.renderOrder = 0;
      },
    });

    // Bend plane, start right at the beginning
    this.btl.to(
      this.mesh.material.uniforms.u_distortionAmount,
      {
        value: -50,
        ease: "power2.out",
        duration: BACKWARD_TWEEN_DURATION,
      },
      0
    );

    // Decrease scale until it goes back to its original value, start right at the beginning
    this.btl.to(
      this.mesh.scale,
      {
        x: 1,
        y: 1,
        onUpdate: this.onScaleUpdate,
        ease: "power2.in",
        duration: BACKWARD_TWEEN_DURATION,
      },
      0
    );

    // Reset original y position, start right at the beginning
    this.btl.to(
      this.mesh.position,
      {
        y: this.posY,
        ease: "power2.in",
        duration: BACKWARD_TWEEN_DURATION,
      },
      0
    );

    // Lil bounce at the end
    this.btl.to(this.mesh.material.uniforms.u_distortionAmount, {
      value: 0,
      duration: 0.25,
      ease: "back.out(3)",
    });
  }

  onImgLoad() {
    this.mesh.material.uniforms.u_texture.value = new Texture(this.img);
    this.mesh.material.uniforms.u_resIn.value = [
      this.img.naturalWidth,
      this.img.naturalHeight,
    ];
    this.mesh.material.uniforms.u_texture.value.needsUpdate = true;
  }

  onScaleUpdate() {
    this.mesh.material.uniforms.u_resOut.value = [
      this.width * this.mesh.scale.x,
      this.height * this.mesh.scale.y,
    ];
  }

  open() {
    return this.ftl.restart(0);
  }

  close() {
    return this.btl.restart(0);
  }

  updateTranslation(translation) {
    this.mesh.position.x += translation;
  }

  respawn(direction, viewportWidth, slideshowWidth) {
    if (this.mesh.position.x + this.width / 2 < -viewportWidth / 2) {
      if (direction === -1) {
        this.mesh.position.x += slideshowWidth;
      }
    } else if (this.mesh.position.x - this.width / 2 > viewportWidth / 2) {
      if (direction === 1) {
        this.mesh.position.x -= slideshowWidth;
      }
    }
  }
}

export default Slide;
