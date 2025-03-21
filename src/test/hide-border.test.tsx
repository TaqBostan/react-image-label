import { fireEvent, prettyDOM, render, renderHook } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { ImageAnnotator } from '../annotator/index';
import { AnnotatorHandles, useImageAnnotator } from '../annotator/hook';
import { Rectangle } from '../base/types';
import { FakeMouseEvent } from './helper/MouseEventWithOffsets';

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

it('hidden border', () => {
    let imageUrl = 'https://raw.githubusercontent.com/TaqBostan/content/main/Fruit.jpeg';
    let rawShapes = [
        { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" }
    ];
    const onReady = (annotator: AnnotatorHandles) => {
        annotator.drawRectangle();
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
            hideBorder={true}
            onReady={onReady} />
    );
    let _img = _annotator.container.querySelector('svg')!.children[0] as SVGImageElement
    _img.getBBox = () => ({width: 600, height: 700}) as any
    fireEvent(_img, new CustomEvent('testEvent', { detail: { testTarget: _img } }));

    let container = _annotator.container.children[0] as HTMLDivElement;
    let svg = _annotator.container.querySelector('svg')!;

    //#region elements
    let polylines = svg.querySelectorAll('polyline:not([points=""])');
    let discs = svg.querySelectorAll('circle[r="2"]');

    expect(polylines.length).toBe(2);
    expect(discs.length).toBe(4);
    //#endregion

    //#region rect1
    let rect1 = polylines[0];
    let rect1Shadow = polylines[1];

    expect(rect1).toHaveAttribute('fill', '#27f17640');
    expect(rect1).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1).toHaveAttribute('stroke', 'rgb(39,241,118)');
    expect(rect1).toHaveAttribute('stroke-opacity', '0.7');
    expect(rect1).toHaveAttribute('stroke-width', '0');
    expect(rect1).toHaveAttribute('transform', 'rotate(0,175,75)');

    expect(rect1Shadow).toHaveAttribute('fill', 'none');
    expect(rect1Shadow).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1Shadow).toHaveAttribute('stroke', '#000');
    expect(rect1Shadow).toHaveAttribute('stroke-opacity', '0.4');
    expect(rect1Shadow).toHaveAttribute('stroke-width', '4');
    expect(rect1Shadow).toHaveAttribute('transform', 'rotate(0,175,75)');
    expect(rect1Shadow).toHaveClass('il-hid');
    //#endregion

    //#region discs
    let _points = [[150, 50], [150, 100], [200, 100], [200, 50]];
    discs.forEach((disc, index) => {
        expect(disc).toHaveAttribute('fill', '#000');
        expect(disc).toHaveAttribute('cx', _points[index][0].toString());
        expect(disc).toHaveAttribute('cy', _points[index][1].toString());
        expect(disc).toHaveAttribute('r', '2');
        expect(disc).toHaveAttribute('transform', 'rotate(0,175,75)');
        expect(disc).toHaveClass('il-hid');
    });
    //#endregion

    let annotator = res.result.current.annotator!;
    let shapes = annotator.getShapes();
    annotator.edit(shapes[0].id);

    //#region elements
    polylines = svg.querySelectorAll('polyline:not([points=""])');
    discs = svg.querySelectorAll('circle[r="5"]');
    expect(polylines.length).toBe(2);
    expect(discs.length).toBe(4);
    //#endregion

    //#region rect1
    rect1 = polylines[0];
    rect1Shadow = polylines[1];
    expect(rect1).toHaveAttribute('fill', '#27f17640');
    expect(rect1).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1).toHaveAttribute('stroke', 'rgb(39,241,118)');
    expect(rect1).toHaveAttribute('stroke-opacity', '0.7');
    expect(rect1).toHaveAttribute('stroke-width', '2');
    expect(rect1).toHaveAttribute('transform', 'rotate(0,175,75)');
    expect(rect1).toHaveClass('grabbable');

    expect(rect1Shadow).toHaveAttribute('fill', 'none');
    expect(rect1Shadow).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1Shadow).toHaveAttribute('stroke', '#000');
    expect(rect1Shadow).toHaveAttribute('stroke-opacity', '0.4');
    expect(rect1Shadow).toHaveAttribute('stroke-width', '4');
    expect(rect1Shadow).toHaveAttribute('transform', 'rotate(0,175,75)');
    //#endregion

    //#region discs
    _points = [[150, 50], [150, 100], [200, 100], [200, 50]];
    discs.forEach((disc, index) => {
        expect(disc).toHaveAttribute('fill', '#009900');
        expect(disc).toHaveAttribute('cx', _points[index][0].toString());
        expect(disc).toHaveAttribute('cy', _points[index][1].toString());
        expect(disc).toHaveAttribute('r', '5');
        expect(disc).toHaveAttribute('transform', 'rotate(0,175,75)');
        expect(disc).toHaveClass(' seg-point');
    });
    //#endregion

    annotator.stopEdit();

    //#region elements
    polylines = svg.querySelectorAll('polyline:not([points=""])');
    discs = svg.querySelectorAll('circle[r="2"]');

    expect(polylines.length).toBe(2);
    expect(discs.length).toBe(4);
    //#endregion

    //#region rect1
    rect1 = polylines[0];
    rect1Shadow = polylines[1];

    expect(rect1).toHaveAttribute('fill', '#27f17640');
    expect(rect1).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1).toHaveAttribute('stroke', 'rgb(39,241,118)');
    expect(rect1).toHaveAttribute('stroke-opacity', '0.7');
    expect(rect1).toHaveAttribute('stroke-width', '0');
    expect(rect1).toHaveAttribute('transform', 'rotate(0,175,75)');

    expect(rect1Shadow).toHaveAttribute('fill', 'none');
    expect(rect1Shadow).toHaveAttribute('points', '150,50 150,100 200,100 200,50 150,50');
    expect(rect1Shadow).toHaveAttribute('stroke', '#000');
    expect(rect1Shadow).toHaveAttribute('stroke-opacity', '0.4');
    expect(rect1Shadow).toHaveAttribute('stroke-width', '4');
    expect(rect1Shadow).toHaveAttribute('transform', 'rotate(0,175,75)');
    expect(rect1Shadow).toHaveClass('il-hid');
    //#endregion

    //#region discs
    _points = [[150, 50], [150, 100], [200, 100], [200, 50]];
    discs.forEach((disc, index) => {
        expect(disc).toHaveAttribute('fill', '#000');
        expect(disc).toHaveAttribute('cx', _points[index][0].toString());
        expect(disc).toHaveAttribute('cy', _points[index][1].toString());
        expect(disc).toHaveAttribute('r', '2');
        expect(disc).toHaveAttribute('transform', 'rotate(0,175,75)');
        expect(disc).toHaveClass('il-hid');
    });
    //#endregion

    let points = [[100, 100], [100, 200], [150, 200], [150, 100]];
    fireEvent(svg, new FakeMouseEvent('mousedown', { bubbles: true, buttons: 1, offsetX: points[0][0], offsetY: points[0][1] }));
    fireEvent(svg, new FakeMouseEvent('mousemove', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }));
    fireEvent(svg, new FakeMouseEvent('mouseup', { bubbles: true, buttons: 1, offsetX: points[2][0], offsetY: points[2][1] }));

    //#region elements
    polylines = svg.querySelectorAll('polyline:not([points=""])');
    discs = svg.querySelectorAll('circle:not([r="12"])');

    expect(polylines.length).toBe(4);
    expect(discs.length).toBe(8);
    //#endregion

    //#region rect2
    let rect2 = polylines[2];
    let rect2Shadow = polylines[3];

    expect(rect2).toHaveAttribute('fill', '#ffffff00');
    expect(rect2).toHaveAttribute('points', '100,100 100,200 150,200 150,100 100,100');
    expect(rect2).toHaveAttribute('stroke', '#f00');
    expect(rect2).toHaveAttribute('stroke-opacity', '0.7');
    expect(rect2).toHaveAttribute('stroke-width', '2');
    expect(rect2).toHaveAttribute('transform', 'rotate(0,125,150)');
    expect(rect2).toHaveClass('grabbable');

    expect(rect2Shadow).toHaveAttribute('fill', 'none');
    expect(rect2Shadow).toHaveAttribute('points', '100,100 100,200 150,200 150,100 100,100');
    expect(rect2Shadow).toHaveAttribute('stroke', '#000');
    expect(rect2Shadow).toHaveAttribute('stroke-opacity', '0.4');
    expect(rect2Shadow).toHaveAttribute('stroke-width', '4');
    expect(rect2Shadow).toHaveAttribute('transform', 'rotate(0,125,150)');
    //#endregion

    //#region discs
    _points = [[100, 100], [100, 200], [150, 200], [150, 100]];    
    discs = svg.querySelectorAll('circle[r="5"]');
    discs.forEach((disc, index) => {
            expect(disc).toHaveAttribute('fill', '#009900');
            expect(disc).toHaveAttribute('cx', _points[index][0].toString());
            expect(disc).toHaveAttribute('cy', _points[index][1].toString());
            expect(disc).toHaveAttribute('r', '5');
            expect(disc).toHaveAttribute('transform', 'rotate(0,125,150)');
            expect(disc).toHaveClass('seg-point');
    });
    //#endregion
});
