import { ArrayXY } from "./types";

export default class Util {
  static ArrayXYSum = (...array: ArrayXY[]): ArrayXY =>
    array.reduce((sum: ArrayXY, xy) => [sum[0] + xy[0], sum[1] + xy[1]], [0, 0])

  static rotate = (pos: ArrayXY, center: ArrayXY, teta: number): ArrayXY => {
    let dx = pos[0] - center[0], dy = pos[1] - center[1], fi = teta * Math.PI / 180;
    return [dx * Math.cos(fi) - dy * Math.sin(fi) + center[0], dx * Math.sin(fi) + dy * Math.cos(fi) + center[1]];
  }

  static fileName = (url: string | null) => url?.substring(url.lastIndexOf('/') + 1) || '';

  static parseColor = (str: string) => {
    let colors: number[];
    if (str[0] === "#") {
      str = str.substring(1, str.length >= 7 ? 7 : 4);
      var collen = str.length / 3;
      var fact = [17, 1][collen - 1];
      colors = [
        Math.round(parseInt(str.substring(0, collen), 16) * fact),
        Math.round(parseInt(str.substring(collen, 2 * collen), 16) * fact),
        Math.round(parseInt(str.substring(2 * collen, 3 * collen), 16) * fact)
      ];
    }
    else colors = str.split("(")[1].split(")")[0].split(",").map(x => +x);
    if (colors.length < 4) colors.push(1);
    return colors;
  }

  static removeOpacity = (color: string) => {
    if (color[0] === "#" || color.startsWith('rgb')) {
      let rgba = Util.parseColor(color);
      return `rgb(${rgba[0]},${rgba[1]},${rgba[2]})`
    }
    else return color;
  }
}
