import { Text, Rect, Circle as Circ, Polyline } from "@svgdotjs/svg.js";
import { Circle, Color, IlElementExtra, Point } from "../types";
import { ArrayXY } from '@svgdotjs/svg.js'
import { ShapeBuilder } from "../ShapeBuilder";

class IlCircle extends Circ implements IlElementExtra {
  discs!: Circ[];
  categoriesPlain?: Text;
  categoriesRect?: Rect;
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
    shape.centre = [shape.centre[0] * ShapeBuilder.statics.ratio, shape.centre[1] * ShapeBuilder.statics.ratio];
    shape.radius = shape.radius * ShapeBuilder.statics.ratio;
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
    this.svg.mousedown((event: MouseEvent) => this.circleMouseDown(event, addShape));
  }

  stopDraw(): void {
    this.svg.off('mousedown').off('mouseup');
  }

  circleMouseDown(event: MouseEvent, addCircle: () => void) {
    if (event.button === 0 && !this.circleOrigin) {
      if (this.element?.editing) this.stopEdit()
      this.circleOrigin = { X: event.offsetX, Y: event.offsetY };
      this.createElement(new Circle());
      this.svg.mousemove((event: MouseEvent) => this.circleMouseMove(event))
        .mouseup((event: MouseEvent) => this.circleMouseUp(event, addCircle));
    }
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
    let centre: ArrayXY = [(this.circleOrigin!.X + event.offsetX) / 2, (this.circleOrigin!.Y + event.offsetY) / 2];
    let radius = Math.sqrt(Math.pow(this.circleOrigin!.X - event.offsetX, 2) + Math.pow(this.circleOrigin!.Y - event.offsetY, 2)) / 2;
    this.element!.shape.centre = centre;
    this.element!.shape.radius = radius;
    this.svg.off('mousemove').off('mouseup');
    if (radius > 10) addCircle();
    this.circleOrigin = undefined;
  }

  plot(circle: IlCircle): void {
    circle.size(2 * circle.shape.radius).move(circle.shape.centre[0] - circle.shape.radius, circle.shape.centre[1] - circle.shape.radius);
    circle.shadow.size(2 * circle.shape.radius).move(circle.shape.centre[0] - circle.shape.radius, circle.shape.centre[1] - circle.shape.radius);
  }

  editShape() {
    this.addEditingPoints();
    this.element!.discs?.forEach((_disc, index) => {
      _disc
        .addClass('seg-point')
        .click((event: MouseEvent) => { event.stopPropagation(); })
        .mousedown((event: MouseEvent) => {
          if (event.button === 0 && this.dragPointIndex === undefined) {
            let oppositIndex = index + 2 <= 3 ? index + 2 : index - 2;
            this.circleOrigin = { X: this.element!.discs[oppositIndex].cx(), Y: this.element!.discs[oppositIndex].cy() }
            this.dragPointIndex = index;
            this.moveIconPath!.remove();
            event.stopPropagation();
            this.svg.mousemove((event: MouseEvent) => this.editCircleMouseMove(event));
            this.svg.mouseup((event: MouseEvent) => {
              this.addMoveIcon();
              this.circleOrigin = undefined;
              this.dragPointIndex = undefined;
              this.svg.off("mousemove").off("mouseup");
            });
          }
        });
    });
  }

  addEditingPoints(): void {
    let radius = this.element!.shape.radius, x = this.element!.shape.centre[0], y = this.element!.shape.centre[1],
      discRadius = ShapeBuilder.statics.discRadius;
    this.element!.discs.push(this.drawDisc(x - radius, y - radius, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x - radius, y + radius, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + radius, y + radius, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + radius, y - radius, discRadius, Color.GreenDisc));
    let points: ArrayXY[] = this.element!.discs.map(disc => [disc.cx(), disc.cy()]);
    this.element!.connector = this.svg.polyline([...points, points[0]])
      .fill(Color.ShapeFill)
      .stroke({ color: Color.BlackLine, width: 1, opacity: 0.8, dasharray: "3,3" })
      .mousedown((event: MouseEvent) => { event.stopPropagation(); });
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
    this.setOptions(circle, circle.shape.categories);
  }
}