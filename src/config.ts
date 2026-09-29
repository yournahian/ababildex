/**
 * wagmi configuration — multi-chain
 * Built with Arc Studio — https://studio.arc.io
 */

import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, base, baseSepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia, polygon, polygonAmoy, avalanche, avalancheFuji } from 'wagmi/chains'
import { arcTestnet } from 'viem/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { registerChain } from './tracing'

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arcTestnet.id, arcTestnet.rpcUrls.default.http[0])

export const config = createConfig({
  chains: [arcTestnet, mainnet, base, arbitrum, optimism, polygon, avalanche, sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, polygonAmoy, avalancheFuji],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'AbabilDEX' }),
  ],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [avalancheFuji.id]: http(),
  },
})
