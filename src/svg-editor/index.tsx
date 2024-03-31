import React, { useEffect } from 'react';
import { SvgContainer, Svg } from 'react-svgdotjs';
import { RectangleDirector } from '../base/builders/RectangleBuilder';
import { PolygonDirector } from '../base/builders/PolygonBuilder';
import { Director } from '../base/base';
import { IlShape, Polygon, Rectangle } from '../base/types';
import './index.css';

interface SvgEditorProps {
  onReady?: () => void;
  onAddedOrEdited?: (shape: IlShape) => void;
  imageUrl?: string;
  polygons?: Polygon[];
  rectangles?: Rectangle[];
  naturalSize?: boolean;
  width?: number;
  height?: number;
}

export default React.forwardRef((props: SvgEditorProps, ref) => {
  const [size, setSize] = React.useState({width: 0, height: 0});
  const svgContainer = React.useRef<any>();
  const getDirectors = (): Director<IlShape>[] => [RectangleDirector.getInstance(), PolygonDirector.getInstance()];


  const getDirector = (id: number): [Director<IlShape>, IlShape] => {
    let shape = Director.findShape(id);
    let director: Director<IlShape>;
    if (shape instanceof Polygon)
      director = PolygonDirector.getInstance();
    else if (shape instanceof Rectangle)
      director = RectangleDirector.getInstance();
    return [director!, shape];
  }

  React.useImperativeHandle(ref, () => ({

    newRectangle() {
      stopAll();
      let x = RectangleDirector.getInstance();
      x.startDraw();
    },
    newPolygon() {
      stopAll();
      let x = PolygonDirector.getInstance();
      x.startDraw();
    },
    stop() {
      stopAll();
    },
    stopEdit(callOnEdited: boolean) {
      getDirectors().forEach(director => director.stopEdit(callOnEdited));
    },
    editShape(id: number) {
      stopAll();
      let [director, shape] = getDirector(id);
      director!.edit(shape);
    },
    updateClasses(shape: IlShape) {
      let [director] = getDirector(shape.id);
      director!.updateClasses(shape);
    },
    zoom(factor: number) {
      zoom(factor);
    },
    container: HTMLDivElement = svgContainer.current.container
  }));

  const drawShapes = () => {
    if (props.rectangles) {
      let x = RectangleDirector.getInstance();
      x.plot(props.rectangles);
    }

    if (props.polygons) {
      let x = PolygonDirector.getInstance();
      x.plot(props.polygons);
    }
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
      setSize({width, height});
      drawShapes();
    }).size('100%', '100%').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
  },[props.imageUrl]);

  const zoom = (factor: number) => {
    Director.setSizeAndRatio(factor);
    svgContainer.current.container.height *= factor;
    svgContainer.current.container.width *= factor;
    getDirectors().forEach(director => { 
      director.stopEdit(false);
      director.zoom(factor);
     });
  }

  useEffect(() => {
    if(svgContainer.current) onload(svgContainer.current.svg);
    return () => { svgContainer.current?.svg.clear(); }
  }, [svgContainer, onload, props.imageUrl]);

  const stopAll = () => {
    getDirectors().forEach(director => {
      director.stopDraw();
      director.stopEdit(false);
    })
  }

  return (<SvgContainer ref={svgContainer} width={size.width + 'px'} height={size.height + 'px'} />);
});
