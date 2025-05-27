import React from "react";
import { Button } from "../atoms/button";
import ClaimModal from "./ClaimModal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../atoms/tooltip";
import { Address } from "viem";

interface ClaimButtonWithModalProps {
  contractAddress?: Address;
  tokenSymbol?: string;
}

const ClaimButtonWithModal: React.FC<ClaimButtonWithModalProps> = ({
  contractAddress,
  tokenSymbol,
}) => {
  const [isModalOpen, setModalOpenState] = React.useState(false);
  let symbol = tokenSymbol || "";
  try {
    const { tokenData } = useToken();
    symbol =
      symbol ||
      tokenData?.clankerData?.symbol ||
      tokenData?.geckoData?.symbol ||
      "";
  } catch (err) {
    // Token context is optional; ignore if not available
  }

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
            {symbol
              ? `Log in with the Farcaster account that deployed ${symbol} to customize this space.`
              : 'Log in with Farcaster to customize this space.'}
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
