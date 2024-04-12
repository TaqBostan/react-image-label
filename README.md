A comprehensive component for tagging images. Check out [demo 1](https://codepen.io/Mohamad-Mehdi-Rajaei/pen/rNbvbYJ) and [demo 2](https://codepen.io/Mohamad-Mehdi-Rajaei/pen/ZEZRoLK) for some examples.

## Features

- Bounding Box (Rectangle, Square, and Circle), and Polygon Annotations 
- Add, Edit, Drag, and Delete Annotations
- Zoom and Scale
- Changing image on the fly
- Raw or typed input/output

## Usage

Install `react-image-label` using npm.

```shell
npm install react-image-label
```

Then you can just import the component and its hook:

```js
import { SvgEditor, useSvgEditor } from 'react-image-label';
```

and use it as below:

```js
const { setHandles, svgEditor } = useSvgEditor();
```

```js
<SvgEditor
  setHandles={setHandles}
  naturalSize={true}
  imageUrl={'your-image-url'}
  onReady={svgEditor => { svgEditor.drawRectangle() }} />
```

Now you can draw rectangles on the image by dragging the left mouse button.

## Props

The following props can be defined on `SvgEditor`:

| Prop | Type | Description | Default |
|---|---|---|---|
| `imageUrl` \* | `string` | Use a state for image url if you want to change it on the fly |   |
| `shapes` | `Shape[] \| any[]` | Annotations being displayed on load |   |
| `naturalSize` | `boolean` | To show image in its natural size | `false` |
| `width` | `number` | Maximum width without breaking the aspect ratio at initial loading (when `naturalSize` is `false`) |  |
| `height` | `number` | Maximum height without breaking the aspect ratio at initial loading (when `naturalSize` is `false`) |  |
| `discRadius` | `number` | The radius of the green discs in edit mode | 5 |
| `onAdded` | `Shape => any` | When an annotation is drawn (see [Annotations with Categories](#annotations-with-categories)) |  |
| `onContextMenu` | `Shape => any` | When an annotation is right-clicked (see [Annotations with Categories](#annotations-with-categories)) |   |
| `onReady` | `SvgEditorHandles => any` | When the component is mounted |   |

(\*) required props

## Handles

You can access the handles using the `svgEditor` object as follows:

```js
<button onClick={() => { svgEditor.drawCircle() }}>Draw Circle</button>
```

Below is a list of all handles:

| Prop | Type | Description |
|---|---|---|
| `drawCircle` | `() => void` | Allows drawing circles by dragging the left mouse button |
| `drawRectangle` | `() => void` | Allows drawing rectangles by dragging the left mouse button (keep the shift key to draw square) |
| `drawPolygon` | `() => void` | Allows drawing polygons by clicking and double-clicking |
| `stop` | `() => void` | Stops draw/edit/drag mode |
| `edit` | `(id: number) => void` | The annotation identified by `id` can be edited and dragged |
| `stopEdit` | `() => void` | Stops editing and dragging |
| `updateCategories` | `(id: number, categories: string[]) => void` | Updates the categories associated with the annotation identified by `id` |
| `zoom` | `(factor: number) => void` | Multiplies the dimensions by `factor` |
| `getShapes` | `() => Shape[]` | Gets all annotations |
| `container` | `HTMLDivElement` | The `div` wrapping the `SVG` |

## Annotations with Categories

To attach one or more categories to an annotation, utilize `onAdded` and `onContextMenu` props being called when an annotation is drawn and right-clicked, respectively. Use `shape.categories` to get the previous categories as `string[]`:

```js
const showCategoriesDialog = (shape) => {
  console.log(shape.id) // 1
  console.log(shape.getCenterWithOffset()) // { X: 247.5, Y: 193 }
  console.log(shape.categories) // Array []
  // Show a category selection component
}

return (
  <SvgEditor
    onAdded={showCategoriesDialog}
    onContextMenu={showCategoriesDialog}
    ...
);
```

Finally, call `svgEditor.updateCategories` to update the categories of the annotation.

## Contributing

- Fork the project.
- Make changes.
- Run the project in development mode: `npm run ladle`.
- Test your changes using `svg-container.stories.tsx` or your own Stories (`*.stories.tsx`).
- Update README with appropriate docs.
- Commit and PR

## Dependencies

The package is dependent on [SVG.js](https://svgjs.dev/docs/3.1/) through [react-svgdotjs](https://www.npmjs.com/package/react-svgdotjs) package. The following peer dependencies must be specified by your project in order to avoid version conflicts:
[`react`](https://www.npmjs.com/package/react),
[`react-dom`](https://www.npmjs.com/package/react-dom).
NPM will not automatically install these for you but it will show you a warning message with instructions on how to install them.

