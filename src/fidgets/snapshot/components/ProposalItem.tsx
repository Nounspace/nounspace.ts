// src/components/ProposalItem.tsx

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/common/lib/utils/markdownRenderers";

interface ProposalItemProps {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const ProposalItem: React.FC<ProposalItemProps> = ({
  proposal,
  isExpanded,
  onToggleExpand,
}) => {
  const extractImageUrl = (markdown: string): string | null => {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = imageRegex.exec(markdown);
    return match ? match[1] : null;
  };

  const [avatarUrl, setAvatarUrl] = useState<string>(
    extractImageUrl(proposal.body) || "/images/noggles.svg",
  );

  const handleError = () => {
    setAvatarUrl("/images/noggles.svg"); // Fallback placeholder image
  };

  return (
    <div className="flex flex-row p-4 border border-gray-200 rounded-lg mb-1">
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-16 h-16 rounded-md mr-4"
        onError={handleError}
      />
      <div className="flex flex-col">
        <h4
          className="font-bold cursor-pointer"
          onClick={() => onToggleExpand(proposal.id)}
        >
          {proposal.title}
        </h4>
        {isExpanded && (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={MarkdownRenderers}
          >
            {proposal.body}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ProposalItem;
