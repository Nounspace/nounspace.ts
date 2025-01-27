import React from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ContractPrimarySpaceContent, ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";

async function loadTokenData(contractAddress: Address): Promise<MasterToken> {
  const [tokenResponse, clankerResponse] = await Promise.all([
    fetchTokenData(contractAddress, null),
    fetchClankerByAddress(contractAddress),
  ]);

  return {
    geckoData: tokenResponse,
    clankerData: clankerResponse,
  };
}

export const getServerSideProps: GetServerSideProps<
  ContractSpacePageProps
> = async ({ params, res }: GetServerSidePropsContext) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59",
  );

  const contractAddress = params?.contractAddress as string;
  const contractData = await loadContractData(params);
  const tokenData = await loadTokenData(contractAddress as Address);

  return {
    props: {
      ...contractData.props,
      contractAddress,
      tokenData,
    },
  };
};

const WrappedContractPrimarySpace = (props: ContractSpacePageProps) => (
  <TokenProvider
    contractAddress={props.contractAddress as Address}
    defaultTokenData={props.tokenData}
  >
    <ContractPrimarySpaceContent {...props} />
  </TokenProvider>
);

export default WrappedContractPrimarySpace;
