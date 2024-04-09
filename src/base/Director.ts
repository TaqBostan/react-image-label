import { Svg } from "react-svgdotjs";
import { Shape, ElementWithExtra } from "./types";
import Util from './util'
import PolygonBuilder from "./builders/PolygonBuilder";
import { ShapeBuilder } from "./ShapeBuilder";
import RectangleBuilder from "./builders/RectangleBuilder";
import CircleBuilder from "./builders/CircleBuilder";

export class Director {
  static builders: ShapeBuilder<Shape>[];
  static elements: ElementWithExtra[] = [];
  static onAdded: ((shape: Shape) => void) | undefined;
  static onContextMenu: ((shape: Shape) => void) | undefined;

  getBuilder<T extends Shape>(shape: T): ShapeBuilder<T> {
    let builder = Director.builders.find(b => b.ofType(shape))! as ShapeBuilder<T>;
    builder.shape = shape;
    return builder
  }

  stopEdit = (): void => Director.builders.find(b => b.element?.editing)?.stopEdit()

  edit(id: number): void {
    if (ShapeBuilder.editing) this.stopEdit();
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.edit();
  }

  zoom(factor: number) {
    let builderInDraw = Director.builders.find(b => b.drawing);
    if (builderInDraw?.element?.shape.id === 0) builderInDraw.zoom(builderInDraw.element, factor);
    Director.elements.forEach(elem => this.getBuilder(elem.shape).zoom(elem, factor));
  }

  getElement = (id: number) => Director.elements.find(p => p.shape.id === id)!;

  setOptions(element: ElementWithExtra, classes: string[]) {
    this.getBuilder(element.shape).setOptions(element, classes);
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
    let builder = Director.builders.find(b => b.drawing);
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
    Director.elements.push(builder.element);
    builder.element.node.addEventListener('contextmenu', (ev: MouseEvent) => {
      ev.preventDefault();
      let elem = Director.elements.find(p => p.shape.id === id)!;
      Director.onContextMenu?.(elem.shape);
      return false;
    }, false);
    if (isNew) {
      if (!builder.element!.editing) builder.edit();
      Director.onAdded?.(builder.element.shape);
    }
  }

  updateClasses(id: number, classes: string[]) {
    let elem = this.getElement(id);
    elem.shape.classes = classes;
    let builder = this.getBuilder(elem.shape);
    if (!elem.editing) builder.setOptions(elem, classes);
  }

  removeElement(id: number) {
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.removeElement();
    Director.elements.splice(Director.elements.indexOf(elem), 1);
  }

  static getShapes = () => Director.elements.map(el => el.shape.getOutput(ShapeBuilder.ratio));
  static findShape = (id: number) => Director.elements.find(el => el.shape.id === id)!.shape;

  static init(svg: Svg, width: number, height: number, ratio: number, container: HTMLDivElement,
    onAdded?: (shape: Shape) => void, onContextMenu?: (shape: Shape) => void) {
    svg.size(width, height);
    Shape.containerOffset = [container.offsetLeft, container.offsetTop];
    ShapeBuilder._svg = svg;
    ShapeBuilder.ratio = ratio;
    ShapeBuilder.width = width;
    ShapeBuilder.height = height;
    Director.onAdded = shape => onAdded?.(shape.getOutput(ShapeBuilder.ratio));
    Director.onContextMenu = shape => onContextMenu?.(shape.getOutput(ShapeBuilder.ratio));
    Director.builders = [new PolygonBuilder(), new RectangleBuilder(), new CircleBuilder()];
  }

  static clear() {
    if (ShapeBuilder._svg) ShapeBuilder._svg.clear();
    Director.elements = [];
    Director.builders = [];
  }

  static setSizeAndRatio(factor: number) {
    ShapeBuilder.ratio *= factor;
    ShapeBuilder.width *= factor;
    ShapeBuilder.height *= factor;
    ShapeBuilder._svg.size(ShapeBuilder.width, ShapeBuilder.height);
  }
}
