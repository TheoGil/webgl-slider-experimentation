import { Object3D, TextureLoader } from "three";
import gsap from "gsap";
import Slide from "./Slide";
import { SLIDES_PARAMS, SLIDE_SPACING } from "../slidesParams";

class Slideshow extends Object3D {
  constructor(options) {
    super(options);

    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.gui = options.gui;
    this.ratio = Math.min(this.viewportWidth, this.viewportHeight);
    this.slides = [];
    this.width = 0; // Initiated at 0 but will be computed in the computeWidth method, once the slide have been initialized
    this.scrollDirection = 0; // 1 = Moving forward | -1 = Moving backward
    this.hasTransitionRunning = false;
    this.activeSlide = null;

    this.initSlides();
    this.computeWidth();
  }

  initSlides() {
    let xOff = 0;

    const textureLoader = new TextureLoader();

    SLIDES_PARAMS.forEach(({ width, height, y, src }, i) => {
      const slide = new Slide({
        id: i,
        width: this.ratio * width,
        height: this.ratio * height,
        y: this.ratio * y,
        x: xOff,
        src,
        textureLoader,
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
      this.add(slide);
    });
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
  }

  update(translation) {
    if (!this.activeSlide) {
      this.slides.forEach((slide) => {
        slide.updateTranslation(translation);
        slide.respawn(this.scrollDirection, this.viewportWidth, this.width);
      });
    }
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
}

export default Slideshow;
