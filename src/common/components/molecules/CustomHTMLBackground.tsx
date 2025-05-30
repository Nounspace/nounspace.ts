import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

type CustomHTMLBackgroundProps = {
  html: string;
  className?: string;
};

const CustomHTMLBackground: React.FC<CustomHTMLBackgroundProps> = ({
  html,
  className = "fixed size-full pointer-events-none",
}) => {
  // todo: more robust sanitization
  const sanitizedHtml = useMemo(() => {
    const sanitized = DOMPurify.sanitize(html, {
      FORCE_BODY: true,
      SAFE_FOR_TEMPLATES: false,
      USE_PROFILES: {
        html: true,
        svg: true,
      },
      ALLOWED_TAGS: ["style"],
    });

    // ensure iframe content always fills its container
    const baseStyles =
      "<style>html,body{margin:0;height:100%;width:100%;}</style>";

    return `${baseStyles}${sanitized}`;
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
