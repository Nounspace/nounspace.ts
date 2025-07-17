import { useQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";

const useNeynarSignerUUID = (fid?: number): string | null => {
  const { data } = useQuery({
    queryKey: ["neynar-signer-uuid", fid],
    enabled: !!fid && fid > 0,
    queryFn: async () => {
      const { data } = await axiosBackend.get<{ signer_uuid: string }>(
        "/api/farcaster/neynar/signer",
        { params: { fid } },
      );
      return data.signer_uuid;
    },
  });

  return data ?? null;
};

export default useNeynarSignerUUID;
