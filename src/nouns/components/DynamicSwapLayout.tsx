import LoadingSpinner from "@nouns/components/LoadingSpinner";
import { Button } from "@nouns/components/ui/button";
import { Suspense } from "react";
import ProgressCircle from "./ProgressCircle";
import Link from "next/link";

interface DynamicSwapLayoutProps {
  currentStep: number;
  numSteps: number;
  title: string;
  subtitle: string;
  backButtonHref: string;
  children: React.ReactNode;
}

export default function DynamicSwapLayout({
  currentStep,
  numSteps,
  title,
  subtitle,
  backButtonHref,
  children,
}: DynamicSwapLayoutProps) {
  return (
    <div className="flex w-full grow flex-col pb-[env(safe-area-inset-bottom)]">
      <div className="bg-background-secondary">
        <div className="relative flex flex-row justify-between px-6 py-5 md:px-10">
          <Suspense fallback={<LoadingSpinner />}>
            <Link href={backButtonHref}>
              <Button variant="secondary" className="py-[10px]">
                Back
              </Button>
            </Link>
          </Suspense>
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row items-center justify-center gap-[7px]">
            {numSteps > 1 &&
              Array(numSteps)
                .fill(0)
                .map((_, i) => (
                  <ProgressCircle
                    state={
                      currentStep > i + 1
                        ? "completed"
                        : currentStep == i + 1
                          ? "active"
                          : "todo"
                    }
                    key={i}
                  />
                ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 pb-10 text-center md:px-10">
          <h1>{title}</h1>
          <div>{subtitle}</div>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}
