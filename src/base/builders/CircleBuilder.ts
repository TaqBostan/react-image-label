import { Circle} from "../types";
import { ArrayXY } from '@svgdotjs/svg.js';
import { RoundBuilder } from "../RoundBuilder";

export default class CircleBuilder extends RoundBuilder<Circle> {
  shape?: Circle;
  canRotate = false;
  newShape = () => new Circle();
  ofType<T>(shape: T): boolean {
    return shape instanceof Circle;
  }

  calculateRadius(offset: ArrayXY): ArrayXY {
    let radius;
    radius = Math.sqrt(Math.pow(this.shapeOrigin!.X -offset[0], 2) + Math.pow(this.shapeOrigin!.Y - offset[1], 2)) / 2;
    return [radius, radius];
  }

  calculateDifferent(offset: ArrayXY): ArrayXY {
    let diff = Math.min(Math.abs(this.shapeOrigin!.X - offset[0]), Math.abs(this.shapeOrigin!.Y - offset[1]));
    return [diff, diff];
  }

}