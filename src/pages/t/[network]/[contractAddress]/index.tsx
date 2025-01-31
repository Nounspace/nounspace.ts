import ContractDefinedSpace from "@/common/components/pages/ContractDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import { OwnerType } from "@/common/data/api/etherscan";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";
import { useAppStore } from "@/common/data/stores/app";
import { generateContractMetadataHtml } from "@/common/lib/utils/generateContractMetadataHtml";
import { NextPageWithLayout } from "@/pages/_app";
import { isArray, isNil } from "lodash";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import {
    MasterToken,
    TokenProvider,
    useToken,
} from "@/common/providers/TokenProvider";
import { Address } from "viem";

export interface ContractSpacePageProps {
    spaceId: string | null;
    tabName: string | null;
    contractAddress: string | null;
    ownerIdType: OwnerType;
    pinnedCastId?: string;
    owningIdentities: string[];
    ownerId: string | null;
    tokenData?: MasterToken;
    network: string; // Add network to props
}

export const getServerSideProps = (async ({
    params,
}: GetServerSidePropsContext) => {
    const contractData = await loadContractData(params);
    return {
        props: {
            ...contractData.props,
            network: Array.isArray(params?.network) ? params.network[0] : params?.network ?? "", // Ensure network is always a string
        },
    };
}) satisfies GetServerSideProps<ContractSpacePageProps>;

export const ContractPrimarySpace: NextPageWithLayout = ({
    spaceId,
    tabName,
    ownerId,
    ownerIdType,
    contractAddress,
    owningIdentities,
    network, // Add network to props
}: ContractSpacePageProps) => {
    return (
        <TokenProvider contractAddress={contractAddress as Address} network={network}>
            <ContractPrimarySpaceContent
                spaceId={spaceId}
                tabName={tabName}
                ownerId={ownerId}
                ownerIdType={ownerIdType}
                contractAddress={contractAddress}
                owningIdentities={owningIdentities}
                network={network} // Pass network to content
            />
        </TokenProvider>
    );
};

export const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
    spaceId,
    tabName,
    ownerId,
    ownerIdType,
    contractAddress,
    owningIdentities,
    network, // Add network to props
}) => {
    const { loadEditableSpaces, addContractEditableSpaces } = useAppStore(
        (state) => ({
            loadEditableSpaces: state.space.loadEditableSpaces,
            addContractEditableSpaces: state.space.addContractEditableSpaces,
        }),
    );

    const { tokenData, isLoading } = useToken();

    useEffect(() => {
        addContractEditableSpaces(spaceId, owningIdentities);
    }, [spaceId]);

    useEffect(() => {
        loadEditableSpaces();
    }, []);

    if (!isNil(ownerId) && !isNil(contractAddress)) {
        if (
            (isNil(spaceId) &&
                (tabName?.toLocaleLowerCase() === "profile" || tabName === null)) ||
            !isNil(spaceId)
        )
            return (
                <>
                    <Head>
                        {isLoading ? (
                            <title>Loading token Page...</title>
                        ) : (
                            generateContractMetadataHtml(contractAddress, tokenData)
                        )}
                    </Head>
                    <ContractDefinedSpace
                        ownerId={ownerId}
                        ownerIdType={ownerIdType}
                        spaceId={spaceId}
                        tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
                        contractAddress={contractAddress}
                    />
                </>
            );
    }

    return <SpaceNotFound />;
};

export default ContractPrimarySpace;
