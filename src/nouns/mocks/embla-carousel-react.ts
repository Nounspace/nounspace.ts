// Mock implementation for embla-carousel-react
import React from 'react';

export type UseEmblaCarouselType = [any, any];

const useEmblaCarousel = () => [
  {
    emblaRef: null,
    scrollPrev: () => {},
    scrollNext: () => {},
    canScrollPrev: false,
    canScrollNext: false,
  },
  null
];

export default useEmblaCarousel;
export { useEmblaCarousel };

export const EmblaCarousel = ({ children, ...props }: any) => React.createElement('div', props, children);
