import * as math from "./lib/math"

export const SvgRect: React.FC<{
  x: number
  y: number
  width: number
  height: number
}> = ({ x, y, width, height }) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="blue"
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

export const SvgCubicBezier: React.FC<{
  x0: number
  y0: number
  x1: number
  y1: number
  t: number
}> = ({ x0, y0, x1, y1, t }) => {
  const x0_t = math.lerp(x0, x1, t)
  const y0_t = math.lerp(y0, y1, 1 - t)
  const x1_t = math.lerp(x0, x1, 1 - t)
  const y1_t = math.lerp(y0, y1, t)

  return (
    <path
      d={`M ${x0},${y0} C ${x0_t},${y0_t} ${x1_t},${y1_t} ${x1},${y1}`}
      stroke="black"
      fill="transparent"
      strokeWidth="2"
    />
  )
}
