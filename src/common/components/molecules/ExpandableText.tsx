import React, { useState, useEffect, useCallback, useRef } from "react";

interface ExpandableTextProps {
  children: React.ReactElement;
  maxLines: number | null;
  onExpand?: () => void;
  expandButtonText?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  children,
  maxLines,
  onExpand,
  expandButtonText = "Show More",
}) => {
  const [overflow, setOverflow] = useState(false);
  const [maxHeight, setMaxHeight] = useState("none");
  const textRef = useRef(null);

  const handleShowMore = useCallback(
    (e) => {
      if (onExpand) {
        e.stopPropagation();
        onExpand();
      }
    },
    [onExpand],
  );

  useEffect(() => {
    if (!maxLines) return;

    const computeMaxHeight = () => {
      if (textRef.current) {
        const lineHeight = Math.ceil(
          parseFloat(window.getComputedStyle(textRef.current).lineHeight),
        );
        setMaxHeight(`${lineHeight * maxLines}px`);
      }
    };

    const checkOverflow = () => {
      if (textRef.current) {
        const { scrollHeight, clientHeight } = textRef.current;
        setOverflow(scrollHeight > clientHeight);
      }
    };

    computeMaxHeight();
    checkOverflow();

    const resizeObserver = new ResizeObserver(() => {
      computeMaxHeight();
      checkOverflow();
    });
    if (textRef.current) resizeObserver.observe(textRef.current);

    return () => resizeObserver.disconnect();
  }, [maxLines]);

  if (!maxLines) {
    return <span>{children}</span>;
  }

  return (
    <>
      <span
        ref={textRef}
        className="overflow-hidden block"
        style={{ maxHeight }}
      >
        {children}
      </span>
      {overflow && (
        <span
          onClick={handleShowMore}
          className="hover:underline text-blue-500 block"
        >
          {expandButtonText}
        </span>
      )}
    </>
  );
};

export default ExpandableText;
