import { useRef, useEffect, useState } from "react"
import * as svg from "./lib/svg"
import * as dag from "./lib/dag"
import * as math from "./lib/math"
import { Rect, Arrow } from "./lib/types"
import { SvgRect, SvgDot, SvgCubicBezier, SvgCubicBezierArc } from "./Svg"
import { Controller } from "./Controller"

import { Node } from "./lib/types"
import { DATA } from "./data"

const topic_to_id = DATA.reduce((z, d, i) => {
  // @ts-ignore
  z[d.topic] = i + 1
  return z
}, {})

// @ts-ignore
const nodes: Node[] = DATA.map((d, i) => {
  console.log(d, i)
  return {
    id: i + 1,
    // @ts-ignore
    parents: new Set(d.parents.map((t) => topic_to_id[t])),
  }
})

const cards = DATA.map((d) => d.topic)

/*
const nodes: Node[] = [
  {
    id: 1,
    parents: new Set([]),
  },
  {
    id: 2,
    parents: new Set([1]),
  },
  {
    id: 3,
    parents: new Set([1, 2]),
  },
  {
    id: 4,
    parents: new Set([2]),
  },
  {
    id: 5,
    parents: new Set([3]),
  },
  {
    id: 6,
    parents: new Set([3, 4]),
  },
  {
    id: 7,
    parents: new Set([4]),
  },
]
*/

const g = dag.build(nodes)
console.log("g", g)
console.log("--- dfs ---")
console.log(dag.dfs(g, 1, (path) => console.log(path)))
console.log("--- bfs ---")
console.log(dag.group(g, 1))

type ViewBox = {
  x: number
  y: number
  width: number
  height: number
}

const SvgGraph: React.FC<{
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
}> = ({ width, height, viewBox, mouse }) => {
  const graph = dag.build(nodes)
  /*
  console.log("--- dfs ---")
  console.log(
    dag.dfs(graph, 1, (path) => {
      console.log(path)
    }),
  )
  */
  const rows = dag.group(graph, 1)
  // console.log("rows", rows)

  const layout = svg.map(graph, {
    width,
    height,
    center: {
      x: width / 2,
      y: height / 2,
    },
    node: {
      width: 100,
      height: 50,
      gap: 60,
    },
  })

  // console.log("LAYOUT", layout)

  const arrows: Arrow[] = []
  nodes.map((node) => {
    const s = node.id
    const es = graph.get(s)
    if (es) {
      for (const e of es) {
        const arrow = svg.getEdge(layout, s, e)
        arrows.push(arrow)
      }
    }
  })

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

  if (svgX != 0 && svgY != 0) {
    const i = (svg.bsearch(layout.ys, (y) => y, svgY) || 0) >> 1
    // @ts-ignore
    if (layout.xs[i]) {
      // @ts-ignore
      const xs = layout.xs[i]
      // @ts-ignore
      const j = (svg.bsearch(xs, (x) => x, svgX) || 0) >> 1
      console.log("i", i, "j", j, cards[layout.nodes[i][j].id - 1])
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{ backgroundColor: "pink" }}
    >
      {svg.iter(layout.mid).map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}
      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <SvgRect
            key={j}
            x={node.rect.x}
            y={node.rect.y}
            width={node.rect.width}
            height={node.rect.height}
          />
        ))
      })}
      {arrows.map((e, i) => {
        if (e.start.y == e.end.y) {
          if (e.start.x <= e.end.x) {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={e.start.x + 20}
                y0={e.start.y}
                x1={e.end.x - 20}
                y1={e.end.y}
                t={0.1}
              />
            )
          } else {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={e.start.x - 20}
                y0={e.start.y}
                x1={e.end.x + 20}
                y1={e.end.y}
                t={0.1}
              />
            )
          }
        }
        return (
          <SvgCubicBezier
            key={i}
            x0={e.start.x}
            y0={e.start.y}
            x1={e.end.x}
            y1={e.end.y}
            t={0.2}
          />
        )
      })}

      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <foreignObject
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
                color: "white",
                textAlign: "center",
              }}
            >
              <a href="/" style={{ color: "white" }}>
                {cards[node.id - 1]}
              </a>
            </div>
          </foreignObject>
        ))
      })}

      {mouse ? <SvgDot x={svgX} y={svgY + 10} radius={4} /> : null}
    </svg>
  )
}

// TODO: zoom - linear zoom
// TODO: layout nodes by "nearest" distance
// TODO: hover
// TODO: hover highlight connecting edges

// zoom in -> view box decrease width, height
// zoome out -> view box increase width, height
// drag -> move view box x, y

export type Drag = {
  startMouseX: number
  startMouseY: number
  startViewBoxX: number
  startViewBoxY: number
}

export type Point = {
  x: number
  y: number
}

function App() {
  const WIDTH = 600
  const HEIGHT = 400
  const ref = useRef(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [mouse, setMouse] = useState<Point | null>(null)
  const [center, setCenter] = useState({
    x: WIDTH / 2,
    y: HEIGHT / 2,
  })
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  })

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
    // @ts-ignore
    ref,
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
    console.log("up")
    setDrag(null)
  }
  function onMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault()
    // console.log("move", getMouse(ref.current, e))
    const mouse = getMouse(ref.current, e)
    if (mouse) {
      setMouse(mouse)
      if (drag) {
        // @ts-ignore
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
    console.log("out")
    setDrag(null)
  }

  const percentage = (WIDTH / viewBox.width) * 100

  console.log(viewBox, mouse)

  return (
    <div
      style={{
        backgroundColor: "white",
        position: "relative",
        width: WIDTH,
        height: HEIGHT,
      }}
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <SvgGraph width={WIDTH} height={HEIGHT} viewBox={viewBox} mouse={mouse} />
      {/* UI */}
      {drag ? (
        <div
          style={{
            cursor: "grabbing",
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: HEIGHT,
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

export default App
