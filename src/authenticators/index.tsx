import { mapValues } from "lodash";
import React, { forwardRef, useImperativeHandle } from "react";

type SaveDataFunction<D> = (data: D) => Promise<void>;

export type AuthenticatorMethod = (...args: any[]) => Promise<unknown>;

export type AuthenticatorMethodWrapper<
  F extends AuthenticatorMethod,
  D extends AuthenticatorData,
> = (data: D, saveData: SaveDataFunction<D>) => F;

type AuthenticatorMethodsWithData<M> = {
  [T in keyof M]: M[T] extends AuthenticatorMethodWrapper<infer F, any>
    ? F
    : never;
};

export interface AuthenticatorMethods<D extends AuthenticatorData> {
  isReady: AuthenticatorMethodWrapper<() => Promise<boolean>, D>;
  [key: string]: AuthenticatorMethodWrapper<AuthenticatorMethod, D>;
}

export interface AuthenticatorData {
  [key: string]: unknown;
}

type AuthenticatorProps<D extends AuthenticatorData> = {
  data: D;
  saveData: SaveDataFunction<D>;
};

export type AuthenticatorInitializer<D> = React.FC<{
  data: D;
  saveData: SaveDataFunction<D>;
  done: () => void;
}>;

type AuthenticatorArgs<D> = { data: D; saveData: SaveDataFunction<D> };

export function makeAuthenticatorMethods<
  D extends AuthenticatorData,
  M extends AuthenticatorMethods<D>,
>(methods: M, args: AuthenticatorArgs<D>): AuthenticatorMethodsWithData<M> {
  return mapValues(methods, (m) =>
    m(args.data, args.saveData),
  ) as AuthenticatorMethodsWithData<M>;
}

export type AuthenticatorRef<
  D extends AuthenticatorData,
  M extends AuthenticatorMethods<D>,
> = AuthenticatorMethodsWithData<M> & {
  initializer: AuthenticatorInitializer<D>;
};

export type AuthenticatorComponent<
  D extends AuthenticatorData,
  M extends AuthenticatorMethods<D>,
> = React.ForwardRefExoticComponent<
  AuthenticatorProps<D> & React.RefAttributes<AuthenticatorRef<D, M>>
>;

export function createAuthenticator<
  D extends AuthenticatorData,
  M extends AuthenticatorMethods<D>,
>(
  name: string,
  methods: M,
  initializerComponent: AuthenticatorInitializer<D>,
): AuthenticatorComponent<D, M> {
  /**
   * This is a code factor function that takes in the methods that a specific
   * This is a code factory function that takes in the methods that a specific
   * authenticator needs to function, and turns it into a component that
   * the AuthenticatorManager can add to the DOM and reference.
   * Because the AuthenticatorManager tracks these components with React refs,
   * it builds a Component that is wrapped in forwardRef and then uses
   * useImperativeHandle, since there are no DOM elements related to this component
   * @param  {String} name  Name of the Authenticator that is being made
   * @param  {M} methods  The methods that a developer can call for this authenticator
   * @param  {AuthenticatorInitializer<D>} initializerComponent A component that allows the user
   * to register sensative data for the Authenticator
   * @return {AuthenticatorComponent<D, M>}  A component that can be used
   */
  const authenticator = forwardRef<
    AuthenticatorRef<D, M>,
    AuthenticatorProps<D>
  >((args: AuthenticatorArgs<D>, ref) => {
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
