import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

type CustomHTMLBackgroundProps = {
  html: string;
  className?: string;
  noSanitize?: boolean;
};

const CustomHTMLBackground: React.FC<CustomHTMLBackgroundProps> = ({
  html,
  className = "fixed size-full pointer-events-none",
  // TODO: remove noSanitize prop
  noSanitize = false,
}) => {
  // todo: more robust sanitization
const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      FORCE_BODY: true,
      SAFE_FOR_TEMPLATES: false,
      USE_PROFILES: {
        html: true,
        svg: true,
      },
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
