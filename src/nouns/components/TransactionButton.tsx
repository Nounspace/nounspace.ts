import React from "react";
import { Button, ButtonProps } from "./ui/button";
import { TransactionState } from "@nouns/hooks/transactions/types";
import LoadingSpinner from "./LoadingSpinner";

export interface TransactionButtonProps extends ButtonProps {
  txnState: TransactionState;
}

const TransactionButton = React.forwardRef<
  HTMLButtonElement,
  TransactionButtonProps
>(({ txnState, children, disabled, ...props }, ref) => {
  const content =
    txnState === "pending-signature" || txnState == "pending-txn" ? (
      <div>
        <LoadingSpinner size={24} />
      </div>
    ) : (
      children
    );

  return (
    <Button ref={ref} disabled={disabled || txnState != "idle"} {...props}>
      {content}
    </Button>
  );
});
TransactionButton.displayName = "TransactionButton";

export default TransactionButton;
