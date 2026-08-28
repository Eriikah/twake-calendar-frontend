import { calculateHorizontalPosition } from './useDynamicPosition'

describe('calculateHorizontalPosition', () => {
  it('should handle inverted bounds when minLeft exceeds maxLeft (800px viewport)', () => {
    // 800px viewport, 570px dialog width
    // paddingLeft = 270, paddingRight = 40
    // minLeft = 270
    // maxLeft = 800 - 570 - 40 = 190
    // minLeft (270) > maxLeft (190), so it should return Math.max(0, 190) = 190
    const anchorRect = {
      left: 300,
      right: 350,
      top: 100,
      bottom: 150,
      width: 50,
      height: 50,
      x: 300,
      y: 100,
      toJSON: () => {}
    } as DOMRect

    const result = calculateHorizontalPosition({
      anchorRect,
      dialogWidth: 570,
      viewportWidth: 800,
      gap: 12,
      paddingRight: 40,
      paddingLeft: 270
    })

    expect(result).toBe(190)
  })
})
