import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import { ArrayXY } from '@svgdotjs/svg.js'
import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Circle, Color, Ellipse, Polygon, Rectangle, Shape } from '../base/types';
import { FakeMouseEvent } from './helper/MouseEventWithOffsets';
import Util from '../base/util';

afterEach(() => {
  Util.maxId = 0;
});

export const ns = "http://www.w3.org/2000/svg";

Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
  writable: true,
  value: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }),
});

it('draw rectangle', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { id: 1, type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { id: 2, type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
    annotator.drawRectangle();
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles } = res.result.current;
  const _annotator = render(
    <ImageAnnotator
      setHandles={setHandles}
      naturalSize={true}
      imageUrl={imageUrl}
      shapes={rawShapes}
      width={700}
      height={400}
      onReady={onReady} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: { testRil: { naturalWidth: 1400, naturalHeight: 800 } } }));

  let container = _annotator.container.children[0] as HTMLDivElement;
  let svg = _annotator.container.querySelector('svg')!;
  let annotator = res.result.current.annotator!;

  let points = [[100, 100], [100, 200], [150, 200], [150, 100]];
  fireEvent(svg, new FakeMouseEvent('mousedown', { bubbles: true, buttons: 1, offsetX: points[0][0], offsetY: points[0][1] }))
  fireEvent(svg, new FakeMouseEvent('mousemove', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))
  fireEvent(svg, new FakeMouseEvent('mouseup', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))

  let shapes = annotator.getShapes();

  expect(shapes).toHaveLength(3);

  let rect = shapes.filter(s => ![1, 2].includes(s.id))[0] as Rectangle;

  expect(JSON.stringify(rect.points)).toBe(JSON.stringify(points));
  expect(rect.type).toBe('rectangle')
  expect(rect.categories).toHaveLength(0);
  expect(rect.color).toBeUndefined();
});

