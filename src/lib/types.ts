export type Point = {
  x: number
  y: number
}

export type Rect = {
  // Node id
  id?: number
  x: number
  y: number
  width: number
  height: number
}

export type MidPoints = {
  top: Point
  left: Point
  bottom: Point
  right: Point
  center: Point
}

export type Canvas = {
  width: number
  height: number
  center: Point
  node: { width: number; height: number; gap: number }
}

export type Layout = {
  rect: Rect
  mid: MidPoints
  nodes: Rect[][]
  boxes: Rect[]
}

export type Node = {
  id: number
  parents: Set<number>
}

export type Graph = Map<number, Set<number>>
