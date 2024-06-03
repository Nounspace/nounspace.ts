import { mapValues } from "lodash";
import React, { forwardRef, useImperativeHandle } from "react";

type SaveDataFunction<D> = (data: D) => Promise<void>;

type AuthenticatorMethod = (...args: any[]) => Promise<unknown>;

export type AuthenticatorMethodWrapper<
  F extends AuthenticatorMethod,
  D extends AuthenticatorData
> = (data: D, saveData: SaveDataFunction<D>) => F;

type AuthenticatorMethodsWithData<M> = {
  [T in keyof M]: M[T] extends AuthenticatorMethodWrapper<infer F, any> ? F : never;
};

export interface AuthenticatorMethods<D extends AuthenticatorData> {
  [key: string]: AuthenticatorMethodWrapper<AuthenticatorMethod, D>;
}

export interface AuthenticatorData {
  [key: string]: unknown;
}

type AuthenticatorProps<D extends AuthenticatorData> = {
  data: D;
  saveData: SaveDataFunction<D>;
}

export type AuthenticatorInitializer<D> = React.FC<{data: D, saveData: SaveDataFunction<D>, done: () => void}>;

type AuthenticatorArgs<D> = { data: D, saveData: SaveDataFunction<D>};

export function makeAuthenticatorMethods<
  D extends AuthenticatorData,
  M extends AuthenticatorMethods<D>
>(methods: M, args: AuthenticatorArgs<D>): AuthenticatorMethodsWithData<M> {
  return mapValues(methods, (m) => m(args.data, args.saveData)) as AuthenticatorMethodsWithData<M>;
}

export type AuthenticatorRef<D extends AuthenticatorData, M extends AuthenticatorMethods<D>> = (
  AuthenticatorMethodsWithData<M> & { initializer: AuthenticatorInitializer<D> }
);

export function createAuthenticator<D extends AuthenticatorData, M extends AuthenticatorMethods<D>>(
  name: string,
  methods: M,
  initializerComponent: AuthenticatorInitializer<D>,
 ) {
  const authenticator = forwardRef<
    AuthenticatorRef<D, M>,
    AuthenticatorProps<D>
  >((
    args: AuthenticatorArgs<D>,
    ref
  ) => {
    useImperativeHandle(ref, () => {
      return {
        ...makeAuthenticatorMethods(methods, args),
        initializer: initializerComponent,
      };
    }, [args.data]);

    return null;
  });
  authenticator.displayName = name;
  return authenticator;
}

type AuthenticatorManagerProviderProps = {
  children: React.ReactNode;
};

export const AuthenticatorManagerProvider: React.FC<AuthenticatorManagerProviderProps> = ({ children }) => {

  return (
    <>
      { children }
    </>
  );
};