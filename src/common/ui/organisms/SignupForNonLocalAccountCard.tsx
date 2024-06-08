import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/ui/atoms/card";
import { Button } from "@/common/ui/atoms/button";
import { openWindow } from "@/common/lib/utils/navigation";
import { WEBSITE_URL } from "@/constants/app";

const SignupForNonLocalAccountCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex">
          You are using a readonly account{" "}
          <ArrowDownTrayIcon className="ml-2 mt-1 w-6 h-6" />
        </CardTitle>
        <CardDescription>
          A readonly account is great for browsing, but you need a full account
          to start casting and interact with others on Farcaster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          className="w-full"
          variant="default"
          onClick={() => openWindow(`${WEBSITE_URL}/login`)}
        >
          Switch to a full account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignupForNonLocalAccountCard;
