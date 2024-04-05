import { Svg, Element } from "react-svgdotjs";
import { IlShape, ElementWithExtra, Color } from "./types";
import Util from './util'
import PolygonBuilder from "./builders/PolygonBuilder";
import { ShapeBuilder } from "./ShapeBuilder";
import RectangleBuilder from "./builders/RectangleBuilder";
import CircleBuilder from "./builders/CircleBuilder";

export class Director {
  static builders: ShapeBuilder<IlShape>[];
  static elements: ElementWithExtra[] = [];
  static onAddedOrEdited: ((shape: IlShape) => void) | undefined;

  getBuilder<Shape extends IlShape>(shape: Shape): ShapeBuilder<Shape> {
    let builder = Director.builders.find(b => b.ofType(shape))! as ShapeBuilder<Shape>;
    builder.shape = shape;
    return builder
  }

  stopEdit(callOnEdited: boolean): void {
    let builder = Director.builders.find(b => b.element?.editing);
    if(builder) {
      builder.stopEdit();
      if (callOnEdited) Director.onAddedOrEdited?.(builder.element!.shape);
    }
  }

  edit(id: number): void {
    let elem = this.getElement(id);
    let builder = this.getBuilder(elem.shape);
    builder.element = elem;
    builder.edit();
  }

  zoom(factor: number) {
    Director.elements.forEach(elem => {
      this.getBuilder(elem.shape).zoom(elem, factor)
    })
  }

  getElement = (id: number) => Director.elements.find(p => p.shape.id === id)!;

  setOptions(element: ElementWithExtra, classes: string[]) {
    this.getBuilder(element.shape).setOptions(element, classes);
  }

  plot(shapes: IlShape[]): void {
    shapes.forEach(shape => {
      shape.id = ++Util.maxId;
      this.getBuilder(shape).plotShape();
      this.addShape(shape, false);
    });
  }

  startDraw(shape: IlShape): void {
    let builder = this.getBuilder(shape);
    builder.drawing = true;
    builder.createElement(shape);
    builder.startDraw(() => this.addShape(shape));
  }

  stopDraw(): void {
    let builder = Director.builders.find(b => b.drawing);
    if(builder) {
      builder.stopDraw();
      builder.drawing = false;
    }
  }

  addShape<Shape extends IlShape>(shape: IlShape, isNew: boolean = true) {
    let builder = this.getBuilder(shape);
    if (!builder.element) return;
    if (builder.element.shape.id === 0) {
      builder.element.shape.id = ++Util.maxId;
    }
    let id = builder.element.shape.id;
    Director.elements.push(builder.element);
    if (isNew) Director.onAddedOrEdited?.(builder.element.shape);
    builder.element.node.addEventListener('contextmenu', (ev: MouseEvent) => {
      if (ShapeBuilder.editing) return;
      ev.preventDefault();
      let elem = Director.elements.find(p => p.shape.id === id)!;
      elem.stroke({ color: Color.GreenLine });
      Director.onAddedOrEdited?.(elem.shape);
      return false;
    }, false);
    return id;
  }

  updateClasses<Shape extends IlShape>(shape: Shape) {
    let elem = this.getElement(shape.id);
    this.getBuilder<Shape>(shape).setOptions(elem, shape.classes);
  }

  removeElement(id: number) {
    let elem = this.getElement(id);
    this.getBuilder(elem.shape).removeElement(elem);
    Director.elements.splice(Director.elements.indexOf(elem), 1);
  }

  static getShapes = () => Director.elements.map(el => el.shape.getOutput());
  static findShape = (id: number) => Director.elements.find(el => el.shape.id === id)!.shape;

  static init(svg: Svg, width: number, height: number, ratio: number, container: HTMLDivElement, onAddedOrEdited?: (shape: IlShape) => void) {
    svg.size(width, height);
    IlShape.containerOffset = [container.offsetLeft, container.offsetTop];
    ShapeBuilder._svg = svg;
    ShapeBuilder.ratio = ratio;
    ShapeBuilder.width = width;
    ShapeBuilder.height = height;
    Director.onAddedOrEdited = onAddedOrEdited;
    Director.builders = [new PolygonBuilder(), new RectangleBuilder(), new CircleBuilder()];
  }

  static clear() {
    if(ShapeBuilder._svg) ShapeBuilder._svg.clear();
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
