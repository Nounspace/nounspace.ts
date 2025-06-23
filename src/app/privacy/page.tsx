import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

const PRIVACY_MD = `# Privacy Policy

**Coming soon.**`;

export default function PrivacyPage() {
  return (
    <div className="max-w-screen-md mx-auto p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={MarkdownRenderers()}
      >
        {PRIVACY_MD}
      </ReactMarkdown>
    </div>
  );
}
