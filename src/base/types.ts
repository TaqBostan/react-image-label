import { ArrayXY, PointArray, Rect, Text, Element, Circle as Circ, Polyline } from '@svgdotjs/svg.js'
import Util from './util';


export type Point = { X: number, Y: number }

export abstract class Shape {
  id: number;
  getCenterWithOffset = (): Point => ({ X: 0, Y: 0 });
  static containerOffset: ArrayXY;
  abstract type: string;
  abstract labelPosition(): ArrayXY;
  abstract getCenter(): ArrayXY;
  abstract zoom(factor: number): void;
  abstract output(ratio: number): Shape;
  abstract centerChanged(newCenter: ArrayXY): void;

  constructor(public classes: string[] = []) {
    this.id = 0;
  }

  getOutput(ratio: number): Shape {
    let obj = this.output(ratio);
    let center = Util.ArrayXYSum(this.getCenter(), Shape.containerOffset)
    obj.id = this.id;
    obj.getCenterWithOffset = () => ({ X: center[0], Y: center[1] })
    return obj;
  }
}

export interface IlElementExtra {
  classNames?: Text;
  classNamesWrapper?: Rect;
  shape: Shape;
  shadow: Element;
  discs: Circ[];
  editing: boolean;
  connector?: Polyline;
}

export type ElementWithExtra = Element & IlElementExtra;

export abstract class AngledShape extends Shape {
  constructor(public points: ArrayXY[] | PointArray = [], public classes: string[] = []) {
    super(classes);
  }
  labelPosition(): ArrayXY {
    let x = this.points
      .map(p => p[0])
      .filter((x, i) => i < this.points.length - 1)
      .reduce((sum: number, num) => sum + num, 0) / (this.points.length - 1);
    let y = Math.min(...this.points.map(p => p[1])) - 24;
    return [x, y];
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

  output(ratio: number) {
    let points: ArrayXY[] = this.points.filter((p, i) => i < this.points.length - 1)
      .map(p => [Math.round(p[0] / ratio), Math.round(p[1] / ratio)]);
    return new Polygon(points, this.classes);
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
}

export class Polygon extends AngledShape {
  type: string = 'polygon';
}

export class Circle extends Shape {
  type: string = 'circle';
  constructor(public centre: ArrayXY = [0, 0], public radius: number = 0, public classes: string[] = []) {
    super(classes);
  }
  labelPosition(): ArrayXY {
    return [this.centre[0], this.centre[1] - this.radius - 24];
  }
  getCenter(): ArrayXY {
    return this.centre;
  }
  centerChanged(newCenter: ArrayXY): void {
    this.centre = newCenter;
  }

  zoom(factor: number): void {
    this.centre = [this.centre[0] * factor, this.centre[1] * factor];
    this.radius *= factor;
  }

  output = (ratio: number): Shape =>
    new Circle([Math.round(this.centre[0] / ratio), Math.round(this.centre[1] / ratio)], Math.round(this.radius / ratio), this.classes);

}