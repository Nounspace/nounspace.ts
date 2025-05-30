import React, { useEffect, useRef } from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

interface MobilePreviewBackgroundProps {
  className?: string;
}

interface SparkleConfig {
  x: string;
  y: string;
  delay: string;
  color?: string;
}

const SPARKLES: SparkleConfig[] = [
  { x: "8%", y: "12%", delay: ".4s", color: "#8ce7ff" },
  { x: "32%", y: "38%", delay: "1.8s" },
  { x: "58%", y: "18%", delay: ".9s" },
  { x: "75%", y: "50%", delay: "2.2s", color: "#f9c0ff" },
  { x: "90%", y: "78%", delay: ".6s" },
  { x: "14%", y: "82%", delay: "1.3s", color: "#8ce7ff" },
];

const DOT_COLORS = ["#ffffff", "#fee684", "#ffc6ff", "#9cf6ff"];

const MobilePreviewBackground: React.FC<MobilePreviewBackgroundProps> = ({
  className,
}) => {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = dotsRef.current;
    if (!container) return;
    container.innerHTML = "";

    for (let i = 0; i < 150; i += 1) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.backgroundColor =
        DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)];
      dot.style.setProperty("--delay", `${Math.random() * 6}s`);
      dot.style.setProperty("--dur", `${8 + Math.random() * 6}s`);
      container.appendChild(dot);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className={mergeClasses("sky", className)}>
      {SPARKLES.map((s, idx) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className="sparkle"
          style={{
            "--x": s.x,
            "--y": s.y,
            "--delay": s.delay,
            "--color": s.color ?? "#ffe76d",
          } as React.CSSProperties}
        />
      ))}
      <div ref={dotsRef} />
    </div>
  );
};

export default MobilePreviewBackground;
