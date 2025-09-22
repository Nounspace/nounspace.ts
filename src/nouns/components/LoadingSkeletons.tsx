import { HTMLAttributes } from "react";
import { Skeleton } from "./ui/skeleton";

interface LoadingSkeletonsProps extends HTMLAttributes<HTMLDivElement> {
  count: number;
}

export default function LoadingSkeletons({
  count,
  ...props
}: LoadingSkeletonsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton {...props} key={i} />
      ))}
    </>
  );
}
