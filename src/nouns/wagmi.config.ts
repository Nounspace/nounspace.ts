import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { nounsAuctionHouseAbi } from './abis/nounsAuctionHouse'
import { nounsErc20TokenAbi } from './abis/nounsErc20Token'
import { nounsTokenAbi } from './abis/nounsToken'
import { erc20TokenAbi } from './abis/erc20Token'
import { nounsDaoDataAbi } from './abis/nounsDaoData'
import { nounsDoaLogicAbi } from './abis/nounsDoaLogic'
import { chainlinkPriceFeedAbi } from './abis/chainlinkPriceFeed'
import { nnsEnsResolverAbi } from './abis/nnsEnsResolver'
import { CHAIN_CONFIG } from './config'

export default defineConfig({
  out: 'src/nouns/data/generated/wagmi.ts',
  contracts: [
    {
      name: 'nounsAuctionHouse',
      abi: nounsAuctionHouseAbi,
      address: CHAIN_CONFIG.addresses.nounsAuctionHouseProxy,
    },
    {
      name: 'nounsErc20',
      abi: nounsErc20TokenAbi,
      address: CHAIN_CONFIG.addresses.nounsErc20,
    },
    {
      name: 'nounsToken',
      abi: nounsTokenAbi,
      address: CHAIN_CONFIG.addresses.nounsToken,
    },
    {
      name: 'erc20Token',
      abi: erc20TokenAbi,
    },
    {
      name: 'nounsDaoData',
      abi: nounsDaoDataAbi,
      address: CHAIN_CONFIG.addresses.nounsDoaDataProxy,
    },
    {
      name: 'nounsDoaLogic',
      abi: nounsDoaLogicAbi,
      address: CHAIN_CONFIG.addresses.nounsDoaProxy,
    },
    {
      name: 'chainlinkPriceFeed',
      abi: chainlinkPriceFeedAbi,
    },
    {
      name: 'nnsEnsResolver',
      abi: nnsEnsResolverAbi,
    },
  ],
  plugins: [react()],
})
