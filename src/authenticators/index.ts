interface AuthenticatorMethods {
  [key: string]: (...args: unknown[]) => Promise<unknown>;
}

interface AuthenticatorData {
  [key: string]: unknown;
}

export interface Authenticator<M extends AuthenticatorMethods, D extends AuthenticatorData> {
  methods: M;
  data: D;
  install: () => Promise<D>;
}

export function initializeAuthenticator<M extends AuthenticatorMethods, D extends AuthenticatorData>(methods: M, data: D) {

}