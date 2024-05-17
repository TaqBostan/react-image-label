import { ArrayXY, PointArray } from '@svgdotjs/svg.js'
import { AngledBuilder } from "../AngledBuilder";
import { Rectangle, Point } from "../types";
import { ShapeBuilder } from '../ShapeBuilder';
import Util from '../util';

export default class RectangleBuilder extends AngledBuilder<Rectangle> {
  rectOrigin?: Point;
  shape?: Rectangle;
  newShape = () => new Rectangle();

  ofType<T>(shape: T): boolean {
    return shape instanceof Rectangle;
  }

  rectangleMouseDown(event: MouseEvent, addPolyline: () => void) {
    if (event.button === 0 && !this.rectOrigin) {
      if (this.element?.editing) this.stopEdit()
      this.rectOrigin = { X: event.offsetX, Y: event.offsetY };
      this.createElement(new Rectangle());
      this.svg.mousemove((event: any) => this.newRectangleMouseMove(event));
      this.svg.mouseup((event: MouseEvent) => this.rectangleMouseUp(event, addPolyline));
    }
  }

  startDraw(addPolyline: () => void) {
    this.svg.mousedown((event: MouseEvent) => this.rectangleMouseDown(event, addPolyline));
  }

  stopDraw() {
    this.svg.off('mousedown').off('mouseup');
  }

  newRectangleMouseMove(event: MouseEvent) {
    if (this.rectOrigin) {
      let points: ArrayXY[] | PointArray = [] = [];
      points.push([this.rectOrigin.X, this.rectOrigin.Y]);
      if (event.shiftKey) {
        let diff = Math.min(Math.abs(this.rectOrigin.X - event.offsetX), Math.abs(this.rectOrigin.Y - event.offsetY));
        let xSign = Math.sign(event.offsetX - this.rectOrigin.X);
        let ySign = Math.sign(event.offsetY - this.rectOrigin.Y);
        points.push([this.rectOrigin.X, diff * ySign + this.rectOrigin.Y]);
        points.push([diff * xSign + this.rectOrigin.X, diff * ySign + this.rectOrigin.Y]);
        points.push([diff * xSign + this.rectOrigin.X, this.rectOrigin.Y]);
      }
      else {
        points.push([this.rectOrigin.X, event.offsetY]);
        points.push([event.offsetX, event.offsetY]);
        points.push([event.offsetX, this.rectOrigin.Y]);
      }
      points.push([this.rectOrigin.X, this.rectOrigin.Y]);
      this.element!.shape.points = points;
      this.plotAngledShape();
    }
  }

  editShape_mm(event: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragIndex !== undefined) {
      let elem = this.element!, fi = elem.shape.fi, discRadius = ShapeBuilder.statics.discRadius, oldCenter = elem.shape.getCenter();
      let [x, y] = Util.rotate([event.offsetX, event.offsetY], oldCenter, -fi);
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
      elem.shape.centerChanged(Util.rotate(elem.shape.getCenter(), oldCenter, fi));
      elem.discs.forEach((disc, i) => disc.move(elem.shape.points[i][0] - discRadius, elem.shape.points[i][1] - discRadius));
      this.plotAngledShape();
      this.rotate();
    }
  }

  rectangleMouseUp(event: MouseEvent, addPolyline: () => void) {
    if (this.rectOrigin) {
      if (Math.abs(this.rectOrigin.X - event.offsetX) < 10 &&
        Math.abs(this.rectOrigin.Y - event.offsetY) < 10) {
        this.rectOrigin = undefined;
        return;
      }
      if (!this.element) throw new Error();
      this.element.shape.points.filter((point, index) => index < this.element!.shape.points.length - 1)
        .forEach(point => {
          this.element!.discs.push(this.drawDisc(point[0], point[1], 2, '#000'))
        });
      this.svg.off('mousemove').off('mouseup');
      addPolyline();
      this.rectOrigin = undefined;
    }
  }

  override processShape(): void {
    let shape = this.shape!;
    if (shape.points[0][0] != shape.points[1][0]) {
      let p = shape.points[1];
      shape.points[1] = [...shape.points[3]];
      shape.points[3] = [...p];
    }
  }
}