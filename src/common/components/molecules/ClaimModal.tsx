import React from "react";
import Modal from "../molecules/Modal";
import { Button } from "../atoms/button";
import { useAppStore } from "@/common/data/stores/app";

interface ClaimModalProps {
  isModalOpen: boolean;
  handleModalClose: () => void;
  tokenSymbol?: string;
  proposalId?: string;
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  isModalOpen,
  handleModalClose,
  tokenSymbol,
  proposalId,
}) => {
  const { setModalOpen, registerProposalSpace } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
      registerProposalSpace: state.space.registerProposalSpace,
    }),
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSignInClick = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (proposalId) {
        // Register proposal space
        await registerProposalSpace(proposalId);
        setSuccess(true);
      } else {
        // For token spaces, just open the Farcaster login modal
        setModalOpen(true);
      }
      handleModalClose();
    } catch (e: any) {
      setError(e?.message || "Failed to claim space");
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
        {success && <div className="text-green-600 mb-2">Proposal space claimed!</div>}
        <Button
          className="line-clamp-1 min-w-40 max-w-xs truncate"
          variant="primary"
          color="primary"
          onClick={handleSignInClick}
          disabled={loading}
        >
          {loading ? "Claiming..." : "Sign In"}
        </Button>
      </div>
    </Modal>
  );
};

export default ClaimModal;
