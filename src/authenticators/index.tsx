import React from "react";

interface AuthenticatorMethods {
  [key: string]: (...args: unknown[]) => Promise<unknown>;
}

interface AuthenticatorData {
  [key: string]: unknown;
}

// export interface Authenticator<M extends AuthenticatorMethods, D extends AuthenticatorData> {
//   methods: M;
//   data: D;
//   install: () => Promise<D>;
// }

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