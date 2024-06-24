import React, { useMemo } from "react";
import styled from "@emotion/styled";
import DOMPurify from "isomorphic-dompurify";

const StyledIframe = styled.iframe`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100vh;
`;

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
    <StyledIframe
      title="Custom Background"
      srcDoc={sanitizedHtml}
      sandbox="" // disallows scripts
    />
  ) : null;
};

export default CustomHTMLBackground;
