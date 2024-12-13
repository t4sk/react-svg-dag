import { Node, Graph } from "./types"

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
]
// 1 -> 2 -> 4
// 1 -> 2 -> 3 -> 5
// 1 -> 3 -> 5

const g = build(data)
console.log("g", g)
console.log("--- dfs ---")
console.log(dfs(g, 1, (path) => console.log(path)))
console.log("--- bfs ---")
const rows: number[][] = []
bfs(g, 1, (i, vs) => {
  console.log(i, vs)
  rows.push([...vs])
})

console.log(rows)

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

console.log(vs)

// Node[] -> build graph -> check valid DAG -> organize into levels
export function build(nodes: Node[]): Graph {
  let graph: Graph = new Map()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    for (const v of node.parents) {
      if (!graph.has(v)) {
        graph.set(v, new Set())
      }
      // @ts-ignore
      graph.get(v).add(node.id)
    }
  }

  return graph
}

export function dfs(
  graph: Graph,
  start: number,
  f: (path: number[]) => void,
): boolean {
  type Node = {
    // parent
    p: number | null
    // current vertex
    v: number
  }

  const q: Node[] = [{ p: null, v: start }]
  const visited: Set<number> = new Set()
  const path: number[] = []

  while (q.length > 0) {
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

    const next = graph.get(v)
    if (next) {
      for (const w of next) {
        q.push({ p: v, v: w })
      }
    } else {
      // Return new copy of path
      f([...path])
    }
  }

  // No cycles - valid DAG
  return true
}

export function bfs(
  graph: Graph,
  start: number,
  f: (i: number, vs: number[]) => void,
) {
  const q: number[][] = [[start]]
  const visited: Set<number> = new Set()

  let i = 0
  while (q.length > 0) {
    const vs = q.pop() as number[]

    f(i, vs)

    const row: Set<number> = new Set()
    for (const v of vs) {
      if (visited.has(v)) {
        continue
      }
      visited.add(v)

      const next = graph.get(v)
      if (next) {
        for (const w of next) {
          if (!visited.has(w)) {
            row.add(w)
          }
        }
      }
    }

    if (row.size > 0) {
      q.push([...row])
    }
    i++
  }
}

// Topological sort
export function sort() {}
