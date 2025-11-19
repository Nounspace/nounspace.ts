import React from "react";

interface ArticleEmbedProps {
  url: string;
}

const MAX_EMBED_HEIGHT = 600;
const MAX_EMBED_WIDTH = 500;

const ArticleEmbed: React.FC<ArticleEmbedProps> = ({ url }) => {
  return (
      <iframe
        src={url}
        title={url}
        style={{ width: MAX_EMBED_WIDTH, height: MAX_EMBED_HEIGHT, border: "none" }}
        allowFullScreen
      />
  );
};

export default ArticleEmbed;
