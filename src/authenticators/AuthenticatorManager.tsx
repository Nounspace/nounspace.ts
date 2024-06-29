import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthenticatorCreatorFunction,
  AuthenticatorData,
  AuthenticatorInitializer,
  AuthenticatorMethods,
} from ".";
import {
  concat,
  first,
  fromPairs,
  get,
  isNull,
  isUndefined,
  map,
  mapValues,
  reject,
  tail,
} from "lodash";
import authenticators from "./authenticators";
import moment from "moment";
import { useAppStore } from "@/common/data/stores/app";

type AuthenticatorPermissions = {
  [fidgetId: string]: string[];
};

type SingleAuthenticatorConfig = {
  data: AuthenticatorData;
  permissions: AuthenticatorPermissions;
};

export type AuthenticatorConfig = {
  [authenticatorId: string]: SingleAuthenticatorConfig;
};

type AuthenticatorManagerProviderProps = {
  children: React.ReactNode;
  authenticatorConfig: AuthenticatorConfig;
  saveAuthenticatorConfig: (newConfig: AuthenticatorConfig) => Promise<void>;
};

type AuthenticatorManagerAllowedResponse<R = unknown> = {
  result: "success";
  value: R;
};
type AuthenticatorManagerDeniedResponse = {
  result: "error";
  reason: "denied";
};
type AuthenticatorManagerFailedResponse = {
  result: "error";
  reason: "failed";
  value: unknown; // Place the error that the method resulted in here
};
type AuthenticatorManagerUnknownMethodResponse = {
  result: "error";
  reason: "unknownMethod";
};

type AuthenticatorManagerResponse =
  | AuthenticatorManagerAllowedResponse
  | AuthenticatorManagerFailedResponse
  | AuthenticatorManagerDeniedResponse
  | AuthenticatorManagerUnknownMethodResponse;

// TO DO: Define FidgetId Type (with information about UUID + Space is installed in + Fidget Name)

export type AuthenticatorManager = {
  // If Authenticator is not initialized, will always return denied
  callMethod: (
    requestingFidgetId: string,
    authenticatorId: string,
    methodName: string,
    ...args: any[]
  ) => Promise<AuthenticatorManagerResponse>;
  initializeAuthenticators: (authenticatorIds: string[]) => void;
  getInitializedAuthenticators: () => Promise<string[]>;
  installAuthenticators: (authenticatorIds: string[]) => Promise<void>;
  CurrentInitializerComponent?: React.FC;
  lastUpdatedAt: string;
};

const AuthenticatorContext = createContext<AuthenticatorManager | null>(null);

function authenticatorForName(
  name: string,
):
  | AuthenticatorCreatorFunction<
      AuthenticatorData,
      AuthenticatorMethods<AuthenticatorData>
    >
  | undefined {
  const lookups = name.replace(":", ".");
  return get(authenticators, lookups);
}

export const AuthenticatorManagerProvider: React.FC<
  AuthenticatorManagerProviderProps
