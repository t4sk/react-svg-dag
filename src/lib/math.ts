export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + t * b
}

export function sum(xs: number[]): number {
  let total = 0
  for (let i = 0; i < xs.length; i++) {
    total += xs[i]
  }
  return total
}
