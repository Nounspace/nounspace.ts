import { twMerge } from "tailwind-merge";
import Icon from "./ui/Icon";
import React, { SVGProps } from "react";
interface LoadingProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export default function LoadingSpinner({ size, ...props }: LoadingProps) {
  return (
    <div className="h-fit w-fit self-center">
      <Icon
        {...props}
        icon="spinner"
        size={size ?? 60}
        className={twMerge("flex w-full animate-spin justify-center", props.className)}
      />
    </div>
  );
}
