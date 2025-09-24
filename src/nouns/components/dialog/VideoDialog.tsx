"use client";
import { ReactNode } from "react";
import ReactPlayer from "react-player";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@nouns/components/ui/dialogBase";

interface VideoDialogProps {
  videoUrl: string;
  children: ReactNode;
}

export default function VideoDialog({ children, videoUrl }: VideoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="aspect-video h-auto w-full max-w-[min(860px,95%)] overflow-hidden border-0 bg-black p-0">
        <div className="h-full w-full">
          <ReactPlayer
            url={videoUrl}
            playing
            controls
            width="100%"
            height="100%"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
