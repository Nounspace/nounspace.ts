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
  noop,
  reject,
  tail,
} from "lodash";
import authenticators from "./authenticators";
import Modal from "@/common/components/molecules/Modal";
import moment from "moment";

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
  const [showModal, setShowModal] = useState(false);

  const authenticatorManager = useMemo<AuthenticatorManager>(
    () => ({
      callMethod: async (
        _requestingFidgetId: string,
        authenticatorId: string,
        methodName: string,
        ...args: any[]
      ): Promise<AuthenticatorManagerResponse> => {
        const authenticator = installedAuthenticators[authenticatorId];
        if (isUndefined(authenticator)) {
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
      lastUpdatedAt: moment().toISOString(),
    }),
    [authenticatorConfig, installedAuthenticators],
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
        setShowModal(true);
      }
    },
    [installedAuthenticators],
  );

  useEffect(() => {
    const authenticatorToInitializer = first(initializationQueue);
    if (!isUndefined(authenticatorToInitializer)) {
      initializeAuthentictator(authenticatorToInitializer);
    }
  }, [initializationQueue]);

  function completeInstallingCurrentInitializer() {
    setInitializationQueue(tail(initializationQueue));
    setCurrentInitializer(undefined);
    setShowModal(false);
  }

  return (
    <AuthenticatorContext.Provider value={authenticatorManager}>
      <Modal
        open={showModal}
        setOpen={noop}
        focusMode
        title={
          !isUndefined(currentInitializer)
            ? `Installing ${currentInitializer.name}`
            : ""
        }
        showClose={false}
      >
        {!isUndefined(currentInitializer) ? (
          <currentInitializer.initializer
            data={authenticatorConfig[currentInitializer.id].data}
            saveData={saveSingleAuthenticatorData(
              authenticatorConfig,
              currentInitializer.id,
              authenticatorConfig[currentInitializer.id],
            )}
            done={completeInstallingCurrentInitializer}
          />
        ) : null}
      </Modal>
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
