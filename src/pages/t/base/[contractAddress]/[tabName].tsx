import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, {
  ContractSpacePageProps,
  loadContractData,
} from ".";

export const getServerSideProps = (async ({
  params,
}: GetServerSidePropsContext) => {
  return loadContractData(params);
}) satisfies GetServerSideProps<ContractSpacePageProps>;

export default ContractPrimarySpace;
