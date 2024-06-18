import { Draft, create as mutativeCreate } from "mutative";
import { StoreApi, create, useStore } from "zustand";
import { PersistOptions, persist, devtools } from "zustand/middleware";
import React, { ReactNode, useRef, createContext, useContext } from "react";

type MutativeFunction<T> = (draft: Draft<T>) => void;

export const mutative =
  <T>(config) =>
  (set: StoreApi<T>["setState"], get: StoreApi<T>["getState"], store: T) =>
    config((fn: MutativeFunction<T>) => set(mutativeCreate(fn)), get, store);

type StoreReset<T> = (newState: Draft<T>) => void;
export type StoreSet<T> = (fn: MutativeFunction<T>) => void | StoreReset<T>;
export type StoreGet<T> = () => T;

export function createStore<T>(
  store: (set: StoreSet<T>, get: StoreGet<T>, store: T) => T,
  persistArgs: PersistOptions<any, any>,
) {
  return create<T>()(devtools(persist(mutative(store), persistArgs)));
}

type StoreProviderProps = { children: ReactNode };

export function createStoreBindings<T = unknown>(
  storeName: string,
  createStoreFunc: () => StoreApi<T>,
) {
  const storeContext = createContext<StoreApi<T> | null>(null);

  const provider: React.FC<StoreProviderProps> = ({ children }) => {
    const storeRef = useRef<StoreApi<T>>();

    if (!storeRef.current) {
      storeRef.current = createStoreFunc();
    }

    return React.createElement(
      storeContext.Provider,
      { value: storeRef.current },
      children,
    );
  };

  function useTStore<S>(fn: (state: T) => S): S {
    const context = useContext(storeContext);

    if (!context) {
      throw new Error(
        `use${storeName} must be use within ${storeName}Provider`,
      );
    }

    return useStore(context, fn);
  }

  return {
    provider,
    context: storeContext,
    useStore: useTStore,
  };
}
