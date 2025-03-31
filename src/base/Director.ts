import { Shape, ElementWithExtra, StaticData, Point, ActType } from "./types";
import PolygonBuilder from "./builders/PolygonBuilder";
import { ShapeBuilder } from "./ShapeBuilder";
import RectangleBuilder from "./builders/RectangleBuilder";
import CircleBuilder from "./builders/CircleBuilder";
import EllipseBuilder from "./builders/EllipseBuilder";
import { DotBuilder } from "./builders/DotBuilder";
import './svg-elems';
import { SVGSVGEl } from "./svg-elems";

export class Director {
  static instance?: Director;
  static actions: { type: ActType, func: (shape: Shape) => any }[];
  protected maxId = 0;
  builders: ShapeBuilder<Shape>[];
  elements: ElementWithExtra[] = [];
  origin?: Point;
  winEv!: { keydown: (e: KeyboardEvent) => false | void; keyup: (e: KeyboardEvent) => void; blur: () => void; };

  constructor(public svg: SVGSVGEl, public container: HTMLDivElement) {
    let onEdited = (shape: Shape) => this.raise(ActType.Edited, shape), enlist = (shape: Shape) => this.enlist(shape, true);
    let params: [(shape: Shape) => void, (shape: Shape) => void] = [onEdited, enlist]
    this.builders = [
      new PolygonBuilder(...params),
      new RectangleBuilder(...params),
      new CircleBuilder(...params),
      new EllipseBuilder(...params),
      new DotBuilder(...params)
    ];
  }

  raise(type: ActType, shape: Shape) {
    Director.actions.find(act => act.type === type)!.func(shape);
  }

  getBuilder<T extends Shape>(shape: T): ShapeBuilder<T> {
    let builder = this.builders.find(b => b.ofType(shape))! as ShapeBuilder<T>;
    builder.shape = shape;
    return builder
  }

  stopEdit = (): void => this.builders.filter(b => b.element?.editing).forEach(b => b.stopEdit());

  edit(id: number): void {
    this.stopEdit();
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.edit();
  }

  zoom(factor: number) {
    let builderInDraw = this.builders.find(b => b.drawing);
    if (builderInDraw?.element?.shape.id === 0) builderInDraw.zoom(builderInDraw.element, factor);
    this.elements.forEach(elem => this.getBuilder(elem.shape).zoom(elem, factor));
  }

  getElement = (id: number) => this.elements.find(p => p.shape.id === id)!;

  setOptions(element: ElementWithExtra, categories: string[], color?: string) {
    this.getBuilder(element.shape).setOptions(element, categories, color);
  }

  plot(shapes: Shape[]): void {
    shapes.forEach(shape => {
      shape.id = ++this.maxId;
      this.getBuilder(shape).basePlotShape();
      this.enlist(shape, false);
    });
  }

  startDraw(shape: Shape): void {
    let builder = this.getBuilder(shape);
    builder.drawing = true;
    builder.createElement(shape);
    builder.startDraw();
  }

  stopDraw(): void {
    let builder = this.builders.find(b => b.drawing);
    if (builder) {
      builder.stopDraw();
      builder.drawing = false;
    }
  }

