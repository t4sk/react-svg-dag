import { useRef, useEffect } from "react"
import * as svg from "./lib/svg"
import * as dag from "./lib/dag"
import { Rect } from "./lib/types"
import { SvgRect, SvgLine, SvgDot, SvgCubicBezier } from "./Svg"

import { Node } from "./lib/types"

const data: Node[] = [
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
    parents: new Set([3]),
  },
  {
    id: 7,
    parents: new Set([4]),
  },
]
// 1 -> 2 -> 4
// 1 -> 2 -> 3 -> 5
// 1 -> 3 -> 5

const g = dag.build(data)
console.log("g", g)
console.log("--- dfs ---")
console.log(dag.dfs(g, 1, (path) => console.log(path)))
console.log("--- bfs ---")
console.log(dag.group(g, 1))

// TODO: view box
// TODO: zoom
// TODO: drag
const SvgGraph: React.FC = () => {
  const r0: Rect = {
    x: 10,
    y: 20,
    width: 100,
    height: 100,
  }

  const r1: Rect = {
    x: 100,
    y: 160,
    width: 100,
    height: 200,
  }

  const m0 = svg.iter(svg.getMidPoints(r0))
  const m1 = svg.iter(svg.getMidPoints(r1))

  const graph = dag.build(data)
  console.log("--- dfs ---")
  console.log(
    dag.dfs(graph, 1, (path) => {
      console.log(path)
    }),
  )
  const rows = dag.group(graph, 1)
  console.log("rows", rows)

  const layout = svg.map(graph, {
    width: 800,
    height: 600,
    center: {
      x: 400,
      y: 300,
    },
    node: {
      width: 200,
      height: 100,
      gap: 40,
    },
  })

  console.log("LAYOUT", layout)

  return (
    <svg width="800" height="600" style={{ backgroundColor: "pink" }}>
      <SvgRect x={r0.x} y={r0.y} width={r0.width} height={r0.height} />
      <SvgRect x={r1.x} y={r1.y} width={r1.width} height={r1.height} />
      <SvgDot x={svg.getCenterX(r0)} y={svg.getCenterY(r0)} radius={4} />
      <SvgDot x={svg.getCenterX(r1)} y={svg.getCenterY(r1)} radius={4} />
      {m0.map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}
      {m1.map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}
      <SvgLine x0={m0[0].x} y0={m0[0].y} x1={m0[2].x} y1={m0[2].y} />
      <SvgLine x0={m0[1].x} y0={m0[1].y} x1={m0[3].x} y1={m0[3].y} />
      <SvgLine x0={m1[0].x} y0={m1[0].y} x1={m1[2].x} y1={m1[2].y} />
      <SvgLine x0={m1[1].x} y0={m1[1].y} x1={m1[3].x} y1={m1[3].y} />

      <SvgCubicBezier
        x0={m0[2].x}
        y0={m0[2].y}
        x1={m1[0].x}
        y1={m1[0].y}
        t={0.1}
      />

      <SvgRect
        x={layout.rect.x}
        y={layout.rect.y}
        width={layout.rect.width}
        height={layout.rect.height}
        fill="transparent"
      />
      {svg.iter(layout.mid).map((p, i) => (
        <SvgDot x={p.x} y={p.y} key={i} radius={4} />
      ))}
      {/*layout.boxes.map((b, i) => (
        <SvgRect
          key={i}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          fill="transparent"
        />
      ))*/}
      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <SvgRect
            key={j}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
          />
        ))
      })}
    </svg>
  )
}

function App() {
  return (
    <div style={{ backgroundColor: "white" }}>
      <SvgGraph />
    </div>
  )
}

export default App
