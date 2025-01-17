import React from "react";
import Modal from "../molecules/Modal";
import { Button } from "../atoms/button";

interface ClaimModalProps {
  isModalOpen: boolean;
  handleModalClose: () => void;
  tokenSymbol?: string;
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  isModalOpen,
  handleModalClose,
  tokenSymbol,
}) => {
  return (
    <Modal
      open={isModalOpen}
      setOpen={handleModalClose}
      title={`Claim ${tokenSymbol}'s Token Space`}
      description={`Login in with the Farcaster Account that deployed ${tokenSymbol} to customize this space.`}
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
        <Button
          className="line-clamp-1 min-w-40 max-w-xs truncate"
          variant="primary"
          color="primary"
          onClick={handleModalClose}
        >
          Sign In
        </Button>
      </div>
    </Modal>
  );
};

export default ClaimModal;
