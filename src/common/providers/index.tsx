import React from "react";

import Wagmi from "./Wagmi";
import Query from "./Query"
import Theme from "./Theme";
import Privy from "./Privy";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Privy>
      <Query>
        <Wagmi>
          <Theme>
            { children }
          </Theme>
        </Wagmi>
      </Query>
    </Privy>
  );
}