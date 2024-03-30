import { AngledBuilder, AngledDirector, IlPolyline } from "../AngledBuilder";
import { Director } from "../base";
import { Polygon, Color } from "../types";

class PolygonBuilder extends AngledBuilder<Polygon> {
  startClicked: boolean = false;
  addPoint(event: MouseEvent, addAngledShape: () => void) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!this.polyline) throw new Error();
    if (this.startClicked) {
      this.polyline.discs[0].remove();
      let origin = this.polyline.shape.points[0];
      this.polyline.discs[0] = this.drawDisc(origin[0], origin[1], 4, Color.BlackDisc);
      this.polyline.discs.forEach(_circle => {
        _circle.fill(Color.BlackDisc);
        _circle.size(4);
      });
      this.startClicked = false;
      addAngledShape();
      this.newAngledShape(new Polygon());
      //segmentor.sendPolyline(id);
    }
    else {
      if (this.polyline.hasConnector) {
        this.polyline.shape.points.pop();
        this.polyline.hasConnector = false;
      }
      let x = event.offsetX, y = event.offsetY;
      let radius = 5 + PolygonBuilder.width / 150;
      if (this.polyline.shape.points.length >= 3 &&
        Math.pow(this.polyline.shape.points[0][0] - x, 2) +
        Math.pow(this.polyline.shape.points[0][1] - y, 2) < Math.pow(radius, 2)) {
        this.startClicked = true;
        x = this.polyline.shape.points[0][0];
        y = this.polyline.shape.points[0][1];
      }
      this.polyline.shape.points.push([x, y]);
      this.plotAngledShape();

      let _radius = this.polyline.shape.points.length === 1 ? 5 : 3;

      if (this.polyline.shape.points.length === 1) {
        let disc = this.drawDisc(x, y, _radius, Color.GreenDisc);
        this.polyline.discs = [disc];
        disc.mouseover(() => {
          if (this.polyline!.shape.points.length > 2)
            disc.animate().attr({ fill: Color.LightGreenLine });
        })
        disc.mouseout(() => {
          disc.animate().attr({ fill: Color.GreenDisc });
        })
        disc.attr('class', 'seg-point');
      }
      else {
        if (this.startClicked) {
          this.polyline.discs[0].attr('class', '');
          this.addPoint({ ...event, offsetX: x, offsetY: y }, addAngledShape);
        }
        else {
          this.polyline.discs.push(this.drawDisc(x, y, _radius, Color.GrayDisc));
        }
      }

    }
  }
  newPolygonMouseMove(event: MouseEvent) {
    if (this.polyline!.shape.points.length) {
      if (!this.polyline) return;
      // Draws a line from the last point to the mouse location
      if (this.polyline.hasConnector)
        this.polyline.shape.points.pop();
      else
        this.polyline.hasConnector = true;
      this.polyline.shape.points.push([event.offsetX, event.offsetY]);
      this.plotAngledShape();
    }
  }
  editPolygonMouseMove(event: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragPointIndex !== undefined) {
      this.polyline!.shape.points[this.dragPointIndex] = [event.offsetX, event.offsetY];
      this.polyline!.discs[this.dragPointIndex].move(event.offsetX - 5, event.offsetY - 5);
      if (this.dragPointIndex === 0)
        this.polyline!.shape.points[this.polyline!.shape.points.length - 1] = [event.offsetX, event.offsetY];
      this.plotAngledShape();
    }
  }
  addPointAndClose(event: MouseEvent, addAngledShape: () => void) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!this.polyline) throw new Error();
    if (this.polyline.hasConnector) {
      this.polyline.shape.points.pop();
      this.polyline.hasConnector = false;
    }
    else {
      this.polyline.shape.points.pop();
      let circle = this.polyline!.discs.pop();
      circle!.remove();
    }
    this.startClicked = true;
    let x = this.polyline.shape.points[0][0];
    let y = this.polyline.shape.points[0][1];
    this.polyline.shape.points.push([x, y]);
    this.plotAngledShape();
    this.polyline.discs[0].attr('class', '');
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
    if (this.builder.polyline && this.builder.polyline.shape.id === 0) {
      if (this.builder.polyline.shape instanceof Polygon) {
        this.zoomAngledShape(this.builder.polyline, factor);
      }
    }
  }

  stopDraw(): void {
    if (this.builder.polyline && this.builder.polyline.shape.id === 0) {
      this.builder.polyline.remove();
      this.builder.polyline.shadow.remove();
      this.builder.polyline.discs.forEach(disc => disc.remove());
    }
    this.builder.svg.off('click');
    this.builder.svg.off('mousemove');
    this.builder.svg.off('dblclick');
  }

  innerEdit(): void {
    this.builder.svg.mousemove((event: MouseEvent) => this.builder.editPolygonMouseMove(event));
  }
  innerStopEdit(): void {
    this.builder.svg.off('mousemove');
  }
}