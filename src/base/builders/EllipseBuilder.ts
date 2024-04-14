import { Ellipse } from "../types";
import { ArrayXY } from '@svgdotjs/svg.js';
import { RoundBuilder } from "../RoundBuilder";

export default class EllipseBuilder extends RoundBuilder<Ellipse> {
  shape?: Ellipse;
  newShape = () => new Ellipse();
  ofType<T>(shape: T): boolean {
    return shape instanceof Ellipse;
  }

  calculateRadius(event: MouseEvent): ArrayXY {
    let radiusX = Math.abs(event.offsetX - this.shapeOrigin!.X) / 2;
    let radiusY = Math.abs(event.offsetY - this.shapeOrigin!.Y) / 2;
    return [radiusX, radiusY];
  }

  calculateDifferent(event: MouseEvent): ArrayXY {
    let diffX = Math.abs(this.shapeOrigin!.X - event.offsetX);
    let diffY = Math.abs(this.shapeOrigin!.Y - event.offsetY);
    return [diffX, diffY];
  }
}