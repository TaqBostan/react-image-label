import { ArrayXY, PointArray } from '@svgdotjs/svg.js'
import { AngledBuilder } from "../AngledBuilder";
import { Rectangle, Point } from "../types";
import { ShapeBuilder } from '../ShapeBuilder';

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

  editShapeMouseMove(event: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragPointIndex !== undefined) {
      let discRadius = ShapeBuilder.statics.discRadius;
      this.element!.shape.points[this.dragPointIndex] = [event.offsetX, event.offsetY];
      this.element!.discs[this.dragPointIndex].move(event.offsetX - discRadius, event.offsetY - discRadius);
      let prevIndex = this.dragPointIndex === 0 ? 3 : this.dragPointIndex - 1,
        nextIndex = this.dragPointIndex === 3 ? 0 : this.dragPointIndex + 1;
      if (this.dragPointIndex % 2 === 0) {
        this.element!.shape.points[prevIndex][1] = event.offsetY;
        this.element!.shape.points[nextIndex][0] = event.offsetX;
        this.element!.discs[prevIndex].move(this.element!.shape.points[prevIndex][0] - discRadius, event.offsetY - discRadius);
        this.element!.discs[nextIndex].move(event.offsetX - discRadius, this.element!.shape.points[nextIndex][1] - discRadius);
      } else {
        this.element!.shape.points[prevIndex][0] = event.offsetX;
        this.element!.shape.points[nextIndex][1] = event.offsetY;
        this.element!.discs[prevIndex].move(event.offsetX - discRadius, this.element!.shape.points[prevIndex][1] - discRadius);
        this.element!.discs[nextIndex].move(this.element!.shape.points[nextIndex][0] - discRadius, event.offsetY - discRadius);
      }
      this.element!.shape.points[this.element!.shape.points.length - 1] = [...this.element!.shape.points[0]];
      this.plotAngledShape();
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