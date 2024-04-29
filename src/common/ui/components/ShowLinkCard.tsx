import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/ui/atoms/card";
import { Button } from "@/common/ui/atoms/button";
import { Label } from "@/common/ui/atoms/label";
import { Input } from "@/common/ui/atoms/input";
import { openWindow } from "../../lib/utils/navigation";

type ShowLinkCardProps = {
  title: string;
  description: string;
  link: string;
  buttonLabel: string;
};

const ShowLinkCard = ({
  title,
  description,
  link,
  buttonLabel,
}: ShowLinkCardProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex">
        <Label htmlFor="link" className="sr-only">
          Link
        </Label>
        <Input id="link" value={link} readOnly className="mr-2" />
        <Button
          variant="secondary"
          className="shrink-0"
          onClick={() => openWindow(link)}
        >
          {buttonLabel}
        </Button>
      </div>
    </CardContent>
  </Card>   
);

export default ShowLinkCard;
