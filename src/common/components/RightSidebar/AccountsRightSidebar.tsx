import React from "react";
import {
  AccountObjectType,
  PENDING_ACCOUNT_NAME_PLACEHOLDER,
  useAccountStore,
} from "../../../../src/stores/useAccountStore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import EmptyStateWithAction from "../../../../src/common/components/EmptyStateWithAction";
import { classNames } from "../../../../src/common/helpers/css";
import isEmpty from "lodash.isempty";
import ChannelsOverview from "./ChannelsOverview";
import { SidebarHeader } from "./SidebarHeader";
import * as Tooltip from "@radix-ui/react-tooltip";
import HotkeyTooltipWrapper from "../HotkeyTooltipWrapper";
import { useRouter } from "next/router";
import { AccountPlatformType } from "@/common/constants/accounts";

type AccountsRightSidebarProps = {
  showChannels?: boolean;
};

const AccountsRightSidebar = ({ showChannels }: AccountsRightSidebarProps) => {
  const router = useRouter();

  const { accounts, selectedAccountIdx, setCurrentAccountIdx } =
    useAccountStore();

  const renderEmptyState = () => (
    <div className="ml-6">
      <EmptyStateWithAction
        title="Connect Farcaster accounts"
        description="Get started with herocast"
        onClick={() => router.push("/accounts")}
        submitText="Connect account"
        icon={UserPlusIcon}
      />
    </div>
  );

  const renderStatus = (status: string) => {
    switch (status) {
      case "active":
        return <></>;
      case "pre-migration":
        return (
          <span className={classNames("flex-none text-sm text-yellow-300/80")}>
            pre-migration account
          </span>
        );
      default:
        return (
          <span
            className={classNames(
              "underline flex-none text-sm text-foreground/70"
            )}
          >
            {status}
          </span>
        );
    }
  };

  const renderAccounts = () => (
    <Tooltip.Provider delayDuration={50} skipDelayDuration={0}>
      <ul role="list" className="mx-4 divide-y divide-white/5">
        {accounts.map((account: AccountObjectType, idx: number) => (
          <li key={account.id} className="px-2 py-2 sm:px-3 lg:px-4">
            <HotkeyTooltipWrapper hotkey={`Ctrl + ${idx + 1}`} side="left">
              <div
                onClick={() =>
                  account.status === "active" && setCurrentAccountIdx(idx)
                }
                className="flex items-center gap-x-3 cursor-pointer"
              >
                {account.user?.pfp_url && (
                  <img
                    src={account.user?.pfp_url}
                    alt=""
                    className={classNames(
                      idx === selectedAccountIdx
                        ? "border-gray-100"
                        : "grayscale border-gray-400 hover:border-gray-300",
                      "-mr-1 -mt-0.5 bg-gray-100 border h-5 w-5 flex-none rounded-full"
                    )}
                  />
                )}
                <h3
                  className={classNames(
                    idx === selectedAccountIdx
                      ? "text-foreground"
                      : "text-foreground/60",
                    "flex-auto truncate text-sm font-normal leading-6"
                  )}
                >
                  {account.name || PENDING_ACCOUNT_NAME_PLACEHOLDER}
                </h3>
                {renderStatus(account.status)}
                {account.platform ===
                  AccountPlatformType.farcaster_hats_protocol && (
                  <p className="truncate text-sm text-foreground">🧢</p>
                )}
              </div>
            </HotkeyTooltipWrapper>
          </li>
        ))}
      </ul>
    </Tooltip.Provider>
  );

  const renderChannels = () => {
    return (
      <div className="mt-4">
        <ChannelsOverview />
      </div>
    );
  };

  return (
    <aside className="min-h-full bg-background md:fixed md:bottom-0 md:right-0 md:top-16 md:w-48 lg:w-64 md:border-l md:border-white/5">
      <div className="border-l border-foreground/5">
        <SidebarHeader title="Accounts" />
        {isEmpty(accounts) ? renderEmptyState() : renderAccounts()}
        {showChannels && renderChannels()}
      </div>
    </aside>
  );
};

export default AccountsRightSidebar;
