import React from 'react';
import { Shape } from '../base/types';

export const useImageAnnotator = () => {
  const [handles, setHandles] = React.useState<AnnotatorHandles>();
  return { setHandles, annotator: handles };
};

export type AnnotatorHandles = {
  drawRectangle(): void;
  drawPolygon(): void;
  drawCircle(): void;
  drawEllipse(): void;
  drawDot(): void;
  stop: () => void;
  stopEdit: () => void;
  edit: (id: number) => void;
  delete: (id: number) => void;
  updateCategories: (id: number, categories: string[]) => void;
  zoom: (factor: number) => void;
  getShapes: () => Shape[];
  container: HTMLDivElement;
}