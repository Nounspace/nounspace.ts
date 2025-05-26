import React, { useEffect, useState } from "react";
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
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { useWallets } from "@privy-io/react-auth";
import { useFarcasterSigner } from "@/fidgets/farcaster";

interface ClaimButtonWithModalProps {
  contractAddress?: Address;
  proposalId?: string;
  fid?: number;
  proposerAddress?: string;
}

const ClaimButtonWithModal: React.FC<ClaimButtonWithModalProps> = ({
  contractAddress,
  proposalId,
  fid,
  proposerAddress,
}) => {
  const [isModalOpen, setModalOpenState] = React.useState(false);
  const [resolvedFid, setResolvedFid] = useState<number | undefined>(fid);
  const [isFetchingFid, setIsFetchingFid] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [isProposalPage, setIsProposalPage] = useState(false);
  const [_proposalId, setProposalId] = useState<string | undefined>(proposalId);

  // Get context data
  let proposalData;
  let tokenData;

  try {
    proposalData = useProposalContext()?.proposalData;
  } catch (error) {
    console.error("Error retrieving proposal context:", error);
  }

  try {
    tokenData = useToken()?.tokenData;
  } catch (error) {
    console.error("Error retrieving token data:", error);
  }

  // Set up symbol, proposal page, proposalId from context/props
  useEffect(() => {
    if (proposalData) {
      setSymbol(proposalData.title || proposalData.id || "Proposal");
      setIsProposalPage(true);
      setProposalId(proposalData.id);
    } else if (tokenData) {
      setSymbol(
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || ""
      );
      setIsProposalPage(false);
    } else {
      setSymbol("");
      setIsProposalPage(false);
    }
  }, [proposalData, tokenData]);

  // Fetch fid if needed
  useEffect(() => {
    if (isProposalPage && !resolvedFid && fid) {
      setIsFetchingFid(true);
      // Use our API route instead of calling Neynar directly
      fetch(
        `/api/farcaster/proposer-fid?address=${encodeURIComponent(
          proposalData.proposer?.id
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.proposerFid) {
            setResolvedFid(data.proposerFid);
          }
        })
        .catch((error) => {
          console.error(
            "[ClaimButtonWithModal] Error fetching proposer FID:",
            error
          );
        })
        .finally(() => setIsFetchingFid(false));
    } else if (fid && !resolvedFid) {
      setResolvedFid(fid);
    }
  }, [isProposalPage, fid, resolvedFid]);

  // Use proposerAddress for FID resolution if present
  useEffect(() => {
    if (isProposalPage && proposerAddress && !resolvedFid) {
      setIsFetchingFid(true);
      fetch(
        `/api/farcaster/proposer-fid?address=${encodeURIComponent(
          proposerAddress
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.proposerFid) {
            setResolvedFid(data.proposerFid);
          }
        })
        .catch((error) => {
          console.error(
            "[ClaimButtonWithModal] Error fetching proposer FID:",
            error
          );
        })
        .finally(() => setIsFetchingFid(false));
    } else if (fid && !resolvedFid) {
      setResolvedFid(fid);
    }
  }, [isProposalPage, proposerAddress, fid, resolvedFid]);

  // Debug: log authentication and context
  const currentFid = useCurrentFid();
  const { wallets } = useWallets();
  console.log("[ClaimButtonWithModal] currentFid:", currentFid);
  console.log("[ClaimButtonWithModal] wallets:", wallets);
  const connectedEthAddress = wallets?.[0]?.address || null;
  const { isLoadingSigner } = useFarcasterSigner("claim-button");
  const isEthAddressLoading = isProposalPage && !connectedEthAddress;
  const isAuthLoading = isLoadingSigner || isEthAddressLoading || isFetchingFid;

  // Log authentication state
  console.debug("[ClaimButtonWithModal] useCurrentFid:", currentFid);
  console.debug("[ClaimButtonWithModal] useWallets:", wallets);
  console.debug("[ClaimButtonWithModal] isLoadingSigner:", isLoadingSigner);
  console.debug(
    "[ClaimButtonWithModal] connectedEthAddress:",
    connectedEthAddress
  );

  // Log proposal context and prop flow
  console.debug("[ClaimButtonWithModal] proposal context", {
    isProposalPage,
    proposalId,
    fid,
    _proposalId,
    resolvedFid,
    symbol,
  });

  // Log props passed to ClaimModal
  console.debug("[ClaimButtonWithModal] ClaimModal props", {
    isModalOpen,
    tokenSymbol: symbol,
    proposalId: _proposalId,
    proposalOwner: proposalData?.proposer?.id,
    fid: resolvedFid,
    connectedEthAddress,
    connectedFid: currentFid ?? null,
  });

  // Log all props in ClaimButtonWithModal
  console.debug("[ClaimButtonWithModal] props", {
    contractAddress,
    proposalId,
    fid,
  });

  // Fix isProposalPage logic: should be true if proposalId is present
  useEffect(() => {
    if (proposalId || _proposalId) {
      setIsProposalPage(true);
    } else if (tokenData) {
      setIsProposalPage(false);
    }
  }, [proposalId, _proposalId, tokenData]);

  const handleClaimClick = () => {
    // Prevent opening modal if any authentication data is still loading for proposals
    if (isProposalPage && isAuthLoading) return;
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
              disabled={
                isProposalPage &&
                (isFetchingFid ||
                  isEthAddressLoading ||
                  (!resolvedFid && !connectedEthAddress))
              }
            >
              {isProposalPage && (isFetchingFid || isEthAddressLoading)
                ? "Loading..."
                : "Claim this Space"}
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
        proposalId={_proposalId}
        fid={resolvedFid}
        connectedEthAddress={connectedEthAddress}
        connectedFid={currentFid ?? null}
      />
    </TooltipProvider>
  );
};

export default ClaimButtonWithModal;
