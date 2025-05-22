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
import { useProposalContext } from "@/common/providers/ProposalProvider";
import { Address } from "viem";

interface ClaimButtonWithModalProps {
  contractAddress?: Address;
}

const ClaimButtonWithModal: React.FC<ClaimButtonWithModalProps> = ({
  contractAddress,
}) => {
  const [isModalOpen, setModalOpenState] = React.useState(false);

  // Try proposal context first, fallback to token context only if not in proposal context
  let symbol = "";
  let isProposalPage = false;
  let proposalId: string | undefined = undefined;
  try {
    const { proposalData } = useProposalContext();
    if (proposalData) {
      symbol = proposalData.title || proposalData.id || "Proposal";
      isProposalPage = true;
      proposalId = proposalData.id;
    }
  } catch {
    // Not in proposal context, try token context
    try {
      const { tokenData } = useToken();
      symbol = tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";
    } catch {
      // Not in token context either
      symbol = "";
    }
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
            {isProposalPage
              ? `Log in with the Farcaster account that created this proposal to customize this space.`
              : symbol
                ? `Log in with the Farcaster account that deployed ${symbol} to customize this space.`
                : `Log in with the Farcaster account to customize this space.`}
          </TooltipContent>
        </Tooltip>
      </div>
      <ClaimModal
        isModalOpen={isModalOpen}
        handleModalClose={handleModalClose}
        tokenSymbol={symbol}
        proposalId={proposalId}
      />
    </TooltipProvider>
  );
};

export default ClaimButtonWithModal;
