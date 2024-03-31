import { AngledBuilder, AngledDirector, IlPolyline } from "../AngledBuilder";
import { Director } from "../base";
import { Polygon, Color } from "../types";

class PolygonBuilder extends AngledBuilder<Polygon> {
  startClicked: boolean = false;
  addPoint(event: MouseEvent, addAngledShape: () => void) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!this.element) throw new Error();
    if (this.startClicked) {
      this.element.discs[0].remove();
      let origin = this.element.shape.points[0];
      this.element.discs[0] = this.drawDisc(origin[0], origin[1], 4, Color.BlackDisc);
      this.element.discs.forEach(_circle => {
        _circle.fill(Color.BlackDisc);
        _circle.size(4);
      });
      this.startClicked = false;
      addAngledShape();
      this.newAngledShape(new Polygon());
      //segmentor.sendPolyline(id);
    }
    else {
      if (this.element.hasConnector) {
        this.element.shape.points.pop();
        this.element.hasConnector = false;
      }
      let x = event.offsetX, y = event.offsetY;
      let radius = 5 + PolygonBuilder.width / 150;
      if (this.element.shape.points.length >= 3 &&
        Math.pow(this.element.shape.points[0][0] - x, 2) +
        Math.pow(this.element.shape.points[0][1] - y, 2) < Math.pow(radius, 2)) {
        this.startClicked = true;
        x = this.element.shape.points[0][0];
        y = this.element.shape.points[0][1];
      }
      this.element.shape.points.push([x, y]);
      this.plotAngledShape();

      let _radius = this.element.shape.points.length === 1 ? 5 : 3;

      if (this.element.shape.points.length === 1) {
        let disc = this.drawDisc(x, y, _radius, Color.GreenDisc);
        this.element.discs = [disc];
        disc.mouseover(() => {
          if (this.element!.shape.points.length > 2)
            disc.animate().attr({ fill: Color.LightGreenLine });
        })
        disc.mouseout(() => {
          disc.animate().attr({ fill: Color.GreenDisc });
        })
        disc.attr('class', 'seg-point');
      }
      else {
        if (this.startClicked) {
          this.element.discs[0].attr('class', '');
          this.addPoint({ ...event, offsetX: x, offsetY: y }, addAngledShape);
        }
        else {
          this.element.discs.push(this.drawDisc(x, y, _radius, Color.GrayDisc));
        }
      }

    }
  }
  newPolygonMouseMove(event: MouseEvent) {
    if (this.element!.shape.points.length) {
      if (!this.element) return;
      // Draws a line from the last point to the mouse location
      if (this.element.hasConnector)
        this.element.shape.points.pop();
      else
        this.element.hasConnector = true;
      this.element.shape.points.push([event.offsetX, event.offsetY]);
      this.plotAngledShape();
    }
  }
  editShapeMouseMove(event: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragPointIndex !== undefined) {
      this.element!.shape.points[this.dragPointIndex] = [event.offsetX, event.offsetY];
      this.element!.discs[this.dragPointIndex].move(event.offsetX - 5, event.offsetY - 5);
      if (this.dragPointIndex === 0)
        this.element!.shape.points[this.element!.shape.points.length - 1] = [event.offsetX, event.offsetY];
      this.plotAngledShape();
    }
  }
  addPointAndClose(event: MouseEvent, addAngledShape: () => void) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!this.element) throw new Error();
    if (this.element.hasConnector) {
      this.element.shape.points.pop();
      this.element.hasConnector = false;
    }
    else {
      this.element.shape.points.pop();
      let circle = this.element!.discs.pop();
      circle!.remove();
    }
    this.startClicked = true;
    let x = this.element.shape.points[0][0];
    let y = this.element.shape.points[0][1];
    this.element.shape.points.push([x, y]);
    this.plotAngledShape();
    this.element.discs[0].attr('class', '');
    this.addPoint({ ...event, offsetX: x, offsetY: y }, addAngledShape);
  }
}

export class PolygonDirector extends AngledDirector<Polygon>{
  private static instance?: PolygonDirector;
	
  constructor(public builder = new PolygonBuilder()) {
    super();
  }

  static override getInstance(): PolygonDirector {
    if (!PolygonDirector.instance) PolygonDirector.instance = new PolygonDirector();
    return PolygonDirector.instance;
  }

  startDraw(): void {
    this.builder.newAngledShape(new Polygon());
    this.builder.svg.click((event: MouseEvent) => this.builder.addPoint(event, () => this.addAngledShape()));
    this.builder.svg.mousemove((event: MouseEvent) => this.builder.newPolygonMouseMove(event));
    this.builder.svg.dblclick((event: MouseEvent) => this.builder.addPointAndClose(event, () => this.addAngledShape()));
  }

  zoom(factor: number): void {
    Director.elements.forEach(elem => (elem.shape instanceof Polygon) && this.zoomAngledShape(elem as IlPolyline, factor));
    if (this.builder.element && this.builder.element.shape.id === 0) {
      if (this.builder.element.shape instanceof Polygon) {
        this.zoomAngledShape(this.builder.element, factor);
      }
    }
  }

  stopDraw(): void {
    if (this.builder.element && this.builder.element.shape.id === 0) {
      this.builder.element.remove();
      this.builder.element.shadow.remove();
      this.builder.element.discs.forEach(disc => disc.remove());
    }
    this.builder.svg.off('click');
    this.builder.svg.off('mousemove');
    this.builder.svg.off('dblclick');
  }
}