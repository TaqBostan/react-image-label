A comprehensive package for tagging images.

## Features

- Bounding Box, Circle, and Polygon Tag
- Add, Edit, Drag, and Delete Tags
- Zoom and Scale
- Changing image on the fly
- Raw or typed input/output

## Usage

Install `react-image-label` using npm.

```shell
npm install react-image-label
```

Then you can just import the component:

```js
import { SvgEditor } from 'react-image-label';
```

and use it like so:

```js
const svgEditor = React.useRef<any>();

<SvgEditor
  ref={svgEditor}
  naturalSize={true}
  imageUrl={'your-image-url'}
  onReady={() => {svgEditor.current.newRectangle();}} />
```

Now you can draw, edit, and drag rectangles on the image.

## Props

The following props can be defined on `SvgEditor`:

| Prop | Type | Description | Default |
|---|---|---|---|
| `imageUrl` \* | `string` | Use a state for image url if you want to change it on the fly |   |
| `shapes` | `Shape[] \| any[]` | Tags being displayed on load |   |
| `naturalSize` | `boolean` | Show image in its natural size | `false` |
| `maxWidth` | `number` | The maximum width without breaking the aspect ratio when `naturalSize` is `false` |  |
| `maxHeight` | `number` | The maximum height without breaking the aspect ratio when `naturalSize` is `false` |  |
| `onAdded` | `Shape => any` | After a tag is added  |  |
| `onContextMenu` | `Shape => any` | When a tag is right-clicked |   |
| `onReady` | `SvgEditorHandles => any` | When SvgEditor is mounted |   |
(\*) required props

## Exposed Handles

Use `svgEditor` object received from `useSvgEditor` to call or use the following handles:

| Prop | Type | Description |
|---|---|---|
| `drawCircle` | `() => void` | Allows drawing circles by dragging the left mouse button |
| `drawRectangle` | `() => void` | Allows drawing rectangles by dragging the left mouse button (keep the shift key to draw square) |
| `drawPolygon` | `() => void` | Allows drawing polygons by clicking and double-clicking |
| `stop` | `() => void` | Stops draw/edit/drag mode |
| `edit` | `(id: number) => void` | The tag identified by `id` can be edited and dragged |
| `stopEdit` | `() => void` | Stops editing and dragging |
| `updateClasses` | `(id: number, classes: string[]) => void` | Updates the classes associated with the tag identified by `id` |
| `zoom` | `(factor: number) => void` | Multiplies the dimensions by `factor` |
| `getShapes` | `() => Shape[]` | Gets all tags |
| `container` | `HTMLDivElement` | The `div` wrapping the `SVG` |

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

