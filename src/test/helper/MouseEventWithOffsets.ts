interface MouseEventWithOffsets extends MouseEventInit {
    pageX?: number
    pageY?: number
    offsetX?: number
    offsetY?: number
    x?: number
    y?: number
    deltaY?: number
  }
  
  export class FakeMouseEvent extends MouseEvent {
    constructor(type: string, values: MouseEventWithOffsets) {
      const { pageX, pageY, offsetX, offsetY, x, y, deltaY, ...mouseValues } = values
      super(type, mouseValues)
  
      Object.assign(this, {
        offsetX: offsetX || 0,
        offsetY: offsetY || 0,
        pageX: pageX || 0,
        pageY: pageY || 0,
        x: x || 0,
        y: y || 0,
        deltaY: deltaY || 0,
      })
    }
  }