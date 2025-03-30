import { PathEl, SVGEl, SVGSVGEl } from "./svg-elems";
import { Shape, ElementWithExtra, Color, Point, StaticData, ArrayXY } from "./types";
import Util from "./util";

export abstract class ShapeBuilder<T extends Shape> {
  constructor(public onEdited: (shape: Shape) => void, public enlist: (shape: Shape) => void){}
  static _svg: SVGSVGEl;
  static _sd: StaticData;
  svg: SVGSVGEl = ShapeBuilder._svg;
  sd: StaticData = ShapeBuilder._sd;
  abstract element?: ElementWithExtra;
  abstract shape?: T;
  /** Stroke and discs can be hidden when not in edit/draw mode by setting hideBorder=true */
  abstract canHB: boolean;
  //#region drag
  private lastPoint?: Point;
  private moveIcon = (center: ArrayXY) => `M${center[0] + 11.3},${center[1]}l-4.6-4.6v2.4h-4.5v-4.5h2.4l-4.6,-4.6l-4.6,4.6h2.4v4.5h-4.5v-2.4l-4.6,4.6l4.6,4.6v-2.4h4.5v4.5h-2.4l4.6,4.6
  l4.6-4.6h-2.4v-4.5h4.5v2.4l4.6-4.6z`;
  protected movePath?: PathEl;
  //#endregion
  private rotateIcon = (center: ArrayXY) => `M${center[0] + 5.2},${center[1] + 4.5}a7,7,0,1,1,0-8l-3,3h9v-9l-3,3a11+11,0,1,0,0+14z`;
  protected rotateArr: SVGEl[] = [];
  protected canRotate = true;
  drawing: boolean = false;
  abstract plotShape(): void;
  abstract createElement(shape: T): void;
  abstract newShape(): T;
  abstract startDraw(): void;
  abstract plot(element: ElementWithExtra): void;
  abstract stopDraw(): void;
  abstract editShape(): void;
  dragIndex?: number;

  drawDisc(x: number, y: number, radius: number, color: string) {
    return this.svg.circle(radius).fill(color).move(x, y);
  }

  rotate(elem: ElementWithExtra = this.element!) {
    if (!this.canRotate) return;
    let shape = elem.shape, center = shape.getCenter();
    let items = [elem, elem.shadow, elem.connector, ...elem.discs];
    if (elem.editing) items.push(...this.rotateArr);
    items.forEach(el => el?.attr('transform', `rotate(${shape.phi},${center[0]},${center[1]})`));
  }

  abstract ofType<S extends Shape>(shape: S): boolean;

  basePlotShape() {
    let shape = this.shape!;
    this.plotShape();
    this.rotate();
    this.setOptions(this.element!, shape.categories, shape.color);
  }

  labeledStyle(element: ElementWithExtra, labeled: boolean, color?: string) {
    element.stroke({ color: color ? Util.removeOpacity(color) : (labeled ? Color.WhiteLine : Color.RedLine) });
  }

  setOptions(element: ElementWithExtra, categories: string[], color?: string) {
    let labeled = categories.length > 0;
    this.labeledStyle(element, labeled, color);
    element.fill(color || Color.ShapeFill);

    if (this.sd.hb && this.canHB) {
      [element.shadow, ...element.discs].forEach(el => el.addClass('il-hid'));
      element.stroke({ width: 0 });
    }

    if (element.categoriesPlain) element.categoriesPlain.remove();
    if (element.categoriesRect) element.categoriesRect.remove();
    if (labeled) {
      let pos = element.shape.labelPosition();
      let categoriesPlain = categories.join(', ');
      element.categoriesPlain = this.svg.plain(categoriesPlain).font(12, 'bold');
      let width = element.categoriesPlain.bbox().width;
      let height = element.categoriesPlain.bbox().height;
      element.categoriesRect = this.svg.rect(width, height).radius(2).move(pos[0] - width / 2, pos[1] + height / 4).fill('#ffffff80');
      element.categoriesPlain.remove();
      element.categoriesPlain = this.svg
        .plain(categoriesPlain)
        .move(pos[0], pos[1] + height)
        .font(12, 'bold', '#3a4620','middle')
        .addClass('class-names');
    }
  }

  removeElement() {
    let elem = this.element!;
    [elem, elem.shadow, this.movePath, elem.categoriesPlain, elem.categoriesRect, elem.connector, ...elem.discs, ...this.rotateArr]
      .forEach(el => el?.remove());
    if (this.drawing) this.createElement(this.newShape());
  }

  addMoveIcon(): void {
    let str = this.moveIcon(this.element!.shape.getCenter());
    this.movePath = this.svg.path(str);
    this.element!.after(this.movePath);
    this.movePath.attr('class', 'move-icon grabbable')
      .mousedown((ev: MouseEvent) => this.drag_md(ev))
      .on('contextmenu', (ev: any) => {
        ev.preventDefault();
        this.element!.node.dispatchEvent!(new Event('contextmenu', ev));
      })
  }

