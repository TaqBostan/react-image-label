import React, { FC } from 'react';
import { ImageAnnotator } from '.';
import { Circle, Shape, Point, Polygon, Rectangle, Ellipse, Dot } from '../base/types';
import './annotator.stories.css';
import { useImageAnnotator } from './hook';

const img2 = '/ic.png';
const imgUrl = '/Fruit.jpeg';
// const imgUrl = '/Fruit.jpeg';
// const img2 = '/ic.png';
// const img1 = 'https://svgjs.dev/docs/3.0/assets/images/logo-svg-js-01d-128.png';
// const img2 = 'https://en.systemgroup.net/wp-content/themes/sg/dist/images/logo.png';
const categories = ['blueberry', 'strawberry', 'raspberry', 'apple', 'benana'];
let p = new Polygon([[550, 224], [519, 222], [474, 261], [430, 341], [416, 383], [427, 399], [446, 414], [528, 396], [604, 372], [633, 325], [654, 313], [648, 282], [638, 231], [596, 208], [562, 208]], ['strawberry'], "#27fe7640");
let r = new Rectangle([[734, 292], [680, 377], [781, 440], [835, 355]], ['blueberry'], "rgba(255,255,255,0.4)");
let c = new Circle([70, 90], 55, ['blueberry'], "rgba(0,0,0,0.4)");
let e = new Ellipse([457, 114], 40, 80, ['raspberry'], 0, "#0004");
let d = new Dot([123, 223], ['raspberry'], "rgba(0,0,0,0.4)");
let rawShapes = [
  { type: 'rectangle', categories: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]], color: "#27f17640" },
  { type: 'polygon', categories: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], color: "#27f17640" },
  { type: 'circle', categories: ["class 4"], centre: [250, 100], radius: 40 },
  { type: 'ellipse', categories: ["class 3"], centre: [350, 150], radiusX: 60, radiusY: 40, color: "#27f17640" },
]

export const ImageAnnotatorPrimary: FC = () => {
  const { setHandles, annotator } = useImageAnnotator();
  const [img, setImg] = React.useState(imgUrl);
  const [shapes, setShapes] = React.useState<Shape[]>([r, p, c, e, d]);
  const [dialog, setDialog] = React.useState<{ show: boolean, shape: Shape | undefined }>({ show: false, shape: undefined });

  const selectedCategoriesChanged = (items: string[]) => {
    dialog.shape!.categories = items;
    setDialog({ ...dialog });
  }

  const hideDialog = () => setDialog({ show: false, shape: undefined });
  const hideAndUpdateCategories = () => {
    if (dialog.show) {
      annotator!.updateCategories(dialog.shape!.id, dialog.shape!.categories, "#0004");
      hideDialog();
    }
  }
  const changeImage = () => {
    if (img === imgUrl) {
      setImg(img2);
      setShapes([c]);
    }
    else if (img === img2) {
      setImg(imgUrl);
      setShapes([r, p, c, e, d]);
    }
  }


  return (
    <div>
      <button onClick={() => { changeImage(); }}>Change image</button>
      <button onClick={() => { annotator!.drawRectangle() }}>Add Rectangle</button>
      <button onClick={() => { annotator!.drawPolygon() }}>Add Polygon</button>
      <button onClick={() => { annotator!.drawCircle() }}>Add Circle</button>
      <button onClick={() => { annotator!.drawEllipse() }}>Add Ellipse</button>
      <button onClick={() => { annotator!.drawDot() }}>Add Dot</button>
      <button onClick={() => { annotator!.stop() }}>Stop</button>
      <button onClick={() => { annotator!.stopEdit() }}>Edit Done</button>
      <button onClick={() => { annotator!.zoom(1.25) }}>Zoom in</button>
      <button onClick={() => { annotator!.zoom(0.8) }}>Zoom out</button>
      <button onClick={() => { setShapes(annotator!.getShapes()) }}>Get shapes</button>
      <button onClick={() => { setShapes([p]) }}>change shapes</button>
      {dialog.show &&
        <Dialog items={dialog.shape!.categories} itemsChanged={selectedCategoriesChanged}
          onEdit={() => { annotator!.edit(dialog.shape!.id); hideDialog(); }}
          onDelete={() => { annotator!.delete(dialog.shape!.id); hideDialog(); }}
          onClose={hideAndUpdateCategories}
          offset={dialog.shape!.getCenterWithOffset()} />
      }
      <ImageAnnotator
        setHandles={setHandles}
        naturalSize={true}
        imageUrl={img}
        shapes={shapes}
        width={700}
        height={400}
        hideBorder={true}
        onAdded={shape => setDialog({ show: true, shape })}
        onContextMenu={shape => setDialog({ show: true, shape })}
        onReady={annotator => { }} />
      <div>{JSON.stringify(shapes, null, 2)}</div>
    </div>
  );
}

const Dialog = (props: DialogProps) => {

  const handleCheck = (event: any) => {
    let selected = props.items;
    if (event.target.checked) selected = [...selected, event.target.value];
    else selected.splice(selected.indexOf(event.target.value), 1);
    selected.sort((c1, c2) => categories.indexOf(c1) - categories.indexOf(c2));
    props.itemsChanged(selected);
  };

  return (
    <div className='dialog-bg' onClick={props.onClose}>
      <div className='dialog' onClick={e => e.stopPropagation()}
        style={{ left: props.offset.X, top: props.offset.Y }}>
        <button onClick={props.onEdit} style={{ background: '#36A9AE' }}>edit</button>
        <button onClick={props.onDelete} style={{ background: '#F082AC' }}>delete</button>
        {categories.map((_class, i) => (
          <div key={i} className="checkbox-wrapper-1">
            <input id={'chb' + i} className="substituted" type="checkbox" aria-hidden="true"
              value={_class} onChange={handleCheck} checked={props.items.includes(_class)} />
            <label htmlFor={'chb' + i}>{_class}</label>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DialogProps {
  items: string[],
  itemsChanged: (items: string[]) => void,
  onClose: () => void,
  onEdit: () => void,
  onDelete: () => void, offset: Point
}
