import { ArrayXY } from '@svgdotjs/svg.js'

export default class Util {
    static maxId: number = 0;
    static ArrayXYSum = (...array: ArrayXY[]): ArrayXY =>
      array.reduce((sum: ArrayXY, xy) => [sum[0] + xy[0], sum[1] + xy[1]], [0,0])
  }