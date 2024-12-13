import { useRef, useEffect } from "react";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + t * b;
}

function getCenterX(rect: Rect): number {
  return rect.x + (rect.width >> 1);
}

function getCenterY(rect: Rect): number {
  return rect.y + (rect.height >> 1);
}

function getMidPoints(rect: Rect): {
  top: Point;
  left: Point;
  bottom: Point;
  right: Point;
} {
  const midWidth = rect.width >> 1;
  const midHeight = rect.height >> 1;

  return {
    top: {
      x: rect.x + midWidth,
      y: rect.y,
    },
    bottom: {
      x: rect.x + midWidth,
      y: rect.y + rect.height,
    },
    left: {
      x: rect.x,
      y: rect.y + midHeight,
    },
    right: {
      x: rect.x + rect.width,
      y: rect.y + midHeight,
    },
  };
}

function iter(mids: {
  top: Point;
  bottom: Point;
  left: Point;
  right: Point;
}): Point[] {
  const { top, left, bottom, right } = mids;
  // clockwise
  return [top, left, bottom, right];
}

const SvgRect: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
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
  );
};

const SvgDot: React.FC<{
  x: number;
  y: number;
  radius: number;
}> = ({ x, y, radius }) => {
  return <circle cx={x} cy={y} r={radius} fill="red" />;
};

const SvgLine: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}> = ({ x0, y0, x1, y1 }) => {
  return (
    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="black" stroke-width="2" />
  );
};

const SvgCubicBezier: React.FC<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
}> = ({ x0, y0, x1, y1, t }) => {
  return (
    <path
      d={`M ${x0},${y0} C ${lerp(x0, x1, t)},${lerp(y0, y1, 1 - t)} ${lerp(x0, x1, 1 - t)},${lerp(y0, y1, t)} ${x1},${y1}`}
      stroke="black"
      fill="transparent"
      strokeWidth="2"
    />
  );
};

const SvgGraph: React.FC = () => {
  // TODO: view box
  const r0: Rect = {
    x: 10,
    y: 20,
    width: 100,
    height: 100,
  };

  const r1: Rect = {
    x: 100,
    y: 160,
    width: 100,
    height: 200,
  };

  const m0 = iter(getMidPoints(r0));
  const m1 = iter(getMidPoints(r1));

  return (
    <svg width="800" height="600" style={{ backgroundColor: "pink" }}>
      <SvgRect x={r0.x} y={r0.y} width={r0.width} height={r0.height} />
      <SvgRect x={r1.x} y={r1.y} width={r1.width} height={r1.height} />
      <SvgDot x={getCenterX(r0)} y={getCenterY(r0)} radius={4} />
      <SvgDot x={getCenterX(r1)} y={getCenterY(r1)} radius={4} />
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
  );
};

function App() {
  return (
    <div style={{ backgroundColor: "white" }}>
      <SvgGraph />
    </div>
  );
}

export default App;
