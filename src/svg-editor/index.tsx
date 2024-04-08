import React, { useEffect } from 'react';
import { SvgContainer, Svg } from 'react-svgdotjs';
import { Director } from '../base/Director';
import { Circle, Shape, Polygon, Rectangle } from '../base/types';
import './index.css';

export const useSvgEditor = () => {
  const [handles, setHandles] = React.useState<SvgEditorHandles>();
  return { setHandles, svgEditor: handles };
};

export default (props: SvgEditorProps) => {
  const svgContainer = React.useRef<any>();

  const drawShapes = (shapes?: Shape[] | any[]) => {
    let director = new Director();
    if (!shapes) return;
    let rectangles = shapes.filter(s => s instanceof Rectangle || s.type === 'rectangle')
      .map(s => new Rectangle(s.points, s.classes));
    let polygons = shapes.filter(s => s instanceof Polygon || s.type === 'polygon')
      .map(s => new Polygon(s.points, s.classes));
    let circles = shapes.filter(s => s instanceof Circle || s.type === 'circle')
      .map(s => new Circle(s.centre, s.radius, s.classes));
    if (rectangles.length > 0) director.plot(rectangles);
    if (polygons.length > 0) director.plot(polygons);
    if (circles.length > 0) director.plot(circles);
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
    newRectangle() {
      stopAll();
      new Director().startDraw(new Rectangle());
    },
    newPolygon() {
      stopAll();
      new Director().startDraw(new Polygon());
    },
    newCircle() {
      stopAll();
      new Director().startDraw(new Circle());
    },
    stop: stopAll,
    stopEdit: () => new Director().stopEdit(),
    edit: (id: number) => new Director().edit(id),
    delete: (id: number) => new Director().removeElement(id),
    updateClasses: (shape: Shape) => new Director().updateClasses(shape),
    zoom,
    getShapes: Director.getShapes,
    container: HTMLDivElement = svgContainer.current?.container
  })

  const onload = React.useCallback((svg: Svg, imageUrl: string) => {
    svg.image(imageUrl, (ev: any) => {
      if (!ev?.target) return;
      let width = ev.target.naturalWidth, height = ev.target.naturalHeight, maxWidth = props.maxWidth, maxHeight = props.maxHeight;
      if (!props.naturalSize) {
        if (!maxWidth) maxWidth = svgContainer.current.container.scrollWidth;
        if (!maxHeight) maxHeight = svgContainer.current.container.scrollHeight;
        if (maxWidth! / maxHeight! > ev.target.naturalWidth / ev.target.naturalHeight) {
          height = Math.min(maxHeight!, ev.target.naturalHeight);
          width = height * ev.target.naturalWidth / ev.target.naturalHeight;
        }
        else {
          width = Math.min(maxWidth!, ev.target.naturalWidth);
          height = width * ev.target.naturalHeight / ev.target.naturalWidth;
        }
      }
      Director.init(svg, width, height, width / ev.target.naturalWidth, svgContainer.current.container,
        props.onAdded, props.onContextMenu);
      drawShapes(props.shapes);
      props.onReady?.();
      props.setHandles({ ...getHandles() });
    }).size('100%', '100%').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
  }, []);

  useEffect(() => {
    if (svgContainer.current && props.imageUrl) onload(svgContainer.current.svg, props.imageUrl);
    return () => { Director.clear(); }
  }, [svgContainer, onload, props.imageUrl]);

  return (<SvgContainer ref={svgContainer} width='fit-content' height='fit-content' />);
}

interface SvgEditorProps {
  onReady?: () => any;
  onAdded?: (shape: Shape) => any;
  onContextMenu?: (shape: Shape) => any;
  imageUrl?: string;
  shapes?: Shape[] | any[];
  naturalSize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  setHandles: (data: any) => void;
}

type SvgEditorHandles = {
  newRectangle(): void;
  newPolygon(): void;
  newCircle(): void;
  stop: () => void;
  stopEdit: () => void;
  edit: (id: number) => void;
  delete: (id: number) => void;
  updateClasses: (shape: Shape) => void;
  zoom: (factor: number) => void;
  getShapes: () => Shape[];
  container: HTMLDivElement;
}
