import { Object3D, TextureLoader } from "three";
import gsap from "gsap";
import Slide from "./Slide";

import slideSrc1 from "../../img/01.jpg";
import slideSrc2 from "../../img/02.jpg";
import slideSrc3 from "../../img/03.jpg";
import slideSrc4 from "../../img/04.jpg";
import slideSrc5 from "../../img/05.jpg";
import slideSrc6 from "../../img/06.jpg";
import slideSrc7 from "../../img/07.jpg";

const SLIDES_PARAMS = [
  {
    width: 25,
    height: 40,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 15,
    height: 15,
    y: 7,
    src: slideSrc2,
  },
  {
    width: 32,
    height: 51,
    y: 0,
    src: slideSrc3,
  },
  {
    width: 32,
    height: 32,
    y: 0,
    src: slideSrc4,
  },
  {
    width: 32,
    height: 51,
    y: 0,
    src: slideSrc5,
  },
  {
    width: 32,
    height: 32,
    y: -16,
    src: slideSrc6,
  },
  {
    width: 25,
    height: 40,
    y: 0,
    src: slideSrc7,
  },
];
const SLIDE_SPACING = 12.5;
const DEBUG = false;
const PARAMS = {
  distortion: 0,
};

class Slideshow extends Object3D {
  constructor(options) {
    super(options);

    this.gui = options.gui;
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;

    this.slides = [];

    // Initiated at 0 but will be computed in the computeWidth method, once the slide have been initialized
    this.width = 0;

    // 1 = Moving forward
    // -1 = Moving backward
    this.scrollDirection = 0;

    this.hasTransitionRunning = false;
    this.activeSlide = null;

    this.initSlides();
    this.computeWidth();

    if (DEBUG) {
      this.initGUI();
    }
  }

  initSlides() {
    let xOff = 0;

    const textureLoader = new TextureLoader();

    SLIDES_PARAMS.forEach(({ width, height, y, src }, i) => {
      const slide = new Slide({
        id: i,
        width,
        height,
        y,
        x: xOff,
        src,
        textureLoader,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
      });

      if (i < SLIDES_PARAMS.length - 1) {
        xOff += width / 2 + SLIDES_PARAMS[i + 1].width / 2 + SLIDE_SPACING;
      }

      this.slides.push(slide);
      this.add(slide);
    });
  }

  computeWidth() {
    this.width =
      SLIDES_PARAMS.reduce(function (a, b) {
        return a + b.width;
      }, 0) +
      SLIDES_PARAMS.length * SLIDE_SPACING;
  }

  update(translation) {
    if (!this.activeSlide) {
      this.slides.forEach((slide, i) => {
        slide.updateTranslation(translation);
        slide.respawn(this.scrollDirection, this.viewportWidth, this.width);
      });
    }
  }

  open(mesh) {
    if (!this.hasTransitionRunning) {
      this.hasTransitionRunning = true;
      this.activeSlide = mesh.parent;
      this.truckToSlide(this.activeSlide).then(() => {
        this.activeSlide.open().then(() => {
          this.hasTransitionRunning = false;
        });
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

  truckToSlide(slide) {
    return new Promise((resolve) => {
      gsap.killTweensOf(this.position);
      gsap.to(this.position, {
        x: -slide.mesh.position.x,
        duration: 1,
        onComplete: resolve,
      });
    });
  }

  initGUI() {
    const folder = this.gui.addFolder({
      title: "Slideshow",
    });

    folder
      .addInput(PARAMS, "distortion", {
        min: -50,
        max: 50,
        step: 0.01,
      })
      .on("change", (value) => {
        this.slides.forEach((slide) => {
          slide.mesh.material.uniforms.u_distortionAmount.value = value;
        });
      });
  }
}

export default Slideshow;
