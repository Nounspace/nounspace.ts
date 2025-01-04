import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, { ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  return loadContractData(params);
}) satisfies GetServerSideProps<ContractSpacePageProps>;

export default ContractPrimarySpace;
