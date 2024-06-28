import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import AuthenticatorProvider from "./AutheticatorProvider";
import { AppStoreProvider } from "@/common/data/stores";
import { UserThemeContextProvider } from "@/common/lib/theme/UserThemeContextProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            <UserThemeContextProvider>
              <AppStoreProvider>
                <AuthenticatorProvider>{children}</AuthenticatorProvider>
              </AppStoreProvider>
            </UserThemeContextProvider>
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}
