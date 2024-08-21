import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Circle, Ellipse, Polygon, Rectangle } from '../base/types';

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

it('load shapes', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'rectangle', categories: ["class 2"], points: [[250, 150], [300, 150], [300, 200], [250, 200]], color: "red" },
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
  let svg = _annotator.container.querySelector('svg')!;

  let polylines = svg.querySelectorAll('polyline');
  let discs = svg.querySelectorAll('circle[r="2"]');
  let ellipses = svg.querySelectorAll('ellipse');

  expect(polylines.length).toBe(6);
  expect(discs.length).toBe(16);
  expect(ellipses.length).toBe(4);

  //#region rect1
  let rect1 = polylines[0];
  let rect1Shadow = polylines[1];

  expect(rect1).toHaveAttribute('fill', '#27f17640');
  expect(rect1).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
  expect(rect1).toHaveAttribute('stroke', '#ffffff');
  expect(rect1).toHaveAttribute('stroke-opacity', '0.7');
  expect(rect1).toHaveAttribute('stroke-width', '2');
  expect(rect1).toHaveAttribute('transform', 'rotate(0,175,75)');

  expect(rect1Shadow).toHaveAttribute('fill', 'none');
  expect(rect1Shadow).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
  expect(rect1Shadow).toHaveAttribute('stroke', '#000000');
  expect(rect1Shadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rect1Shadow).toHaveAttribute('stroke-width', '4');
  expect(rect1Shadow).toHaveAttribute('transform', 'rotate(0,175,75)');
  //#endregion

  //#region rect2
  let rect2 = polylines[2];
  let rect2Shadow = polylines[3];

  expect(rect2).toHaveAttribute('fill', 'red');
  expect(rect2).toHaveAttribute('points', '250,150 250,200 300,200 300,150 250,150');
  expect(rect2).toHaveAttribute('stroke', '#ffffff');
  expect(rect2).toHaveAttribute('stroke-opacity', '0.7');
  expect(rect2).toHaveAttribute('stroke-width', '2');
  expect(rect2).toHaveAttribute('transform', 'rotate(0,275,175)');

  expect(rect2Shadow).toHaveAttribute('fill', 'none');
  expect(rect2Shadow).toHaveAttribute('points', '250,150 250,200 300,200 300,150 250,150');
  expect(rect2Shadow).toHaveAttribute('stroke', '#000000');
  expect(rect2Shadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rect2Shadow).toHaveAttribute('stroke-width', '4');
  expect(rect2Shadow).toHaveAttribute('transform', 'rotate(0,275,175)');
  //#endregion

  //#region polyline
  let polyline = polylines[4];
  let polylineShadow = polylines[5];

  expect(polyline).toHaveAttribute('fill', '#27f17640');
  expect(polyline).toHaveAttribute('points', '50,50 50,100 75,100 75,120 90,120 90,150 120,150 120,50 50,50');
  expect(polyline).toHaveAttribute('stroke', '#ffffff');
  expect(polyline).toHaveAttribute('stroke-opacity', '0.7');
  expect(polyline).toHaveAttribute('stroke-width', '2');
  expect(polyline).not.toHaveAttribute('transform');
  
  expect(polylineShadow).toHaveAttribute('fill', 'none');
  expect(polylineShadow).toHaveAttribute('points', '50,50 50,100 75,100 75,120 90,120 90,150 120,150 120,50 50,50');
  expect(polylineShadow).toHaveAttribute('stroke', '#000000');
  expect(polylineShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(polylineShadow).toHaveAttribute('stroke-width', '4');
  expect(polylineShadow).not.toHaveAttribute('transform');
  //#endregion

  //#region circle
  let circle = ellipses[0];
  let circleShadow = ellipses[1];

  expect(circle).toHaveAttribute('fill', '#ffffff00');
  expect(circle).toHaveAttribute('cx', '250');
  expect(circle).toHaveAttribute('cy', '100');
  expect(circle).toHaveAttribute('rx', '40');
  expect(circle).toHaveAttribute('ry', '40');
  expect(circle).toHaveAttribute('stroke', '#ffffff');
  expect(circle).toHaveAttribute('stroke-opacity', '0.7');
  expect(circle).toHaveAttribute('stroke-width', '2');
  expect(circle).not.toHaveAttribute('transform');

  expect(circleShadow).toHaveAttribute('fill', 'none');
  expect(circleShadow).toHaveAttribute('cx', '250');
  expect(circleShadow).toHaveAttribute('cy', '100');
  expect(circleShadow).toHaveAttribute('rx', '40');
  expect(circleShadow).toHaveAttribute('ry', '40');
  expect(circleShadow).toHaveAttribute('stroke', '#000000');
  expect(circleShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(circleShadow).toHaveAttribute('stroke-width', '4');
  expect(circleShadow).not.toHaveAttribute('transform');
  //#endregion

  //#region ellipse
  let ellipse = ellipses[2];
  let ellipseShadow = ellipses[3];

  expect(ellipse).toHaveAttribute('fill', '#27f17640');
  expect(ellipse).toHaveAttribute('cx', '350');
  expect(ellipse).toHaveAttribute('cy', '150');
  expect(ellipse).toHaveAttribute('rx', '60');
  expect(ellipse).toHaveAttribute('ry', '40');
  expect(ellipse).toHaveAttribute('stroke', '#ffffff');
  expect(ellipse).toHaveAttribute('stroke-opacity', '0.7');
  expect(ellipse).toHaveAttribute('stroke-width', '2');
  expect(ellipse).toHaveAttribute('transform', 'rotate(0,350,150)');

  expect(ellipseShadow).toHaveAttribute('fill', 'none');
  expect(ellipseShadow).toHaveAttribute('cx', '350');
  expect(ellipseShadow).toHaveAttribute('cy', '150');
  expect(ellipseShadow).toHaveAttribute('rx', '60');
  expect(ellipseShadow).toHaveAttribute('ry', '40');
  expect(ellipseShadow).toHaveAttribute('stroke', '#000000');
  expect(ellipseShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(ellipseShadow).toHaveAttribute('stroke-width', '4');
  expect(ellipseShadow).toHaveAttribute('transform', 'rotate(0,350,150)');
  //#endregion
});

it('getShapes', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "blue" },
    { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    { type: 'rectangle', categories: ["class 2"], points: [[250, 150], [300, 150], [300, 200], [250, 200]], color: "red" },
    { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "yellow" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles } = res.result.current;
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
  let shapes = res.result.current.annotator!.getShapes();

  let rectangles = shapes.filter(c => c.type === 'rectangle');
  let polygons = shapes.filter(c => c.type === 'polygon');
  let circles = shapes.filter(c => c.type === 'circle');
  let ellipses = shapes.filter(c => c.type === 'ellipse');

  expect(rectangles.length).toBe(2);
  expect(polygons.length).toBe(1);
  expect(circles.length).toBe(1);
  expect(ellipses.length).toBe(1);

  let rectangle = rectangles[0] as Rectangle;
  let rectangle2 = rectangles[1] as Rectangle;
  let polygon = polygons[0] as Polygon;
  let circle = circles[0] as Circle;
  let ellipse = ellipses[0] as Ellipse;

  expect(rectangle.color).toBe('#27f17640');
  expect(rectangle.categories.length).toBe(1);
  expect(rectangle.categories[0]).toBe('class 3');
  expect(rectangle.getCenterWithOffset().X).toBe(175);
  expect(rectangle.getCenterWithOffset().Y).toBe(75);
  expect(JSON.stringify(rectangle.points)).toBe('[[150,50],[150,100],[200,100],[200,50]]');
  expect(rectangle.type).toBe('rectangle');

  expect(rectangle2.color).toBe('red');
  expect(rectangle2.categories.length).toBe(1);
  expect(rectangle2.categories[0]).toBe('class 2');
  expect(rectangle2.getCenterWithOffset().X).toBe(275);
  expect(rectangle2.getCenterWithOffset().Y).toBe(175);
  expect(JSON.stringify(rectangle2.points)).toBe('[[250,150],[250,200],[300,200],[300,150]]');
  expect(rectangle2.type).toBe('rectangle');

  expect(polygon.color).toBe('blue');
  expect(polygon.categories.length).toBe(2);
  expect(polygon.categories[0]).toBe('class 1');
  expect(polygon.getCenterWithOffset().X).toBe(83.75);
  expect(polygon.getCenterWithOffset().Y).toBe(100);
  expect(JSON.stringify(polygon.points)).toBe('[[50,50],[50,100],[75,100],[75,120],[90,120],[90,150],[120,150],[120,50]]');
  expect(polygon.type).toBe('polygon');

  expect(circle.color).not.toBeDefined;
  expect(circle.categories.length).toBe(1);
  expect(circle.categories[0]).toBe('class 4');
  expect(circle.getCenterWithOffset().X).toBe(250);
  expect(circle.getCenterWithOffset().Y).toBe(100);
  expect(JSON.stringify(circle.centre)).toBe('[250,100]');
  expect(circle.radius).toBe(40);
  expect(circle.type).toBe('circle');

  expect(ellipse.color).toBe('yellow');
  expect(ellipse.categories.length).toBe(1);
  expect(ellipse.categories[0]).toBe('class 3');
  expect(ellipse.getCenterWithOffset().X).toBe(350);
  expect(ellipse.getCenterWithOffset().Y).toBe(150);
  expect(JSON.stringify(ellipse.centre)).toBe('[350,150]');
  expect(ellipse.radiusX).toBe(60);
  expect(ellipse.radiusY).toBe(40);
  expect(ellipse.type).toBe('ellipse');
});