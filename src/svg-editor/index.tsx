import React, { useEffect } from 'react';
import { SvgContainer, Svg } from 'react-svgdotjs';
import { Director } from '../base/base';
import { Circle, IlShape, Polygon, Rectangle } from '../base/types';
import './index.css';

interface SvgEditorProps {
  onReady?: () => void;
  onAddedOrEdited?: (shape: IlShape) => void;
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
      let director = new Director();
      director.startDraw(new Rectangle());
    },
    newPolygon() {
      stopAll();
      let director = new Director();
      director.startDraw(new Polygon());
    },
    newCircle() {
      stopAll();
      let director = new Director();
      director.startDraw(new Circle());
    },
    stop() {
      stopAll();
    },
    stopEdit(callOnEdited: boolean) {
      let director = new Director();
      director.stopEdit(callOnEdited);
    },
    edit(id: number) {
      stopAll();
      let director = new Director();
      director!.edit(id);
    },
    delete(id: number) {
      let director = new Director();
      director!.removeElement(id);
    },
    updateClasses(shape: IlShape) {
      let director = new Director();
      director.updateClasses(shape);
    },
    zoom(factor: number) {
      zoom(factor);
    },
    getShapes() {
      return Director.getShapes();
    },
    container: HTMLDivElement = svgContainer.current.container
  }));

  const drawShapes = (shapes?: IlShape[] | any[]) => {
    // let q = new PolygonBuilder();
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

  const onload = React.useCallback((svg: Svg) => {
    props.onReady?.();

    let _img = svg.image(props.imageUrl, (ev: any) => {
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
      Director.init(svg, width, height, width / ev.target.naturalWidth, svgContainer.current.container, props.onAddedOrEdited);
      setSize({ width, height });
      drawShapes(props.shapes);
    }).size('100%', '100%').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
  }, [props.imageUrl]);

  const zoom = (factor: number) => {
    let director = new Director();
    Director.setSizeAndRatio(factor);
    svgContainer.current.container.height *= factor;
    svgContainer.current.container.width *= factor;
    director.stopEdit(false);
    director.zoom(factor);
  }

  useEffect(() => {
    if (svgContainer.current) onload(svgContainer.current.svg);
    return () => { svgContainer.current?.svg.clear(); }
  }, [svgContainer, onload, props.imageUrl]);

  const stopAll = () => {
    let director = new Director();
    director.stopDraw();
    director.stopEdit(false);
  }

  return (<SvgContainer ref={svgContainer} width={size.width + 'px'} height={size.height + 'px'} />);
});
