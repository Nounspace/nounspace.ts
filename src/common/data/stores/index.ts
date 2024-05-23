import { Draft, create as mutativeCreate } from 'mutative';
import { StoreApi, create, useStore } from "zustand";
import { PersistOptions, persist, devtools } from "zustand/middleware";
import React, { ReactNode, useRef, createContext, useContext } from 'react'
import { mapValues } from 'lodash';

export const mutative = (config) =>
  (set, get, store) => config(
    (fn) => set(mutativeCreate(fn)), get, store);

type StoreReset<T> = (newState: Draft<T>) => void;
export type StoreSet<T> = (fn: (draft: Draft<T>) => void) => void | StoreReset<T>;
export type StoreGet<T> = () => T;

export function createStore<T>(
  store: (set: StoreSet<T>, get: StoreGet<T>, store: T) => object,
  persistArgs: PersistOptions<any, any>,
) {
  return create<T>()(devtools(persist(mutative(store), persistArgs)));
}

type StoreProviderProps = { children: ReactNode };
type CreateStoreOpts = {
  hooks?: {
    [key: string]: () => unknown;
  };
};

export function createStoreBindings<T = unknown>(
  storeName: string,
  createStoreFunc: (hooks?) => StoreApi<T>,
  createStoreOpts?: CreateStoreOpts
) {
  const storeContext = createContext<StoreApi<T> | null>(null);

  const provider: React.FC<StoreProviderProps> = ({ children }) => {
    const storeRef = useRef<StoreApi<T>>();

    const resolvedHooks = mapValues(createStoreOpts?.hooks || {}, (hook) => hook());

    if (!storeRef.current) {
      storeRef.current = createStoreFunc(resolvedHooks);
    }
  
    return React.createElement(storeContext.Provider, { value: storeRef.current }, children);
  };

  function useTStore<S>(fn: (state: T) => S): S {
    const context = useContext(storeContext);

    if (!context) {
      throw new Error(`use${storeName} must be use within ${storeName}Provider`)
    }

    return useStore(context, fn);
  }

  return {
    provider,
    context: storeContext,
    useStore: useTStore,
  }
}