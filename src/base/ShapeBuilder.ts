import { Svg, Element } from "react-svgdotjs";
import { IlShape, ElementWithExtra, Color, Point, Polygon } from "./types";

export abstract class ShapeBuilder<Shape extends IlShape> {
    static _svg: Svg;
    svg: Svg = ShapeBuilder._svg;
    abstract element?: ElementWithExtra;
    abstract shape?: Shape;
    //#region static data
    static editing: boolean = false;
    static width: number;
    static height: number;
    static ratio: number = 1;
    //#endregion
    //#region drag
    private lastPoint?: Point;
    private originPoint?: Point;
    protected moveIconPath?: Element;
    drawing: boolean = false;
    //#endregion
    abstract plotShape(): void;
    abstract createElement(shape: Shape): void;
    abstract newShape(): Shape;
    abstract startDraw(addShape: () => void): void;
    abstract plot(element: ElementWithExtra): void;
    abstract stopDraw(): void;
    abstract editShape(): void;
    dragPointIndex?: number;
  
    drawDisc(x: number, y: number, radius: number, color: string) {
      return this.svg.circle(2 * radius).fill(color).move(x - radius, y - radius);
    }

    abstract ofType<T extends IlShape>(shape: T): boolean;
  
    setOptions(element: ElementWithExtra, classes: string[]) {
      let labeled = classes.length > 0;
      element.stroke({ color: labeled ? Color.WhiteLine : Color.RedLine });
  
      if (element.classNames) element.classNames.remove();
      if (element.classNamesWrapper) element.classNamesWrapper.remove();
      if (labeled) {
        let pos = element.shape.labelPosition();
        let classNames = classes.join(', ');
        element.classNames = this.svg.plain(classNames).font({ size: 12, weight: 'bold' });
        let width = element.classNames.bbox().width;
        let height = element.classNames.bbox().height;
        element.classNamesWrapper = this.svg.rect(width, height).radius(2).move(pos[0] - width / 2, pos[1] + height / 4).fill('#ffffff80');
        element.classNames.clear();
        element.classNames = this.svg.plain(classNames);
        element.classNames.move(pos[0], pos[1]).font({ fill: '#3a4620', size: 12, anchor: 'middle', weight: 'bold' }).attr('class', 'class-names');
      }
    }
  
    removeElement(element: ElementWithExtra) {
      if (element.classNames) element.classNames.remove();
      if (element.classNamesWrapper) element.classNamesWrapper.remove();
      element.discs.forEach(disc => disc.remove());
      element.shadow.remove();
      element.remove();
    }
  
    addMoveIcon(): void {
      let center = this.element!.shape.getCenter();
      let str = `M${center[0] + 11.3},${center[1]}l-4.6-4.6v2.4h-4.5v-4.5h2.4l-4.6,-4.6l-4.6,4.6h2.4v4.5h-4.5v-2.4l-4.6,4.6l4.6,4.6v-2.4h4.5v4.5h-2.4l4.6,4.6
          l4.6-4.6h-2.4v-4.5h4.5v2.4l4.6-4.6z`;
      this.moveIconPath = this.svg.path(str);
      this.element!.after(this.moveIconPath);
      this.moveIconPath.attr('class', 'move-icon grabbable');
      this.moveIconPath.mousedown((event: MouseEvent) => this.mouseDown(event));
    }
  
    initDrag() {
      this.element!.addClass('grabbable');
      this.addMoveIcon();
      this.element!.mousedown((event: MouseEvent) => this.mouseDown(event));
      this.svg.mouseup(() => this.mouseUp());
    }
  
    stopDrag() {
      if (this.element) {
        this.element.removeClass('grabbable');
        this.element.off('mousedown');
        this.svg.off('mousemove');
        this.svg.off('mouseup');
        if (this.moveIconPath) this.moveIconPath.remove();
        this.lastPoint = undefined;
        this.originPoint = undefined;
        this.moveIconPath = undefined;
      }
    }
  
    mouseDown(event: MouseEvent) {
      if (event.button === 0 && !this.lastPoint) {
        this.lastPoint = { X: event.offsetX, Y: event.offsetY };
        this.originPoint = { X: event.offsetX, Y: event.offsetY };
        this.moveIconPath!.remove();
        this.svg.mousemove((event: MouseEvent) => this.mouseMove(event));
      }
    }
  
    mouseMove(event: MouseEvent) {
      if (this.lastPoint) {
        if (!this.element) return;
        let dx = event.offsetX - this.lastPoint.X, dy = event.offsetY - this.lastPoint.Y;
        this.element.cx(this.element.cx() + dx);
        this.element.cy(this.element.cy() + dy);
        this.element.shadow.cx(this.element.shadow.cx() + dx);
        this.element.shadow.cy(this.element.shadow.cy() + dy);
        this.element.discs.forEach(disc => {
          disc.cx(disc.cx() + dx);
          disc.cy(disc.cy() + dy);
        })
        if (this.element!.connector) {
          this.element.connector.cx(this.element.connector.cx() + dx);
          this.element.connector.cy(this.element.connector.cy() + dy);
        }
        this.lastPoint = { X: event.offsetX, Y: event.offsetY };
      }
    }
  
    mouseUp() {
      if (this.lastPoint) {
        if (!this.element) return;
        let x = this.lastPoint.X - this.originPoint!.X + this.element.shape.getCenter()[0];
        let y = this.lastPoint.Y - this.originPoint!.Y + this.element.shape.getCenter()[1];
        this.element.shape.centerChanged([x, y]);
        this.addMoveIcon();
        this.lastPoint = undefined;
        this.originPoint = undefined;
        this.svg.off('mousemove');
      }
    }
  
    zoom(elem: ElementWithExtra, factor: number): void {
      elem.shape.zoom(factor);
      this.plot(elem);
      elem.discs?.forEach(_disc => {
        _disc.cx(_disc.cx() * factor);
        _disc.cy(_disc.cy() * factor);
      });
      if (this.element && this.element.shape.id === 0) {
        this.zoom(this.element, factor);
      }
      if (elem.shape.classes.length > 0) this.setOptions(elem, elem.shape.classes);
    }
  
    stopEdit() {
      if (ShapeBuilder.editing && this.element && this.element.editing) {
        ShapeBuilder.editing = this.element.editing = false;
        this.stopDrag();
        this.stopEditShape(this.element);
      }
    }
  
    stopEditShape(elem: ElementWithExtra): void {
      elem.discs?.forEach((_disc, index) => {
        _disc.fill(Color.BlackDisc);
        _disc.size(4);
        _disc.removeClass('seg-point');
        this.dragPointIndex = undefined;
        _disc.off('mousedown');
        _disc.off('mouseup')
      });
      let shape = elem.shape;
      if (shape.classes.length > 0) this.setOptions(elem, shape.classes);
    }
  
    edit(): void {
      let polyline = this.element!;
      ShapeBuilder.editing = true;
      this.element!.editing = true;
      if (polyline.classNames) polyline.classNames.clear();
      if (polyline.classNamesWrapper) polyline.classNamesWrapper.remove();
      this.initDrag();
      this.editShape();
    }
  }