import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, { ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";

export const getServerSideProps: GetServerSideProps<
  ContractSpacePageProps
> = async ({ params }: GetServerSidePropsContext) => {
  const contractAddress = params?.contractAddress as string;
  const contractData = await loadContractData(params);

  // Ensure pinnedCastId is either null or omitted if undefined
  if (contractData.props.pinnedCastId === undefined) {
    delete contractData.props.pinnedCastId;
  }

  // Hardcoded rule for specific contractAddress and user
  if (
    contractAddress === "0x48C6740BcF807d6C47C864FaEEA15Ed4dA3910Ab" &&
    (contractData.props.owningIdentities as string[]).includes("527313")
  ) {
    console.log("Hardcoded rule applied: setting ownerId to 527313");
    contractData.props.ownerId = "0x06AE622bF2029Db79Bdebd38F723f1f33f95F6C5";
    contractData.props.ownerIdType = "address";
  }

  console.log("ownerId:", contractData.props.ownerId);
  console.log("ownerIdType:", contractData.props.ownerIdType);

  return {
    props: {
      ...contractData.props,
      contractAddress,
    },
  };
};

export default ContractPrimarySpace;
