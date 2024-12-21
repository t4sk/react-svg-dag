import React from "react"
import * as math from "./lib/math"

export const SvgRect: React.FC<{
  x: number
  y: number
  width: number
  height: number
  fill?: string
}> = ({ x, y, width, height, fill = "blue" }) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke="black"
      strokeWidth="2"
    />
  )
}

export const SvgDot: React.FC<{
  x: number
  y: number
  radius: number
}> = ({ x, y, radius }) => {
  return <circle cx={x} cy={y} r={radius} fill="red" />
}

export const SvgLine: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
}> = ({ x0, y0, x1, y1 }) => {
  return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="black" strokeWidth="2" />
}

/*

Let's break down the given Bézier curve path in detail:

Full Path
html
Copy code
<path _ngcontent-pgu-c41="" 
      stroke-width="4.5" 
      stroke="white" 
      marker="white" 
      marker-end="url(#arrow)" 
      class="line" 
      d="M820,430
         L820,438.3333333333333
         C820,446.6666666666667,820,463.3333333333333,759.5833333333334,471.6666666666667
         C699.1666666666666,480,578.3333333333334,480,517.9166666666666,488.3333333333333
         C457.5,496.6666666666667,457.5,513.3333333333334,457.5,521.6666666666666
         L457.5,530">
</path>
*/

export const SvgCubicBezier: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  t: number
}> = ({ x0, y0, x1, y1, t }) => {
  const dy = 10
  const arrow = 4
  const x0_t = math.lerp(x0, x1, t)
  const y0_t = math.lerp(y0 + dy, y1 - dy, 1 - t)
  const x1_t = math.lerp(x0, x1, 1 - t)
  const y1_t = math.lerp(y0 + dy, y1 - dy, t)

  return (
    <>
      <defs>
        <marker
          id="arrow"
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M 0 0 L 5 2.5 L 0 5 z" fill="black" />
        </marker>
      </defs>
      <path
        d={`M ${x0}, ${y0} L ${x0} ${y0 + dy}`}
        stroke="black"
        fill="transparent"
        strokeWidth="2"
      />
      <path
        d={`M ${x0} ${y0 + dy} C ${x0_t},${y0_t} ${x1_t},${y1_t} ${x1},${y1 - dy}`}
        stroke="black"
        fill="transparent"
        strokeWidth="2"
      />
      <path
        d={`M ${x1}, ${y1 - dy} L ${x1} ${y1 - arrow}`}
        stroke="black"
        fill="transparent"
        strokeWidth="2"
        markerEnd="url(#arrow)"
      />
    </>
  )
}
