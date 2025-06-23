import fs from "fs";
import path from "path";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

export default function TermsPage() {
  const TERMS_MD = fs.readFileSync(
    path.join(process.cwd(), "src/app/terms/terms.md"),
    "utf8",
  );
  return (
    <div className="max-w-screen-md mx-auto p-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={MarkdownRenderers()}
      >
        {TERMS_MD}
      </ReactMarkdown>
    </div>
  );
}