> = ({ authenticatorConfig, saveAuthenticatorConfig, children }) => {
  function saveSingleAuthenticatorData(
    parentConfig: AuthenticatorConfig,
    authenticatorId: string,
    config: SingleAuthenticatorConfig,
  ) {
    return (data: AuthenticatorData) =>
      saveAuthenticatorConfig({
        ...parentConfig,
        [authenticatorId]: {
          permissions: config.permissions,
          data,
        },
      });
  }

  const installedAuthenticators = useMemo(() => {
    return mapValues(authenticatorConfig, (config, authenticatorId) => {
      const auth = authenticatorForName(authenticatorId);
      if (isUndefined(auth)) {
        return auth;
      }
      return auth({
        data: config.data,
        saveData: saveSingleAuthenticatorData(
          authenticatorConfig,
          authenticatorId,
          config,
        ),
      });
    });
  }, [authenticatorConfig]);

  const [currentInitializer, setCurrentInitializer] = useState<{
    initializer: AuthenticatorInitializer<AuthenticatorData>;
    name: string;
    id: string;
  }>();
  const [initializationQueue, setInitializationQueue] = useState<string[]>([]);

  const {
    setup: { setModalOpen, modalOpen },
  } = useAppStore((state) => state);

  const authenticatorManager = useMemo<AuthenticatorManager>(
    () => ({
      callMethod: async (
        requestingFidgetId: string,
        authenticatorId: string,
        methodName: string,
        ...args: any[]
      ): Promise<AuthenticatorManagerResponse> => {
        const authenticator = installedAuthenticators[authenticatorId];
        if (isUndefined(authenticator)) {
          // Open the modal if a Fidget requests info
          // Don't do it if Nav does
          // THIS IS A HACK
          // TO DO: When adding permissioning
          // Allow client requests to not open modal
          // While Fidget requests will
          if (!modalOpen && requestingFidgetId !== "navigation") {
            setModalOpen(true);
          }
          return {
            result: "error",
            reason: "denied",
          };
        }
        // const allowedMethods =
        //   authenticatorConfig[authenticatorId].permissions[requestingFidgetId] || [];
        // if (!includes(allowedMethods, methodName)) {
        //   return {
        //     result: "error",
        //     reason: "denied",
        //   } as AuthenticatorManagerDeniedResponse;
        // }
        try {
          const method = authenticator.methods[methodName];
          if (isUndefined(method)) {
            return {
              result: "error",
              reason: "unknownMethod",
            };
          }
          return {
            result: "success",
            value: await method(...args),
          };
        } catch (e) {
          return {
            result: "error",
            reason: "failed",
            value: e,
          };
        }
      },
      getInitializedAuthenticators: async () => {
        return reject(
          await Promise.all(
            map(installedAuthenticators, async (auth, name) => {
              if (isUndefined(auth)) {
                return null;
              }
              const isReady = await auth.methods.isReady();
              return isReady ? name : null;
            }),
          ),
          (i) => isNull(i),
        ) as string[];
      },
      installAuthenticators: async (authenticatorIds) => {
        await saveAuthenticatorConfig({
          ...fromPairs(
            map(authenticatorIds, (name) => [
              name,
              { data: {}, permissions: {} },
            ]),
          ),
          ...authenticatorConfig,
        });
      },
      initializeAuthenticators: (authenticatorIds) => {
        setInitializationQueue(concat(initializationQueue, authenticatorIds));
      },
      CurrentInitializerComponent: () =>
        currentInitializer && (
          <currentInitializer.initializer
            data={authenticatorConfig[currentInitializer.id].data}
            saveData={saveSingleAuthenticatorData(
              authenticatorConfig,
              currentInitializer.id,
              authenticatorConfig[currentInitializer.id],
            )}
            done={completeInstallingCurrentInitializer}
          />
        ),
      lastUpdatedAt: moment().toISOString(),
    }),
    [authenticatorConfig, installedAuthenticators, currentInitializer],
  );

  const initializeAuthentictator = useCallback(
    async (authenticatorId: string) => {
      const authenticator = installedAuthenticators[authenticatorId];
      if (
        isUndefined(authenticator) ||
        (await authenticator.methods.isReady())
      ) {
        setInitializationQueue(tail(initializationQueue));
        return;
      } else {
        setCurrentInitializer({
          initializer: authenticator.initializer,
          name: authenticator.name,
          id: authenticatorId,
        });
      }
    },
    [installedAuthenticators],
  );

  useEffect(() => {
    const authenticatorToInitialize = first(initializationQueue);
    if (!isUndefined(authenticatorToInitialize)) {
      initializeAuthentictator(authenticatorToInitialize);
    }
  }, [initializationQueue]);

  function completeInstallingCurrentInitializer() {
    setInitializationQueue(tail(initializationQueue));
    setCurrentInitializer(undefined);
  }

  return (
    <AuthenticatorContext.Provider value={authenticatorManager}>
      {children}
    </AuthenticatorContext.Provider>
  );
};

export function useAuthenticatorManager() {
  const context = useContext(AuthenticatorContext);

  if (!context) {
    throw new Error(
      `useAuthenticatorManager must be use within AuthenticatorManagerProvider`,
    );
  }

  return context;
}
