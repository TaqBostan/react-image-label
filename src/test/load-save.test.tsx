import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';

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

it('load container, svg, image in natural size', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles, annotator } = res.result.current;
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
  fireEvent(_img, new CustomEvent('testEvent', { detail: {testRil: {naturalWidth: 800, naturalHeight: 500}} }));

  let container =_annotator.container.children[0] as HTMLDivElement;
  expect(container.style.height).toBe('400px');
  expect(container.style.width).toBe('700px');
  expect(container).toHaveAttribute('data-img', 'Fruit.jpeg');

  let svg = _annotator.container.querySelector('svg')!;
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '500');
  expect(svg).toHaveAttribute('width', '800');

  let images = svg.querySelectorAll('image');
  expect(images.length).toBe(1);

  let image = images[0];
  expect(image).toHaveAttribute('height', '100%');
  expect(image).toHaveAttribute('width', '100%');
  expect(image).toHaveAttribute('oncontextmenu', 'return false');
  expect(image).toHaveAttribute('onmousedown', 'return false');
  expect(image).toHaveAttribute('href', imageUrl);
});

it('load container, svg, image 1', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles, annotator } = res.result.current;
  const _annotator = render(
    <ImageAnnotator
    setHandles={setHandles}
    naturalSize={false}
    imageUrl={imageUrl}
    shapes={rawShapes}
    width={800}
    height={300}
    onReady={onReady} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: {testRil: {naturalWidth: 800, naturalHeight: 400}} }));

  let container =_annotator.container.children[0] as HTMLDivElement;
  expect(container.style.height).toBe('300px');
  expect(container.style.width).toBe('800px');
  expect(container).toHaveAttribute('data-img', 'Fruit.jpeg');

  let svg = _annotator.container.querySelector('svg')!;
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '300');
  expect(svg).toHaveAttribute('width', '600');

  let images = svg.querySelectorAll('image');
  expect(images.length).toBe(1);

  let image = images[0];
  expect(image).toHaveAttribute('height', '100%');
  expect(image).toHaveAttribute('width', '100%');
});

it('load container, svg, image 2', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles, annotator } = res.result.current;
  const _annotator = render(
    <ImageAnnotator
    setHandles={setHandles}
    naturalSize={false}
    imageUrl={imageUrl}
    shapes={rawShapes}
    width={300}
    height={800}
    onReady={onReady} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: {testRil: {naturalWidth: 400, naturalHeight: 800}} }));

  let container =_annotator.container.children[0] as HTMLDivElement;
  expect(container.style.height).toBe('800px');
  expect(container.style.width).toBe('300px');
  expect(container).toHaveAttribute('data-img', 'Fruit.jpeg');

  let svg = _annotator.container.querySelector('svg')!;
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '600');
  expect(svg).toHaveAttribute('width', '300');

  let images = svg.querySelectorAll('image');
  expect(images.length).toBe(1);

  let image = images[0];
  expect(image).toHaveAttribute('height', '100%');
  expect(image).toHaveAttribute('width', '100%');
});

it('load container, svg, image 3', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles, annotator } = res.result.current;
  const _annotator = render(
    <ImageAnnotator
    setHandles={setHandles}
    naturalSize={false}
    imageUrl={imageUrl}
    shapes={rawShapes}
    width={700}
    height={800}
    onReady={onReady} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: {testRil: {naturalWidth: 600, naturalHeight: 700}} }));

  let container =_annotator.container.children[0] as HTMLDivElement;
  expect(container.style.height).toBe('800px');
  expect(container.style.width).toBe('700px');
  expect(container).toHaveAttribute('data-img', 'Fruit.jpeg');

  let svg = _annotator.container.querySelector('svg')!;
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '700');
  expect(svg).toHaveAttribute('width', '600');

  let images = svg.querySelectorAll('image');
  expect(images.length).toBe(1);

  let image = images[0];
  expect(image).toHaveAttribute('height', '100%');
  expect(image).toHaveAttribute('width', '100%');
});