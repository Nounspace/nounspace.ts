import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

interface ProposalPreviewProps {
  body: string;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = memo(({ body }) => {
  const markdownComponents = useMemo(() => MarkdownRenderers(), []);

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {body}
    </ReactMarkdown>
  );
});

ProposalPreview.displayName = "ProposalPreview";

export default ProposalPreview;
