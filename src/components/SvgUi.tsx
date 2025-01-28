import { useRef, useState } from "react"
import { ViewBox, Point, SvgNode, Graph } from "../lib/types"
import * as svg from "../lib/svg"
import { SvgRect, SvgDot, SvgCubicBezier, SvgCubicBezierArc } from "./Svg"
import { Controller } from "./Controller"

const ARC_X_PADDING = 20

export const SvgGraph: React.FC<{
  graph: Graph
  starts: number[]
  backgroundColor: string
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
  isDragging: boolean
  showDot?: boolean
  rectFill?: string
  rectStroke?: string
  lineColor?: string
  lineHoverColor?: string
  nodeWidth?: number
  nodeHeight?: number
  nodeGap?: number
  renderNode: (node: SvgNode) => React.ReactNode
}> = ({
  graph,
  starts,
  backgroundColor,
  width,
  height,
  viewBox,
  mouse,
  showDot = false,
  rectFill = "none",
  rectStroke = "black",
  lineColor = "black",
  lineHoverColor = "red",
  renderNode,
  nodeWidth = 100,
  nodeHeight = 50,
  nodeGap = 60,
}) => {
  const layout = svg.map(graph, starts, {
    width,
    height,
    center: {
      x: width / 2,
      y: height / 2,
    },
    node: {
      width: nodeWidth,
      height: nodeHeight,
      gap: nodeGap,
    },
  })

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

  let hover = null
  if (mouse && svgX != 0 && svgY != 0) {
    const i = (svg.bsearch(layout.ys, (y) => y, svgY) || 0) >> 1
    const xs = layout.xs[i]
    if (xs) {
      const j = (svg.bsearch(xs, (x) => x, svgX) || 0) >> 1
      const node = layout.nodes[i][j]
      if (node && svg.isInside({ x: svgX, y: svgY }, node.rect)) {
        hover = node.id
      }
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ backgroundColor }}
    >
      {svg.iter(layout.mid).map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}
      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <SvgRect
            key={`${i}-${j}`}
            x={node.rect.x}
            y={node.rect.y}
            width={node.rect.width}
            height={node.rect.height}
            fill={rectFill}
            stroke={rectStroke}
          />
        ))
      })}
      {layout.arrows.map((a, i) => {
        if (a.start.y == a.end.y) {
          if (a.start.x <= a.end.x) {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={a.start.x + ARC_X_PADDING}
                y0={a.start.y}
                x1={a.end.x - ARC_X_PADDING}
                y1={a.end.y}
                t={0.1}
                color={
                  a.s == hover || a.e == hover ? lineHoverColor : lineColor
                }
              />
            )
          } else {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={a.start.x - ARC_X_PADDING}
                y0={a.start.y}
                x1={a.end.x + ARC_X_PADDING}
                y1={a.end.y}
                t={0.1}
                color={
                  a.s == hover || a.e == hover ? lineHoverColor : lineColor
                }
              />
            )
          }
        }
        return (
          <SvgCubicBezier
            key={i}
            x0={a.start.x}
            y0={a.start.y}
            x1={a.end.x}
            y1={a.end.y}
            t={0.2}
            color={a.s == hover || a.e == hover ? lineHoverColor : lineColor}
          />
        )
      })}

      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <foreignObject
            key={`${i}-${j}`}
            x={node.rect.x}
            y={node.rect.y}
            width={node.rect.width}
            height={node.rect.height}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {renderNode(node)}
            </div>
          </foreignObject>
        ))
      })}

      {mouse && showDot ? <SvgDot x={svgX} y={svgY} radius={4} /> : null}
    </svg>
  )
}

// TODO: zoom to current center
// TODO: zoom - linear zoom
// TODO: layout nodes by "nearest" distance
// TODO: pretty controller
// TODO: center button for controller

// Zoom in -> view box decrease width and height
// Zoom out -> view box increase width and height
// Drag -> move view box x, y

export type Drag = {
  startMouseX: number
  startMouseY: number
  startViewBoxX: number
  startViewBoxY: number
}

export const SvgUi: React.FC<{
  graph: Graph
  starts: number[]
  backgroundColor: string
  width: number
  height: number
  rectFill?: string
  rectStroke?: string
  lineColor?: string
  lineHoverColor?: string
  renderNode?: (node: SvgNode) => React.ReactNode
  showDot?: boolean
  nodeWidth?: number
  nodeHeight?: number
  nodeGap?: number
}> = ({
  graph,
  starts,
  backgroundColor,
  width,
  height,
  rectFill,
  rectStroke,
  lineColor,
  lineHoverColor,
  renderNode = (node) => node.id,
  showDot = false,
  nodeWidth,
  nodeHeight,
  nodeGap,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [mouse, setMouse] = useState<Point | null>(null)
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width,
    height,
  })

  const center = {
    x: width / 2,
    y: height / 2,
  }

  function onClickPlus() {
    const width = viewBox.width / 1.2
    const height = viewBox.height / 1.2
    setViewBox({
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    })
  }

  function onClickMinus() {
    const width = viewBox.width * 1.2
    const height = viewBox.height * 1.2
    setViewBox({
      x: center.x - width / 2,
      y: center.y - height / 2,
      width,
      height,
    })
  }

  function getMouse(
    ref: HTMLDivElement | null,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ): Point | null {
    if (!ref) {
      return null
    }
    const rect = ref.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    const mouse = getMouse(ref.current, e)
    if (mouse) {
      setDrag({
        startMouseX: mouse.x,
        startMouseY: mouse.y,
        startViewBoxX: viewBox.x,
        startViewBoxY: viewBox.y,
      })
    }
  }

  function onMouseUp(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setDrag(null)
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    const mouse = getMouse(ref.current, e)
    if (mouse) {
      setMouse(mouse)
      if (drag) {
        const dx = mouse.x - drag.startMouseX
        const dy = mouse.y - drag.startMouseY
        setViewBox({
          ...viewBox,
          x: drag.startViewBoxX - dx,
          y: drag.startViewBoxY - dy,
        })
      }
    }
  }

  function onMouseOut(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    setDrag(null)
  }

  const percentage = (width / viewBox.width) * 100

  return (
    <div
      style={{
        backgroundColor,
        position: "relative",
        width,
        height,
      }}
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <SvgGraph
        graph={graph}
        starts={starts}
        backgroundColor={backgroundColor}
        width={width}
        height={height}
        viewBox={viewBox}
        mouse={mouse}
        isDragging={!!drag}
        showDot={showDot}
        rectFill={rectFill}
        rectStroke={rectStroke}
        lineColor={lineColor}
        lineHoverColor={lineHoverColor}
        renderNode={renderNode}
        nodeWidth={nodeWidth}
        nodeHeight={nodeHeight}
        nodeGap={nodeGap}
      />
      {drag ? (
        <div
          style={{
            cursor: "grabbing",
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
          }}
          onMouseOut={onMouseOut}
        ></div>
      ) : null}
      <div style={{ position: "absolute", bottom: 0, left: 0 }}>
        <Controller
          onClickPlus={onClickPlus}
          onClickMinus={onClickMinus}
          percentage={percentage}
        />
      </div>
    </div>
  )
}
