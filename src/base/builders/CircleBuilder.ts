import { Text, Rect, Circle as Circ, Polyline } from "@svgdotjs/svg.js";
import { Director } from "../base";
import { Circle, Color, ElementWithExtra, IlElementExtra, IlShape, Point } from "../types";
import { ArrayXY } from '@svgdotjs/svg.js'
import Util from "../util";
import { ShapeBuilder } from "../ShapeBuilder";

class IlCircle extends Circ implements IlElementExtra {
  discs!: Circ[];
  classNames?: Text;
  classNamesWrapper?: Rect;
  shape!: Circle;
  shadow!: Circ;
  editing: boolean = false;
  connector?: Polyline;
}

export default class CircleBuilder extends ShapeBuilder<Circle> {
  element?: IlCircle;
  shape?: Circle;
  circleOrigin?: Point;
  dragPointIndex?: number;
  
  newShape = () => new Circle();
  ofType<T>(shape: T): boolean { return shape instanceof Circle; }

  plotShape(): void {
		let shape = this.shape!;
    shape.centre = [shape.centre[0] * ShapeBuilder.ratio, shape.centre[1] * ShapeBuilder.ratio];
    shape.radius = shape.radius * ShapeBuilder.ratio;
    this.createElement(shape);
  }

  createElement(shape: Circle): void {
    this.element = Object.assign(this.svg.circle(2 * shape.radius),
      {
        shape,
        shadow: this.svg.circle(2 * shape.radius),
        discs: [],
        editing: false
      });
    this.element.fill(Color.ShapeFill).move(shape.centre[0] - shape.radius, shape.centre[1] - shape.radius);
    this.element.stroke({ color: Color.RedLine, width: 2, opacity: 0.7 });

    this.element.shadow.fill('none').move(shape.centre[0] - shape.radius, shape.centre[1] - shape.radius);
    this.element.shadow.stroke({ color: Color.BlackLine, width: 4, opacity: 0.4 });
  }

  startDraw(addShape: () => void): void {
    this.svg.mousedown((event: MouseEvent) => this.circleMouseDown(event));
    this.svg.mousemove((event: MouseEvent) => this.circleMouseMove(event));
    this.svg.mouseup((event: MouseEvent) => this.circleMouseUp(event, () => addShape()));
  }

  stopDraw(): void {
    this.svg.off('mousedown');
    this.svg.off('mousemove');
    this.svg.off('mouseup');
  }

  circleMouseDown(event: MouseEvent) {
    if (event.button === 0 && !this.circleOrigin) this.circleOrigin = { X: event.offsetX, Y: event.offsetY };
  }

  circleMouseMove(event: MouseEvent) {
    if (this.circleOrigin) {
      let centre: ArrayXY = [(this.circleOrigin.X + event.offsetX) / 2, (this.circleOrigin.Y + event.offsetY) / 2];
      let radius = Math.sqrt(Math.pow(this.circleOrigin.X - event.offsetX, 2) + Math.pow(this.circleOrigin.Y - event.offsetY, 2)) / 2;
      this.element!.size(2 * radius).move(centre[0] - radius, centre[1] - radius);
      this.element!.shadow.size(2 * radius).move(centre[0] - radius, centre[1] - radius);
    }
  }

  circleMouseUp(event: MouseEvent, addCircle: () => void) {
    if (this.circleOrigin) {
      let centre: ArrayXY = [(this.circleOrigin.X + event.offsetX) / 2, (this.circleOrigin.Y + event.offsetY) / 2];
      let radius = Math.sqrt(Math.pow(this.circleOrigin.X - event.offsetX, 2) + Math.pow(this.circleOrigin.Y - event.offsetY, 2)) / 2;
      this.element!.shape.centre = centre;
      this.element!.shape.radius = radius;
      if (radius > 10)
        addCircle();
      this.createElement(new Circle());
      this.circleOrigin = undefined;
    }
  }

  plot(circle: IlCircle): void {
    circle.size(2 * circle.shape.radius).move(circle.shape.centre[0] - circle.shape.radius, circle.shape.centre[1] - circle.shape.radius);
    circle.shadow.size(2 * circle.shape.radius).move(circle.shape.centre[0] - circle.shape.radius, circle.shape.centre[1] - circle.shape.radius);
  }

