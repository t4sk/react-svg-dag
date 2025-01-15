import React from "react"

export const Controller: React.FC<{
  percentage: number
  onClickPlus: () => void
  onClickMinus: () => void
}> = ({ percentage, onClickPlus, onClickMinus }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "red",
      }}
    >
      <button onClick={onClickMinus}>-</button>
      <div>{Math.round(percentage)}%</div>
      <button onClick={onClickPlus}>+</button>
    </div>
  )
}
