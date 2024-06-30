import React, { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

type CustomHTMLBackgroundProps = {
  html: string;
};

const CustomHTMLBackground: React.FC<CustomHTMLBackgroundProps> = ({
  html,
}) => {
  // todo: more robust sanitization
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      FORCE_BODY: true,
      SAFE_FOR_TEMPLATES: true,
    });
  }, [html]);

  return sanitizedHtml ? (
    <iframe
      title="Custom Background"
      srcDoc={sanitizedHtml}
      className="fixed size-full pointer-events-none"
      sandbox="" // disallows scripts
    />
  ) : null;
};

export default CustomHTMLBackground;
