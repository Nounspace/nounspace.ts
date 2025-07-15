import { useQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";

export function useNeynarSignerUUID(fid?: number): string | undefined {
  const { data } = useQuery(
    ["neynar-signer-uuid", fid],
    async () => {
      if (!fid || fid <= 0) return undefined;
      const response = await axiosBackend.get<{ signer_uuid: string }>(
        "/api/farcaster/neynar/signer",
        { params: { fid } }
      );
      return response.data.signer_uuid;
    },
    { enabled: !!fid && fid > 0 }
  );

  return data;
}

export default useNeynarSignerUUID;
