import React from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ContractPrimarySpaceContent, ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { MasterToken, TokenProvider } from "@/common/providers/TokenProvider";
import { Address } from "viem";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";

async function loadTokenData(contractAddress: Address, network: string): Promise<MasterToken> {
    if (network === "base") {
        const [tokenResponse, clankerResponse] = await Promise.all([
            fetchTokenData(contractAddress, null, network),
            fetchClankerByAddress(contractAddress),
        ]);

        return {
            network,
            geckoData: tokenResponse,
            clankerData: clankerResponse,
        };
    } else {
        const tokenResponse = await fetchTokenData(contractAddress, null, network);
        return {
            network,
            geckoData: tokenResponse,
            clankerData: null,
        };
    }
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
    const network = params?.network as string;
    console.log("network getServerSide", network);
    const tokenData = await loadTokenData(contractAddress as Address, String(network));

    return {
        props: {
            ...contractData.props,
            contractAddress,
            tokenData,
            network
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
