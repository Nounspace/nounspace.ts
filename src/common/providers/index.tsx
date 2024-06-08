import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query";
import Theme from "./Theme";
import Privy from "./Privy";

import { AccountStoreProvider } from "../data/stores/accounts";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            <AccountStoreProvider>{children}</AccountStoreProvider>
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}
