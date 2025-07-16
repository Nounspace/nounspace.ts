import { useQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";

export function useNeynarSignerUUID(fid?: number): string | undefined {
  const { data } = useQuery({
    queryKey: ["neynar-signer-uuid", fid],
    enabled: !!fid && fid > 0,
    queryFn: async () => {
      if (!fid || fid <= 0) return undefined;
      const response = await axiosBackend.get<{ signer_uuid: string }>(
        "/api/farcaster/neynar/signer",
        { params: { fid } },
      );
      return response.data.signer_uuid;
    },
  });

  return data;
}

export default useNeynarSignerUUID;
