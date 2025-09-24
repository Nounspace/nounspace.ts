import Link from "next/link";
import { Button } from "@nouns/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex grow flex-col items-center justify-center gap-2 p-4">
      <h2>404 - Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
