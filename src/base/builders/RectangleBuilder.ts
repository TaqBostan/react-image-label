import { AngledBuilder } from "../AngledBuilder";
import { Rectangle, Point, ArrayXY } from "../types";
import Util from '../util';

export default class RectangleBuilder extends AngledBuilder<Rectangle> {
  rectOrigin?: Point;
  shape?: Rectangle;
  newShape = () => new Rectangle();

  ofType<T>(shape: T): boolean {
    return shape instanceof Rectangle;
  }

  rect_md(e: MouseEvent) {
    if (e.buttons === 1 && !e.ctrlKey && !this.rectOrigin) {
      if (this.element?.editing) this.stopEdit()
      this.rectOrigin = { X: e.offsetX, Y: e.offsetY };
      this.createElement(new Rectangle());
      this.svg.mousemove((e: any) => this.newRect_mm(e));
      this.svg.mouseup((e: MouseEvent) => this.rect_mu(e));
    }
  }

  rect_mu(event: MouseEvent) {
    if (this.rectOrigin) {
      if (Math.abs(this.rectOrigin.X - event.offsetX) < 10 ||
        Math.abs(this.rectOrigin.Y - event.offsetY) < 10) {
        this.removeElement();
        this.rectOrigin = undefined;
        return;
      }
      if (!this.element) throw new Error();
      this.element.shape.points.filter((point, index) => index < this.element!.shape.points.length - 1)
        .forEach(point => {
          this.element!.discs.push(this.drawDisc(point[0], point[1], 2, '#000'))
        });
      this.svg.off('mousemove').off('mouseup');
      this.enlist(this.element.shape);
      this.rectOrigin = undefined;
    }
  }

  startDraw() {
    this.svg.mousedown((event: MouseEvent) => this.rect_md(event));
  }

  stopDraw() {
    this.svg.off('mousedown').off('mouseup');
  }

  newRect_mm(e: MouseEvent) {
    if (this.rectOrigin) {
      if (e.buttons !== 1) return this.rect_mu(e);
      let points: ArrayXY[] = [];
      points.push([this.rectOrigin.X, this.rectOrigin.Y]);
      if (e.shiftKey) {
        let diff = Math.min(Math.abs(this.rectOrigin.X - e.offsetX), Math.abs(this.rectOrigin.Y - e.offsetY));
        let xSign = Math.sign(e.offsetX - this.rectOrigin.X);
        let ySign = Math.sign(e.offsetY - this.rectOrigin.Y);
        points.push([this.rectOrigin.X, diff * ySign + this.rectOrigin.Y]);
        points.push([diff * xSign + this.rectOrigin.X, diff * ySign + this.rectOrigin.Y]);
        points.push([diff * xSign + this.rectOrigin.X, this.rectOrigin.Y]);
      }
      else {
        points.push([this.rectOrigin.X, e.offsetY]);
        points.push([e.offsetX, e.offsetY]);
        points.push([e.offsetX, this.rectOrigin.Y]);
      }
      points.push([this.rectOrigin.X, this.rectOrigin.Y]);
      this.element!.shape.points = points;
      this.plotAngledShape();
    }
  }

  editShape_mm(e: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragIndex !== undefined) {
      if (e.buttons !== 1) return this.editShape_mu();
      let elem = this.element!, phi = elem.shape.phi, discRadius = this.sd.discRadius, oldCenter = elem.shape.getCenter();
      let [x, y] = Util.rotate([e.offsetX, e.offsetY], oldCenter, -phi);
      elem.shape.points[this.dragIndex] = [x, y];
      let prevIndex = this.dragIndex === 0 ? 3 : this.dragIndex - 1,
        nextIndex = this.dragIndex === 3 ? 0 : this.dragIndex + 1;
      if (this.dragIndex % 2 === 0) {
        elem.shape.points[prevIndex][1] = y;
        elem.shape.points[nextIndex][0] = x;
      } else {
        elem.shape.points[prevIndex][0] = x;
        elem.shape.points[nextIndex][1] = y;
      }
      elem.shape.points[elem.shape.points.length - 1] = [...elem.shape.points[0]];
      elem.shape.centerChanged(Util.rotate(elem.shape.getCenter(), oldCenter, phi));
      elem.discs.forEach((disc, i) => disc.move(elem.shape.points[i][0], elem.shape.points[i][1]));
      this.plotAngledShape();
      this.rotate();
    }
  }

  override processShape(): void {
    let shape = this.shape!, points = shape.points;
    if (points[0][0] === points[3][0]) {
      let p = points[1];
      points[1] = [...points[3]];
      points[3] = [...p];
    }
    if (points[0][0] != points[1][0]) {
      shape.phi = Math.atan2(points[3][1] - points[0][1], points[3][0] - points[0][0]) * 180 / Math.PI;
      shape.points = points.map(p => Util.rotate(p, shape.getCenter(), -shape.phi));
    }
  }
}