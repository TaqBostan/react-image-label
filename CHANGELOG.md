# Versions

## 2.0.10

_Jul 27, 2025_

### Bug Fixes
* Fixed a problem with component width and height when specified as a percentage
* Fixed a problem with shape `id` with initial value
* LICENSE added

## 2.0.9

_Jul 4, 2025_

### New Features
* Accepting width and height in percentages


## 2.0.8

_Jun 26, 2025_

### Bug Fixes
* Support for different versions of React

## 2.0.7

_Apr 20, 2025_

### New Features
* Three modes for vertical positioning of categories (top, middle, bottom)

## 2.0.6

_Apr 17, 2025_

__Action Required__: After this release, when the annotator is in draw mode, annotations will NOT go to edit mode when clicked. There are two options for this: Calling `annotator.stop()` to stop draw mode, or calling `annotator.edit(shape.id)` to send the annotation to edit mode without stopping draw mode.

### Bug Fixes
* Fixed a problem in drawing polygons that overlap
  
## 1.4.0

_Dec 05, 2024_

### New Features
* Use `onEdited` prop to get an up-to-date copy of a shape that has been reshaped, stretched, or rotated.

## 1.3.9

_Nov 29, 2024_

__Action Required__: Add `shortcut={{del: true }}` to props to enable Delete key to remove the annotation that is in edit mode

### Bug Fixes
* Due to side effects on text inputs, the Delete key binding was disabled by default, and a prop was added to enable it intentionally.

### New Features
* A setting to bind the Backspace key to act like the Delete key, which is especially useful for Mac users. (see [Shortcut Settings](https://github.com/TaqBostan/react-image-label?tab=readme-ov-file#shortcut-settings))