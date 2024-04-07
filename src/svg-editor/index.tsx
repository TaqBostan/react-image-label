import React, { useEffect } from 'react';
import { SvgContainer, Svg } from 'react-svgdotjs';
import { Director } from '../base/Director';
import { Circle, IlShape, Polygon, Rectangle } from '../base/types';
import './index.css';

interface SvgEditorProps {
  onReady?: () => any;
  onAdded?: (shape: IlShape) => any;
  onContextMenu?: (shape: IlShape) => any;
  imageUrl?: string;
  shapes?: IlShape[] | any[];
  naturalSize?: boolean;
  width?: number;
  height?: number;
}

export default React.forwardRef((props: SvgEditorProps, ref) => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const svgContainer = React.useRef<any>();

  React.useImperativeHandle(ref, () => ({
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
    updateClasses: (shape: IlShape) => new Director().updateClasses(shape),
    zoom,
    getShapes: Director.getShapes,
    container: HTMLDivElement = svgContainer.current.container
  }));

  const drawShapes = (shapes?: IlShape[] | any[]) => {
    let director = new Director();
    if(!shapes) return;
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

  const onload = React.useCallback((svg: Svg, imageUrl: string) => {
    let _img = svg.image(imageUrl, (ev: any) => {
      if (!ev?.target) return;
      let width = ev.target.naturalWidth, height = ev.target.naturalHeight, maxWidth = props.width, maxHeight = props.height;
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
      setSize({ width, height });
      drawShapes(props.shapes);
      props.onReady?.();
    }).size('100%', '100%').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
  }, []);

  const zoom = (factor: number) => {
    let director = new Director();
    Director.setSizeAndRatio(factor);
    director.zoom(factor);
  }

  useEffect(() => {
    if (svgContainer.current && props.imageUrl) onload(svgContainer.current.svg, props.imageUrl);
    return () => { Director.clear(); }
  }, [svgContainer, onload, props.imageUrl]);

  const stopAll = () => {
    let director = new Director();
    director.stopDraw();
    director.stopEdit();
  }

  return (<SvgContainer ref={svgContainer} width='fit-content' height='fit-content' />);
});
