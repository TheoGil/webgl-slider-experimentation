import {
  MeshBasicMaterial,
  Object3D,
  Mesh,
  CylinderBufferGeometry,
  BackSide,
  FrontSide,
  TextureLoader,
  ShaderMaterial,
  Color,
} from "three";
import texture from "../../img/blink-raise-repeat.png";
import vertexShader from "../../shaders/text/vertex.vert";
import fragmentShader from "../../shaders/text/frag.frag";

const CYLINDER_RADIUS = 0.25;
const CYLINDER_HEIGHT = 0.3;
const CYLINDER_RADIAL_SEGMENTS = 64;
const CYLINDER_HEIGHT_SEGMENTS = 50;
const CYLINDER_ROTATION_SPEED = 0.01;
const GLOBAL_ROTATION_X = -0.43;
const GLOBAL_ROTATION_Y = 0;
const GLOBAL_ROTATION_Z = 0.35;
const GLOBAL_X_OFFSET = 0;
const GLOBAL_Y_OFFSET = -0.05;

class Text extends Object3D {
  constructor(options) {
    super(options);

    this.ratio = Math.min(options.width, options.height);
    this.anisotropy = options.anisotropy;

    const map = new TextureLoader().load(texture);
    map.anisotropy = this.anisotropy;

    this.geometry = new CylinderBufferGeometry(
      CYLINDER_RADIUS * this.ratio,
      CYLINDER_RADIUS * this.ratio,
      CYLINDER_HEIGHT * this.ratio,
      CYLINDER_RADIAL_SEGMENTS,
      CYLINDER_HEIGHT_SEGMENTS,
      true
    );

    this.frontMaterial = new ShaderMaterial({
      side: FrontSide,
      transparent: true,
      fragmentShader,
      vertexShader,
      uniforms: {
        u_texture: {
          value: map,
        },
        u_color: {
          value: new Color(0x000000),
        },
        u_invertion: {
          value: 1,
        },
        u_mask: {
          value: options.mask,
        },
      },
    });

    this.backMaterial = new ShaderMaterial({
      side: BackSide,
      transparent: true,
      fragmentShader,
      vertexShader,
      uniforms: {
        u_texture: {
          value: map,
        },
        u_color: {
          value: new Color(0xdadada),
        },
        u_invertion: {
          value: 0,
        },
      },
    });

    this.frontCylinder = new Mesh(this.geometry, this.frontMaterial);
    this.frontCylinder.position.z = 0.1;
    this.add(this.frontCylinder);

    this.backCylinder = new Mesh(this.geometry, this.backMaterial);
    this.add(this.backCylinder);

    this.rotation.set(GLOBAL_ROTATION_X, GLOBAL_ROTATION_Y, GLOBAL_ROTATION_Z);
    this.position.set(
      GLOBAL_X_OFFSET * this.ratio,
      GLOBAL_Y_OFFSET * this.ratio,
      0
    );
  }

  onResize(newWidth, newHeight) {
    const newScale = Math.min(newWidth, newHeight) / this.ratio;
    this.scale.set(newScale, newScale, newScale);
    this.position.set(
      GLOBAL_X_OFFSET * newScale,
      GLOBAL_Y_OFFSET * newScale,
      0
    );
  }

  update() {
    this.backCylinder.rotation.y = this.frontCylinder.rotation.y += CYLINDER_ROTATION_SPEED;
  }
}

export default Text;
