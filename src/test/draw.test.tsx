import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Circle, Ellipse, Polygon, Rectangle, Shape } from '../base/types';
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

  let points = [[100,100],[100,200],[150,200],[150,100]];
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
    res.result.current.annotator!.updateCategories(shape.id, ["class 1"])
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
      onAdded={onAdded}/>
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: { testRil: { naturalWidth: 1400, naturalHeight: 800 } } }));

  let container = _annotator.container.children[0] as HTMLDivElement;
  let svg = _annotator.container.querySelector('svg')!;
  let annotator = res.result.current.annotator!;

  let points = [[100,100],[100,200],[150,200],[150,100]];
  fireEvent(svg, new FakeMouseEvent('mousedown', { bubbles: true, buttons: 1, offsetX: points[0][0], offsetY: points[0][1] }))
  fireEvent(svg, new FakeMouseEvent('mousemove', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))
  fireEvent(svg, new FakeMouseEvent('mouseup', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }))

  let shapes = annotator.getShapes();

  expect(shapes).toHaveLength(3);

  let rect = shapes.filter(s => ![1, 2].includes(s.id))[0] as Rectangle;
  
  expect(JSON.stringify(rect.points)).toBe(JSON.stringify(points));
  expect(rect.type).toBe('rectangle')
  expect(rect.categories).toHaveLength(1);
  expect(rect.categories[0]).toBe("class 1");
  expect(rect.color).toBeUndefined();
});