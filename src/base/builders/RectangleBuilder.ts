import { ArrayXY, PointArray } from '@svgdotjs/svg.js'
import { AngledBuilder, AngledDirector, IlPolyline } from "../AngledBuilder";
import { Rectangle, Point } from "../types";
import { Director } from '../base';

class RectangleBuilder extends AngledBuilder<Rectangle> {
  rectOrigin?: Point;

  rectangleMouseDown(event: MouseEvent) {
    if (event.button === 0 && !this.rectOrigin) this.rectOrigin = { X: event.offsetX, Y: event.offsetY };
  }

  startDraw(addPolyline: () => void) {
    this.svg.mousedown((event: MouseEvent) => this.rectangleMouseDown(event));
    this.svg.mousemove((event: MouseEvent) => this.newRectangleMouseMove(event));
    this.svg.mouseup((event: MouseEvent) => this.rectangleMouseUp(event, addPolyline));
  }

  stopDraw() {
    this.svg.off('mousedown');
    this.svg.off('mousemove');
    this.svg.off('mouseup');
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
      this.polyline!.shape.points = points;
      this.plotAngledShape();
    }
  }

  editRectangleMouseMove(event: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragPointIndex !== undefined) {
      this.polyline!.shape.points[this.dragPointIndex] = [event.offsetX, event.offsetY];
      this.polyline!.discs[this.dragPointIndex].move(event.offsetX - 5, event.offsetY - 5);
      let prevIndex = this.dragPointIndex === 0 ? 3 : this.dragPointIndex - 1,
        nextIndex = this.dragPointIndex === 3 ? 0 : this.dragPointIndex + 1;
      if (this.dragPointIndex % 2 === 0) {
        this.polyline!.shape.points[prevIndex][1] = event.offsetY;
        this.polyline!.shape.points[nextIndex][0] = event.offsetX;
        this.polyline!.discs[prevIndex].move(this.polyline!.shape.points[prevIndex][0] - 5, event.offsetY - 5);
        this.polyline!.discs[nextIndex].move(event.offsetX - 5, this.polyline!.shape.points[nextIndex][1] - 5);
      } else {
        this.polyline!.shape.points[prevIndex][0] = event.offsetX;
        this.polyline!.shape.points[nextIndex][1] = event.offsetY;
        this.polyline!.discs[prevIndex].move(event.offsetX - 5, this.polyline!.shape.points[prevIndex][1] - 5);
        this.polyline!.discs[nextIndex].move(this.polyline!.shape.points[nextIndex][0] - 5, event.offsetY - 5);
      }
      this.polyline!.shape.points[this.polyline!.shape.points.length - 1] = [...this.polyline!.shape.points[0]];
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
      //this.mouseMove(event);
      if (!this.polyline) throw new Error();
      this.polyline.shape.points.filter((point, index) => index < this.polyline!.shape.points.length - 1)
        .forEach(point => {
          this.polyline!.discs.push(this.drawDisc(point[0], point[1], 2, '#000'))
        });
      addPolyline();
      //segmentor.sendPolyline(id);
      this.newAngledShape(new Rectangle());
      this.rectOrigin = undefined;
    }
  }
}

export class RectangleDirector extends AngledDirector<Rectangle>{
  private static instance?: RectangleDirector;
	
  constructor(public builder = new RectangleBuilder()) {
    super();
  }

  static override getInstance(): RectangleDirector {
    if (!RectangleDirector.instance) RectangleDirector.instance = new RectangleDirector();
    return RectangleDirector.instance;
  }

  override plot(shapes: Rectangle[]): void {
    shapes.forEach(shape => {
      if (shape.points[0][0] != shape.points[1][0]) {
        let p = shape.points[1];
        shape.points[1] = [...shape.points[3]];
        shape.points[3] = [...p];
      }
    });
    super.plot(shapes);
  }

  zoom(factor: number): void {
		Director.elements.forEach(elem => (elem.shape instanceof Rectangle) && this.zoomAngledShape(elem as IlPolyline, factor));
  }

  startDraw(): void {
    this.builder.newAngledShape(new Rectangle());
    this.builder.startDraw(() => this.addAngledShape());
  }

  stopDraw(): void {
    this.builder.stopDraw();
  }

  innerEdit(): void {
    this.builder.svg.mousemove((event: MouseEvent) => this.builder.editRectangleMouseMove(event));
  }
  innerStopEdit(): void {
    this.builder.svg.off('mousemove');
  }
}