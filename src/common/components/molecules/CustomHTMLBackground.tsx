import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

type CustomHTMLBackgroundProps = {
  html: string;
  className?: string;
};

const CustomHTMLBackground: React.FC<CustomHTMLBackgroundProps> = ({
  html,
  className = "fixed inset-0 w-full h-full pointer-events-none z-0",
}) => {
  // todo: more robust sanitization
  const sanitizedHtml = useMemo(() => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      FORCE_BODY: true,
      SAFE_FOR_TEMPLATES: false,
      USE_PROFILES: {
        html: true,
        svg: true,
      },
      ALLOWED_TAGS: ["style", "div", "html", "head", "body"],
    });
  }, [html]);

  return sanitizedHtml ? (
    <iframe
      title="Custom Background"
      srcDoc={sanitizedHtml}
      className={className}
      sandbox="" // disallows scripts
    />
  ) : null;
};

export default CustomHTMLBackground;
