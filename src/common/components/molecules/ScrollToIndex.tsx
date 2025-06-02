import React, { useLayoutEffect, useRef } from "react";

type ScrollToIndexProps = {
  children?: React.ReactNode;
  scrollToIndex?: number;
  extraHeight?: number;
};
const ScrollToIndex = ({
  children,
  scrollToIndex = 0,
  extraHeight = 0,
}: ScrollToIndexProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current && contentRef.current && targetRef.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      const target = targetRef.current;

      // Ensure a minimum content height to allow scrolling to the top of the target element
      const targetOffset = target.offsetTop;
      const curContentHeight = content.clientHeight;
      const minContentHeight = container.clientHeight + targetOffset;
      const addContentHeight = Math.max(0, minContentHeight - curContentHeight);

      content.style.paddingBottom = `${addContentHeight + extraHeight}px`;

      // Set the scroll position to the top of the target element
      container.scrollTop = targetOffset;
    }
  }, [scrollToIndex]);

  const childArray = React.Children.toArray(children);

  return (
    <div ref={containerRef} className="size-full overflow-y-auto relative">
      <div ref={contentRef}>
        {childArray.map((item, index) => (
          <div key={index} ref={index === scrollToIndex ? targetRef : null}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollToIndex;
