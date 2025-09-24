import { cn } from "@nouns/utils/shadcn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[12px] bg-gray-100 dark:bg-gray-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
