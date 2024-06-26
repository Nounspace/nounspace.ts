import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import AuthenticatorProvider from "./AutheticatorProvider";
import { AppStoreProvider } from "@/common/data/stores/app";
import UserThemeProvider from "@/common/lib/theme/UserThemeProvider";
import LoggedInStateProvider from "./LoggedInStateProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            <AppStoreProvider>
              <UserThemeProvider>
                <AuthenticatorProvider>
                  <LoggedInStateProvider>{children}</LoggedInStateProvider>
                </AuthenticatorProvider>
              </UserThemeProvider>
            </AppStoreProvider>
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}
