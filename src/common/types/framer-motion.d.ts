import 'framer-motion';

declare module 'framer-motion' {
  namespace Reorder {
    interface Props<V> {
      onReorderEnd?: () => void;
    }
  }
}
