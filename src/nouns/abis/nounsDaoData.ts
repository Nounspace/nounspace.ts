export const nounsDaoDataAbi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "string[]",
        name: "signatures",
        type: "string[]",
      },
      {
        internalType: "bytes[]",
        name: "calldatas",
        type: "bytes[]",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "slug",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "proposalIdToUpdate",
        type: "uint256",
      },
    ],
    name: "createProposalCandidate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "msgSender", type: "address" },
      { indexed: false, internalType: "address[]", name: "targets", type: "address[]" },
      { indexed: false, internalType: "uint256[]", name: "values", type: "uint256[]" },
      { indexed: false, internalType: "string[]", name: "signatures", type: "string[]" },
      { indexed: false, internalType: "bytes[]", name: "calldatas", type: "bytes[]" },
      { indexed: false, internalType: "string", name: "description", type: "string" },
      { indexed: false, internalType: "string", name: "slug", type: "string" },
      { indexed: false, internalType: "uint256", name: "proposalIdToUpdate", type: "uint256" },
      { indexed: false, internalType: "bytes32", name: "encodedProposalHash", type: "bytes32" },
    ],
    name: "ProposalCandidateCreated",
    type: "event",
  },
] as const;
