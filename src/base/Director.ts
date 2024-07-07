import { Svg } from "react-svgdotjs";
import { Shape, ElementWithExtra, StaticData, Point } from "./types";
import Util from './util'
import PolygonBuilder from "./builders/PolygonBuilder";
import { ShapeBuilder } from "./ShapeBuilder";
import RectangleBuilder from "./builders/RectangleBuilder";
import CircleBuilder from "./builders/CircleBuilder";
import EllipseBuilder from "./builders/EllipseBuilder";
import { DotBuilder } from "./builders/DotBuilder";

export class Director {
  static instance: Director;
  static onAdded: ((shape: Shape) => void) | undefined;
  static onContextMenu: ((shape: Shape) => void) | undefined;
  builders: ShapeBuilder<Shape>[];
  elements: ElementWithExtra[] = [];
  origin?: Point;

  constructor(public svg: Svg, public container: HTMLDivElement) {
    this.builders = [new PolygonBuilder(), new RectangleBuilder(), new CircleBuilder(), new EllipseBuilder(), new DotBuilder()];
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

  setOptions(element: ElementWithExtra, categories: string[]) {
    this.getBuilder(element.shape).setOptions(element, categories);
  }

  plot(shapes: Shape[]): void {
    shapes.forEach(shape => {
      shape.id = ++Util.maxId;
      this.getBuilder(shape).basePlotShape();
      this.addShape(shape, false);
    });
  }

  startDraw(shape: Shape): void {
    let builder = this.getBuilder(shape);
    builder.drawing = true;
    builder.createElement(shape);
    builder.startDraw(() => this.addShape(shape));
  }

  stopDraw(): void {
    let builder = this.builders.find(b => b.drawing);
    if (builder) {
      builder.stopDraw();
      builder.drawing = false;
    }
  }

  addShape(shape: Shape, isNew: boolean = true) {
    let builder = this.getBuilder(shape);
    if (!builder.element) return;
    if (builder.element.shape.id === 0) {
      builder.element.shape.id = ++Util.maxId;
    }
    let id = builder.element.shape.id;
    this.elements.push(builder.element);
    builder.element.node.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
      let elem = this.elements.find(p => p.shape.id === id)!;
      Director.onContextMenu?.(elem.shape);
      return false;
    }, false);
    if (isNew) {
      if (!builder.element!.editing) builder.edit();
      Director.onAdded?.(builder.element.shape);
    }
  }

  updateCategories(id: number, categories: string[]) {
    let elem = this.getElement(id);
    elem.shape.categories = categories;
    let builder = this.getBuilder(elem.shape);
    if (!elem.editing) builder.setOptions(elem, categories);
  }

  removeElement(id: number) {
    this.stopEdit();
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.removeElement();
    this.elements.splice(this.elements.indexOf(elem), 1);
  }

  drag_md(container: HTMLDivElement, e: MouseEvent) {
    if (e.button === 0 && e.ctrlKey && !this.origin) {
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
      if(!e.ctrlKey) this.drag_mu();
    }
  }

  drag_mu() {
    if (this.origin) {
      this.container.onmousemove = null;
      this.container.onmouseup = null;
      this.origin = undefined;
    }
  }

  getShapes = () => this.elements.map(el => el.shape.getOutput(ShapeBuilder.statics.ratio, this.container));
  findShape = (id: number) => this.elements.find(el => el.shape.id === id)!.shape;

  static init(svg: Svg, statics: StaticData, container: HTMLDivElement) {
    svg.size(statics.width, statics.height);
    Shape.containerOffset = [container.offsetLeft, container.offsetTop];
    ShapeBuilder._svg = svg;
    ShapeBuilder.statics = statics;
    Director.instance = new Director(svg, container);
    container.onmousedown = (event: MouseEvent) => Director.instance.drag_md(container, event);
    container.onwheel = (event: WheelEvent) => Director.instance.mousewheel(event);
  }

  static setActions(onAdded?: (shape: Shape) => void, onContextMenu?: (shape: Shape) => void) {
    Director.onAdded = shape => onAdded?.(shape.getOutput(ShapeBuilder.statics.ratio, Director.instance.container));
    Director.onContextMenu = shape => onContextMenu?.(shape.getOutput(ShapeBuilder.statics.ratio, Director.instance.container));
  }

  clear() {
    this.builders.forEach(b => {
      b.stopDraw();
      b.stopEdit();
    });
    ShapeBuilder._svg?.clear();
    this.elements = [];
    this.builders = [];
  }

  mousewheel(e: WheelEvent) {
    e.preventDefault();
    let parent = this.container;
    let scale = e.deltaY > 0 ? 1.25 : 0.8;
    this.setSizeAndRatio(scale);
    this.zoom(scale);
    let { scrollLeftMax: maxLeft, scrollTopMax: maxTop, offsetLeft: ol, offsetTop: ot } = (e.currentTarget as any)
    parent.scrollLeft = Math.min(Math.max(parent.scrollLeft * scale + (scale - 1) * (e.pageX - ol), 0), maxLeft);
    parent.scrollTop = Math.min(Math.max(parent.scrollTop * scale + (scale - 1) * (e.pageY - ot), 0), maxTop);
  }

  setSizeAndRatio(factor: number) {
    ShapeBuilder.statics.ratio *= factor;
    ShapeBuilder.statics.width *= factor;
    ShapeBuilder.statics.height *= factor;
    ShapeBuilder._svg.size(ShapeBuilder.statics.width, ShapeBuilder.statics.height);
  }
}
