import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, { ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";

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

export default ContractPrimarySpace;
