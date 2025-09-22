import { getAddress } from 'viem'
import { nounsAuctionHouseAbi } from '../../abis/nounsAuctionHouse'
import { nounsErc20TokenAbi } from '../../abis/nounsErc20Token'
import { nounsTokenAbi } from '../../abis/nounsToken'
import { erc20TokenAbi } from '../../abis/erc20Token'
import { nounsDaoDataAbi } from '../../abis/nounsDaoData'
import { nounsDoaLogicAbi } from '../../abis/nounsDoaLogic'
import { chainlinkPriceFeedAbi } from '../../abis/chainlinkPriceFeed'
import { nnsEnsResolverAbi } from '../../abis/nnsEnsResolver'
import { CHAIN_CONFIG } from '../../config'

export const nounsAuctionHouseConfig = {
  address: CHAIN_CONFIG.addresses.nounsAuctionHouseProxy,
  abi: nounsAuctionHouseAbi,
} as const

export const nounsErc20Config = {
  address: CHAIN_CONFIG.addresses.nounsErc20,
  abi: nounsErc20TokenAbi,
} as const

export const nounsTokenConfig = {
  address: CHAIN_CONFIG.addresses.nounsToken,
  abi: nounsTokenAbi,
} as const

export const erc20TokenConfig = {
  abi: erc20TokenAbi,
} as const

export const nounsDaoDataConfig = {
  address: CHAIN_CONFIG.addresses.nounsDoaDataProxy,
  abi: nounsDaoDataAbi,
} as const

export const nounsDoaLogicConfig = {
  address: CHAIN_CONFIG.addresses.nounsDoaProxy,
  abi: nounsDoaLogicAbi,
} as const

export const chainlinkPriceFeedConfig = {
  abi: chainlinkPriceFeedAbi,
} as const

export const nnsEnsResolverConfig = {
  abi: nnsEnsResolverAbi,
} as const

export const nounsDaoLogicConfig = {
  address: CHAIN_CONFIG.addresses.nounsDoaProxy,
  abi: nounsDoaLogicAbi,
} as const
