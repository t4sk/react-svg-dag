import { Point, Rect, MidPoints, Canvas, Layout, Graph } from "./types"
import * as dag from "./dag"
import * as math from "./math"

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

export function box(canvas: Canvas, n: number, p0: Point): Rect {
  const height = canvas.node.height
  const width = n * canvas.node.width + (n - 1) * canvas.node.gap

  return {
    x: p0.x - (width >> 1),
    y: p0.y - (height >> 1),
    width,
    height,
  }
}

// TODO: start from input
// TODO: box layout
export function map(graph: Graph, canvas: Canvas): Layout {
  const rows = dag.group(graph, 1)

  const height =
    rows.length * canvas.node.height + (rows.length - 1) * canvas.node.gap
  const y0 = canvas.center.y - (height >> 1)

  const boxes = rows.map((r, i) =>
    box(canvas, r.length, {
      x: canvas.center.x,
      y:
        y0 +
        (canvas.node.height >> 1) +
        i * (canvas.node.height + canvas.node.gap),
    }),
  )

  const width = Math.max(...boxes.map((b) => b.width))

  const rect = {
    x: canvas.center.x - (width >> 1),
    y: canvas.center.y - (height >> 1),
    width,
    height,
  }

  const mid = getMidPoints(rect)

  const nodes: Rect[][] = []
  for (let i = 0; i < rows.length; i++) {
    const row: Rect[] = []
    const box = boxes[i]
    for (let j = 0; j < rows[i].length; j++) {
      row.push({
        id: rows[i][j],
        x: box.x + j * (canvas.node.width + canvas.node.gap),
        y: box.y,
        width: canvas.node.width,
        height: canvas.node.height,
      })
    }
    nodes.push(row)
  }

  return {
    rect,
    mid,
    nodes,
    boxes,
  }
}
