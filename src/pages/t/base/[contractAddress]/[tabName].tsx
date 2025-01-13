import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ContractPrimarySpace, { ContractSpacePageProps } from ".";
import { loadContractData } from "@/common/data/loaders/contractPagePropsLoader";

const handleUndefinedProps = (props: any) => {
  for (const key in props) {
    if (props[key] === undefined) {
      props[key] = "";
    }
  }
};

export const getServerSideProps: GetServerSideProps<
  ContractSpacePageProps
> = async ({ params }: GetServerSidePropsContext) => {
  const contractAddress = params?.contractAddress as string;
  const contractData = await loadContractData(params);

  // Ensure no props are undefined
  handleUndefinedProps(contractData.props);

  return {
    props: {
      ...contractData.props,
      contractAddress,
    },
  };
};

export default ContractPrimarySpace;
