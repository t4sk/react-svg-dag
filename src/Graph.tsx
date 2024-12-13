import React, { useEffect, useRef } from "react";
import { graphviz } from "d3-graphviz";

const DotGraph: React.FC = () => {
  const graphContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (graphContainer.current) {
      // Define the DOT graph
      const dotGraph = `
        digraph G {
          A [label="Node A"];
          B [label="Node B"];
          A -> B [label="Edge from A to B"];
        }
      `;

      // Render the DOT graph
      graphviz(graphContainer.current).renderDot(dotGraph);
    }
  }, []);

  return (
    <div>
      <h1>DOT Graph Example</h1>
      <div ref={graphContainer}></div>
    </div>
  );
};

export default DotGraph;
