export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + t * b
}

export function lin(dy: number, dx: number, x: number, y0: number): number {
  return (dy / dx) * x + y0
}

export function getViewBoxX(
  width: number,
  mouseX: number,
  viewBoxWidth: number,
  viewBoxX: number,
): number {
  return lin(viewBoxWidth, width, mouseX, viewBoxX)
}

export function getViewBoxY(
  height: number,
  mouseY: number,
  viewBoxHeight: number,
  viewBoxY: number,
): number {
  return lin(viewBoxHeight, height, mouseY, viewBoxY)
}

export function sum(xs: number[]): number {
  let total = 0
  for (let i = 0; i < xs.length; i++) {
    total += xs[i]
  }
  return total
}
