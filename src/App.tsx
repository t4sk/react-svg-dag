import { useRef, useEffect } from "react"
import * as svg from "./lib/svg"
import * as dag from "./lib/dag"
import { Rect, Arrow } from "./lib/types"
import {
  SvgRect,
  SvgLine,
  SvgDot,
  SvgCubicBezier,
  SvgCubicBezierArc,
} from "./Svg"

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

// TODO: view box
// TODO: zoom
// TODO: drag
const SvgGraph: React.FC = () => {
  const graph = dag.build(nodes)
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
      width: 100,
      height: 50,
      gap: 60,
    },
  })

  console.log("LAYOUT", layout)

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

  return (
    <div style={{ position: "relative" }}>
      <svg width="800" height="600" style={{ backgroundColor: "pink" }}>
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

        <SvgDot x={0} y={0} radius={4} />
      </svg>
      {layout.nodes.map((row, i) => {
        return row.map((node, j) => (
          <div
            style={{
              position: "absolute",
              top: node.rect.y,
              left: node.rect.x,
              width: node.rect.width,
              height: node.rect.height,
            }}
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
              {cards[node.id - 1]}
            </div>
          </div>
        ))
      })}
    </div>
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
