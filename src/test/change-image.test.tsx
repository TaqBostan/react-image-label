import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent, act } from '@testing-library/react';
import React, { useState } from 'react';
import '@testing-library/jest-dom';
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Circle, Ellipse, Polygon, Rectangle, Shape } from '../base/types';

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

it('change image', () => {
  let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
  let imageUrl2 = 'https://svgjs.dev/docs/3.0/assets/images/logo-svg-js-01d-128.png';
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
  const imgHk = renderHook(() => useState(imageUrl));
  let { setHandles } = res.result.current;

  const Comp = function ({ }) {
    const [img, setImg] = React.useState(imageUrl);
    return (
      <>
        <input id="change-img" type='button' onClick={() => setImg(imageUrl2)} />
        <ImageAnnotator
          setHandles={setHandles}
          naturalSize={false}
          imageUrl={img}
          shapes={rawShapes}
          width={700}
          height={800}
          onReady={onReady} />
      </>
    );
  };

  const _annotator = render(<Comp />);
  let imgs = _annotator.container.querySelectorAll('svg>image')
  let _img1 = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img1, new CustomEvent('testEvent', { detail: { testRil: { naturalWidth: 800, naturalHeight: 700 } } }));

  fireEvent(_annotator.container.querySelector('#change-img')!, new MouseEvent('click', { bubbles: true, cancelable: true }));
  let _img2 = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
  fireEvent(_img2, new CustomEvent('testEvent', { detail: { testRil: { naturalWidth: 500, naturalHeight: 400 } } }));
  
  console.log(prettyDOM(_annotator.container));

  // let container = _annotator.container.children[0] as HTMLDivElement;
  // let shapes = res.result.current.annotator!.getShapes();

  //console.log(prettyDOM(_annotator.container));

});