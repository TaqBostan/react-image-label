import { Ellipse } from "../types";
import { ArrayXY } from '@svgdotjs/svg.js';
import { RoundBuilder } from "../RoundBuilder";

export default class EllipseBuilder extends RoundBuilder<Ellipse> {
  shape?: Ellipse;
  newShape = () => new Ellipse();
  ofType<T>(shape: T): boolean {
    return shape instanceof Ellipse;
  }

  calculateRadius(offset: ArrayXY): ArrayXY {
    let radiusX = Math.abs(offset[0] - this.origin!.X) / 2;
    let radiusY = Math.abs(offset[1] - this.origin!.Y) / 2;
    return [radiusX, radiusY];
  }

  calculateDifferent(offset: ArrayXY): ArrayXY {
    return [offset[0] - this.origin!.X, offset[1] - this.origin!.Y];
  }
}