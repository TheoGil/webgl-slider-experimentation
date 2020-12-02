import slideSrc1 from "../img/01.jpg";
import slideSrc2 from "../img/02.jpg";
import slideSrc3 from "../img/03.jpg";
import slideSrc4 from "../img/04.jpg";
import slideSrc5 from "../img/05.jpg";
import slideSrc6 from "../img/06.jpg";
import slideSrc7 from "../img/07.jpg";

const SLIDE_SPACING = 0.2;
const SLIDES_PARAMS = [
  {
    width: 0.345,
    height: 0.345,
    y: 0,
    src: slideSrc1,
  },
  {
    width: 0.375,
    height: 0.585,
    y: 0,
    src: slideSrc2,
  },
  {
    width: 0.345,
    height: 0.345,
    y: -0.1875,
    src: slideSrc3,
  },
  {
    width: 0.225,
    height: 0.225,
    y: 0,
    src: slideSrc4,
  },

  {
    width: 0.375,
    height: 0.585,
    y: 0,

    src: slideSrc5,
  },
  {
    width: 0.225,
    height: 0.225,
    y: 0.225,
    src: slideSrc6,
  },
  {
    width: 0.345,
    height: 0.345,
    y: -0.1875,
    src: slideSrc7,
  },
];

export { SLIDES_PARAMS, SLIDE_SPACING };
