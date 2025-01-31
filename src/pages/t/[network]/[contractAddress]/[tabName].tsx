import React from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ContractPrimarySpaceContent, ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";

async function loadTokenData(contractAddress: Address, network: string): Promise<MasterToken> {
    const [tokenResponse, clankerResponse] = await Promise.all([
        fetchTokenData(contractAddress, null, network),
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
    const network = Array.isArray(params?.network) ? params.network[0] : params?.network;
    const tokenData = await loadTokenData(contractAddress as Address, String(network));

    return {
        props: {
            ...contractData.props,
            contractAddress,
            tokenData,
            network: params?.network as string, // Pass network as a prop
        },
    };
};

const WrappedContractPrimarySpace = (props: ContractSpacePageProps) => (
    <TokenProvider
        contractAddress={props.contractAddress as Address}
        defaultTokenData={props.tokenData}
        network={props.network}
    >
        <ContractPrimarySpaceContent {...props} />
    </TokenProvider>
);

export default WrappedContractPrimarySpace;
