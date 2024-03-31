import React, { FC } from 'react';
import SvgEditor from './';
import { IlShape, Polygon, Rectangle } from '../base/types';
import './svg-editor.stories.css';

const imgUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
const img1 = 'https://svgjs.dev/docs/3.0/assets/images/logo-svg-js-01d-128.png';
const img2 = 'https://en.systemgroup.net/wp-content/themes/sg/dist/images/logo.png';
const classes = ['class 1', 'class 2', 'class 3', 'class 4', 'class 5'];

export const SvgEditorPrimary: FC = () => {
  const [img, setImg] = React.useState(imgUrl);
  const [dialog, setDialog] = React.useState<{ show: boolean, shape: IlShape | undefined }>({ show: false, shape: undefined });
  const svgEditor = React.useRef<any>();

  // Add/Remove checked item from list
  const handleCheck = (event: any) => {
    if (event.target.checked) dialog.shape!.classes = [...dialog.shape!.classes, event.target.value];
    else dialog.shape!.classes.splice(dialog.shape!.classes.indexOf(event.target.value), 1);
    dialog.shape!.classes.sort((c1, c2) => classes.indexOf(c1) - classes.indexOf(c2));
    setDialog({ ...dialog });
  };

  let p: Polygon = new Polygon(
    [
      [50, 50]
      , [50, 100]
      , [75, 100]
      , [75, 120]
      , [90, 120]
      , [90, 150]
      , [120, 150]
      , [120, 50]
    ], ['class 1', 'class 2']);
  let r: Rectangle = new Rectangle(
    [
      [150, 50]
      , [200, 50]
      , [200, 100]
      , [150, 100]
    ], ['class 3']);

  const mousedown = React.useCallback((ev: MouseEvent) => {
    if (dialog.show) {
      svgEditor.current.updateClasses(dialog.shape);
      setDialog({ show: false, shape: undefined });
    }
  }, [setDialog, svgEditor, dialog]);

  React.useEffect(() => {
    svgEditor.current.container.addEventListener('mousedown', mousedown);
    return () => { svgEditor.current.container.removeEventListener("mousedown", mousedown); }
  }, [svgEditor.current?.container, mousedown])

  return (
    <div>
      <button onClick={() => { setImg(img2); }}>change image</button>
      <button onClick={() => { svgEditor.current.newRectangle() }}>Add Rectangle</button>
      <button onClick={() => { svgEditor.current.newPolygon() }}>Add Polygon</button>
      <button onClick={() => { svgEditor.current.stop() }}>stop</button>
      <button onClick={() => { svgEditor.current.stopEdit(false) }}>Edit Done</button>
      <button onClick={() => { svgEditor.current.zoom(1.25) }}>zoom in</button>
      <button onClick={() => { svgEditor.current.zoom(0.8) }}>zoom out</button>
      {dialog.show &&
        <div className='dialog'
          style={{ left: dialog.shape!.getCenterWithOffset()[0], top: dialog.shape!.getCenterWithOffset()[1] }}>
          <button onClick={() => { svgEditor.current.editShape(dialog.shape!.id); setDialog({ show: false, shape: undefined }); }}>editShape</button>
          {classes.map((_class, index) => (
            <div key={index}>
              <input id={'checkbox' + index} value={_class} type="checkbox" onChange={handleCheck}
                checked={dialog.shape!.classes.includes(_class)} />
              <label htmlFor={'checkbox' + index}>{_class}</label>
            </div>
          ))}
        </div>
      }
      <SvgEditor
        ref={svgEditor}
        naturalSize={true}
        imageUrl={img}
        polygons={[p]}
        rectangles={[r]}
        onAddedOrEdited={shape => setDialog({ show: true, shape })} />
    </div>
  );
}
