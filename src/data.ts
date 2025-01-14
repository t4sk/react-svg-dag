export const DATA = [
  {
    topic: "hello",
    parents: [],
  },
  {
    topic: "value",
    parents: ["hello"],
  },
  {
    topic: "reference",
    parents: ["hello", "value"],
  },
  {
    topic: "dyn_array",
    parents: ["value", "reference"],
  },
  {
    topic: "constructor",
    parents: ["hello"],
  },
  {
    topic: "pub_priv",
    parents: ["hello"],
  },
  {
    topic: "constant",
    parents: ["value"],
  },
  {
    topic: "immutable",
    parents: ["value", "constant", "constructor"],
  },
]
