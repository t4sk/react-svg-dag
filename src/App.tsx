import { useRef, useEffect, useState } from "react"
import styles from "./App.module.css"
import { Node, ViewBox, Point } from "./lib/types"
import { assert } from "./lib/utils"
import * as svg from "./lib/svg"
import * as dag from "./lib/dag"
import { SvgRect, SvgDot, SvgCubicBezier, SvgCubicBezierArc } from "./Svg"
import { Controller } from "./Controller"

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

const { graph, starts } = dag.build(nodes)

// Check valid DAG
for (const s of starts) {
  assert(dag.dfs(graph, s), `invalid DAG starting from ${s}`)
}

// TODO:  multiple starting points

const SvgGraph: React.FC<{
  width: number
  height: number
  viewBox: ViewBox
  mouse: Point | null
}> = ({ width, height, viewBox, mouse }) => {
  const layout = svg.map(graph, starts, {
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

  const svgX = mouse
    ? svg.getViewBoxX(width, mouse.x, viewBox.width, viewBox.x)
    : 0
  const svgY = mouse
    ? svg.getViewBoxY(height, mouse.y, viewBox.height, viewBox.y)
    : 0

  let hover = null
  if (svgX != 0 && svgY != 0) {
    const i = (svg.bsearch(layout.ys, (y) => y, svgY) || 0) >> 1
    // @ts-ignore
    if (layout.xs[i]) {
      // @ts-ignore
      const xs = layout.xs[i]
      // @ts-ignore
      const j = (svg.bsearch(xs, (x) => x, svgX) || 0) >> 1
      console.log(
        "i",
        i,
        "j",
        j,
        "id",
        layout.nodes[i][j].id,
        cards[layout.nodes[i][j].id - 1],
        svg.isInside({ x: svgX, y: svgY }, layout.nodes[i][j].rect),
      )
      hover = layout.nodes[i][j].id
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
      {layout.arrows.map((a, i) => {
        if (a.start.y == a.end.y) {
          if (a.start.x <= a.end.x) {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={a.start.x + 20}
                y0={a.start.y}
                x1={a.end.x - 20}
                y1={a.end.y}
                t={0.1}
                color={a.s == hover || a.e == hover ? "red" : "black"}
              />
            )
          } else {
            return (
              <SvgCubicBezierArc
                key={i}
                x0={a.start.x - 20}
                y0={a.start.y}
                x1={a.end.x + 20}
                y1={a.end.y}
                t={0.1}
                color={a.s == hover || a.e == hover ? "red" : "black"}
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
            color={a.s == hover || a.e == hover ? "red" : "black"}
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

// zoom in -> view box decrease width, height
// zoome out -> view box increase width, height
// drag -> move view box x, y

type Drag = {
  startMouseX: number
  startMouseY: number
  startViewBoxX: number
  startViewBoxY: number
}

function App() {
  const WIDTH = 600
  const HEIGHT = 400
  const ref = useRef(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [mouse, setMouse] = useState<Point | null>(null)
  // TODO: remove?
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
      className={styles.svg_container}
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
