import React from 'react';
import { Shape } from '../base/types';

export const useSvgEditor = () => {
  const [handles, setHandles] = React.useState<SvgEditorHandles>();
  return { setHandles, svgEditor: handles };
};

export type SvgEditorHandles = {
  drawRectangle(): void;
  drawPolygon(): void;
  drawCircle(): void;
  stop: () => void;
  stopEdit: () => void;
  edit: (id: number) => void;
  delete: (id: number) => void;
  updateCategories: (id: number, categories: string[]) => void;
  zoom: (factor: number) => void;
  getShapes: () => Shape[];
  container: HTMLDivElement;
}