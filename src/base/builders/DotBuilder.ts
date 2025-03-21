import { IlElementExtra, Color, Dot, ElementWithExtra, ArrayXY } from "./../types";
import { ShapeBuilder } from "./../ShapeBuilder";

class IDot extends SVGPolylineElement implements IlElementExtra {
  discs!: SVGCircleElement[];
  classNames?: Text;
  classNamesWrapper?: SVGRectElement;
  shape!: Dot;
  shadow!: SVGCircleElement;
  editing: boolean = false;
  connector?: SVGPolylineElement;
}

export class DotBuilder extends ShapeBuilder<Dot> {
  shape?: Dot;
  element?: IDot;
  canRotate = false;
	canHB = false;
  newShape = () => new Dot();
  ofType<T>(shape: T): boolean {
    return shape instanceof Dot;
  }

  createElement(shape: Dot): void {
    let [x, y] = shape.position;
    let polyline = this.svg.polyline(this.vertices(x, y, 16, 13))
      .fill(Color.ShapeFill)
      .stroke({ color: Color.BlackLine, width: 1, opacity: 0.8, dasharray: "3,3" });
    let elem = Object.assign(polyline, {
      shape,
      shadow: this.drawDisc(x, y, 6, Color.BlackLine).opacity(0.4),
      discs: [this.drawDisc(x, y, 4, Color.RedLine).opacity(0.6)],
      editing: false
    });
    elem.discs[0].after(elem);
    this.element = elem;
  }

  labeledStyle(element: ElementWithExtra, labeled: boolean) {
    element.discs[0].fill(labeled ? Color.WhiteLine : Color.RedLine);
  }

  plotShape(): void {
    let shape = this.shape!;
    shape.zoom(this.sd.ratio);
    this.createElement(shape);
  }

  startDraw(): void {
    this.svg.click((event: MouseEvent) => this.drawClick(event));
  }

  drawClick(event: MouseEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey) return;
    let elem = this.element!;
    if (elem.editing) {
      this.stopEdit()
      this.createElement(new Dot());
      this.drawClick(event);
    }
    else {
      elem.shape.position = [event.offsetX, event.offsetY];
      elem.discs[0].move(event.offsetX, event.offsetY);
      this.plot(elem);
      this.enlist(elem.shape);
    }
  }

  plot(elem: IDot): void {
    let [x, y] = elem.shape.position;
    elem.shadow.move(x, y);
    elem.plot(this.vertices(x, y, 16, 13));
  }

  stopDraw(): void {
    this.svg.off('click');
  }

  editShape(): void {
  }

  stopEditShape(elem: IDot): void {
		let shape = elem.shape;
    this.setOptions(elem, shape.categories, shape.color);
  }

  vertices(x: number, y: number, w: number, h: number) : ArrayXY[] {
    return [[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h], [x - w, y - h]];
  }
}