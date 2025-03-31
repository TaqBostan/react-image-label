import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent, act } from '@testing-library/react';
import React, { useState } from 'react';
import '@testing-library/jest-dom';
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Circle, Ellipse, Polygon, Rectangle, Shape } from '../base/types';

export const ns = "http://www.w3.org/2000/svg";

Object.defineProperty(global.SVGTextElement.prototype, 'getBBox', {
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
  let _rect1 = new Rectangle([[150, 50], [200, 50], [200, 100], [150, 100]], ["class 3"], "#27f17640");
  let _rect2 = new Rectangle([[250, 150], [300, 150], [300, 200], [250, 200]], ["class 1", "class 2"]);
  let _polygon = new Polygon([[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]]);
  let _circle = new Circle([250, 100], 40, ["class 4"]);
  let _ellipse = new Ellipse([300, 150], 60, 40, ["class 3"]);
  const res = renderHook(useImageAnnotator);
  let { setHandles } = res.result.current;

  const Comp = function ({ }) {
    const [img, setImg] = React.useState(imageUrl);
    const [shapes, setShapes] = React.useState<Shape[]>([_rect1, _polygon]);
    return (
      <>
        <input id="change-img" type='button' onClick={() => {setImg(imageUrl2); setShapes([_rect2, _circle, _ellipse]); }} />
        <ImageAnnotator
          setHandles={setHandles}
          naturalSize={false}
          imageUrl={img}
          shapes={shapes}
          width={700}
          height={800}/>
      </>
    );
  };

  const _annotator = render(<Comp />);
  let svg = _annotator.container.querySelector('svg')!;
  let container = svg.parentElement as HTMLDivElement
  let imgs = svg.querySelectorAll('image')
  let _img1 = imgs[0] as SVGImageElement
  _img1.getBBox = () => ({width: 800, height: 700}) as any
  fireEvent(_img1, new CustomEvent('testEvent', { detail: { testTarget: _img1 } }));

  //#region container, svg, and image
  expect(container.style.width).toBe('700px');
  expect(container.style.height).toBe('800px');
  
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '612.5');
  expect(svg).toHaveAttribute('width', '700');
  
  expect(_img1).toHaveAttribute('height', '100%');
  expect(_img1).toHaveAttribute('width', '100%');
  expect(_img1).toHaveAttribute('oncontextmenu', 'return false');
  expect(_img1).toHaveAttribute('onmousedown', 'return false');
  expect(_img1).toHaveAttribute('href', imageUrl);
  //#endregion

  //#region elements
  let polylines = svg.querySelectorAll('polyline');
  let discs = svg.querySelectorAll('circle[r="2"]');
  let ellipses = svg.querySelectorAll('ellipse');

  expect(polylines.length).toBe(4);
  expect(discs.length).toBe(12);
  expect(ellipses.length).toBe(0);
  //#endregion

  //#region rect1
  let rect1 = polylines[0];
  let rect1Shadow = polylines[1];

  expect(rect1).toHaveAttribute('fill', '#27f17640');
  expect(rect1).toHaveAttribute('points', '131.25,43.75 131.25,87.5 175,87.5 175,43.75 131.25,43.75');
  expect(rect1).toHaveAttribute('stroke', 'rgb(39,241,118)');
  expect(rect1).toHaveAttribute('stroke-opacity', '0.7');
  expect(rect1).toHaveAttribute('stroke-width', '2');
  expect(rect1).toHaveAttribute('transform', 'rotate(0,153.125,65.625)');
  expect(rect1).not.toHaveClass('il-hid');

  expect(rect1Shadow).toHaveAttribute('fill', 'none');
  expect(rect1Shadow).toHaveAttribute('points', '131.25,43.75 131.25,87.5 175,87.5 175,43.75 131.25,43.75');
  expect(rect1Shadow).toHaveAttribute('stroke', '#000');
  expect(rect1Shadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rect1Shadow).toHaveAttribute('stroke-width', '4');
  expect(rect1Shadow).toHaveAttribute('transform', 'rotate(0,153.125,65.625)');
  expect(rect1Shadow).not.toHaveClass('il-hid');
  //#endregion
  
  //#region polyline
  let polyline = polylines[2];
  let polylineShadow = polylines[3];

  expect(polyline).toHaveAttribute('fill', '#ffffff00');
  expect(polyline).toHaveAttribute('points', '43.75,43.75 43.75,87.5 65.625,87.5 65.625,105 78.75,105 78.75,131.25 105,131.25 105,43.75 43.75,43.75');
  expect(polyline).toHaveAttribute('stroke', '#f00');
  expect(polyline).toHaveAttribute('stroke-opacity', '0.7');
  expect(polyline).toHaveAttribute('stroke-width', '2');
  expect(polyline).not.toHaveAttribute('transform');
  
  expect(polylineShadow).toHaveAttribute('fill', 'none');
  expect(polylineShadow).toHaveAttribute('points', '43.75,43.75 43.75,87.5 65.625,87.5 65.625,105 78.75,105 78.75,131.25 105,131.25 105,43.75 43.75,43.75');
  expect(polylineShadow).toHaveAttribute('stroke', '#000');
  expect(polylineShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(polylineShadow).toHaveAttribute('stroke-width', '4');
  expect(polylineShadow).not.toHaveAttribute('transform');
  //#endregion

  fireEvent(_annotator.container.querySelector('#change-img')!, new MouseEvent('click', { bubbles: true, cancelable: true }));
  imgs = svg.querySelectorAll('image')
  let _img2 = imgs[imgs.length - 1] as SVGImageElement
  _img2.getBBox = () => new DOMRect(0, 0, 1400, 900)
  fireEvent(_img2, new CustomEvent('testEvent', { detail: { testTarget: _img2 } }));
  
  //#region container, svg, and image
  expect(container.style.width).toBe('700px');
  expect(container.style.height).toBe('800px');
  
  expect(svg).toHaveClass('il-svg');
  expect(svg).toHaveAttribute('height', '450');
  expect(svg).toHaveAttribute('width', '700');
  
  expect(_img2).toHaveAttribute('height', '100%');
  expect(_img2).toHaveAttribute('width', '100%');
  expect(_img2).toHaveAttribute('oncontextmenu', 'return false');
  expect(_img2).toHaveAttribute('onmousedown', 'return false');
  expect(_img2).toHaveAttribute('href', imageUrl2);
  //#endregion

  //#region elements
  polylines = svg.querySelectorAll('polyline');
  discs = svg.querySelectorAll('circle[r="2"]');
  ellipses = svg.querySelectorAll('ellipse');

  expect(polylines.length).toBe(2);
  expect(discs.length).toBe(4);
  expect(ellipses.length).toBe(4);
  //#endregion
  
  //#region rect2
  let rect2 = polylines[0];
  let rect2Shadow = polylines[1];

  expect(rect2).toHaveAttribute('fill', '#ffffff00');
  expect(rect2).toHaveAttribute('points', '125,75 125,100 150,100 150,75 125,75');
  expect(rect2).toHaveAttribute('stroke', '#fff');
  expect(rect2).toHaveAttribute('stroke-opacity', '0.7');
  expect(rect2).toHaveAttribute('stroke-width', '2');
  expect(rect2).toHaveAttribute('transform', 'rotate(0,137.5,87.5)');

  expect(rect2Shadow).toHaveAttribute('fill', 'none');
  expect(rect2Shadow).toHaveAttribute('points', '125,75 125,100 150,100 150,75 125,75');
  expect(rect2Shadow).toHaveAttribute('stroke', '#000');
  expect(rect2Shadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(rect2Shadow).toHaveAttribute('stroke-width', '4');
  expect(rect2Shadow).toHaveAttribute('transform', 'rotate(0,137.5,87.5)');
  //#endregion

  //#region circle
  let circle = ellipses[0];
  let circleShadow = ellipses[1];

  expect(circle).toHaveAttribute('fill', '#ffffff00');
  expect(circle).toHaveAttribute('cx', '125');
  expect(circle).toHaveAttribute('cy', '50');
  expect(circle).toHaveAttribute('rx', '20');
  expect(circle).toHaveAttribute('ry', '20');
  expect(circle).toHaveAttribute('stroke', '#fff');
  expect(circle).toHaveAttribute('stroke-opacity', '0.7');
  expect(circle).toHaveAttribute('stroke-width', '2');
  expect(circle).not.toHaveAttribute('transform');

  expect(circleShadow).toHaveAttribute('fill', 'none');
  expect(circleShadow).toHaveAttribute('cx', '125');
  expect(circleShadow).toHaveAttribute('cy', '50');
  expect(circleShadow).toHaveAttribute('rx', '20');
  expect(circleShadow).toHaveAttribute('ry', '20');
  expect(circleShadow).toHaveAttribute('stroke', '#000');
  expect(circleShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(circleShadow).toHaveAttribute('stroke-width', '4');
  expect(circleShadow).not.toHaveAttribute('transform');
  //#endregion

  //#region ellipse
  let ellipse = ellipses[2];
  let ellipseShadow = ellipses[3];

  expect(ellipse).toHaveAttribute('fill', '#ffffff00');
  expect(ellipse).toHaveAttribute('cx', '150');
  expect(ellipse).toHaveAttribute('cy', '75');
  expect(ellipse).toHaveAttribute('rx', '30');
  expect(ellipse).toHaveAttribute('ry', '20');
  expect(ellipse).toHaveAttribute('stroke', '#fff');
  expect(ellipse).toHaveAttribute('stroke-opacity', '0.7');
  expect(ellipse).toHaveAttribute('stroke-width', '2');
  expect(ellipse).toHaveAttribute('transform', 'rotate(0,150,75)');

  expect(ellipseShadow).toHaveAttribute('fill', 'none');
  expect(ellipseShadow).toHaveAttribute('cx', '150');
  expect(ellipseShadow).toHaveAttribute('cy', '75');
  expect(ellipseShadow).toHaveAttribute('rx', '30');
  expect(ellipseShadow).toHaveAttribute('ry', '20');
  expect(ellipseShadow).toHaveAttribute('stroke', '#000');
  expect(ellipseShadow).toHaveAttribute('stroke-opacity', '0.4');
  expect(ellipseShadow).toHaveAttribute('stroke-width', '4');
  expect(ellipseShadow).toHaveAttribute('transform', 'rotate(0,150,75)');
  //#endregion
});