  enlist(shape: Shape, isNew: boolean) {
    let builder = this.getBuilder(shape);
    if (!builder.element) return;
    if (builder.element.shape.id === 0) {
      builder.element.shape.id = ++this.maxId;
    }
    let id = builder.element.shape.id;
    this.elements.push(builder.element);
    builder.element.node.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
      let elem = this.elements.find(p => p.shape.id === id)!;
      this.raise(ActType.CtxMenu, elem.shape);
      return false;
    }, false);
    builder.element.node.onclick = (e: MouseEvent) => {
      let elem = this.elements.find(p => p.shape.id === id)!;
      if (!e.ctrlKey && !elem.editing) {
        this.edit(id);
        this.raise(ActType.Selected, builder.element!.shape);
      }
      e.stopPropagation();
    };
    if (isNew) {
      if (!builder.element!.editing) builder.edit();
      this.raise(ActType.Added, builder.element.shape);
      this.raise(ActType.Selected, builder.element.shape);
    }
  }

  updateCategories(id: number, categories: string[], color?: string) {
    let elem = this.getElement(id);
    if (!elem) return;
    elem.shape.categories = categories;
    if (color !== undefined) elem.shape.color = color;
    let builder = this.getBuilder(elem.shape);
    if (!elem.editing) builder.setOptions(elem, categories, elem.shape.color);
  }

  removeById(id: number) {
    this.stopEdit();
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.removeElement();
    this.elements.splice(this.elements.indexOf(elem), 1);
  }

  remove() {
    if (this.builders.filter(b => b.element?.editing).length > 0) {
      let id = this.builders.filter(b => b.element?.editing)[0].element!.shape!.id;
      this.removeById(id);
    }
  }

  drag_md(container: HTMLDivElement, e: MouseEvent) {
    if (e.buttons === 1 && e.ctrlKey && !this.origin) {
      this.origin = { X: e.clientX, Y: e.clientY };
      container.onmousemove = (event: MouseEvent) => this.drag_mm(event);
      container.onmouseup = () => this.drag_mu();
    }
  }

  drag_mm(e: MouseEvent) {
    if (this.origin) {
      let parent = this.container;
      parent.scrollLeft = parent.scrollLeft - e.clientX + this.origin.X;
      parent.scrollTop = parent.scrollTop - e.clientY + this.origin.Y;
      this.origin = { X: e.clientX, Y: e.clientY };
      if (!e.ctrlKey) this.drag_mu();
    }
  }

  drag_mu() {
    if (this.origin) {
      this.container.onmousemove = null;
      this.container.onmouseup = null;
      this.origin = undefined;
    }
  }

  getShapes = () => this.elements.map(el => el.shape.getOutput(ShapeBuilder._sd.ratio, this.svg));
  findShape = (id: number) => this.elements.find(el => el.shape.id === id)!.shape;

  static init(svg: SVGSVGEl, sd: StaticData, container: HTMLDivElement) {
    svg.addClass('il-svg');
    svg.size(sd.width * sd.ratio, sd.height * sd.ratio);
    ShapeBuilder._svg = svg;
    ShapeBuilder._sd = sd;
    let instance = Director.instance = new Director(svg, container);

    container.onmousedown = (event: MouseEvent) => instance.drag_md(container, event);
    container.onwheel = (event: WheelEvent) => instance.mousewheel(event);
    container.onclick = (e: MouseEvent) => !instance.builders.some(b => b.drawing) && !e.ctrlKey && instance.stopEdit();

    instance.winEv = {
      keydown: (e: KeyboardEvent) => e.key === 'Control' && instance.container.classList.add('grabbable'),
      keyup: (e: KeyboardEvent) => {
        if (e.key === 'Control') instance.winEv.blur();
        if ((ShapeBuilder._sd.shortcut?.del && e.key === 'Delete') || (ShapeBuilder._sd.shortcut?.bksp && e.key === 'Backspace')) instance.remove();
        if (e.key === 'Escape') instance?.stopEdit();
      },
      blur: () => instance.container.classList.remove('grabbable')
    }
    Object.keys(instance.winEv).forEach(key => window.addEventListener(key, instance.winEv[key as "keydown" | "keyup" | "blur"] as EventListenerOrEventListenerObject))
  }

  static setActions(actions: { type: ActType; func: ((shape: Shape) => any) | undefined }[]) {
    let hof = (fun?: (shape: Shape) => any) => (shape: Shape) => 
      fun?.(shape.getOutput(ShapeBuilder._sd.ratio, ShapeBuilder._svg))
    Director.actions = actions.map(act => ({ type: act.type, func: hof(act.func) }));
  }

  clear() {
    this.builders.forEach(b => {
      b.stopDraw();
      b.stopEdit();
    });
    this.elements = [];
    this.builders = [];
    Object.keys(this.winEv).forEach(key => window.removeEventListener(key, this.winEv[key as "keydown" | "keyup" | "blur"] as EventListenerOrEventListenerObject))
    Director.instance = undefined;
  }

  mousewheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();
      let parent = this.container;
      let scale = e.deltaY > 0 ? 0.8 : 1.25;
      let { scrollLeft, scrollTop } = parent;
      this.setSizeAndRatio(scale, true);
      this.zoom(scale);
      parent.scrollLeft = Math.min(Math.max(scrollLeft * scale + (scale - 1) * (e.pageX - parent.offsetLeft), 0), parent.scrollWidth - parent.clientWidth);
      parent.scrollTop = Math.min(Math.max(scrollTop * scale + (scale - 1) * (e.pageY - parent.offsetTop), 0), parent.scrollHeight - parent.clientHeight);
    }
  }

  setSizeAndRatio(factor: number, relative: boolean) {
    let ratio = relative ? ShapeBuilder._sd.ratio * factor : factor;
    factor = ratio / ShapeBuilder._sd.ratio;
    ShapeBuilder._sd.ratio = ratio;
    ShapeBuilder._svg.size(ShapeBuilder._sd.width * ratio, ShapeBuilder._sd.height * ratio);
    return factor;
  }
}
