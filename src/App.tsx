import { useRef, useEffect } from "react"
import * as svg from "./lib/svg"
import * as dag from "./lib/dag"
import { Rect } from "./lib/types"
import { SvgRect, SvgLine, SvgDot, SvgCubicBezier } from "./Svg"

console.log(dag)

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
