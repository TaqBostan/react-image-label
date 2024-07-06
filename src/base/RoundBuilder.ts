
import { RoundShape, IlElementExtra, Point, Color, Ellipse } from "./types";
import { Text, Rect, Circle as Circ, Ellipse as Elp, Polyline } from "@svgdotjs/svg.js";
import { ShapeBuilder } from "./ShapeBuilder";
import { ArrayXY } from '@svgdotjs/svg.js';
import Util from "./util";

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
  origin?: Point;
  dragIndex?: number;
  points: ArrayXY[] = [];
  abstract calculateRadius(offset: ArrayXY): ArrayXY;
  abstract calculateDifferent(offset: ArrayXY): ArrayXY;

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
    this.svg.mousedown((event: MouseEvent) => this.draw_md(event, addShape));
  }

  draw_md(event: MouseEvent, addShape: () => void) {
    if (event.button === 0 && !event.ctrlKey && !this.origin) {
      if (this.element?.editing) this.stopEdit();
      this.origin = { X: event.offsetX, Y: event.offsetY };
      this.createElement(this.newShape());
      this.svg.mousemove((event: MouseEvent) => this.draw_mm(event))
        .mouseup((event: MouseEvent) => this.draw_mu(event, addShape));
    }
  }

  draw_mm(event: MouseEvent): void {
    if (this.origin) {
      let centre: ArrayXY = [(this.origin.X + event.offsetX) / 2, (this.origin.Y + event.offsetY) / 2];
      let radius = this.calculateRadius([event.offsetX, event.offsetY]);
      [this.element!, this.element!.shadow].forEach(el => el.size(2 * radius[0], 2 * radius[1]).move(centre[0] - radius[0], centre[1] - radius[1]));
    }
  }

  draw_mu(event: MouseEvent, addShape: () => void) {
    let shape = this.element!.shape;
    let centre: ArrayXY = [(this.origin!.X + event.offsetX) / 2, (this.origin!.Y + event.offsetY) / 2];
    let radius = this.calculateRadius([event.offsetX, event.offsetY]);
    shape.centre = centre;
    shape.width = 2 * radius[0];
    shape.height = 2 * radius[1];
    this.svg.off('mousemove').off('mouseup');
    if (radius[0] > 10 && radius[1] > 10) addShape();
    else this.removeElement();
    this.origin = undefined;
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
    [ellipse, ellipse.shadow].forEach(el => el
      .size(ellipse.shape.width, ellipse.shape.height)
      .move(ellipse.shape.centre[0] - ellipse.shape.width / 2, ellipse.shape.centre[1] - ellipse.shape.height / 2)
    );
  }

  editShape() {
    this.addDiscs();
    this.element!.discs?.forEach((_disc, index) => {
      _disc
        .addClass('seg-point')
        .click((event: MouseEvent) => { event.stopPropagation(); })
        .mousedown((event: MouseEvent) => {
          if (event.button === 0 && !event.ctrlKey && this.dragIndex === undefined) {
            this.setPoints();
            this.dragIndex = index;
            [this.movePath!, ...this.rotateArr].forEach(item => item.remove());
            event.stopPropagation();
            this.svg.mousemove((event: MouseEvent) => this.editShape_mm(event));
            this.svg.mouseup((event: MouseEvent) => {
              this.addMoveIcon();
              this.addRotateIcon();
              this.origin = undefined;
              this.dragIndex = undefined;
              this.svg.off("mousemove").off("mouseup");
            });
          }
        });
    });
  }

  addDiscs(): void {
    let elem = this.element!;
    this.setPoints();
    elem.discs = this.points.map(point => this.drawDisc(point[0], point[1], ShapeBuilder.statics.discRadius, Color.GreenDisc));
    elem.connector = this.svg.polyline([...this.points, this.points[0]])
      .fill(Color.ShapeFill)
      .stroke({ color: Color.BlackLine, width: 1, opacity: 0.8, dasharray: "3,3" })
      .mousedown((event: MouseEvent) => { event.stopPropagation(); });
    elem.before(elem.connector);
    this.rotate();
  }

  setPoints() {
    let elem = this.element!, width = elem.shape.width, height = elem.shape.height, x = elem.shape.centre[0], y = elem.shape.centre[1];
    this.points = [[x - width / 2, y - height / 2], [x - width / 2, y + height / 2], [x + width / 2, y + height / 2], [x + width / 2, y - height / 2]];
  }

  editShape_mm(event: MouseEvent) {
    if (this.dragIndex !== undefined) {
      let elem = this.element!, discRadius = ShapeBuilder.statics.discRadius, phi = elem.shape.phi, oldCenter = elem.shape.getCenter();
      let [x, y] = Util.rotate([event.offsetX, event.offsetY], oldCenter, -phi);
      let prevIndex = this.dragIndex === 0 ? 3 : this.dragIndex - 1,
        nextIndex = this.dragIndex === 3 ? 0 : this.dragIndex + 1,
        oppositIndex = this.dragIndex > 1 ? this.dragIndex - 2 : this.dragIndex + 2;
      this.origin = { X: this.points[oppositIndex][0], Y: this.points[oppositIndex][1] };
      let diff = this.calculateDifferent([x, y]);
      this.points[this.dragIndex] = [diff[0] + this.origin.X, diff[1] + this.origin.Y];
      if (this.dragIndex % 2 === 0) {
        this.points[prevIndex][1] = diff[1] + this.origin.Y;
        this.points[nextIndex][0] = diff[0] + this.origin.X;
      } else {
        this.points[prevIndex][0] = diff[0] + this.origin.X;
        this.points[nextIndex][1] = diff[1] + this.origin.Y;
      }
      elem.shape.width = Math.abs(diff[0]);
      elem.shape.height = Math.abs(diff[1]);
      elem.shape.centerChanged(Util.rotate([this.origin.X + diff[0] / 2, this.origin.Y + diff[1] / 2], oldCenter, phi));
      this.setPoints();
      elem.discs.forEach((disc, i) => disc.move(this.points[i][0] - discRadius, this.points[i][1] - discRadius));
      elem.connector!.plot([...this.points, this.points[0]]);
      this.plot(elem);
      this.rotate();
    }
  }

  stopEditShape(ellipse: IlEllipse): void {
    ellipse.discs?.forEach((_disc, index) => {
      this.dragIndex = undefined;
      _disc.remove();
    });
    ellipse.discs = [];
    ellipse.connector!.remove();
    this.setOptions(ellipse, ellipse.shape.categories);
  }
}