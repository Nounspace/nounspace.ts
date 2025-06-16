import { Web3Provider } from "@ethersproject/providers";
import snapshot from "@snapshot-labs/snapshot.js";

const hub = "https://hub.snapshot.org";
const client = new snapshot.Client712(hub);

export declare type ProposalType =
  | "single-choice"
  | "approval"
  | "quadratic"
  | "ranked-choice"
  | "weighted"
  | "basic";

interface VoteParams {
  proposalId: string;
  choiceId: number | number[] | { [key: string]: number };
  reason: string;
  space: string;
  type: ProposalType;
}

const voteOnProposalCore = async ({
  proposalId,
  choiceId,
  reason,
  space,
  type,
}: VoteParams): Promise<boolean> => {
  // Check if ethereum is available
  if (!window.ethereum) {
    throw new Error("Please install a Web3 wallet like MetaMask");
  }

  const web3 = new Web3Provider(window.ethereum);
  let [account] = await web3.listAccounts();
  
  if (!account) {
    // Request wallet connection
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // Retrieve accounts again after connection request
    [account] = await web3.listAccounts();
    
    if (!account) {
      throw new Error("Please connect your wallet");
    }
  }

  const receipt = await client.vote(web3, account, {
    space: space,
    proposal: proposalId,
    type: type,
    choice: choiceId,
    reason: reason,
    app: "nounspace",
  });

  if (!receipt) {
    throw new Error("Vote submission failed - no receipt received");
  }
  
  return true;
};

// Legacy export for backward compatibility
const voteOnProposalWrapper = async (
  proposalId: string,
  choiceId: number | number[] | { [key: string]: number },
  reason: string,
  space: string,
  type: ProposalType,
): Promise<boolean> => {
  return voteOnProposalCore({
    proposalId,
    choiceId,
    reason,
    space,
    type,
  });
};

export { voteOnProposalCore };
export default voteOnProposalWrapper;
