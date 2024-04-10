import { Svg } from "react-svgdotjs";
import { Shape, ElementWithExtra, Color, Point, Polygon, StaticData } from "./types";
import { ArrayXY, Path } from '@svgdotjs/svg.js'

export abstract class ShapeBuilder<T extends Shape> {
  static _svg: Svg;
  svg: Svg = ShapeBuilder._svg;
  abstract element?: ElementWithExtra;
  abstract shape?: T;
  //#region static data
  static statics: StaticData;
  static editing: boolean = false;
  //#endregion
  //#region drag
  private lastPoint?: Point;
  private originPoint?: Point;
  private moveIcon = (center: ArrayXY) => `M${center[0] + 11.3},${center[1]}l-4.6-4.6v2.4h-4.5v-4.5h2.4l-4.6,-4.6l-4.6,4.6h2.4v4.5h-4.5v-2.4l-4.6,4.6l4.6,4.6v-2.4h4.5v4.5h-2.4l4.6,4.6
  l4.6-4.6h-2.4v-4.5h4.5v2.4l4.6-4.6z`;
  protected moveIconPath?: Path;
  drawing: boolean = false;
  //#endregion
  abstract plotShape(): void;
  abstract createElement(shape: T): void;
  abstract newShape(): T;
  abstract startDraw(addShape: () => void): void;
  abstract plot(element: ElementWithExtra): void;
  abstract stopDraw(): void;
  abstract editShape(): void;
  dragPointIndex?: number;

  drawDisc(x: number, y: number, radius: number, color: string) {
    return this.svg.circle(2 * radius).fill(color).move(x - radius, y - radius);
  }

  abstract ofType<S extends Shape>(shape: S): boolean;

  basePlotShape() {
    this.plotShape();
    this.setOptions(this.element!, this.element!.shape.categories);
  }

  setOptions(element: ElementWithExtra, categories: string[]) {
    let labeled = categories.length > 0;
    element.stroke({ color: labeled ? Color.WhiteLine : Color.RedLine });

    if (element.categoriesPlain) element.categoriesPlain.remove();
    if (element.categoriesRect) element.categoriesRect.remove();
    if (labeled) {
      let pos = element.shape.labelPosition();
      let categoriesPlain = categories.join(', ');
      element.categoriesPlain = this.svg.plain(categoriesPlain).font({ size: 12, weight: 'bold' });
      let width = element.categoriesPlain.bbox().width;
      let height = element.categoriesPlain.bbox().height;
      element.categoriesRect = this.svg.rect(width, height).radius(2).move(pos[0] - width / 2, pos[1] + height / 4).fill('#ffffff80');
      element.categoriesPlain.clear();
      element.categoriesPlain = this.svg
        .plain(categoriesPlain)
        .move(pos[0], pos[1])
        .font({ fill: '#3a4620', size: 12, anchor: 'middle', weight: 'bold' })
        .addClass('class-names');
    }
  }

  removeElement() {
    let elem = this.element!;
    if (elem.editing) ShapeBuilder.editing = false;
    this.moveIconPath?.remove();
    elem.categoriesPlain?.remove();
    elem.categoriesRect?.remove();
    elem.connector?.remove();
    elem.discs.forEach(disc => disc.remove());
    elem.shadow.remove();
    elem.remove();
    if (this.drawing) this.createElement(this.newShape());
  }

  addMoveIcon(): void {
    let str = this.moveIcon(this.element!.shape.getCenter());
    this.moveIconPath = this.svg.path(str);
    this.element!.after(this.moveIconPath);
    this.moveIconPath.attr('class', 'move-icon grabbable');
    this.moveIconPath
      .mousedown((ev: MouseEvent) => this.mouseDown(ev))
      .on('contextmenu', (ev: any) => {
        ev.preventDefault();
        this.element!.node.dispatchEvent!(new Event('contextmenu', ev));
      })
  }

  initDrag() {
    this.element!.addClass('grabbable')
      .click((event: MouseEvent) => { event.stopPropagation(); })
      .mousedown((event: MouseEvent) => this.mouseDown(event));
    this.addMoveIcon();
  }

  stopDrag() {
    if (this.element) {
      this.element.removeClass('grabbable').off('click').off('mousedown');
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
      this.svg.mousemove((event: MouseEvent) => this.mouseMove(event))
        .mouseup(() => this.mouseUp());
      event.stopPropagation();
    }
  }

  mouseMove(event: MouseEvent) {
    if (this.lastPoint) {
      if (!this.element) return;
      let dx = event.offsetX - this.lastPoint.X, dy = event.offsetY - this.lastPoint.Y;
      this.element.cx(this.element.cx() + dx).cy(this.element.cy() + dy);
      this.element.shadow.cx(this.element.shadow.cx() + dx).cy(this.element.shadow.cy() + dy);
      this.element.discs.forEach(disc => {
        disc.cx(disc.cx() + dx).cy(disc.cy() + dy);
      })
      if (this.element!.connector)
        this.element.connector.cx(this.element.connector.cx() + dx).cy(this.element.connector.cy() + dy);
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
      this.svg.off('mousemove').off('mouseup');
    }
  }

  zoom(elem: ElementWithExtra, factor: number): void {
    elem.shape.zoom(factor);
    this.plot(elem);
    elem.discs?.forEach(_disc => _disc.cx(_disc.cx() * factor).cy(_disc.cy() * factor));
    elem.connector?.plot(elem.connector.array().map(p => [p[0] * factor, p[1] * factor] as ArrayXY));
    this.moveIconPath?.plot(this.moveIcon(elem.shape.getCenter()))
    this.setOptions(elem, elem.shape.categories);
  }

  stopEdit() {
    if (ShapeBuilder.editing && this.element && this.element.editing) {
      ShapeBuilder.editing = this.element.editing = false;
      this.stopDrag();
      this.stopEditShape(this.element);
      if (this.drawing) this.createElement(this.newShape());
    }
  }

  stopEditShape(elem: ElementWithExtra): void {
    elem.discs?.forEach((_disc, index) => {
      _disc.fill(Color.BlackDisc).size(4).removeClass('seg-point')
        .off('click').off('mousedown').off('mouseup')
      this.dragPointIndex = undefined;
    });
    this.setOptions(elem, elem.shape.categories);
  }

  edit(): void {
    let polyline = this.element!;
    ShapeBuilder.editing = true;
    this.element!.editing = true;
    if (polyline.categoriesPlain) polyline.categoriesPlain.clear();
    if (polyline.categoriesRect) polyline.categoriesRect.remove();
    this.initDrag();
    this.editShape();
  }
}