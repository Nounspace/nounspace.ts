import { useAppStore } from "@/common/data/stores/app";

export const useCurrentSpaceIdentityPublicKey = () => {
  return useAppStore((state) => state.account.currentSpaceIdentityPublicKey);
};

export default useCurrentSpaceIdentityPublicKey;
