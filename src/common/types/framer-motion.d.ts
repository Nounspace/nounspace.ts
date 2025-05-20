import 'framer-motion';

declare module 'framer-motion' {
  interface Props<T> {
    onReorderEnd?: () => void;
  }
}

export {};
