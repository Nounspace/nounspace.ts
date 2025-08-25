import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import AuthenticatorProvider from "./AutheticatorProvider";
import { AppStoreProvider } from "@/common/data/stores/app";
import UserThemeProvider from "@/common/lib/theme/UserThemeProvider";
import LoggedInStateProvider from "./LoggedInStateProvider";
import VersionCheckProivder from "./VersionCheckProvider";
import { SidebarContextProvider } from "@/common/components/organisms/Sidebar";
import AnalyticsProvider from "./AnalyticsProvider";
import { ToastProvider } from "../components/atoms/Toast";
import MiniAppSdkProvider from "./MiniAppSdkProvider";
import MobilePreviewProvider from "./MobilePreviewProvider";
import { SharedDataProvider } from "./SharedDataProvider";

const RarelyUpdatedProviders = React.memo(
  function RarelyUpdatedProviders({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <MobilePreviewProvider>
        <AnalyticsProvider>
          <MiniAppSdkProvider>
            <SharedDataProvider>
              <ToastProvider>{children}</ToastProvider>
            </SharedDataProvider>
          </MiniAppSdkProvider>
        </AnalyticsProvider>
      </MobilePreviewProvider>
    );
  },
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VersionCheckProivder>
      <Privy>
        <Query>
          <Wagmi>
            <Theme>
              <AppStoreProvider>
                <UserThemeProvider>
                  <AuthenticatorProvider>
                    <LoggedInStateProvider>
                      <SidebarContextProvider>
                        <RarelyUpdatedProviders>{children}</RarelyUpdatedProviders>
                      </SidebarContextProvider>
                    </LoggedInStateProvider>
                  </AuthenticatorProvider>
                </UserThemeProvider>
              </AppStoreProvider>
            </Theme>
          </Wagmi>
        </Query>
      </Privy>
    </VersionCheckProivder>
  );
}
