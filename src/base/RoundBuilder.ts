
import { RoundShape, IlElementExtra, Point, Color, Ellipse } from "./types";
import { Text, Rect, Circle as Circ, Ellipse as Elp, Polyline } from "@svgdotjs/svg.js";
import { ShapeBuilder } from "./ShapeBuilder";
import { ArrayXY } from '@svgdotjs/svg.js';

class IlEllipse extends Elp implements IlElementExtra {
  discs!: Circ[];
  classNames?: Text;
  classNamesWrapper?: Rect;
  shape!: RoundShape;
  shadow!: Elp;
  editing: boolean = false;
  connector?: Polyline;
}

export abstract class RoundBuilder<T extends RoundShape> extends ShapeBuilder<T> {
  element?: IlEllipse;
  shapeOrigin?: Point;
  dragPointIndex?: number;
  abstract calculateRadius(event: MouseEvent): ArrayXY;
  abstract calculateDifferent(event: MouseEvent): ArrayXY;

  createElement(shape: RoundShape): void {
    this.element = Object.assign(this.svg.ellipse(shape.width, shape.height),
      {
        shape,
        shadow: this.svg.ellipse(shape.width, shape.height),
        discs: [],
        editing: false
      });
    this.element.fill(Color.ShapeFill).move(shape.centre[0] - shape.width / 2, shape.centre[1] - shape.height / 2);
    this.element.stroke({ color: Color.RedLine, width: 2, opacity: 0.7 });

    this.element.shadow.fill('none').move(shape.centre[0] - shape.width / 2, shape.centre[1] - shape.height / 2);
    this.element.shadow.stroke({ color: Color.BlackLine, width: 4, opacity: 0.4 });
  }

  startDraw(addShape: () => void): void {
    this.svg.mousedown((event: MouseEvent) => this.shapeMouseDown(event, addShape));
  }

  shapeMouseDown(event: MouseEvent, addShape: () => void) {
    if (event.button === 0 && !this.shapeOrigin) {
      if (this.element?.editing) this.stopEdit();
      this.shapeOrigin = { X: event.offsetX, Y: event.offsetY };
      this.createElement(this.newShape());
      this.svg.mousemove((event: MouseEvent) => this.shapeMouseMove(event))
        .mouseup((event: MouseEvent) => this.shapeMouseUp(event, addShape));
    }
  }

  shapeMouseMove(event: MouseEvent): void {
    if (this.shapeOrigin) {
      let centre: ArrayXY = [(this.shapeOrigin.X + event.offsetX) / 2, (this.shapeOrigin.Y + event.offsetY) / 2];
      let radius = this.calculateRadius(event);
      this.element!.size(2 * radius[0], 2 * radius[1]).move(centre[0] - radius[0], centre[1] - radius[1]);
      this.element!.shadow.size(2 * radius[0], 2 * radius[1]).move(centre[0] - radius[0], centre[1] - radius[1]);
    }
  }

  shapeMouseUp(event: MouseEvent, addShape: () => void) {
    let centre: ArrayXY = [(this.shapeOrigin!.X + event.offsetX) / 2, (this.shapeOrigin!.Y + event.offsetY) / 2];
    let radius = this.calculateRadius(event);
    this.element!.shape.centre = centre;
    this.element!.shape.width = 2 * radius[0];
    this.element!.shape.height = 2 * radius[1];
    this.svg.off('mousemove').off('mouseup');
    if (radius[0] > 10 && radius[1] > 10)
      addShape();
    this.shapeOrigin = undefined;
  }

  plotShape(): void {
    let shape = this.shape!;
    shape.zoom(ShapeBuilder.statics.ratio);
    this.createElement(shape);
  }

  stopDraw(): void {
    this.svg.off('mousedown').off('mouseup');
  }

