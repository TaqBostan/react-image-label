import { AngledBuilder } from "../AngledBuilder";
import { ShapeBuilder } from "../ShapeBuilder";
import { Polygon, Color } from "../types";

export default class PolygonBuilder extends AngledBuilder<Polygon> {
  startClicked: boolean = false;
	shape?: Polygon;
  newShape = () => new Polygon();

  ofType<T>(shape: T): boolean {
    return shape instanceof Polygon;
  }

  startDraw(addPolyline: () => void): void {
    this.svg.click((event: MouseEvent) => this.addPoint(event, () => addPolyline()));
    this.svg.mousemove((event: MouseEvent) => this.newPolygonMouseMove(event));
    this.svg.dblclick((event: MouseEvent) => this.addPointAndClose(event, () => addPolyline()));
  }

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
      this.createElement(new Polygon());
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

  stopDraw(): void {
    if (this.element && this.element.shape.id === 0) {
      this.element.remove();
      this.element.shadow.remove();
      this.element.discs.forEach(disc => disc.remove());
    }
    this.svg.off('click');
    this.svg.off('mousemove');
    this.svg.off('dblclick');
  }
}