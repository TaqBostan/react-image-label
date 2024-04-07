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

All of the following properties can be defined on the Annotator...

| Prop | Type | Description | Default |
|---|---|---|---|
| `imageUrl` \* | `string` | Use a state for image url if you want to change it on the fly |   |
| `naturalSize` | `boolean` | Show image in its natural size | `false` |
| `shapes` | `IlShape[] \| any[]` | Tags being displayed on load |   |
| `onAdded` | `IlShape => any` | After a tag is added  |  |
| `onContextMenu` | `IlShape => any` | When a tag is right-clicked |   |
| `onReady` | `IlShape => any` | When SvgEditor is mounted |   |
(\*) required props

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

