// src/utils/voteOnProposal.ts

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

const voteOnProposal = async (
  proposalId: string,
  choiceId: number | number[] | { [key: string]: number },
  reason: string,
  space: string,
  type: ProposalType,
) => {
  try {
    const web3 = new Web3Provider(window.ethereum);
    const [account] = await web3.listAccounts();
    if (!account) {
      alert("Please connect your wallet");
      return;
    }
    // console.log("Voting with account:", account);
    // console.log("Voting on proposal:", proposalId);
    // console.log("Choice:", choiceId);
    // console.log("Reason:", reason);
    // console.log("Space:", space);
    // console.log("Type:", type);

    const receipt = await client.vote(web3, account, {
      space: space,
      proposal: proposalId,
      type: type,
      choice: choiceId,
      reason: reason,
      app: "nounspace",
    });

    if (receipt) {
      alert("Vote submitted!");
    }
  } catch (error) {
    console.error("Error submitting vote:", error);
    alert("An error occurred while submitting your vote. Please try again.");
  }
};

export default voteOnProposal;
