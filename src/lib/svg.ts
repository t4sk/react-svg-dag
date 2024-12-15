import { Point, Rect, MidPoints, Graph } from "./types"
import * as dag from "./dag"

export function getCenterX(rect: Rect): number {
  return rect.x + (rect.width >> 1)
}

export function getCenterY(rect: Rect): number {
  return rect.y + (rect.height >> 1)
}

export function getCenter(rect: Rect): Point {
  return {
    x: rect.x + (rect.width >> 1),
    y: rect.y + (rect.height >> 1),
  }
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
    center: {
      x: rect.x + midWidth,
      y: rect.y + midHeight,
    },
  }
}

export function iter(mids: {
  top: Point
  bottom: Point
  left: Point
  right: Point
  center: Point
}): Point[] {
  const { top, left, bottom, right, center } = mids
  // clockwise
  return [top, left, bottom, right, center]
}

export type Layout = {
  rect: Rect
  mid: MidPoints
  nodes: Rect[][]
}

export function map(
  graph: Graph,
  params: {
    canvas: { width: number; height: number }
    node: { width: number; height: number; gap: number }
  },
): Layout {
  // TODO: start from input
  const rows = dag.group(graph, 1)
  const maxRowLen = Math.max(...rows.map((r) => r.length))
  const height =
    rows.length * params.node.height + (rows.length - 1) * params.node.gap
  const width =
    maxRowLen * params.node.width + (maxRowLen - 1) * params.node.gap

  const center = getCenter({
    x: 0,
    y: 0,
    width: params.canvas.width,
    height: params.canvas.height,
  })

  const rect = {
    x: center.x - (width >> 1),
    y: center.y - (height >> 1),
    width,
    height,
  }

  const mid = getMidPoints(rect)

  return {
    rect,
    mid,
    nodes: [],
  }
}
