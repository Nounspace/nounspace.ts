import 'framer-motion';

declare module 'framer-motion' {
  namespace Reorder {
    interface GroupProps<V> {
      onReorderEnd?: () => void;
    }
  }
}
