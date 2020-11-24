import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from "three";
import clamp from "../helpers/clamp";

const SLIDES_PARAMS = [
  {
    width: 25,
    height: 40,
    y: 0,
  },
  {
    width: 15,
    height: 15,
    y: 7,
  },
  {
    width: 32,
    height: 51,
    y: 0,
  },
  {
    width: 32,
    height: 32,
    y: 0,
  },
  {
    width: 32,
    height: 51,
    y: 0,
  },
  {
    width: 32,
    height: 32,
    y: -16,
  },
  {
    width: 25,
    height: 40,
    y: 0,
  },
];
const SLIDE_GEO_SEGMENTS = 10;
const SLIDE_SPACING = 12.5;

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
      wireframe: true,
      color: 0x000000,
    });

    this.mesh = new Mesh(geometry, material);

    this.add(this.mesh);
  }
}

class Slideshow extends Object3D {
  constructor() {
    super();

    this.slides = [];
    this.scrollMin = 0;
    this.scrollMax = 0;

    this.initSlides();
    this.setScrollMinMax();
  }

  initSlides() {
    let xOff = 0;
    SLIDES_PARAMS.forEach(({ width, height, y }) => {
      const slide = new Slide({
        width,
        height,
        y,
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
    this.position.x = clamp(e.y, this.scrollMin, this.scrollMax);
  }
}

export default Slideshow;