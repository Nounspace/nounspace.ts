import { useState, useCallback } from "react";

export const useLifoQueue = <T>(
  initialValue: T[] = [],
): {
  push: (element: T) => void;
  pop: () => T | undefined;
  clear: () => void;
  first: T | undefined;
  last: T | undefined;
  prev: T | undefined;
  queue: T[];
} => {
  const [queue, setQueue] = useState<T[]>(initialValue);

  const push = useCallback((element: T) => {
    setQueue((prevQueue) => [...prevQueue, element]);
  }, []);

  const pop = useCallback(() => {
    let removedElement: T | undefined = undefined;

    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      const newQueue = [...prevQueue];
      removedElement = newQueue.pop();
      return newQueue;
    });

    return removedElement;
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
  }, []);

  const first = queue.length === 0 ? undefined : queue[0];
  const last = queue.length === 0 ? undefined : queue[queue.length - 1];
  const prev = queue.length <= 1 ? undefined : queue[queue.length - 2];

  return { push, pop, clear, first, last, prev, queue };
};

export default useLifoQueue;