  addRotateIcon(): void {
    if (!this.canRotate) return;
    let position = this.element!.shape.rotatePosition();
    let str = this.rotateIcon(position);
    let path = this.svg.path(str);
    let bg = this.svg.circle(12).move(position[0], position[1]).fill(Color.ShapeFill);
    this.rotateArr = [path, bg];
    path.attr('class', 'rot-icon grabbable');
    bg.attr('class', 'grabbable').after(path);
    this.rotateArr.forEach(item => item.mousedown((ev: MouseEvent) => this.rotate_md(ev))
      .click((event: MouseEvent) => event.stopPropagation()));
    this.rotate();
  }

  initDrag() {
    this.element!.addClass('grabbable')
      .click((event: MouseEvent) => { event.stopPropagation(); })
      .mousedown((event: MouseEvent) => this.drag_md(event));
    this.addMoveIcon();
  }

  drag_md(e: MouseEvent) {
    if (e.buttons === 1 && !e.ctrlKey && !this.lastPoint) {
      this.lastPoint = { X: e.offsetX, Y: e.offsetY };
      [this.movePath!, ...this.rotateArr].forEach(item => item.remove());
      this.svg.mousemove((e: MouseEvent) => this.drag_mm(e))
        .mouseup(() => this.drag_mu());
      e.stopPropagation();
    }
  }

  drag_mm(e: MouseEvent) {
    if (this.lastPoint) {
      if (e.buttons !== 1) return this.drag_mu();
      if (!this.element) return;
      let dx = e.offsetX - this.lastPoint.X, dy = e.offsetY - this.lastPoint.Y, center = this.element.shape.getCenter();
      [this.element, this.element.shadow, this.element.connector, ...this.element.discs].forEach(disc => {
        disc?.increment([dx, dy]);
      })
      this.element.shape.centerChanged([center[0] + dx, center[1] + dy]);
      this.rotate();
      this.lastPoint = { X: e.offsetX, Y: e.offsetY };
    }
  }

  drag_mu() {
    if (this.lastPoint) {
      if (!this.element) return;
      this.addMoveIcon();
      this.addRotateIcon();
      this.lastPoint = undefined;
      this.svg.off('mousemove').off('mouseup');
      this.onEdited(this.shape!);
    }
  }

  stopDrag() {
    if (this.element) {
      this.element.removeClass('grabbable').off('click').off('mousedown');
      if (this.movePath) this.movePath.remove();
      this.rotateArr.forEach(item => item.remove());
      this.rotateArr = [];
      this.lastPoint = undefined;
      this.movePath = undefined;
    }
  }

  rotate_md(e: MouseEvent) {
    if (e.buttons === 1 && !e.ctrlKey) {
      this.svg
        .mousemove((e: MouseEvent) => this.rotate_mm(e))
        .mouseup(() => this.rotate_mu());
      e.stopPropagation();
    }
  }

  rotate_mm(e: MouseEvent) {
    if (e.buttons !== 1) return this.rotate_mu();
    if (!this.element) return;
    let center = this.element.shape.getCenter(), vector: ArrayXY = [e.offsetX - center[0], e.offsetY - center[1]];
    this.element.shape.phi = Math.atan2(-vector[0], vector[1]) * 180 / Math.PI;
    this.rotate();
  }

  rotate_mu() {
    this.svg.off('mousemove').off('mouseup');
    this.onEdited(this.shape!);
  }

  zoom(elem: ElementWithExtra, factor: number): void {
    elem.shape.zoom(factor);
    this.plot(elem);
    elem.discs?.forEach(_disc => _disc.x(_disc.x() * factor).y(_disc.y() * factor));
    elem.connector?.plot(elem.connector.array().map(p => [p[0] * factor, p[1] * factor] as ArrayXY));
    if (elem.editing) {
      if (this.rotateArr.length > 0) {
        let position = elem.shape.rotatePosition();
        let [path, bg] = this.rotateArr;
        (path as PathEl).plot(this.rotateIcon(position));
        bg.move(position[0], position[1]);
      }
      this.movePath?.plot(this.moveIcon(elem.shape.getCenter()));
    }
    else this.setOptions(elem, elem.shape.categories, elem.shape.color);
    this.rotate(elem);
  }

  stopEdit() {
    if (this.element && this.element.editing) {
      this.element.editing = false;
      this.stopDrag();
      this.stopEditShape(this.element);
      if (this.drawing) this.createElement(this.newShape());
    }
  }

  stopEditShape(elem: ElementWithExtra): void {
    let shape = elem.shape;
    elem.discs?.forEach(_disc =>
      _disc.fill(Color.BlackDisc).radius(2).removeClass('seg-point').off('click').off('mousedown').off('mouseup')
    );
    this.setOptions(elem, shape.categories, shape.color);
  }

  edit(): void {
    let elem = this.element!;
    elem.editing = true;
    if (elem.categoriesPlain) elem.categoriesPlain.node.innerHTML = '';
    if (elem.categoriesRect) elem.categoriesRect.remove();
    if (this.canHB) {
      [elem.shadow, ...elem.discs].forEach(el => el.removeClass('il-hid'));
      elem.stroke({ width: 2 });
    }
    this.initDrag();
    this.addRotateIcon();
    this.editShape();
  }
}