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

it('Show content', () => {
  let rawShapes = [
    { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
    // { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
    // { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
    // { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
  ]

  const onReady = (annotator: AnnotatorHandles) => {
  }
  const res = renderHook(useImageAnnotator);
  let { setHandles, annotator } = res.result.current;
  const _annotator = render(
    <ImageAnnotator
    setHandles={setHandles}
    naturalSize={true}
    imageUrl={'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg'}
    shapes={rawShapes}
    width={700}
    height={400}
    onReady={onReady} />
  );
  let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img, new CustomEvent('testEvent', { detail: {testRil: {naturalWidth: 600, naturalHeight: 400}} }));
  console.log(prettyDOM(_annotator.container.querySelector('svg')!));
});