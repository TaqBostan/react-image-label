import { Svg, Element } from "react-svgdotjs";
import { IlShape, ElementWithExtra, Color, Point } from "./types";
import Util from './util'

export abstract class ShapeBuilder<Shape extends IlShape> {
  static _svg: Svg;
  svg: Svg = ShapeBuilder._svg;
	abstract element?: ElementWithExtra;
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
  //#endregion
  constructor() {
  }

  drawDisc(x: number, y: number, radius: number, color: string) {
    return this.svg.circle(2 * radius).fill(color).move(x - radius, y - radius);
  }
  
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
    if(this.element) {
      this.element.removeClass('grabbable');
      this.element.off('mousedown');
      this.svg.off('mousemove');
      this.svg.off('mouseup');
      if(this.moveIconPath) this.moveIconPath.remove();
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
      if(!this.element) return;
      let dx = event.offsetX - this.lastPoint.X, dy = event.offsetY - this.lastPoint.Y;
      this.element.cx(this.element.cx() + dx);
      this.element.cy(this.element.cy() + dy);
      this.element.shadow.cx(this.element.shadow.cx() + dx);
      this.element.shadow.cy(this.element.shadow.cy() + dy);
      this.element.discs.forEach(disc => {
        disc.cx(disc.cx() + dx);
        disc.cy(disc.cy() + dy);
      })
      this.lastPoint = { X: event.offsetX, Y: event.offsetY };
    }
  }
  
  mouseUp() {
    if(this.lastPoint) {
      if(!this.element) return;
      let x = this.lastPoint.X - this.originPoint!.X + this.element.shape.getCenter()[0];
      let y = this.lastPoint.Y - this.originPoint!.Y + this.element.shape.getCenter()[1];
      this.element.shape.centerChanged([x, y]);
      this.addMoveIcon();
      this.lastPoint = undefined;
      this.originPoint = undefined;
      this.svg.off('mousemove');
    }
  }
}

export abstract class Director<Shape extends IlShape> {
  abstract builder: ShapeBuilder<Shape>;
	static elements: ElementWithExtra[] = [];
  static onAddedOrEdited: ((shape: IlShape) => void) | undefined;

  abstract innerPlot(shape: Shape): void;
  abstract startDraw(): void;
  abstract stopDraw(): void;
  abstract edit(shape: Shape): void;
  abstract stopEdit(callOnEdited: boolean): void;
  abstract getElement(id: number): ElementWithExtra;
  abstract zoom(factor: number): void;
  
  setOptions = (element: ElementWithExtra, classes: string[]) => this.builder.setOptions(element, classes);

  plot(shapes: Shape[]): void {
    shapes.forEach(shape => {
      shape.id = ++Util.maxId;
      this.innerPlot(shape);
    });
  }
  

  updateClasses(shape: Shape) {
    let elem = this.getElement(shape.id);
    this.builder.setOptions(elem, shape.classes);
  }

  static getShapes = () => Director.elements.map(el => el.shape.getOutput());
  static findShape = (id: number) => Director.elements.find(el => el.shape.id === id)!.shape;

  static getInstance(): Director<IlShape> {
    throw new Error('Method not implemented! Use derived class');
  }
  
  static init(svg: Svg, width: number, height: number, ratio: number, container: HTMLDivElement, onAddedOrEdited?: (shape: IlShape) => void) {
    svg.size(width, height);
    IlShape.containerOffset = [container.offsetLeft, container.offsetTop];
    ShapeBuilder._svg = svg;
    ShapeBuilder.ratio = ratio;
    ShapeBuilder.width = width;
    ShapeBuilder.height = height;
    Director.onAddedOrEdited = onAddedOrEdited;
  }

  static setSizeAndRatio(factor: number) {
    ShapeBuilder.ratio *= factor;
    ShapeBuilder.width *= factor;
    ShapeBuilder.height *= factor;
    ShapeBuilder._svg.size(ShapeBuilder.width, ShapeBuilder.height);
  }
}