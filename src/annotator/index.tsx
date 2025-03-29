import React, { useEffect, FC, useRef } from 'react';
import { Director } from '../base/Director';
import { Shape, Polygon, Rectangle, Circle, Ellipse, Dot, Shortcut, ActType } from '../base/types';
import Util from '../base/util';
import { AnnotatorHandles } from './hook';
import './index.css';

const ImageAnnotator: FC<ImageAnnotatorProps> = props => {
  const getDirector = () => Director.instance!;
  const wrapper = useRef<SVGSVGElement>(null);

  const drawShapes = (shapes?: Shape[] | any[]) => {
    let director = getDirector();
    if (!shapes) return;
    let rectangles = shapes.filter(s => s instanceof Rectangle || s.type === 'rectangle')
      .map(s => new Rectangle([...s.points], s.categories, s.color));
    let polygons = shapes.filter(s => s instanceof Polygon || s.type === 'polygon')
      .map(s => new Polygon([...s.points], s.categories, s.color));
    let circles = shapes.filter(s => s instanceof Circle || s.type === 'circle')
      .map(s => new Circle(s.centre, s.radius, s.categories, s.color));
    let ellipses = shapes.filter(s => s instanceof Ellipse || s.type === 'ellipse')
      .map(s => new Ellipse(s.centre, s.radiusX, s.radiusY, s.categories, s.phi || 0, s.color));
    let dots = shapes.filter(s => s instanceof Dot || s.type === 'dot')
      .map(s => new Dot(s.position, s.categories, s.color));
    if (rectangles.length > 0) director.plot(rectangles);
    if (polygons.length > 0) director.plot(polygons);
    if (circles.length > 0) director.plot(circles);
    if (ellipses.length > 0) director.plot(ellipses);
    if (dots.length > 0) director.plot(dots);
  }

  const zoom = (factor: number, relative: boolean = true) => {
    let director = getDirector();
    factor = director.setSizeAndRatio(factor, relative);
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
    delete: (id: number) => getDirector().removeById(id),
    updateCategories: (id: number, categories: string[], color?: string) =>
      getDirector().updateCategories(id, categories, color),
    zoom,
    getShapes: getDirector().getShapes
  })

  const onload = React.useCallback((svg: SVGSVGElement, container: HTMLDivElement, imageUrl: string) => {
    let onloaded = (ev: Event) => {
      if (!ev?.currentTarget || !svg.innerHTML) return;
      let target = (ev!.detail?.testTarget || ev!.currentTarget) as SVGImageElement, 
        src1 = container.getAttribute('data-img')!, src2 = imageUrl;
      if (src1 !== Util.fileName(src2)) {
        for (let i = 0; i < svg.children.length; i++) {
          let child = svg.children[i], href = Util.fileName(child.getAttribute('href'));
          if (href && src1 !== href) child.remove();
        }
        return;
      }
      let bb = target.getBBox();
      let naturalWidth = bb.width, naturalHeight = bb.height, maxWidth = props.width, maxHeight = props.height, ratio = 1;
      Object.assign(container.style, {
        width: (props.width || naturalWidth) + 'px',
        height: (props.height || naturalHeight) + 'px',
        overflow: 'hidden',
        backgroundColor: '#e6e6e6'
      });
      if (!props.naturalSize) {
        if (!maxWidth) maxWidth = container.scrollWidth;
        if (!maxHeight) maxHeight = container.scrollHeight;
        if (maxWidth! / maxHeight! > bb.width / bb.height)
          ratio = Math.min(maxHeight!, bb.height) / naturalHeight;
        else ratio = Math.min(maxWidth!, bb.width) / naturalWidth;
      }
      target.size('100%', '100%');
      
      let statics = { 
        width: naturalWidth, 
        height: naturalHeight, 
        ratio, 
        discRadius: props.discRadius || 5, 
        hb: props.hideBorder,
        shortcut: props.shortcut
      }

      Director.init(svg, statics, container);
      drawShapes(props.shapes);
      props.setHandles({ ...getHandles(), container });
      props.onReady?.({ ...getHandles(), container });
    }
    container.setAttribute('data-img', Util.fileName(imageUrl))
    var image = svg.image(imageUrl, onloaded).size('', '').attr('onmousedown', 'return false').attr('oncontextmenu', 'return false');
    image.addEventListener('testEvent', onloaded)
  }, [props.width, props.height, props.shapes]);

  useEffect(() => {
    let actions = [
      { type: ActType.Added, func: props.onAdded },
      { type: ActType.Edited, func: props.onEdited },
      { type: ActType.Selected, func: props.onSelected },
      { type: ActType.CtxMenu, func: props.onContextMenu }
    ]
    Director.setActions(actions);
    return () => Director.setActions([]);
  }, [props.onAdded,props.onEdited, props.onContextMenu, props.onSelected]);

  useEffect(() => {
    if (wrapper.current && props.imageUrl) {
      var container = wrapper.current.parentElement! as HTMLDivElement;
      onload(wrapper.current!, container, props.imageUrl);
    }
    return () => {
      Director.instance?.clear();
    }
  }, [wrapper, props.imageUrl, props.shapes]);

  return (
    <div>
      <svg ref={wrapper}>
      </svg>
    </div>
  );
}

export { ImageAnnotator };

export interface ImageAnnotatorProps {
  onReady?: (annotator: AnnotatorHandles) => any;
  onAdded?: (shape: Shape) => any;
  onEdited?: (shape: Shape)=> any;
  onSelected?: (shape: Shape) => any;
  onContextMenu?: (shape: Shape) => any;
  imageUrl?: string;
  shapes?: Shape[] | any[];
  naturalSize?: boolean;
  width?: number;
  height?: number;
  discRadius?: number;
  hideBorder?: boolean;
  shortcut?: Shortcut;
  setHandles: (handles: AnnotatorHandles) => void;
}
