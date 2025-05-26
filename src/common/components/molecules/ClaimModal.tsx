import React, { useState } from "react";
import Modal from "../molecules/Modal";
import { Button } from "../atoms/button";
import { useAppStore } from "@/common/data/stores/app";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { v4 as uuidv4 } from "uuid";

interface ClaimModalProps {
  isModalOpen: boolean;
  handleModalClose: () => void;
  tokenSymbol?: string;
  proposalId?: string;
  fid?: number;
  connectedEthAddress?: string | null;
  connectedFid?: number | null;
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  isModalOpen,
  handleModalClose,
  tokenSymbol,
  proposalId,
  fid = 0,
  connectedEthAddress,
  connectedFid,
}) => {
  const { setModalOpen, registerProposalSpace } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
    registerProposalSpace: state.space.registerProposalSpace,
  }));

  // Use Farcaster signer to get authentication loading state
  const { isLoadingSigner, fid: authenticatedFid } =
    useFarcasterSigner("claim-modal");

  // Use connectedFid from props if provided, otherwise fallback to hook or authenticated FID
  const currentFid =
    connectedFid ??
    useCurrentFid() ??
    (authenticatedFid > 0 ? authenticatedFid : null);

  // Log modal props and authentication state
  console.debug("[ClaimModal] props", {
    isModalOpen,
    tokenSymbol,
    proposalId,
    fid,
    connectedEthAddress,
    connectedFid,
  });
  console.debug("[ClaimModal] authentication state", {
    isLoadingSigner,
    authenticatedFid,
    currentFid,
    connectedEthAddress,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignInClick = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (proposalId) {
        // Debug: log all relevant values before payload construction
        console.log("[ClaimModal] proposalId:", proposalId);
        console.log("[ClaimModal] fid:", fid);
        console.log(
          "[ClaimModal] connectedEthAddress (prop):",
          connectedEthAddress
        );
        console.log("[ClaimModal] connectedFid (prop):", connectedFid);
        console.log("[ClaimModal] currentFid (resolved):", currentFid);

        // Ensure we have valid authentication values
        if (!currentFid && !connectedEthAddress) {
          throw new Error(
            "Authentication required: Please connect your Farcaster account or wallet"
          );
        }

        // Always generate a UUID for proposal spaceId
        const proposalSpaceId = uuidv4();
        const payload = {
          proposalId,
          spaceId: proposalSpaceId, // always a UUID
          fid,
          connectedEthAddress: connectedEthAddress || null,
          connectedFid: currentFid || null,
        };
        console.log("[ClaimModal] FINAL payload to backend:", payload);
        await registerProposalSpace(payload);
        setSuccess(true);
      } else {
        // For token spaces, just open the Farcaster login modal
        setModalOpen(true);
      }
      handleModalClose();
    } catch (e: any) {
      setError(e?.message || "Failed to claim space");
      console.error("[ClaimModal] Error registering proposal space:", e);
    } finally {
      setLoading(false);
    }
  };

  // Use a different title/description if proposalId is present
  const isProposal = !!proposalId;
  const title = isProposal
    ? `Claim Proposal #${proposalId} Space`
    : `Claim ${tokenSymbol}'s Token Space`;
  const description = isProposal
    ? `Login with the Farcaster Account that created proposal #${proposalId} to customize this space.`
    : `Login in with the Farcaster Account that deployed ${tokenSymbol} to customize this space.`;

  // Determine if user is authenticated (has FID or ETH address)
  const isAuthenticated = !!(currentFid || connectedEthAddress);

  // Determine if we're still loading authentication data
  const isAuthLoading = isLoadingSigner && !currentFid && !connectedEthAddress;

  return (
    <Modal
      open={isModalOpen}
      setOpen={handleModalClose}
      title={title}
      description={description}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full"
        src="/images/tutorial.webm"
      />
      <div className="flex flex-col items-center justify-center p-4">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && (
          <div className="text-green-600 mb-2">Proposal space claimed!</div>
        )}
        {isAuthLoading && (
          <div className="text-blue-600 mb-2">Loading authentication...</div>
        )}
        {!isAuthenticated && !isAuthLoading && (
          <div className="text-yellow-600 mb-2">
            Please log in with your Farcaster account or connect your wallet to
            claim this space.
          </div>
        )}
        <Button
          className="line-clamp-1 min-w-40 max-w-xs truncate"
          variant="primary"
          color="primary"
          onClick={handleSignInClick}
          disabled={loading || isAuthLoading || !isAuthenticated}
        >
          {loading ? "Claiming..." : isAuthLoading ? "Loading..." : "Sign In"}
        </Button>
      </div>
    </Modal>
  );
};

export default ClaimModal;
