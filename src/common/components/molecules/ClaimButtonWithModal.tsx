import React from "react";
import { Button } from "../atoms/button";
import ClaimModal from "./ClaimModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../atoms/tooltip";
import { useToken } from "@/common/providers/TokenProvider";
import { Address } from "viem";

interface ClaimButtonWithModalProps {
  contractAddress?: Address;
}

const ClaimButtonWithModal: React.FC<ClaimButtonWithModalProps> = ({
  contractAddress,
}) => {
  const [isModalOpen, setModalOpenState] = React.useState(false);
  const { tokenData } = useToken();
  const symbol =
    tokenData?.clankerData?.symbol ||
    tokenData?.empireData?.token_symbol ||
    tokenData?.geckoData?.symbol ||
    "";

  const handleClaimClick = () => {
    setModalOpenState(true);
  };

  const handleModalClose = () => {
    setModalOpenState(false);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center mr-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="line-clamp-1 min-w-40 max-w-xs truncate"
              variant="primary"
              color="primary"
              onClick={handleClaimClick}
            >
              Claim this Space
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Log in with the Farcaster account that deployed ${symbol} to
            customize this space.
          </TooltipContent>
        </Tooltip>
      </div>
      <ClaimModal
        isModalOpen={isModalOpen}
        handleModalClose={handleModalClose}
        tokenSymbol={symbol}
      />
    </TooltipProvider>
  );
};

export default ClaimButtonWithModal;
