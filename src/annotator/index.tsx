import React, { useEffect, FC } from 'react';
import { SvgContainer, useSvgContainer, Svg } from 'react-svgdotjs';
import { Director } from '../base/Director';
import { Shape, Polygon, Rectangle, Circle, Ellipse } from '../base/types';
import { AnnotatorHandles } from './hook';
import './index.css';

const ImageAnnotator: FC<ImageAnnotatorProps> = props => {
  const { setHandles, svgContainer } = useSvgContainer();

  const drawShapes = (shapes?: Shape[] | any[]) => {
    let director = new Director();
    if (!shapes) return;
    let rectangles = shapes.filter(s => s instanceof Rectangle || s.type === 'rectangle')
      .map(s => new Rectangle(s.points, s.categories));
    let polygons = shapes.filter(s => s instanceof Polygon || s.type === 'polygon')
      .map(s => new Polygon(s.points, s.categories));
    let circles = shapes.filter(s => s instanceof Circle || s.type === 'circle')
      .map(s => new Circle(s.centre, s.radius, s.categories));
    let ellipses = shapes.filter(s => s instanceof Ellipse || s.type === 'ellipse')
      .map(s => new Ellipse(s.centre, s.radiusX, s.radiusY, s.categories));
    if (rectangles.length > 0) director.plot(rectangles);
    if (polygons.length > 0) director.plot(polygons);
    if (circles.length > 0) director.plot(circles);
    if (ellipses.length > 0) director.plot(ellipses);
  }

  const zoom = (factor: number) => {
    let director = new Director();
    Director.setSizeAndRatio(factor);
    director.zoom(factor);
  }

  const stopAll = () => {
    let director = new Director();
    director.stopDraw();
    director.stopEdit();
  }

  const getHandles = () => ({
    drawRectangle() {
      stopAll();
      new Director().startDraw(new Rectangle());
    },
    drawPolygon() {
      stopAll();
      new Director().startDraw(new Polygon());
    },
    drawCircle() {
      stopAll();
      new Director().startDraw(new Circle());
    },
    drawEllipse() {
      stopAll();
      new Director().startDraw(new Ellipse());
    },
    stop: stopAll,
    stopEdit: () => new Director().stopEdit(),
    edit: (id: number) => new Director().edit(id),
    delete: (id: number) => new Director().removeElement(id),
    updateCategories: (id: number, categories: string[]) => new Director().updateCategories(id, categories),
    zoom,
    getShapes: Director.getShapes
  })

  const onload = React.useCallback((svg: Svg, container: HTMLDivElement, imageUrl: string) => {
    svg.image(imageUrl, (ev: any) => {
      if (!ev?.target) return;
      let width = ev.target.naturalWidth, height = ev.target.naturalHeight, maxWidth = props.width, maxHeight = props.height;
      if (!props.naturalSize) {
        if (!maxWidth) maxWidth = container.scrollWidth;
        if (!maxHeight) maxHeight = container.scrollHeight;
        if (maxWidth! / maxHeight! > ev.target.naturalWidth / ev.target.naturalHeight) {
          height = Math.min(maxHeight!, ev.target.naturalHeight);
          width = height * ev.target.naturalWidth / ev.target.naturalHeight;
        }
        else {
          width = Math.min(maxWidth!, ev.target.naturalWidth);
          height = width * ev.target.naturalHeight / ev.target.naturalWidth;
        }
      }
      let statics = { width, height, ratio: width / ev.target.naturalWidth, discRadius: props.discRadius || 5 }
      Director.init(svg, statics, container);
      drawShapes(props.shapes);
      props.setHandles({ ...getHandles(), container });
      props.onReady?.({ ...getHandles(), container });
    }).size('100%', '100%').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
  }, [props.width, props.height, props.shapes]);

  useEffect(() => {
    Director.setActions(props.onAdded, props.onContextMenu);
    return () => Director.setActions(undefined, undefined);
  }, [props.onAdded, props.onContextMenu]);

  useEffect(() => {
    if (svgContainer && props.imageUrl) onload(svgContainer.svg, svgContainer.container, props.imageUrl);
    return () => { Director.clear(); }
  }, [svgContainer, onload, props.imageUrl]);

  return (<SvgContainer setHandles={setHandles} width='fit-content' height='fit-content' />);
}

export { ImageAnnotator };

export interface ImageAnnotatorProps {
  onReady?: (annotator: AnnotatorHandles) => any;
  onAdded?: (shape: Shape) => any;
  onContextMenu?: (shape: Shape) => any;
  imageUrl?: string;
  shapes?: Shape[] | any[];
  naturalSize?: boolean;
  width?: number;
  height?: number;
  discRadius?: number;
  setHandles: (handles: AnnotatorHandles) => void;
}
