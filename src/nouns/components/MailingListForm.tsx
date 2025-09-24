"use client";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import LoadingSpinner from "./LoadingSpinner";
import { Check, X } from "lucide-react";

export default function MailingListForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email");

    if (email) {
      setState("loading");

      try {
        const formBody = `email=${encodeURIComponent(email.toString())}&mailingLists=${encodeURIComponent("cm5mzdts7001j0ljjdcl0ag6r")}`;

        const resp = await fetch(
          "https://app.loops.so/api/newsletter-form/cm5mxio0500j6ee13ksumcwsl",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody,
          },
        );

        if (resp.ok) {
          const data = await resp.json();
          setState("success");
        } else {
          console.error(
            `Failed to add to mailing list:`,
            resp.statusText,
            await resp.text(),
          );
          setState("error");
        }
      } catch (err) {
        console.error(`Fetch error add to mailing list:`, err);
        setState("error");
      }
    }
  }

  const buttonContent = useMemo(() => {
    switch (state) {
      case "idle":
        return "Sign up";
      case "loading":
        return <LoadingSpinner size={20} />;
      case "success":
        return <Check size={20} />;
      case "error":
        return <X size={20} />;
    }
  }, [state]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Input
        type="email"
        name="email"
        placeholder="Your email address"
        required
      />
      <Button
        type="submit"
        variant="positive"
        disabled={state != "idle"}
        className="w-[111px]"
      >
        {buttonContent}
      </Button>
    </form>
  );
}
