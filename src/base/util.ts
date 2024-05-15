import { ArrayXY } from '@svgdotjs/svg.js'

export default class Util {
  static maxId: number = 0;
  static ArrayXYSum = (...array: ArrayXY[]): ArrayXY =>
    array.reduce((sum: ArrayXY, xy) => [sum[0] + xy[0], sum[1] + xy[1]], [0, 0])

  static rotate = (pos: ArrayXY, center: ArrayXY, teta: number): ArrayXY => {
    let dx = pos[0] - center[0], dy = pos[1] - center[1], fi = teta * Math.PI / 180;
    return [dx * Math.cos(fi) - dy * Math.sin(fi) + center[0], dx * Math.sin(fi) + dy * Math.cos(fi) + center[1]];
  }
}