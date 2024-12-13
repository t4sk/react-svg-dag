import { Point, Rect, MidPoints } from "./types"

export function getCenterX(rect: Rect): number {
  return rect.x + (rect.width >> 1)
}

export function getCenterY(rect: Rect): number {
  return rect.y + (rect.height >> 1)
}

export function getMidPoints(rect: Rect): MidPoints {
  const midWidth = rect.width >> 1
  const midHeight = rect.height >> 1

  return {
    top: {
      x: rect.x + midWidth,
      y: rect.y,
    },
    bottom: {
      x: rect.x + midWidth,
      y: rect.y + rect.height,
    },
    left: {
      x: rect.x,
      y: rect.y + midHeight,
    },
    right: {
      x: rect.x + rect.width,
      y: rect.y + midHeight,
    },
  }
}

export function iter(mids: {
  top: Point
  bottom: Point
  left: Point
  right: Point
}): Point[] {
  const { top, left, bottom, right } = mids
  // clockwise
  return [top, left, bottom, right]
}
