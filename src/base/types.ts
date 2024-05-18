import { ArrayXY, PointArray, Rect, Text, Element, Circle as Circ, Polyline } from '@svgdotjs/svg.js'
import Util from './util';

export type Point = { X: number, Y: number }

export type StaticData = { width: number, height: number, ratio: number, discRadius: number }

export abstract class Shape {
  id: number;
  fi: number = 0;
  getCenterWithOffset = (): Point => ({ X: 0, Y: 0 });
  static containerOffset: ArrayXY;
  abstract type: string;
  abstract labelPosition(): ArrayXY;
  abstract getCenter(): ArrayXY;
  abstract zoom(factor: number): void;
  abstract output(ratio: number): Shape;
  abstract centerChanged(newCenter: ArrayXY): void;

  constructor(public categories: string[] = []) {
    this.id = 0;
  }

  getOutput(ratio: number): Shape {
    let obj = this.output(ratio);
    let center = Util.ArrayXYSum(this.getCenter(), Shape.containerOffset)
    obj.id = this.id;
    obj.fi= Math.round(this.fi);
    obj.getCenterWithOffset = () => ({ X: center[0], Y: center[1] })
    return obj;
  }

  rotatePosition(): ArrayXY {
    let c = this.getCenter();
    let p = this.labelPosition();
    return [2 * c[0] - p[0], 2 * c[1] - p[1]];
  }

}

export interface IlElementExtra {
  categoriesPlain?: Text;
  categoriesRect?: Rect;
  shape: Shape;
  shadow: Element;
  discs: Circ[];
  editing: boolean;
  connector?: Polyline;
}

export type ElementWithExtra = Element & IlElementExtra;

export abstract class AngledShape extends Shape {
  constructor(public points: ArrayXY[] | PointArray = [], public categories: string[] = []) {
    super(categories);
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
    return this.points.filter((p, i) => i < this.points.length - 1)
      .map(p => {
        let _p = Util.rotate([p[0] / ratio, p[1] / ratio], this.getCenter(), this.fi)
        return [Math.round(_p[0]), Math.round(_p[1])];
      });
  }
  getCenter(): ArrayXY {
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
  constructor(public centre: ArrayXY = [0, 0], public categories: string[] = []) {
    super(categories);
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
  constructor(public centre: ArrayXY = [0, 0], public radius: number = 0, public categories: string[] = []) {
    super(centre, categories);
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
  constructor(public centre: ArrayXY = [0, 0], public radiusX: number = 0, public radiusY: number = 0, public categories: string[] = []) {
    super(centre, categories);
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