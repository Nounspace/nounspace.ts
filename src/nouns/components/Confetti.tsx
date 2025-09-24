"use client";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { createPortal } from "react-dom";
import { useWindowSize } from "usehooks-ts";

const colors = [
  "#F3322C",
  "#F98F30",
  "#FFA21E",
  "#F4580D",
  "#FFeF16",
  "#C4DA53",
  "#38DD56",
  "#068940",
  "#45FAFF",
  "#CAEFF9",
  "#2A86FD",
  "#AAA7A4",
  "#FF1AD2",
  "#D18687",
];

export default function Confetti() {
  const { width, height } = useWindowSize();
  return (
    typeof window == "object" &&
    createPortal(
      <ReactConfetti
        width={width}
        height={height}
        colors={colors}
        recycle={false}
        numberOfPieces={width > 768 ? 1000 : 500}
        tweenDuration={20000}
      />,
      document.body
    )
  );
}
