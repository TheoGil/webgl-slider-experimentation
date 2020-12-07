import {
  Object3D,
  Scene,
  WebGLRenderTarget,
  RGBAFormat,
  PlaneBufferGeometry,
  ShaderMaterial,
  Mesh,
  MeshBasicMaterial,
} from "three";
import gsap from "gsap";
import lerp from "lerp";
import Preload from "preload-it";

import Slide from "./Slide";
import vertexShader from "../../shaders/postfx/vertex.vert";
import fragmentShader from "../../shaders/postfx/fragment.frag";

import { SLIDES_PARAMS, SLIDE_SPACING } from "../slidesParams";
const SEGMENTS = 200;

const LERP_FRICTION = 0.1;
const LERP_THRESHOLD = 0.01;
const DISTORTION_MULTIPLIER = 100;
const DISTORTION_MIN = -100;
const DISTORTION_MAX = 50;

class Slideshow extends Object3D {
  constructor(options) {
    super(options);

    this.onSlidesLoaded = this.onSlidesLoaded.bind(this);

    this.renderer = options.renderer;
    this.camera = options.camera;
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.ratio = Math.min(this.viewportWidth, this.viewportHeight);
    this.slides = [];
    this.distortion = 0;
    this.width = 0; // Initiated at 0 but will be computed in the computeWidth method, once the slide have been initialized
    this.scrollTarget = 0;
    this.scroll = 0;
    this.scrollDirection = 0; // 1 = Moving forward | -1 = Moving backward
    this.hasTransitionRunning = false;
    this.activeSlide = null;
    this.hoveredSlide = null;
    this.scene = new Scene();
    this.preload = Preload();
    this.initPostFX();

    this.initSlides();
    this.computeWidth();

    this.preload
      .fetch(SLIDES_PARAMS.map((slide) => slide.src))
      .then(this.onSlidesLoaded);
  }

  initSlides() {
    let xOff = 0;

    SLIDES_PARAMS.forEach(({ width, height, y, src }, i) => {
      const slide = new Slide({
        id: i,
        width: this.ratio * width,
        height: this.ratio * height,
        y: this.ratio * y,
        x: xOff,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
      });

      if (i < SLIDES_PARAMS.length - 1) {
        xOff +=
          (width * this.ratio) / 2 +
          (SLIDES_PARAMS[i + 1].width * this.ratio) / 2 +
          SLIDE_SPACING * this.ratio;
      }

      this.slides.push(slide);
      this.scene.add(slide);
    });
  }

  initPostFX() {
    this.postProcessingScene = new Scene();
    this.postProcessingTarget = new WebGLRenderTarget(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio,
      {
        format: RGBAFormat,
        stencilBuffer: false,
      }
    );
    this.postProcessingGeometry = new PlaneBufferGeometry(
      1,
      1,
      SEGMENTS,
      SEGMENTS
    );
    this.postProcessingMaterial = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      transparent: true,
      depthTest: false,
      uniforms: {
        u_scene: { value: this.postProcessingTarget.texture },
        u_distortionAmount: { value: 0 },
      },
    });
    this.postProcessingMesh = new Mesh(
      this.postProcessingGeometry,
      this.postProcessingMaterial
    );
    this.postProcessingMesh.scale.set(
      this.viewportWidth,
      this.viewportHeight,
      1
    );
    this.postProcessingMesh.frustumCulled = false;
    this.postProcessingScene.add(this.postProcessingMesh);

    this.postProcessedTarget = this.postProcessingTarget.clone();
    this.postProcessedMaterial = new MeshBasicMaterial({
      transparent: true,
      depthTest: false,
      map: this.postProcessedTarget.texture,
      opacity: 0,
    });
    this.postProcessedMesh = new Mesh(
      this.postProcessingGeometry,
      this.postProcessedMaterial
    );
    this.postProcessedMesh.scale.set(
      this.viewportWidth,
      this.viewportHeight,
      1
    );
    this.postProcessedMesh.frustumCulled = false;
  }

  computeWidth() {
    this.width =
      SLIDES_PARAMS.reduce((a, b) => a + b.width * this.ratio, 0) +
      SLIDES_PARAMS.length * SLIDE_SPACING * this.ratio;
  }

  onResize(newWidth, newHeight) {
    const newScale = Math.min(newWidth, newHeight) / this.ratio;
    this.scale.set(newScale, newScale, 1);

    this.slides.forEach((slide) => {
      slide.respawn(1, this.viewportWidth, this.width);
    });

    this.postProcessingTarget.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    this.postProcessedTarget.setSize(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
    this.postProcessingMesh.scale.set(newWidth, newHeight, 1);
    this.postProcessedMesh.scale.set(newWidth, newHeight, 1);
  }

  onScroll({ deltaX, deltaY }) {
    this.scroll = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    this.scrollDirection = Math.sign(this.scroll);

    this.distortion = lerp(
      this.distortion,
      this.scroll * DISTORTION_MULTIPLIER,
      0.01
    );
  }

  animateIn() {
    const scrollParams = {
      deltaX: -40,
      deltaY: 0,
    };

    gsap.to(scrollParams, {
      deltaX: 0,
      duration: 2.5,
      onUpdate: () => {
        this.onScroll(scrollParams);
      },
    });

    gsap.to(this.postProcessedMesh.material, {
      opacity: 1,
      duration: 2.5,
    });
  }

  onSlidesLoaded(items) {
    items.forEach(({ blobUrl }, i) => {
      this.slides[i].img.src = blobUrl;
    });

    this.animateIn();
  }

  update() {
    this.scroll =
      Math.abs(this.scroll) > LERP_THRESHOLD
        ? lerp(this.scroll, 0, LERP_FRICTION)
        : 0;

    if (!this.activeSlide) {
      this.slides.forEach((slide) => {
        slide.updateTranslation(this.scroll);
        slide.respawn(this.scrollDirection, this.viewportWidth, this.width);
      });
    }

    this.distortion =
      Math.abs(this.distortion) > LERP_THRESHOLD
        ? lerp(this.distortion, 0, 0.05)
        : 0;

    this.distortion = Math.min(
      Math.max(this.distortion, DISTORTION_MIN),
      DISTORTION_MAX
    );
    this.postProcessingMesh.material.uniforms.u_distortionAmount.value = this.distortion;
  }

  open(mesh) {
    if (!this.hasTransitionRunning) {
      this.hasTransitionRunning = true;
      this.activeSlide = mesh.parent;
      this.moveToSlide(mesh);
      this.activeSlide.open().then(() => {
        this.hasTransitionRunning = false;
      });
    }
  }

  close() {
    if (!this.hasTransitionRunning && this.activeSlide) {
      this.hasTransitionRunning = true;
      this.activeSlide.close().then(() => {
        this.hasTransitionRunning = false;
        this.activeSlide = null;
      });
    }
  }

  moveToSlide(mesh) {
    gsap.to(
      this.slides.map((slide) => slide.mesh.position),
      {
        x: `-=${mesh.position.x}`,
        ease: "power2.out",
        duration: 1,
        onUpdate: () => {
          this.slides.forEach((slide) => {
            slide.respawn(
              Math.sign(mesh.position.x),
              this.viewportWidth,
              this.width
            );
          });
        },
      }
    );
  }

  render() {
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setRenderTarget(this.postProcessingTarget);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(this.postProcessedTarget);
    this.renderer.render(this.postProcessingScene, this.camera);

    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setRenderTarget(null);
  }
}

export default Slideshow;
