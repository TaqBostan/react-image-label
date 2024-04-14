import { Circle} from "../types";
import { ArrayXY } from '@svgdotjs/svg.js';
import { RoundBuilder } from "../RoundBuilder";

export default class CircleBuilder extends RoundBuilder<Circle> {
  shape?: Circle;
  newShape = () => new Circle();
  ofType<T>(shape: T): boolean {
    return shape instanceof Circle;
  }

  calculateRadius(event: MouseEvent): ArrayXY {
    let radius;
    radius = Math.sqrt(Math.pow(this.shapeOrigin!.X - event.offsetX, 2) + Math.pow(this.shapeOrigin!.Y - event.offsetY, 2)) / 2;
    return [radius, radius];
  }

  calculateDifferent(event: MouseEvent): ArrayXY {
    let diff = Math.min(Math.abs(this.shapeOrigin!.X - event.offsetX), Math.abs(this.shapeOrigin!.Y - event.offsetY));
    return [diff, diff];
  }

}