  plot(ellipse: IlEllipse): void {
    ellipse.size(ellipse.shape.width, ellipse.shape.height).move(ellipse.shape.centre[0] - ellipse.shape.width / 2, ellipse.shape.centre[1] - ellipse.shape.height / 2);
    ellipse.shadow.size(ellipse.shape.width, ellipse.shape.height).move(ellipse.shape.centre[0] - ellipse.shape.width / 2, ellipse.shape.centre[1] - ellipse.shape.height / 2);
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
            this.shapeOrigin = { X: this.element!.discs[oppositIndex].cx(), Y: this.element!.discs[oppositIndex].cy() }
            this.dragPointIndex = index;
            this.moveIconPath!.remove();
            event.stopPropagation();
            this.svg.mousemove((event: MouseEvent) => this.editShapeMouseMove(event));
            this.svg.mouseup((event: MouseEvent) => {
              this.addMoveIcon();
              this.shapeOrigin = undefined;
              this.dragPointIndex = undefined;
              this.svg.off("mousemove").off("mouseup");
            });
          }
        });
    });
  }

  addEditingPoints(): void {
    let width = this.element!.shape.width, height = this.element!.shape.height, x = this.element!.shape.centre[0], y = this.element!.shape.centre[1],
      discRadius = ShapeBuilder.statics.discRadius;
    this.element!.discs.push(this.drawDisc(x - width / 2, y - height / 2, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x - width / 2, y + height / 2, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + width / 2, y + height / 2, discRadius, Color.GreenDisc));
    this.element!.discs.push(this.drawDisc(x + width / 2, y - height / 2, discRadius, Color.GreenDisc));
    let points: ArrayXY[] = this.element!.discs.map(disc => [disc.cx(), disc.cy()]);
    this.element!.connector = this.svg.polyline([...points, points[0]])
      .fill(Color.ShapeFill)
      .stroke({ color: Color.BlackLine, width: 1, opacity: 0.8, dasharray: "3,3" })
      .mousedown((event: MouseEvent) => { event.stopPropagation(); });
    this.element!.before(this.element!.connector);
  }

  editShapeMouseMove(event: MouseEvent) {
    if (this.dragPointIndex !== undefined && this.shapeOrigin !== undefined) {
      let diff = this.calculateDifferent(event);
      let xSign = Math.sign(event.offsetX - this.shapeOrigin.X);
      let ySign = Math.sign(event.offsetY - this.shapeOrigin.Y);
      this.element!.discs[this.dragPointIndex].cx(diff[0] * xSign + this.shapeOrigin.X).cy(diff[1] * ySign + this.shapeOrigin.Y);
      let prevIndex = this.dragPointIndex === 0 ? 3 : this.dragPointIndex - 1,
        nextIndex = this.dragPointIndex === 3 ? 0 : this.dragPointIndex + 1;
      if (this.dragPointIndex % 2 === 0) {
        this.element!.discs[prevIndex].cy(diff[1] * ySign + this.shapeOrigin.Y);
        this.element!.discs[nextIndex].cx(diff[0] * xSign + this.shapeOrigin.X);
      } else {
        this.element!.discs[prevIndex].cx(diff[0] * xSign + this.shapeOrigin.X);
        this.element!.discs[nextIndex].cy(diff[1] * ySign + this.shapeOrigin.Y);
      }
      let points: ArrayXY[] = this.element!.discs.map(disc => [disc.cx(), disc.cy()]);
      this.element!.connector!.plot([...points, points[0]]);
      this.element!.shape.width = diff[0];
      this.element!.shape.height = diff[1];
      this.element!.shape.centre = [this.shapeOrigin.X + xSign * diff[0] / 2, this.shapeOrigin.Y + ySign * diff[1] / 2];
      this.plot(this.element!);
    }
  }

  stopEditShape(ellipse: IlEllipse): void {
    ellipse.discs?.forEach((_disc, index) => {
      this.dragPointIndex = undefined;
      _disc.remove();
    });
    ellipse.discs = [];
    ellipse.connector!.remove();
    this.setOptions(ellipse, ellipse.shape.categories);
  }
}