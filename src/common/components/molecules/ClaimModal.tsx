import React from "react";
import Modal from "../molecules/Modal";
import { Button } from "../atoms/button";
import { useAppStore } from "@/common/data/stores/app";

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
  const { setModalOpen } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
    }),
  );

  const handleSignInClick = () => {
    setModalOpen(true);
    handleModalClose();
  };

  const title = tokenSymbol
    ? `Claim ${tokenSymbol}'s Token Space`
    : 'Claim this Space';
  const description = tokenSymbol
    ? `Login in with the Farcaster Account that deployed ${tokenSymbol} to customize this space.`
    : 'Login with the Farcaster account that controls this space to customize it.';

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
        <Button
          className="line-clamp-1 min-w-40 max-w-xs truncate"
          variant="primary"
          color="primary"
          onClick={handleSignInClick}
        >
          Sign In
        </Button>
      </div>
    </Modal>
  );
};

export default ClaimModal;
