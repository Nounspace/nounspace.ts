import { useState } from "react";
import { useEditor as useTiptap } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import suggestion from "@tiptap/suggestion";
import { Channel, FarcasterEmbed } from "./types";

interface UseTiptapEditorProps {
  onSubmit: () => Promise<boolean>;
}

export function useTiptapEditor({ onSubmit }: UseTiptapEditorProps) {
  const [embeds, setEmbeds] = useState<FarcasterEmbed[]>([]);
  const [channel, setChannel] = useState<Channel | null>(null);

  const editor = useTiptap({
    extensions: [
      StarterKit,
      Link,
      Placeholder,
      Mention.configure({
        suggestion: suggestion({
          items: () => [],
        }),
      }),
    ],
  });

  const getText = () => editor?.getText() ?? "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit();
  };

  return {
    editor,
    getText,
    setText: (text: string) => editor?.commands.setContent(text),
    addEmbed: (embed: FarcasterEmbed) => setEmbeds((prev) => [...prev, embed]),
    getEmbeds: () => embeds,
    setEmbeds,
    setChannel,
    getChannel: () => channel,
    handleSubmit,
  };
}
