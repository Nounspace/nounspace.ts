import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import { AppStoreProvider } from "../data/stores";
import AuthenticatorProvider from "./AutheticatorProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            <AppStoreProvider>
              <AuthenticatorProvider>{children}</AuthenticatorProvider>
            </AppStoreProvider>
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}
