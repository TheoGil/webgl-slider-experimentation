import { Object3D, TextureLoader } from "three";
import gsap from "gsap";
import Slide from "./Slide";
import clamp from "../helpers/clamp";
import slideSrc1 from "../../img/portrait1.jpg";

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
    src: slideSrc1,
  },
  {
    width: 32,
    height: 51,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 32,
    height: 32,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 32,
    height: 51,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 32,
    height: 32,
    y: -16,
    src: slideSrc1,
  },
  {
    width: 25,
    height: 40,
    y: 0,
    src: slideSrc1,
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
    this.scrollMin = 0;
    this.scrollMax = 0;
    this.hasTransitionRunning = false;
    this.activeSlide = null;

    this.initSlides();
    this.setScrollMinMax();

    if (DEBUG) {
      this.initGUI();
    }
  }

  initSlides() {
    let xOff = 0;

    const textureLoader = new TextureLoader();

    SLIDES_PARAMS.forEach(({ width, height, y, src }) => {
      const slide = new Slide({
        width,
        height,
        y,
        src,
        textureLoader,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
      });

      slide.position.set(xOff + width / 2, y, 0);

      // Update the xOff for the next slide
      xOff += width + SLIDE_SPACING;

      this.slides.push(slide);
      this.add(slide);
    });

    // Center the slideshow on the first slide
    this.position.x = -SLIDES_PARAMS[0].width / 2;
  }

  setScrollMinMax() {
    this.scrollMin = -this.slides[this.slides.length - 1].position.x;
    this.scrollMax = -SLIDES_PARAMS[0].width / 2;
  }

  onScroll(e) {
    // Prevent scroll if slide is opened
    if (!this.activeSlide) {
      this.position.x = clamp(e.y, this.scrollMin, this.scrollMax);
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
        x: -slide.position.x,
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
