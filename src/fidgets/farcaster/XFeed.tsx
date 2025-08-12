import React, { useEffect, useMemo, useRef } from "react";

interface XFeedProps {
  Xhandle: string;
  style?: string;
}

// Cache iframes by handle and style so remounts reuse the same element
const iframeCache = new Map<string, HTMLIFrameElement>();

const buildUrl = (handle: string, theme: string) =>
  `https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}?dnt=true&embedId=twitter-widget-0&frame=false&hideBorder=true&hideFooter=false&hideHeader=false&hideScrollBar=true&lang=en&origin=https%3A%2F%2Fpublish.twitter.com%2F%23&theme=${theme}&widgetsVersion=2615f7e52b7e0%3A1702314776716`;

const XFeedComponent: React.FC<XFeedProps> = ({ Xhandle, style }) => {
  const theme = style || "light";
  const url = useMemo(() => buildUrl(Xhandle, theme), [Xhandle, theme]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = `${Xhandle}-${theme}`;
    const cachedIframe = iframeCache.get(key);

    if (containerRef.current) {
      if (cachedIframe) {
        if (cachedIframe.src !== url) {
          cachedIframe.src = url;
        }
        containerRef.current.appendChild(cachedIframe);
      } else {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.border = "none";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.title = "Twitter Feed";
        iframe.scrolling = "yes";
        iframe.frameBorder = "0";
        iframe.className = "scrollbar-none";
        iframeCache.set(key, iframe);
        containerRef.current.appendChild(iframe);
      }
    }

    return () => {
      const iframe = iframeCache.get(key);
      if (iframe && containerRef.current?.contains(iframe)) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, [Xhandle, theme, url]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export const XFeed = React.memo(XFeedComponent);
