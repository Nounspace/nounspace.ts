import React, { useEffect, useMemo, useRef } from "react";

interface XFeedProps {
  Xhandle: string;
  style?: string;
}

const XFeedComponent: React.FC<XFeedProps> = ({ Xhandle, style }) => {
  const url = useMemo(() => {
    const theme = style || "light";
    return `https://syndication.twitter.com/srv/timeline-profile/screen-name/${Xhandle}?dnt=true&embedId=twitter-widget-0&frame=false&hideBorder=true&hideFooter=false&hideHeader=false&hideScrollBar=true&lang=en&origin=https%3A%2F%2Fpublish.twitter.com%2F%23&theme=${theme}&widgetsVersion=2615f7e52b7e0%3A1702314776716`;
  }, [Xhandle, style]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const srcRef = useRef(url);

  useEffect(() => {
    if (srcRef.current !== url && iframeRef.current) {
      iframeRef.current.src = url;
      srcRef.current = url;
    }
  }, [url]);

  return (
    <iframe
      ref={iframeRef}
      src={srcRef.current}
      style={{ border: "none", width: "100%", height: "100%" }}
      title="Twitter Feed"
      scrolling="yes"
      frameBorder="0"
      className="scrollbar-none"
    />
  );
};

export const XFeed = React.memo(XFeedComponent);
