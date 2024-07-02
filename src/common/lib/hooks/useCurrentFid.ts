import { useAppStore } from "@/common/data/stores/app";
import { NounspaceDeveloperManagedSignerData } from "@/authenticators/farcaster/signers/NounspaceManagedSignerAuthenticator";

export const useCurrentFid = (): number | null => {
  const data: NounspaceDeveloperManagedSignerData | undefined = useAppStore(
    (state) => {
      return state.account.authenticatorConfig["farcaster:nounspace"]?.data;
    },
  );
  const fid = data?.accountFid;
  return !fid || fid === 1 ? null : fid;
};

export default useCurrentFid;
