import React, { useEffect, FC } from 'react';
import { SvgContainer, useSvgContainer, Svg } from 'react-svgdotjs';
import { Director } from '../base/Director';
import { Shape, Polygon, Rectangle, Circle, Ellipse, Dot } from '../base/types';
import { AnnotatorHandles } from './hook';
import './index.css';

const ImageAnnotator: FC<ImageAnnotatorProps> = props => {
  const { setHandles, svgContainer } = useSvgContainer();
  const getDirector = () => Director.instance;

  const drawShapes = (shapes?: Shape[] | any[]) => {
    let director = getDirector();
    if (!shapes) return;
    let rectangles = shapes.filter(s => s instanceof Rectangle || s.type === 'rectangle')
      .map(s => new Rectangle(s.points, s.categories));
    let polygons = shapes.filter(s => s instanceof Polygon || s.type === 'polygon')
      .map(s => new Polygon(s.points, s.categories));
    let circles = shapes.filter(s => s instanceof Circle || s.type === 'circle')
      .map(s => new Circle(s.centre, s.radius, s.categories));
    let ellipses = shapes.filter(s => s instanceof Ellipse || s.type === 'ellipse')
      .map(s => new Ellipse(s.centre, s.radiusX, s.radiusY, s.categories));
    let dots = shapes.filter(s => s instanceof Dot || s.type === 'dot')
      .map(s => new Dot(s.position, s.categories));
    if (rectangles.length > 0) director.plot(rectangles);
    if (polygons.length > 0) director.plot(polygons);
    if (circles.length > 0) director.plot(circles);
    if (ellipses.length > 0) director.plot(ellipses);
    if (dots.length > 0) director.plot(dots);
  }

  const zoom = (factor: number) => {
    let director = getDirector();
    director.setSizeAndRatio(factor);
    director.zoom(factor);
  }

  const stopAll = () => {
    let director = getDirector();
    director.stopDraw();
    director.stopEdit();
  }

  const getHandles = () => ({
    drawRectangle() {
      stopAll();
      getDirector().startDraw(new Rectangle());
    },
    drawPolygon() {
      stopAll();
      getDirector().startDraw(new Polygon());
    },
    drawCircle() {
      stopAll();
      getDirector().startDraw(new Circle());
    },
    drawEllipse() {
      stopAll();
      getDirector().startDraw(new Ellipse());
    },
    drawDot() {
      stopAll();
      getDirector().startDraw(new Dot());
    },
    stop: stopAll,
    stopEdit: () => getDirector().stopEdit(),
    edit: (id: number) => getDirector().edit(id),
    delete: (id: number) => getDirector().removeElement(id),
    updateCategories: (id: number, categories: string[]) => getDirector().updateCategories(id, categories),
    zoom,
    getShapes: getDirector().getShapes
  })

  const onload = React.useCallback((svg: Svg, container: HTMLDivElement, imageUrl: string) => {
    svg.image(imageUrl, (ev: any) => {
      if (!ev?.target || !svg.node.innerHTML) return;
      let width = ev.target.naturalWidth, height = ev.target.naturalHeight, maxWidth = props.width, maxHeight = props.height;
      svg.node.style.overflowY = 'scroll';
      Object.assign(container.style, {
        width: (props.width || width) + 'px',
        height: (props.height || height) + 'px',
        overflow: 'hidden'
      });
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
    const onkeydown = (e: KeyboardEvent) => e.key === 'Control' && svgContainer!.container.classList.add('grabbable');
    const onkeyup = (e: KeyboardEvent) => e.key === 'Control' && svgContainer!.container.classList.remove('grabbable');
    if (svgContainer && props.imageUrl) {
      onload(svgContainer.svg, svgContainer.container, props.imageUrl);
      window.addEventListener('keydown', onkeydown);
      window.addEventListener('keyup', onkeyup);
    }
    return () => { 
      Director.instance?.clear(); 
      window.removeEventListener('keydown', onkeydown);
      window.removeEventListener('keyup', onkeyup);
    }
  }, [svgContainer, props.imageUrl]);

  return (<SvgContainer setHandles={setHandles} />);
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
