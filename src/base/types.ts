import Util from './util';

export type Point = { X: number, Y: number }
export type ArrayXY = [number, number];

export type StaticData = {
  width: number,
  height: number,
  ratio: number,
  discRadius: number,
  /** Stroke and discs can be hidden when not in edit/draw mode */
  hb: boolean | undefined
}

export type Shortcut = {
  del?: boolean,
  bksp?: boolean
}

export abstract class Shape {
  id: number;
  getCenterWithOffset = (): Point => ({ X: 0, Y: 0 });
  abstract type: string;
  abstract labelPosition(): ArrayXY;
  abstract getCenter(): ArrayXY;
  abstract zoom(factor: number): void;
  abstract output(ratio: number): Shape;
  abstract centerChanged(newCenter: ArrayXY): void;

  constructor(public categories: string[] = [], public phi: number = 0, public color?: string) {
    this.id = 0;
  }

  getOutput(ratio: number, svg: SVGSVGElement): Shape {
    let obj = this.output(ratio);
    let center = this.getCenter()
    let svgBox = svg.getBoundingClientRect();
    obj.id = this.id;
    if (this.color) obj.color = this.color;
    obj.phi = Math.round(this.phi);
    obj.getCenterWithOffset = () => ({ X: center[0] + svgBox.x, Y: center[1] + svgBox.y })
    return obj;
  }

  rotatePosition(): ArrayXY {
    let c = this.getCenter();
    let p = this.labelPosition();
    return [2 * c[0] - p[0], 2 * c[1] - p[1]];
  }

}

export class Dot extends Shape {
  type: string = 'dot';

  constructor(public position: ArrayXY = [-100, -100], public categories: string[] = [], public color?: string) {
    super(categories, 0, color);
  }

  labelPosition(): ArrayXY {
    return [this.position[0], this.position[1] - 40];
  }
  getCenter(): ArrayXY {
    return this.position;
  }
  zoom(factor: number): void {
    this.position = [this.position[0] * factor, this.position[1] * factor];
  }
  output(ratio: number) {
    return new Dot([Math.round(this.position[0] / ratio), Math.round(this.position[1] / ratio)], this.categories);
  }
  centerChanged(newPos: ArrayXY): void {
    this.position = newPos;
  }
}

export interface IlElementExtra {
  categoriesPlain?: SVGTextElement;
  categoriesRect?: SVGRectElement;
  shape: Shape;
  shadow: SVGElement;
  discs: SVGCircleElement[];
  editing: boolean;
  connector?: SVGPolylineElement;
}

export type ElementWithExtra = SVGElement & IlElementExtra;

export abstract class AngledShape extends Shape {
  constructor(public points: ArrayXY[] = [], public categories: string[] = [], public color?: string) {
    super(categories, 0, color);
  }

  labelPosition(): ArrayXY {
    let x = this.points
      .map(p => p[0])
      .filter((x, i) => i < this.points.length - 1)
      .reduce((sum: number, num) => sum + num, 0) / (this.points.length - 1);
    let y = Math.min(...this.points.map(p => p[1])) - 24;
    return [x, y];
  }
  outPoints(ratio: number): ArrayXY[] {
    let center = this.getCenter();
    return this.points.filter((p, i) => i < this.points.length - 1)
      .map(p => {
        let _p = Util.rotate([p[0] / ratio, p[1] / ratio], [center[0] / ratio, center[1] / ratio], this.phi)
        return [Math.round(_p[0]), Math.round(_p[1])];
      });
  }
  getCenter(): ArrayXY {
    if (this.points.length === 0) return [0, 0];
    let x = this.points
      .map(p => p[0])
      .filter((x, i) => i < this.points.length - 1)
      .reduce((sum: number, num) => sum + num, 0) / (this.points.length - 1);
    let y = (Math.min(...this.points.map(p => p[1])) + Math.max(...this.points.map(p => p[1]))) / 2;
    return [x, y];
  }
  centerChanged(newCenter: ArrayXY): void {
    let oldCenter = this.getCenter();
    let dx = newCenter[0] - oldCenter[0], dy = newCenter[1] - oldCenter[1];
    this.points.forEach(point => {
      point[0] += dx;
      point[1] += dy;
    })
  }

  zoom(factor: number): void {
    this.points = this.points.map(p => [p[0] * factor, p[1] * factor]);
  }
}

export enum Color {
  BlackDisc = "#000",
  GreenDisc = "#009900",
  GrayDisc = "#a6a6a6",
  BlackLine = "#000",
  GreenLine = "#030",
  LightGreenLine = "#ccffcc",
  RedLine = "#f00",
  WhiteLine = "#fff",
  ShapeFill = "#ffffff00"
}

export enum ActType{
  Added,
  Edited,
  Selected,
  CtxMenu
}

export class Rectangle extends AngledShape {
  type: string = 'rectangle';
  output(ratio: number) {
    return new Rectangle(this.outPoints(ratio), this.categories);
  }
}

export class Polygon extends AngledShape {
  type: string = 'polygon';
  output(ratio: number) {
    return new Polygon(this.outPoints(ratio), this.categories);
  }
}

export abstract class RoundShape extends Shape {
  constructor(public centre: ArrayXY = [0, 0], public categories: string[] = [], public phi: number = 0, public color?: string) {
    super(categories, phi, color);
  }
  abstract get width(): number;
  abstract set width(w);
  abstract get height(): number;
  abstract set height(h);
  getCenter(): ArrayXY {
    return this.centre;
  }
  centerChanged(newCenter: ArrayXY): void {
    this.centre = newCenter;
  }
}

export class Circle extends RoundShape {
  type: string = 'circle';
  constructor(public centre: ArrayXY = [0, 0], public radius: number = 0, public categories: string[] = [], public color?: string) {
    super(centre, categories, 0, color);
  }
  get width(): number { return 2 * this.radius; }
  set width(w: number) { this.radius = w / 2; }
  get height(): number { return 2 * this.radius; }
  set height(h: number) { this.radius = h / 2; }

  labelPosition(): ArrayXY {
    return [this.centre[0], this.centre[1] - this.radius - 24];
  }
  zoom(factor: number): void {
    this.centre = [this.centre[0] * factor, this.centre[1] * factor];
    this.radius *= factor;
  }
  output = (ratio: number): Shape =>
    new Circle([Math.round(this.centre[0] / ratio), Math.round(this.centre[1] / ratio)], Math.round(this.radius / ratio), this.categories);

}

export class Ellipse extends RoundShape {
  type: string = 'ellipse';
  constructor(public centre: ArrayXY = [0, 0], public radiusX: number = 0, public radiusY: number = 0, public categories: string[] = [], public phi: number = 0, public color?: string) {
    super(centre, categories, phi, color);
  }
  get width(): number { return 2 * this.radiusX; }
  set width(w: number) { this.radiusX = w / 2; }
  get height(): number { return 2 * this.radiusY; }
  set height(h: number) { this.radiusY = h / 2; }
  labelPosition(): ArrayXY {
    return [this.centre[0], this.centre[1] - this.radiusY - 24];
  }
  zoom(factor: number): void {
    this.centre = [this.centre[0] * factor, this.centre[1] * factor];
    this.radiusX *= factor;
    this.radiusY *= factor;
  }
  output = (ratio: number): Shape =>
    new Ellipse([Math.round(this.centre[0] / ratio), Math.round(this.centre[1] / ratio)], Math.round(this.radiusX / ratio), Math.round(this.radiusY / ratio), this.categories);

}