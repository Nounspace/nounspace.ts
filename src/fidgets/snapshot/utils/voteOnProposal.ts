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
  try {
    // Check if ethereum is available
    if (!window.ethereum) {
      alert("Please install a Web3 wallet like MetaMask");
      return false;
    }

    const web3 = new Web3Provider(window.ethereum);
    const [account] = await web3.listAccounts();
    
    if (!account) {
      alert("Please connect your wallet");
      return false;
    }

    const receipt = await client.vote(web3, account, {
      space: space,
      proposal: proposalId,
      type: type,
      choice: choiceId,
      reason: reason,
      app: "nounspace",
    });

    if (receipt) {
      alert("Vote submitted successfully!");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error submitting vote:", error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes("User denied")) {
        alert("Transaction was cancelled by user.");
      } else if (error.message.includes("insufficient funds")) {
        alert("Insufficient funds to complete the transaction.");
      } else {
        alert(`An error occurred while submitting your vote: ${error.message}`);
      }
    } else {
      alert("An unexpected error occurred while submitting your vote. Please try again.");
    }
    
    return false;
  }
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
