import React, { createContext, useContext, useRef } from "react";
import {
  AuthenticatorComponent,
  AuthenticatorData,
  AuthenticatorMethod,
  AuthenticatorMethods,
  AuthenticatorRef,
} from ".";
import {
  get,
  includes,
  isNull,
  isUndefined,
  map,
  mapValues,
  pickBy,
} from "lodash";
import authenticators from "./authenticators";

type AuthenticatorPermissions = {
  [fidgetId: string]: string[];
};

type AuthenticatorConfig = {
  [authenticatorName: string]: {
    data: AuthenticatorData;
    permissions: AuthenticatorPermissions;
  };
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

type AuthenticatorPermissionRequest = {
  authenticatorName: string;
  methods: {
    required: boolean;
    name: string;
    description?: string;
  }[];
};

type AuthenticatorPermissionResponse = {
  authenticatorName: string;
  methods: string[];
};

// TO DO: Define FidgetId Type (with information about UUID + Space is installed in + Fidget Name)

type AuthenticatorManager = {
  // If Authenticator is not initialized, will always return denied
  callMethod: (
    requestingFidgetId: string,
    authenticatorName: string,
    methodName: string,
    ...args: any[]
  ) => Promise<AuthenticatorManagerResponse>;
  // If Authenticator is not initialized, it will initialize it before asking
  // the user to grant the permission to the Fidget
  requestPermissions: (
    requestingFidgetId: string,
    permissionsRequested: AuthenticatorPermissionRequest[],
  ) => Promise<AuthenticatorPermissionResponse[]>;
  // If Authenticator is not initialized, returns an empty array
  grantedPermissions: (
    requestingFidgetId: string,
  ) => Promise<AuthenticatorPermissionResponse[]>;
  openManagementPanel: () => void;
};

// type InitializerRecord<D> = {
//   Initalizer: AuthenticatorInitializer<D>;
//   authenticatorName: string;
// };

const AuthenticatorContext = createContext<AuthenticatorManager | null>(null);

function authenticatorForName(
  name: string,
):
  | AuthenticatorComponent<
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
  const installedAuthenticators = mapValues(
    authenticatorConfig,
    (config, authenticatorName) => {
      const component = authenticatorForName(authenticatorName);
      if (isUndefined(component))
        return {
          component: null,
          ref: null,
          config,
        };
      type ComponentMethods<X> =
        X extends AuthenticatorComponent<any, infer M> ? M : never;
      return {
        component,
        ref: useRef<
          AuthenticatorRef<
            typeof config.data,
            ComponentMethods<typeof component>
          >
        >(null),
        config,
      };
    },
  );

  // const [currentInitializer, setCurrentInitializer] = useState<InitializerRecord<unknown>>();
  // const [showModal, setShowModal] = useState(false);
  const authenticatorManager = useRef<AuthenticatorManager>();

  if (isUndefined(authenticatorManager.current)) {
    authenticatorManager.current = {
      callMethod: async (
        requestingFidgetId: string,
        authenticatorName: string,
        methodName: string,
        ...args: any[]
      ) => {
        const authenticator = installedAuthenticators[authenticatorName];
        if (isUndefined(authenticator) || isNull(authenticator.ref)) {
          return {
            result: "error",
            reason: "denied",
          };
        }
        const allowedMethods =
          authenticator.config.permissions[requestingFidgetId] || [];
        if (!includes(allowedMethods, methodName)) {
          return {
            result: "error",
            reason: "denied",
          };
        }
        try {
          const method = authenticator.ref[methodName] as AuthenticatorMethod;
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
      requestPermissions: async (requestingFidgetId, permissionsRequested) => {
        return [];
      },
      grantedPermissions: async (requestingFidgetId) => {
        // TO DO: Change this to support permission grants to spaces or Fidget types, not just single instances
        return map(
          // Get all of the auth configs that contain the figet ID
          pickBy(authenticatorConfig, (conf) =>
            includes(conf.permissions, [requestingFidgetId]),
          ),
          // Map these configs into the return type
          (config, authenticatorName) => {
            return {
              authenticatorName,
              methods: config.permissions[requestingFidgetId],
            };
          },
        );
      },
      openManagementPanel: () => undefined,
    };
  }

  function saveSingleAuthenticatorData(authenticatorName, config) {
    return (data) =>
      saveAuthenticatorConfig({
        ...authenticatorConfig,
        [authenticatorName]: {
          permissions: config.permissions,
          data,
        },
      });
  }

  // function initializationCompleted() {
  //   setCurrentInitializer(undefined);
  //   setShowModal(false);
  // }

  return (
    <AuthenticatorContext.Provider value={authenticatorManager.current}>
      {map(
        installedAuthenticators,
        ({ component, ref, config }, authenticatorName) =>
          component
            ? React.createElement(component, {
                ref,
                data: config.data,
                saveData: saveSingleAuthenticatorData(
                  authenticatorName,
                  config,
                ),
              })
            : null,
      )}
      {/* <Modal open={showModal} setOpen={setShowModal}>
        {
          !isUndefined(currentInitializer) ?
          <currentInitializer.Initalizer
            data={authenticatorConfig[currentInitializer.authenticatorName]}
            saveData={saveSingleAuthenticatorData(
              currentInitializer.authenticatorName,
              authenticatorConfig[currentInitializer.authenticatorName]
            )}
            done={initializationCompleted}
          /> :
          null
        }
      </Modal> */}
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
