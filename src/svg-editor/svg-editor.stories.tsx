import React, { FC } from 'react';
import SvgEditor from './';
import { Circle, IlShape, Point, Polygon, Rectangle } from '../base/types';
import './svg-editor.stories.css';

//const imgUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
const imgUrl = '/logo512.png';
const img2 = '/ic.png';
// const img1 = 'https://svgjs.dev/docs/3.0/assets/images/logo-svg-js-01d-128.png';
// const img2 = 'https://en.systemgroup.net/wp-content/themes/sg/dist/images/logo.png';
const classes = ['class 1', 'class 2', 'class 3', 'class 4', 'class 5'];
let p: Polygon = new Polygon([[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]], ['class 1', 'class 2']);
let r: Rectangle = new Rectangle([[150, 50], [200, 50], [200, 100], [150, 100]], ['class 3']);
let c: Circle = new Circle([250, 100], 40, ['class 4'])
let rawShapes = [{ type: 'rectangle', classes: ["class 3"], points: [[150, 50], [200, 50], [200, 100], [150, 100]] },
{ type: 'polygon', classes: ["class 1", "class 2"], points: [[50, 50], [50, 100], [75, 100], [75, 120], [90, 120], [90, 150], [120, 150], [120, 50]] },
{ type: 'circle', classes: ["class 4"], centre: [250, 100], radius: 40 }]

export const SvgEditorPrimary: FC = () => {
  const [img, setImg] = React.useState(imgUrl);
  const [shapes, setShapes] = React.useState<IlShape[]>([r, p, c]);
  const [dialog, setDialog] = React.useState<{ show: boolean, shape: IlShape | undefined }>({ show: false, shape: undefined });
  const svgEditor = React.useRef<any>();

  const selectedClassesChanged = (items: string[]) => {
    dialog.shape!.classes = items;
    setDialog({...dialog});
  }

  const hideDialog = () => setDialog({ show: false, shape: undefined });
  const hideAndUpdateClasses = () => {
    if (dialog.show) {
      svgEditor.current.updateClasses(dialog.shape);
      hideDialog();
    }
  }

  return (
    <div>
      <button onClick={() => { setImg(img2); }}>change image</button>
      <button onClick={() => { svgEditor.current.newRectangle() }}>Add Rectangle</button>
      <button onClick={() => { svgEditor.current.newPolygon() }}>Add Polygon</button>
      <button onClick={() => { svgEditor.current.newCircle() }}>Add Circle</button>
      <button onClick={() => { svgEditor.current.stop() }}>stop</button>
      <button onClick={() => { svgEditor.current.stopEdit(false) }}>Edit Done</button>
      <button onClick={() => { svgEditor.current.zoom(1.25) }}>zoom in</button>
      <button onClick={() => { svgEditor.current.zoom(0.8) }}>zoom out</button>
      <button onClick={() => { setShapes(svgEditor.current.getShapes()) }}>get shapes</button>
      {dialog.show &&
        <Dialog items={dialog.shape!.classes} itemsChanged={selectedClassesChanged}
          onEdit={() => { svgEditor.current.edit(dialog.shape!.id); hideDialog(); }}
          onDelete={() => { svgEditor.current.delete(dialog.shape!.id); hideDialog(); }}
          onClose={hideAndUpdateClasses} 
          offset={dialog.shape!.getCenterWithOffset()} />
      }
      <SvgEditor
        ref={svgEditor}
        naturalSize={true}
        imageUrl={img}
        shapes={shapes}
        onAddedOrEdited={shape => setDialog({ show: true, shape })} />
      <div>{JSON.stringify(shapes, null, 2)}</div>
    </div>
  );
}

const Dialog = (props: DialogProps) => {
  
  const handleCheck = (event: any) => {
    let selected = props.items;
    if (event.target.checked) selected = [...selected, event.target.value];
    else selected.splice(selected.indexOf(event.target.value), 1);
    selected.sort((c1, c2) => classes.indexOf(c1) - classes.indexOf(c2));
    props.itemsChanged(selected);
  };

  return (
    <div className='dialog-bg' onClick={props.onClose}>
      <div className='dialog' onClick={e => e.stopPropagation()}
        style={{ left: props.offset.X, top: props.offset.Y }}>
        <button onClick={props.onEdit}>edit</button>
        <button onClick={props.onDelete}>delete</button>
        {classes.map((_class, index) => (
          <div key={index}>
            <input id={'checkbox' + index} value={_class} type="checkbox" onChange={handleCheck}
              checked={props.items.includes(_class)} />
            <label htmlFor={'checkbox' + index}>{_class}</label>
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
