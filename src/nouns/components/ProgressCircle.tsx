import { twMerge } from "tailwind-merge";

interface ProgressCircleProps {
  state: "active" | "completed" | "todo";
}

export default function ProgressCircle({ state }: ProgressCircleProps) {
  return (
    <div
      className={twMerge(
        "h-3 w-3 rounded-full bg-background-disabled",
        state == "active" && "bg-semantic-accent ring-4 ring-semantic-accent-light",
        state == "completed" && "bg-semantic-accent"
      )}
    ></div>
  );
}
