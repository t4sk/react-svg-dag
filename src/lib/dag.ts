import { Node, Graph } from "./types"

// Node[] -> build graph -> check valid DAG -> organize into levels
export function build(nodes: Node[]): { graph: Graph; starts: number[] } {
  const graph: Graph = new Map()
  const starts: number[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.parents.size == 0) {
      starts.push(node.id)
    } else {
      for (const v of node.parents) {
        if (!graph.has(v)) {
          graph.set(v, new Set())
        }
        graph.get(v)?.add(node.id)
      }
    }
  }

  return { graph, starts }
}

type DfsNode = {
  // parent
  p: number | null
  // current vertex
  v: number
}

export function dfs(
  graph: Graph,
  start: number,
  f?: (d: number, v: number) => void,
): boolean {
  type Node = {p: number | null; v: number }

  const q: Node[] = [{ p: null, v: start }]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
    // Avoid using shift() which is O(N) to get element from the head of q
    const { p, v } = q.pop() as Node

    // Cycle detected - invalid DAG
    if (visited.has(v)) {
      return false
    }

    // Backtrack path to p
    while (path.length > 0 && path[path.length - 1] != p) {
      const u = path.pop() as number
      visited.delete(u)
    }

    visited.add(v)
    path.push(v)

    if (f) {
      f(path.length - 1, v)
    }


    const neighbors = graph.get(v)
    if (neighbors) {
      for (const w of [...neighbors].reverse()) {
        q.push({ p: v, v: w })
      }
    }
  }

  // No cycles - valid DAG
  return true
}

export function bfs(
  graph: Graph,
  start: number,
  f?: (d: number, v: number) => void,
) {
  const q: [number, number][] = [[0, start]]
  const visited: Set<number> = new Set()
  let i = 0

  while (i < q.length) {
    // Avoid using shift() which is O(N) to get element from the head of q
    const [d, v] = q[i++]

    if (visited.has(v)) {
      continue
    }
    visited.add(v)

    if (f) {
      f(d, v)
    }

    const neighbors = graph.get(v)
    if (neighbors) {
      for (const w of neighbors) {
        if (!visited.has(w)) {
          q.push([d + 1, w])
        }
      }
    }
  }
}

export function group(graph: Graph, starts: number[]): number[][] {
  const rows: Set<number>[] = []

  // BFS from each starting point
  for (const s of starts) {
    bfs(graph, s, (d, v) => {
      if (d == rows.length) {
        rows.push(new Set())
      }
      rows[d].add(v)
    })
  }

  const vs: number[][] = []
  const inserted: Set<number> = new Set()

  for (const row of rows) {
    const r = []
    for (const v of row) {
      if (inserted.has(v)) {
        continue
      }
      inserted.add(v)
      r.push(v)
    }
    if (r.length > 0) {
      vs.push(r)
    }
  }

  return vs
}