  editShape() {
    this.element!.editing = true;
    if (this.element!.classNames) this.element!.classNames.clear();
    if (this.element!.classNamesWrapper) this.element!.classNamesWrapper.remove();
    this.addEditingPoints();
    this.element!.discs?.forEach((_disc, index) => {
      _disc.addClass('seg-point');
      _disc.mousedown((event: MouseEvent) => {
        if (event.button === 0 && this.dragPointIndex === undefined) {
          let oppositIndex = index + 2 <= 3 ? index + 2 : index - 2;
          this.circleOrigin = { X: this.element!.discs[oppositIndex].cx(), Y: this.element!.discs[oppositIndex].cy() }
          this.dragPointIndex = index;
          this.moveIconPath!.remove();
          this.svg.mousemove((event: MouseEvent) => this.editCircleMouseMove(event));
        }
      });
    });
    this.svg.mouseup((event: MouseEvent) => {
      if (this.dragPointIndex !== undefined) {
        this.addMoveIcon();
        this.circleOrigin = undefined;
        this.dragPointIndex = undefined;
        this.svg.off("mousemove");
      }
    });
  }

  addEditingPoints(): void {
    let radius = this.element!.shape.radius, x = this.element!.shape.centre[0], y = this.element!.shape.centre[1];
    this.element!.discs.push(this.drawDisc(x - radius, y - radius, 4, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x - radius, y + radius, 4, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + radius, y + radius, 4, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + radius, y - radius, 4, Color.GreenDisc));
    let points: ArrayXY[] = this.element!.discs.map(disc => [disc.cx(), disc.cy()]);
    let polyline = this.svg.polyline([...points, points[0]]);
    this.element!.connector = polyline.fill(Color.ShapeFill)
      .stroke({ color: Color.BlackLine, width: 1, opacity: 0.8, dasharray: "3,3" });
    this.element!.before(this.element!.connector);
  }

  editCircleMouseMove(event: MouseEvent) {
    if (this.dragPointIndex !== undefined && this.circleOrigin !== undefined) {
      let diff = Math.min(Math.abs(this.circleOrigin.X - event.offsetX), Math.abs(this.circleOrigin.Y - event.offsetY));
      let xSign = Math.sign(event.offsetX - this.circleOrigin.X);
      let ySign = Math.sign(event.offsetY - this.circleOrigin.Y);
      this.element!.discs[this.dragPointIndex].cx(diff * xSign + this.circleOrigin.X).cy(diff * ySign + this.circleOrigin.Y);
      let prevIndex = this.dragPointIndex === 0 ? 3 : this.dragPointIndex - 1,
        nextIndex = this.dragPointIndex === 3 ? 0 : this.dragPointIndex + 1;
      if (this.dragPointIndex % 2 === 0) {
        this.element!.discs[prevIndex].cy(diff * ySign + this.circleOrigin.Y);
        this.element!.discs[nextIndex].cx(diff * xSign + this.circleOrigin.X);
      } else {
        this.element!.discs[prevIndex].cx(diff * xSign + this.circleOrigin.X);
        this.element!.discs[nextIndex].cy(diff * ySign + this.circleOrigin.Y);
      }
      let points: ArrayXY[] = this.element!.discs.map(disc => [disc.cx(), disc.cy()]);
      this.element!.connector!.plot([...points, points[0]]);
      this.element!.shape.radius = diff / 2;
      this.element!.shape.centre = [this.circleOrigin.X + xSign * diff / 2, this.circleOrigin.Y + ySign * diff / 2];
      this.plot(this.element!);
    }
  }

  stopEditShape(circle: IlCircle): void {
    circle.discs?.forEach((_disc, index) => {
      this.dragPointIndex = undefined;
      _disc.remove();
    });
    circle.discs = [];
    circle.connector!.remove();
    let shape = circle.shape;
    if (shape.classes.length > 0) this.setOptions(circle, shape.classes);
  }
}