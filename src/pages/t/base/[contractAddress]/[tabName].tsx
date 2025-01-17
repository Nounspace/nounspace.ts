import React from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, { ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";

export const getServerSideProps: GetServerSideProps<
  ContractSpacePageProps
> = async ({ params }: GetServerSidePropsContext) => {
  const contractAddress = params?.contractAddress as string;
  const contractData = await loadContractData(params);

  return {
    props: {
      ...contractData.props,
      contractAddress,
    },
  };
};

const WrappedContractPrimarySpace = (props: ContractSpacePageProps) => (
  <TokenProvider contractAddress={props.contractAddress as Address}>
    <ContractPrimarySpace {...props} />
  </TokenProvider>
);

export default WrappedContractPrimarySpace;
