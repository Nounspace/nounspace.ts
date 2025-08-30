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
    [onExpand]
  );

  useEffect(() => {
    if (!maxLines) return;

    const computeMaxHeight = () => {
      if (textRef.current) {
        const lineHeight = Math.ceil(parseFloat(window.getComputedStyle(textRef.current).lineHeight));
        // Fix: If lineHeight calculation fails or returns invalid value, use a fallback
        const validLineHeight = isNaN(lineHeight) || lineHeight <= 0 ? 20 : lineHeight;
        const calculatedMaxHeight = validLineHeight * maxLines;
        // Additional safety check: don't set maxHeight to 0 or very small values
        if (calculatedMaxHeight > 10) {
          setMaxHeight(`${calculatedMaxHeight}px`);
        } else {
          setMaxHeight("none"); // Fallback to no height restriction
        }
      }
    };

    const checkOverflow = () => {
      if (textRef.current) {
        const { scrollHeight, clientHeight } = textRef.current;
        setOverflow(scrollHeight > clientHeight);
      }
    };

    // Add a small delay to ensure the element is properly rendered
    const timer = setTimeout(() => {
      computeMaxHeight();
      checkOverflow();
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      computeMaxHeight();
      checkOverflow();
    });
    if (textRef.current) resizeObserver.observe(textRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [maxLines]);

  if (!maxLines) {
    return <span>{children}</span>;
  }

  return (
    <>
      <span ref={textRef} className="overflow-hidden block" style={{ maxHeight }}>
        {children}
      </span>
      {overflow && (
        <span onClick={handleShowMore} className="hover:underline text-blue-500 block">
          {expandButtonText}
        </span>
      )}
    </>
  );
};

export default ExpandableText;
