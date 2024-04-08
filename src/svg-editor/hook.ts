import React from 'react';
import { Shape } from '../base/types';

export const useSvgEditor = () => {
  const [handles, setHandles] = React.useState<SvgEditorHandles>();
  return { setHandles, svgEditor: handles };
};

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