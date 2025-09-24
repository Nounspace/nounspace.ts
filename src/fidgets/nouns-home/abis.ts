export const NounsAuctionHouseV3Abi = [
  {
    type: "function",
    stateMutability: "view",
    name: "auction",
    inputs: [],
    outputs: [
      { name: "nounId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "bidder", type: "address" },
      { name: "settled", type: "bool" },
    ],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "createBid",
    inputs: [{ name: "nounId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "settleAuction",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "settleCurrentAndCreateNewAuction",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getSettlements",
    inputs: [
      { name: "startId", type: "uint256" },
      { name: "endId", type: "uint256" },
      { name: "skipEmptyValues", type: "bool" },
    ],
    outputs: [
      {
        name: "settlements",
        type: "tuple[]",
        components: [
          { name: "blockTimestamp", type: "uint32" },
          { name: "amount", type: "uint256" },
          { name: "winner", type: "address" },
          { name: "nounId", type: "uint256" },
          { name: "clientId", type: "uint32" },
        ],
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "duration",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const NounsTokenAbi = [
  {
    type: "function",
    stateMutability: "view",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;