it('draw rectangle with categories', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { id: 1, type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { id: 2, type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
    annotator.drawRectangle();
  }

  const res = renderHook(useImageAnnotator);
  let { setHandles } = res.result.current;
  const onAdded = (shape: Shape) => {
    res.result.current.annotator!.updateCategories(shape.id, ["class 1"], "rgba(250,250,250,0.4)")
  }
  const _annotator = render(
    <ImageAnnotator
      setHandles={setHandles}
      naturalSize={true}
      imageUrl={imageUrl}
      shapes={rawShapes}
      width={700}
      height={400}
      onReady={onReady}
      onAdded={onAdded} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: { testRil: { naturalWidth: 1400, naturalHeight: 800 } } }));

  let container = _annotator.container.children[0] as HTMLDivElement;
  let svg = _annotator.container.querySelector('svg')!;
  let annotator = res.result.current.annotator!;

  //#region zoom
  expect(svg).toHaveAttribute('height', '800');
  expect(svg).toHaveAttribute('width', '1400');

  fireEvent(container, new FakeMouseEvent('wheel', { bubbles: true, ctrlKey: true, pageX: 100, pageY: 100, deltaY: 50 }))

  expect(svg).toHaveAttribute('height', '640');
  expect(svg).toHaveAttribute('width', '1120');
  //#endregion

  //#region draw
  let points = [[100, 100], [100, 200], [150, 200], [150, 100]], pointsCopy = [...points];
  let originalPoints = [[125, 125], [125, 250], [187, 250], [187, 125]];
  fireEvent(svg, new FakeMouseEvent('mousedown', { bubbles: true, buttons: 1, offsetX: points[0][0], offsetY: points[0][1] }))
  fireEvent(svg, new FakeMouseEvent('mousemove', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))
  fireEvent(svg, new FakeMouseEvent('mouseup', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))
  //#endregion

  //#region zoom
  fireEvent(container, new FakeMouseEvent('wheel', { bubbles: true, ctrlKey: true, pageX: 100, pageY: 100, deltaY: 50 }))

  expect(parseInt(svg.getAttribute('height')!)).toBe(512);
  expect(parseInt(svg.getAttribute('width')!)).toBe(896);

  points.forEach(p => { p[0] *= 0.8, p[1] *= 0.8; });
  //#endregion

  //#region pan
  fireEvent(container, new FakeMouseEvent('mousedown', { bubbles: true, ctrlKey: true, buttons: 1, clientX: 200, clientY: 200 }))
  fireEvent(container, new FakeMouseEvent('mousemove', { bubbles: true, ctrlKey: true, buttons: 1, clientX: 100, clientY: 50 }))
  fireEvent(container, new FakeMouseEvent('mouseup', { bubbles: true, ctrlKey: true, buttons: 1, clientX: 100, clientY: 50 }))

  expect(container.scrollLeft).toBe(100)
  expect(container.scrollTop).toBe(150)
  //#endregion

  //#region getShapes
  let shapes = annotator.getShapes();

  expect(shapes).toHaveLength(3);

  let rect = shapes.filter(s => ![1, 2].includes(s.id))[0] as Rectangle;

  expect(JSON.stringify(rect.points)).toBe(JSON.stringify(originalPoints));
  expect(rect.type).toBe('rectangle')
  expect(rect.categories).toHaveLength(1);
  expect(rect.categories[0]).toBe("class 1");
  expect(rect.color).toBe('rgba(250,250,250,0.4)');
  //#endregion

  //#region elements
  let polylines = svg.querySelectorAll('polyline');
  let discs = svg.querySelectorAll('circle[r="2"]');
  let greenDiscs = svg.querySelectorAll('circle[r="5"]');
  let ellipses = svg.querySelectorAll('ellipse');

  expect(polylines.length).toBe(8);
  expect(discs.length).toBe(12);
  expect(greenDiscs.length).toBe(4);
  expect(ellipses.length).toBe(0);
  //#endregion

  //#region green discs
  greenDiscs.forEach(greenDisc => {
    expect(greenDisc).toHaveClass('seg-point');
    expect(greenDisc).toHaveAttribute('fill', Color.GreenDisc);
    let cx = parseInt(greenDisc.getAttribute('cx')!);
    let cy = parseInt(greenDisc.getAttribute('cy')!);
    expect(pointsCopy.findIndex(p => p[0] === cx && p[1] === cy)).toBeGreaterThanOrEqual(0)
    pointsCopy.splice(pointsCopy.findIndex(p => p[0] === cx && p[1] === cy), 1)[0]
  });

  expect(pointsCopy).toHaveLength(0);
  //#endregion

  //#region rect
  let _rect = polylines[6];
  let rectShadow = polylines[7];

  expect(_rect).toHaveClass('grabbable');
  expect(_rect).toHaveAttribute('fill', Color.ShapeFill);
  expect(_rect).toHaveAttribute('points', "80,80 80,160 120,160 120,80 80,80");
  expect(_rect).toHaveAttribute('stroke', '#ff0000');
  expect(_rect).toHaveAttribute('stroke-opacity', '0.7');
  expect(_rect).toHaveAttribute('stroke-width', '2');
  expect(_rect).toHaveAttribute('transform', 'rotate(0,100,120)');

  expect(rectShadow).toHaveAttribute('fill', 'none');
  expect(rectShadow).toHaveAttribute('points', "80,80 80,160 120,160 120,80 80,80");
  expect(rectShadow).toHaveAttribute('stroke', '#000000');
  expect(rectShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rectShadow).toHaveAttribute('stroke-width', '4');
  expect(rectShadow).toHaveAttribute('transform', 'rotate(0,100,120)');

  annotator.stopEdit()

  expect(_rect).not.toHaveClass('grabbable');
  expect(_rect).toHaveAttribute('fill', "rgba(250,250,250,0.4)");
  expect(_rect).toHaveAttribute('stroke', "#fafafa");
  //#endregion

  //#region rotate
  rect = annotator.getShapes().find(c => c.id === rect.id)! as Rectangle;
  let center = points.reduce((avg: number[], p: number[]) => ([avg[0] + p[0] / 4.0, avg[1] + p[1] / 4.0]), [0, 0]);
  annotator.edit(rect.id);
  let rotateIcons = svg.querySelectorAll('path.rot-icon.grabbable')
  let backgrounds = svg.querySelectorAll('circle.grabbable')
  expect(rotateIcons).toHaveLength(1);
  expect(backgrounds).toHaveLength(1);
  let rotateIcon = rotateIcons[0]
  let bg = backgrounds[0]

  expect(rotateIcon).toHaveAttribute('d', 'M105.2,188.5a7,7,0,1,1,0-8l-3,3h9v-9l-3,3a11+11,0,1,0,0+14z');
  expect(rotateIcon).toHaveAttribute('transform', 'rotate(0,100,120)');

  expect(bg).toHaveAttribute('cx', '100');
  expect(bg).toHaveAttribute('cy', '184');
  expect(bg).toHaveAttribute('fill', Color.ShapeFill);
  expect(bg).toHaveAttribute('r', '12');
  expect(bg).toHaveAttribute('transform', 'rotate(0,100,120)');

  let origin: ArrayXY = [center[0], 190], dest = Util.rotate(origin, [center[0], center[1]], 30)

  fireEvent(rotateIcon, new FakeMouseEvent('mousedown', { bubbles: true, buttons: 1, offsetX: origin[0], offsetY: origin[1] }))
  fireEvent(rotateIcon, new FakeMouseEvent('mousemove', { bubbles: true, buttons: 1, offsetX: dest[0], offsetY: dest[1] }))
  fireEvent(rotateIcon, new FakeMouseEvent('mouseup', { bubbles: true, buttons: 1, offsetX: dest[0], offsetY: dest[1] }))

  rect = annotator.getShapes().find(c => c.id === rect.id)! as Rectangle;

  expect(JSON.stringify(rect.points)).toBe('[[160,118],[98,226],[152,257],[215,149]]')
  expect(rect.phi).toBe(30)
  expect(rect.type).toBe('rectangle')
  expect(rect.categories).toHaveLength(1);
  expect(rect.categories[0]).toBe("class 1");
  expect(rect.color).toBe('rgba(250,250,250,0.4)');

  expect(_rect).toHaveClass('grabbable');
  expect(_rect).toHaveAttribute('fill', 'rgba(250,250,250,0.4)');
  expect(_rect).toHaveAttribute('points', "80,80 80,160 120,160 120,80 80,80");
  expect(_rect).toHaveAttribute('stroke', '#fafafa');
  expect(_rect).toHaveAttribute('stroke-opacity', '0.7');
  expect(_rect).toHaveAttribute('stroke-width', '2');
  expect(_rect).toHaveAttribute('transform', 'rotate(29.999999999999993,100,120)');

  expect(rectShadow).toHaveAttribute('fill', 'none');
  expect(rectShadow).toHaveAttribute('points', "80,80 80,160 120,160 120,80 80,80");
  expect(rectShadow).toHaveAttribute('stroke', '#000000');
  expect(rectShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rectShadow).toHaveAttribute('stroke-width', '4');
  expect(rectShadow).toHaveAttribute('transform', 'rotate(29.999999999999993,100,120)');
  //#endregion
});