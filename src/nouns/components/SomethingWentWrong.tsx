import Link from "next/link";
import { Button } from "./ui/button";

interface SomethingWentWrongProps {
  message: string;
  returnHref: string;
}

export function SomethingWentWrong({ message, returnHref }: SomethingWentWrongProps) {
  return (
    <div className="flex h-full w-full grow flex-col items-center justify-center gap-4 p-4 text-center">
      <h2>Uh oh, something went wrong :(</h2>
      <span className="paragraph-lg">{message}</span>
      <Link href={returnHref}>
        <Button>Back to safety</Button>
      </Link>
    </div>
  );
}
