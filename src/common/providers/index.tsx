import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";
import { AppStoreProvider } from "../data/stores";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            <AppStoreProvider>{children}</AppStoreProvider>
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}
