import React from 'react';
import { Shape } from 'image-labeling';

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
  updateCategories: (id: number, categories: string[], color?: string) => void;
  zoom: (factor: number, relative?: boolean) => void;
  getShapes: () => Shape[];
  container: HTMLDivElement;
}