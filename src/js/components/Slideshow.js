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
    width: 0.23,
    height: 0.23,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 0.25,
    height: 0.39,
    y: 0,
    src: slideSrc2,
  },
  {
    width: 0.23,
    height: 0.23,
    y: -0.125,
    src: slideSrc3,
  },
  {
    width: 0.15,
    height: 0.15,
    y: 0,
    src: slideSrc4,
  },

  {
    width: 0.25,
    height: 0.39,
    y: 0,

    src: slideSrc5,
  },
  {
    width: 0.15,
    height: 0.15,
    y: 0.15,
    src: slideSrc6,
  },
  {
    width: 0.23,
    height: 0.23,
    y: -0.125,
    src: slideSrc7,
  },
];
const SLIDE_SPACING = 0.1;
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
        width: this.viewportWidth * width,
        height: this.viewportWidth * height,
        y: this.viewportWidth * y,
        x: xOff,
        src,
        textureLoader,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
      });

      if (i < SLIDES_PARAMS.length - 1) {
        xOff +=
          (width * this.viewportWidth) / 2 +
          (SLIDES_PARAMS[i + 1].width * this.viewportWidth) / 2 +
          SLIDE_SPACING * this.viewportWidth;
      }

      this.slides.push(slide);
      this.add(slide);
    });
  }

  computeWidth() {
    this.width =
      SLIDES_PARAMS.reduce((a, b) => a + b.width * this.viewportWidth, 0) +
      SLIDES_PARAMS.length * SLIDE_SPACING * this.viewportWidth;
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
