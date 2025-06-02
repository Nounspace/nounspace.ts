import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import AuthenticatorProvider from "./AutheticatorProvider";
import { AppStoreProvider } from "@/common/data/stores/app";
import UserThemeProvider from "@/common/lib/theme/UserThemeProvider";
import GlobalFidgetStyleProvider from "./GlobalFidgetStyleProvider";
import LoggedInStateProvider from "./LoggedInStateProvider";
import AnalyticsProvider from "./AnalyticsProvider";
import VersionCheckProivder from "./VersionCheckProvider";
import { SidebarContextProvider } from "@/common/components/organisms/Sidebar";
import { ToastProvider } from "../components/atoms/Toast";
import MiniAppSdkProvider from "./MiniAppSdkProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VersionCheckProivder>
      <Privy>
        <Query>
          <Wagmi>
            <Theme>
              <AppStoreProvider>
                <UserThemeProvider>
                  <GlobalFidgetStyleProvider>
                    <AuthenticatorProvider>
                      <LoggedInStateProvider>
                        <SidebarContextProvider>
                          <AnalyticsProvider>
                            <MiniAppSdkProvider>
                              <ToastProvider>{children}</ToastProvider>
                            </MiniAppSdkProvider>
                          </AnalyticsProvider>
                        </SidebarContextProvider>
                      </LoggedInStateProvider>
                    </AuthenticatorProvider>
                  </GlobalFidgetStyleProvider>
                </UserThemeProvider>
              </AppStoreProvider>
            </Theme>
          </Wagmi>
        </Query>
      </Privy>
    </VersionCheckProivder>
  );
}
