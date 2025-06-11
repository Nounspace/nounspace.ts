import { mergeClasses as classNames } from "@/common/lib/utils/mergeClasses";
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface IntersectionOptions {
  rootMargin?: string;
  threshold?: number | number[];
  root?: Element | Document | null;
}

export const useIntersectionObserver = (options: IntersectionOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Extract individual properties to avoid stability issues with the object reference
  const { rootMargin, threshold, root } = options;
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { rootMargin, threshold, root });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, root]);

  return { ref, isIntersecting };
};

const LazyImageComponent = ({ 
  src, 
  alt, 
  className = '', 
  onLoad, 
  onError,
  referrerPolicy,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt?: string;
  className?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  referrerPolicy?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, isIntersecting: isVisible } = useIntersectionObserver({
    rootMargin: '200px', 
    threshold: 0.1,
  });

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  
  const placeholder = useMemo(() => {
   // We convert to number explicitly to avoid type errors
    const heightNum = props.height ? Number(props.height) : 0;
    const widthNum = props.width ? Number(props.width) : 0;
    
    const ratio = (heightNum && widthNum) ? (heightNum / widthNum * 100) : 56.25; 
    return (
      <div
        className={classNames(
          'bg-gray-200 animate-pulse rounded overflow-hidden',
          className
        )}
        style={{
          paddingBottom: `${ratio}%`,
          width: '100%',
          height: props.height ? `${props.height}px` : 'auto',
        }}
      />
    );
  }, [props.height, props.width, className]);

  return (
    <div ref={ref} className="relative">
      {(!isVisible || !loaded) && placeholder}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={classNames(
            className,
            !loaded ? 'opacity-0 absolute top-0 left-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={onError}
          referrerPolicy={referrerPolicy}
          {...props}
        />
      )}
    </div>
  );
};

export const LazyImage = React.memo(LazyImageComponent);
LazyImage.displayName = 'LazyImage';