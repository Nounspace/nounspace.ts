"use client";
import NumberFlow from "@number-flow/react";
import clsx from "clsx";
import { HTMLAttributes } from "react";

export default function DataMetric({
  label,
  value,
  unit,
  className,
  ...props
}: {
  label: string;
  value: number;
  unit?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "flex w-fit flex-col items-center justify-center place-self-center text-center",
        className,
      )}
      {...props}
    >
      <span className="heading-2">
        {unit}
        <NumberFlow
          value={value}
          format={{
            notation: value > 9999 || value < -9999 ? "compact" : "standard",
          }}
        />
      </span>
      <span className="text-content-secondary label-md">{label}</span>
    </div>
  );
}
