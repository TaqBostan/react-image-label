import { AngledBuilder } from "../AngledBuilder";
import { Polygon, Color } from "../types";

export default class PolygonBuilder extends AngledBuilder<Polygon> {
  startClicked: boolean = false;
  shape?: Polygon;
  canRotate = false;
  newShape = () => new Polygon();

  ofType<T>(shape: T): boolean {
    return shape instanceof Polygon;
  }

  startDraw(): void {
    this.svg.click((event: MouseEvent) => this.addPoint(event));
    this.svg.dblclick((event: MouseEvent) => this.addPointAndClose(event));
  }

  addPoint(event: MouseEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey || event.detail > 1) return;
    if (!this.element) throw new Error();
    let elem = this.element;
    if (this.startClicked) {
      elem.discs[0].remove();
      let origin = elem.shape.points[0];
      elem.discs[0] = this.drawDisc(origin[0], origin[1], 4, Color.BlackDisc);
      elem.discs.forEach(_circle => {
        _circle.fill(Color.BlackDisc).size(4);
      });
      this.startClicked = false;
      this.svg.off('mousemove');
      this.enlist(elem.shape);
    }
    else {
      if (elem.hasConnector) {
        elem.shape.points.pop();
        elem.hasConnector = false;
      }
      if (elem.editing) {
        this.stopEdit()
        this.createElement(new Polygon());
      }
      let x = event.offsetX, y = event.offsetY;
      let radius = this.sd.discRadius + this.sd.width / 150;
      if (elem.shape.points.length >= 3 &&
        Math.pow(elem.shape.points[0][0] - x, 2) +
        Math.pow(elem.shape.points[0][1] - y, 2) < Math.pow(radius, 2)) {
        this.startClicked = true;
        x = elem.shape.points[0][0];
        y = elem.shape.points[0][1];
      }
      elem.shape.points.push([x, y]);
      this.plotAngledShape();

      let _radius = elem.shape.points.length === 1 ? 5 : 3;

      if (elem.shape.points.length === 1) {
        this.svg.mousemove((event: MouseEvent) => this.newPlg_mm(event));
        let disc = this.drawDisc(x, y, _radius, Color.GreenDisc);
        elem.discs = [disc];
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
          elem.discs[0].attr('class', '');
          this.addPoint({ ...event, offsetX: x, offsetY: y });
        }
        else {
          elem.discs.push(this.drawDisc(x, y, _radius, Color.GrayDisc));
        }
      }

    }
  }

  newPlg_mm(event: MouseEvent) {
    if (!this.element) return;
    // Draws a line from the last point to the mouse location
    if (this.element.hasConnector)
      this.element.shape.points.pop();
    else
      this.element.hasConnector = true;
    this.element.shape.points.push([event.offsetX, event.offsetY]);
    this.plotAngledShape();
  }

  editShape_mm(e: MouseEvent) {
    // Moves a vertex of the polyline
    if (this.dragIndex !== undefined) {
      if (e.buttons !== 1) return this.editShape_mu();
      let discRadius = this.sd.discRadius;
      this.element!.shape.points[this.dragIndex] = [e.offsetX, e.offsetY];
      this.element!.discs[this.dragIndex].move(e.offsetX - discRadius, e.offsetY - discRadius);
      if (this.dragIndex === 0)
        this.element!.shape.points[this.element!.shape.points.length - 1] = [e.offsetX, e.offsetY];
      this.plotAngledShape();
    }
  }

  addPointAndClose(event: MouseEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!this.element) throw new Error();
    if(this.element.shape.points.length < 3) return;
    this.startClicked = true;
    let x = this.element.shape.points[0][0];
    let y = this.element.shape.points[0][1];
    this.element.shape.points.push([x, y]);
    this.plotAngledShape();
    this.element.discs[0].attr('class', '');
    this.addPoint({ ...event, offsetX: x, offsetY: y });
  }

  stopDraw(): void {
    if (this.element && this.element.shape.id === 0) {
      this.element.remove();
      this.element.shadow.remove();
      this.element.discs.forEach(disc => disc.remove());
    }
    this.svg.off('click').off('mousemove').off('dblclick');
  }
}