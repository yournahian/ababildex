export interface Token {
  symbol: string
  name: string
  decimals: number
  logoColor: string
  listed: boolean
  chain?: string
  price?: number
  change24h?: number
}

export interface ChainInfo {
  id: string        // Circle SDK / router chain key
  chainId: number
  name: string
  shortName: string
  isTestnet: boolean
  color: string
  explorerUrl?: string
}

// ──────────────────────────────────────────────────────────────────────────────
// 20 Mainnet Blockchains
// ──────────────────────────────────────────────────────────────────────────────
export const MAINNET_CHAINS: ChainInfo[] = [
  { id: 'Arc', chainId: 5042001, name: 'Arc Mainnet', shortName: 'ARC', isTestnet: false, color: '#5FFBF1', explorerUrl: 'https://arcscan.io' },
  { id: 'Ethereum', chainId: 1, name: 'Ethereum', shortName: 'ETH', isTestnet: false, color: '#627EEA', explorerUrl: 'https://etherscan.io' },
  { id: 'Base', chainId: 8453, name: 'Base', shortName: 'BASE', isTestnet: false, color: '#0052FF', explorerUrl: 'https://basescan.org' },
  { id: 'Arbitrum', chainId: 42161, name: 'Arbitrum One', shortName: 'ARB', isTestnet: false, color: '#28A0F0', explorerUrl: 'https://arbiscan.io' },
  { id: 'Optimism', chainId: 10, name: 'OP Mainnet', shortName: 'OP', isTestnet: false, color: '#FF0420', explorerUrl: 'https://optimistic.etherscan.io' },
  { id: 'Polygon', chainId: 137, name: 'Polygon PoS', shortName: 'POL', isTestnet: false, color: '#8247E5', explorerUrl: 'https://polygonscan.com' },
  { id: 'Avalanche', chainId: 43114, name: 'Avalanche C-Chain', shortName: 'AVAX', isTestnet: false, color: '#E84142', explorerUrl: 'https://snowtrace.io' },
  { id: 'Solana', chainId: 101, name: 'Solana', shortName: 'SOL', isTestnet: false, color: '#9945FF', explorerUrl: 'https://solscan.io' },
  { id: 'BSC', chainId: 56, name: 'BNB Smart Chain', shortName: 'BNB', isTestnet: false, color: '#F3BA2F', explorerUrl: 'https://bscscan.com' },
  { id: 'Linea', chainId: 59144, name: 'Linea', shortName: 'LINEA', isTestnet: false, color: '#121212', explorerUrl: 'https://lineascan.build' },
  { id: 'Scroll', chainId: 534352, name: 'Scroll', shortName: 'SCR', isTestnet: false, color: '#FFEEDA', explorerUrl: 'https://scrollscan.com' },
  { id: 'zkSync', chainId: 324, name: 'zkSync Era', shortName: 'ZK', isTestnet: false, color: '#8C8DFC', explorerUrl: 'https://era.zksync.network' },
  { id: 'Mantle', chainId: 5000, name: 'Mantle', shortName: 'MNT', isTestnet: false, color: '#000000', explorerUrl: 'https://mantlescan.xyz' },
  { id: 'Blast', chainId: 81457, name: 'Blast', shortName: 'BLAST', isTestnet: false, color: '#FCFC03', explorerUrl: 'https://blastscan.io' },
  { id: 'Celo', chainId: 42220, name: 'Celo', shortName: 'CELO', isTestnet: false, color: '#35D07F', explorerUrl: 'https://celoscan.io' },
  { id: 'Sei', chainId: 1329, name: 'Sei Network', shortName: 'SEI', isTestnet: false, color: '#9B1C2E', explorerUrl: 'https://seitrace.com' },
  { id: 'Aptos', chainId: 2, name: 'Aptos', shortName: 'APT', isTestnet: false, color: '#2ED8A7', explorerUrl: 'https://explorer.aptoslabs.com' },
  { id: 'Sui', chainId: 784, name: 'Sui', shortName: 'SUI', isTestnet: false, color: '#4DA2FF', explorerUrl: 'https://suiscan.xyz' },
  { id: 'Sonic', chainId: 146, name: 'Sonic', shortName: 'S', isTestnet: false, color: '#1969FF', explorerUrl: 'https://sonicscan.org' },
  { id: 'Near', chainId: 397, name: 'Near Protocol', shortName: 'NEAR', isTestnet: false, color: '#000000', explorerUrl: 'https://nearblocks.io' },
]

// ──────────────────────────────────────────────────────────────────────────────
// 20 Corresponding Testnet Blockchains
// ──────────────────────────────────────────────────────────────────────────────
export const TESTNET_CHAINS: ChainInfo[] = [
  { id: 'Arc_Testnet', chainId: 5042002, name: 'Arc Testnet', shortName: 'ARC-T', isTestnet: true, color: '#5FFBF1', explorerUrl: 'https://testnet.arcscan.io' },
  { id: 'Ethereum_Sepolia', chainId: 11155111, name: 'Ethereum Sepolia', shortName: 'SEP', isTestnet: true, color: '#627EEA', explorerUrl: 'https://sepolia.etherscan.io' },
  { id: 'Base_Sepolia', chainId: 84532, name: 'Base Sepolia', shortName: 'BASE-S', isTestnet: true, color: '#0052FF', explorerUrl: 'https://sepolia.basescan.org' },
  { id: 'Arbitrum_Sepolia', chainId: 421614, name: 'Arbitrum Sepolia', shortName: 'ARB-S', isTestnet: true, color: '#28A0F0', explorerUrl: 'https://sepolia.arbiscan.io' },
  { id: 'Optimism_Sepolia', chainId: 11155420, name: 'OP Sepolia', shortName: 'OP-S', isTestnet: true, color: '#FF0420', explorerUrl: 'https://sepolia-optimism.etherscan.io' },
  { id: 'Polygon_Amoy', chainId: 80002, name: 'Polygon Amoy', shortName: 'AMOY', isTestnet: true, color: '#8247E5', explorerUrl: 'https://amoy.polygonscan.com' },
  { id: 'Avalanche_Fuji', chainId: 43113, name: 'Avalanche Fuji', shortName: 'FUJI', isTestnet: true, color: '#E84142', explorerUrl: 'https://testnet.snowtrace.io' },
  { id: 'Solana_Devnet', chainId: 103, name: 'Solana Devnet', shortName: 'SOL-D', isTestnet: true, color: '#9945FF', explorerUrl: 'https://explorer.solana.com/?cluster=devnet' },
  { id: 'BSC_Testnet', chainId: 97, name: 'BNB Testnet', shortName: 'tBNB', isTestnet: true, color: '#F3BA2F', explorerUrl: 'https://testnet.bscscan.com' },
  { id: 'Linea_Sepolia', chainId: 59141, name: 'Linea Sepolia', shortName: 'LINEA-S', isTestnet: true, color: '#121212', explorerUrl: 'https://sepolia.lineascan.build' },
  { id: 'Scroll_Sepolia', chainId: 534351, name: 'Scroll Sepolia', shortName: 'SCR-S', isTestnet: true, color: '#FFEEDA', explorerUrl: 'https://sepolia.scrollscan.com' },
  { id: 'zkSync_Sepolia', chainId: 300, name: 'zkSync Sepolia', shortName: 'ZK-S', isTestnet: true, color: '#8C8DFC', explorerUrl: 'https://sepolia.explorer.zksync.io' },
  { id: 'Mantle_Sepolia', chainId: 5003, name: 'Mantle Sepolia', shortName: 'MNT-S', isTestnet: true, color: '#000000', explorerUrl: 'https://sepolia.mantlescan.xyz' },
  { id: 'Blast_Sepolia', chainId: 168587773, name: 'Blast Sepolia', shortName: 'BLAST-S', isTestnet: true, color: '#FCFC03', explorerUrl: 'https://sepolia.blastscan.io' },
  { id: 'Celo_Alfajores', chainId: 44787, name: 'Celo Alfajores', shortName: 'CELO-A', isTestnet: true, color: '#35D07F', explorerUrl: 'https://alfajores.celoscan.io' },
  { id: 'Sei_Testnet', chainId: 1328, name: 'Sei Testnet', shortName: 'SEI-T', isTestnet: true, color: '#9B1C2E', explorerUrl: 'https://seitrace.com/?cluster=testnet' },
  { id: 'Aptos_Testnet', chainId: 3, name: 'Aptos Testnet', shortName: 'APT-T', isTestnet: true, color: '#2ED8A7', explorerUrl: 'https://explorer.aptoslabs.com/?network=testnet' },
  { id: 'Sui_Testnet', chainId: 785, name: 'Sui Testnet', shortName: 'SUI-T', isTestnet: true, color: '#4DA2FF', explorerUrl: 'https://suiscan.xyz/testnet' },
  { id: 'Sonic_Testnet', chainId: 64165, name: 'Sonic Testnet', shortName: 'S-T', isTestnet: true, color: '#1969FF', explorerUrl: 'https://testnet.sonicscan.org' },
  { id: 'Near_Testnet', chainId: 398, name: 'Near Testnet', shortName: 'NEAR-T', isTestnet: true, color: '#000000', explorerUrl: 'https://testnet.nearblocks.io' },
]

// All 40 chains combined for universal indexing and lookup
export const SUPPORTED_CHAINS: ChainInfo[] = [...MAINNET_CHAINS, ...TESTNET_CHAINS]

/**
 * Filter chains by active NetworkMode ('mainnet' | 'testnet')
 */
export function getChainsForMode(mode: 'mainnet' | 'testnet'): ChainInfo[] {
  return mode === 'testnet' ? TESTNET_CHAINS : MAINNET_CHAINS
}

// ──────────────────────────────────────────────────────────────────────────────
// Token Catalog across all Mainnets & Testnets
// ──────────────────────────────────────────────────────────────────────────────
export const CHAIN_TOKENS: Record<string, Token[]> = {
  // ── Mainnet Tokens ─────────────────────────────────────────────────────────
  Arc: [
    { symbol: 'USDC', name: 'USD Coin (Native Gas)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Arc Mainnet', price: 1.00 },
    { symbol: 'EURC', name: 'Euro Coin', decimals: 6, logoColor: '#1B54B8', listed: true, chain: 'Arc Mainnet', price: 1.08 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Arc Mainnet', price: 1.00 },
    { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Arc Mainnet', price: 3510.0 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoColor: '#F7931A', listed: true, chain: 'Arc Mainnet', price: 67420.0 },
  ],
  Ethereum: [
    { symbol: 'ETH',  name: 'Ether (Native)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Ethereum', price: 3510.0 },
    { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Ethereum', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Ethereum', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Ethereum', price: 1.00 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoColor: '#F7931A', listed: true, chain: 'Ethereum', price: 67420.0 },
    { symbol: 'DAI',  name: 'Dai Stablecoin', decimals: 18, logoColor: '#F4B731', listed: true, chain: 'Ethereum', price: 1.00 },
    { symbol: 'LINK', name: 'Chainlink', decimals: 18, logoColor: '#2A5ADA', listed: true, chain: 'Ethereum', price: 14.80 },
    { symbol: 'UNI',  name: 'Uniswap', decimals: 18, logoColor: '#FF007A', listed: true, chain: 'Ethereum', price: 9.72 },
    { symbol: 'AAVE', name: 'Aave', decimals: 18, logoColor: '#B6509E', listed: true, chain: 'Ethereum', price: 108.0 },
    { symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, logoColor: '#FFA409', listed: true, chain: 'Ethereum', price: 0.000018 },
    { symbol: 'PEPE', name: 'Pepe', decimals: 18, logoColor: '#439B42', listed: true, chain: 'Ethereum', price: 0.0000095 },
    { symbol: 'LDO',  name: 'Lido DAO', decimals: 18, logoColor: '#00A3FF', listed: true, chain: 'Ethereum', price: 1.45 },
    { symbol: 'CRV',  name: 'Curve DAO', decimals: 18, logoColor: '#4C60D2', listed: true, chain: 'Ethereum', price: 0.32 },
    { symbol: 'MKR',  name: 'Maker', decimals: 18, logoColor: '#1AAB9B', listed: true, chain: 'Ethereum', price: 2120.0 },
    { symbol: 'ENS',  name: 'Ethereum Name Service', decimals: 18, logoColor: '#5298FF', listed: true, chain: 'Ethereum', price: 18.40 },
    { symbol: 'FRAX', name: 'Frax', decimals: 18, logoColor: '#000000', listed: true, chain: 'Ethereum', price: 0.999 },
    { symbol: 'PENDLE', name: 'Pendle', decimals: 18, logoColor: '#243C7A', listed: true, chain: 'Ethereum', price: 4.20 },
    { symbol: 'ENA',  name: 'Ethena', decimals: 18, logoColor: '#5C54D8', listed: true, chain: 'Ethereum', price: 0.38 },
    { symbol: 'GRT',  name: 'The Graph', decimals: 18, logoColor: '#6749DB', listed: true, chain: 'Ethereum', price: 0.22 },
    { symbol: '1INCH', name: '1inch', decimals: 18, logoColor: '#D11438', listed: true, chain: 'Ethereum', price: 0.34 },
    { symbol: 'BLUR', name: 'Blur', decimals: 18, logoColor: '#FF643D', listed: true, chain: 'Ethereum', price: 0.26 },
  ],
  Solana: [
    { symbol: 'SOL',  name: 'Solana (Native)', decimals: 9, logoColor: '#9945FF', listed: true, chain: 'Solana', price: 172.50 },
    { symbol: 'WSOL', name: 'Wrapped SOL', decimals: 9, logoColor: '#9945FF', listed: true, chain: 'Solana', price: 172.50 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Solana', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Solana', price: 1.00 },
    { symbol: 'JUP',  name: 'Jupiter', decimals: 6, logoColor: '#000000', listed: true, chain: 'Solana', price: 0.92 },
    { symbol: 'RAY',  name: 'Raydium', decimals: 6, logoColor: '#00C2FF', listed: true, chain: 'Solana', price: 1.85 },
    { symbol: 'BONK', name: 'Bonk', decimals: 5, logoColor: '#FFA409', listed: true, chain: 'Solana', price: 0.000022 },
    { symbol: 'WIF',  name: 'dogwifhat', decimals: 6, logoColor: '#A87D56', listed: true, chain: 'Solana', price: 2.40 },
    { symbol: 'PYTH', name: 'Pyth Network', decimals: 6, logoColor: '#5E2750', listed: true, chain: 'Solana', price: 0.36 },
    { symbol: 'JTO',  name: 'Jito', decimals: 9, logoColor: '#2EB774', listed: true, chain: 'Solana', price: 2.65 },
    { symbol: 'ORCA', name: 'Orca', decimals: 6, logoColor: '#FFD15C', listed: true, chain: 'Solana', price: 1.75 },
    { symbol: 'RENDER', name: 'Render', decimals: 8, logoColor: '#E51B24', listed: true, chain: 'Solana', price: 5.80 },
    { symbol: 'BOME', name: 'BOOK OF MEME', decimals: 6, logoColor: '#E84142', listed: true, chain: 'Solana', price: 0.0084 },
    { symbol: 'POPCAT', name: 'Popcat', decimals: 9, logoColor: '#D4A373', listed: true, chain: 'Solana', price: 1.28 },
    { symbol: 'DRIFT', name: 'Drift Protocol', decimals: 6, logoColor: '#6B46C1', listed: true, chain: 'Solana', price: 0.54 },
    { symbol: 'KMNO', name: 'Kamino Finance', decimals: 6, logoColor: '#00C888', listed: true, chain: 'Solana', price: 0.11 },
  ],
  Base: [
    { symbol: 'ETH',   name: 'Ether (Native)', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base', price: 3510.0 },
    { symbol: 'WETH',  name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Base', price: 3510.0 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Base', price: 1.00 },
    { symbol: 'BRETT', name: 'Brett', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base', price: 0.092 },
    { symbol: 'DEGEN', name: 'Degen', decimals: 18, logoColor: '#A36EFD', listed: true, chain: 'Base', price: 0.0078 },
    { symbol: 'AERO',  name: 'Aerodrome Finance', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base', price: 0.84 },
    { symbol: 'TOSHI', name: 'Toshi', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base', price: 0.00028 },
    { symbol: 'HIGHER', name: 'higher', decimals: 18, logoColor: '#22c55e', listed: true, chain: 'Base', price: 0.045 },
    { symbol: 'SEAM',  name: 'Seamless Protocol', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base', price: 1.65 },
  ],
  Arbitrum: [
    { symbol: 'ETH',    name: 'Ether (Native)', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Arbitrum', price: 3510.0 },
    { symbol: 'WETH',   name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Arbitrum', price: 3510.0 },
    { symbol: 'USDC',   name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Arbitrum', price: 1.00 },
    { symbol: 'USDT',   name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Arbitrum', price: 1.00 },
    { symbol: 'ARB',    name: 'Arbitrum Token', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Arbitrum', price: 1.12 },
    { symbol: 'GMX',    name: 'GMX', decimals: 18, logoColor: '#303f9f', listed: true, chain: 'Arbitrum', price: 28.50 },
    { symbol: 'MAGIC',  name: 'Magic', decimals: 18, logoColor: '#DD2C00', listed: true, chain: 'Arbitrum', price: 0.48 },
    { symbol: 'PENDLE', name: 'Pendle', decimals: 18, logoColor: '#243C7A', listed: true, chain: 'Arbitrum', price: 4.20 },
    { symbol: 'RDNT',   name: 'Radiant Capital', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Arbitrum', price: 0.065 },
    { symbol: 'GRAIL',  name: 'Camelot Token', decimals: 18, logoColor: '#FFA409', listed: true, chain: 'Arbitrum', price: 920.0 },
  ],
  Optimism: [
    { symbol: 'ETH',  name: 'Ether (Native)', decimals: 18, logoColor: '#FF0420', listed: true, chain: 'Optimism', price: 3510.0 },
    { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Optimism', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Optimism', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Optimism', price: 1.00 },
    { symbol: 'OP',   name: 'Optimism Token', decimals: 18, logoColor: '#FF0420', listed: true, chain: 'Optimism', price: 2.07 },
    { symbol: 'SNX',  name: 'Synthetix', decimals: 18, logoColor: '#00D1FF', listed: true, chain: 'Optimism', price: 1.92 },
    { symbol: 'VELO', name: 'Velodrome Finance', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Optimism', price: 0.095 },
  ],
  Polygon: [
    { symbol: 'POL',   name: 'Polygon (Native)', decimals: 18, logoColor: '#8247E5', listed: true, chain: 'Polygon', price: 0.94 },
    { symbol: 'WPOL',  name: 'Wrapped POL', decimals: 18, logoColor: '#8247E5', listed: true, chain: 'Polygon', price: 0.94 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Polygon', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Polygon', price: 1.00 },
    { symbol: 'QUICK', name: 'QuickSwap', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Polygon', price: 0.048 },
    { symbol: 'GHST',  name: 'Aavegotchi', decimals: 18, logoColor: '#FF64FF', listed: true, chain: 'Polygon', price: 1.15 },
    { symbol: 'SAND',  name: 'The Sandbox', decimals: 18, logoColor: '#00ADEF', listed: true, chain: 'Polygon', price: 0.32 },
  ],
  Avalanche: [
    { symbol: 'AVAX',  name: 'Avalanche (Native)', decimals: 18, logoColor: '#E84142', listed: true, chain: 'Avalanche', price: 38.40 },
    { symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18, logoColor: '#E84142', listed: true, chain: 'Avalanche', price: 38.40 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Avalanche', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Avalanche', price: 1.00 },
    { symbol: 'JOE',   name: 'Trader Joe', decimals: 18, logoColor: '#F56B3A', listed: true, chain: 'Avalanche', price: 0.42 },
    { symbol: 'QI',    name: 'BENQI', decimals: 18, logoColor: '#29B6AF', listed: true, chain: 'Avalanche', price: 0.016 },
    { symbol: 'PNG',   name: 'Pangolin', decimals: 18, logoColor: '#FF7A00', listed: true, chain: 'Avalanche', price: 0.28 },
    { symbol: 'COQ',   name: 'Coq Inu', decimals: 18, logoColor: '#E84142', listed: true, chain: 'Avalanche', price: 0.0000018 },
  ],
  BSC: [
    { symbol: 'BNB',   name: 'BNB (Native)', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Chain', price: 585.0 },
    { symbol: 'WBNB',  name: 'Wrapped BNB', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Chain', price: 585.0 },
    { symbol: 'USDT',  name: 'Tether USD', decimals: 18, logoColor: '#26A17B', listed: true, chain: 'BNB Chain', price: 1.00 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 18, logoColor: '#2775CA', listed: true, chain: 'BNB Chain', price: 1.00 },
    { symbol: 'BUSD',  name: 'Binance USD', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Chain', price: 1.00 },
    { symbol: 'CAKE',  name: 'PancakeSwap', decimals: 18, logoColor: '#D1884F', listed: true, chain: 'BNB Chain', price: 2.15 },
    { symbol: 'XVS',   name: 'Venus', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Chain', price: 7.40 },
    { symbol: 'FLOKI', name: 'Floki', decimals: 9, logoColor: '#F3BA2F', listed: true, chain: 'BNB Chain', price: 0.00014 },
    { symbol: 'TWT',   name: 'Trust Wallet Token', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'BNB Chain', price: 0.98 },
  ],
  Sui: [
    { symbol: 'SUI',   name: 'Sui (Native)', decimals: 9, logoColor: '#4DA2FF', listed: true, chain: 'Sui', price: 1.85 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sui', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Sui', price: 1.00 },
    { symbol: 'CETUS', name: 'Cetus Protocol', decimals: 9, logoColor: '#4DA2FF', listed: true, chain: 'Sui', price: 0.18 },
    { symbol: 'NAVX',  name: 'NAVI Protocol', decimals: 9, logoColor: '#0052FF', listed: true, chain: 'Sui', price: 0.14 },
    { symbol: 'SCA',   name: 'Scallop', decimals: 9, logoColor: '#FF643D', listed: true, chain: 'Sui', price: 0.45 },
  ],
  Aptos: [
    { symbol: 'APT',  name: 'Aptos (Native)', decimals: 8, logoColor: '#2ED8A7', listed: true, chain: 'Aptos', price: 8.90 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Aptos', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Aptos', price: 1.00 },
    { symbol: 'THL',  name: 'Thala', decimals: 8, logoColor: '#2ED8A7', listed: true, chain: 'Aptos', price: 1.25 },
    { symbol: 'AMU',  name: 'Amnis Finance', decimals: 8, logoColor: '#0052FF', listed: true, chain: 'Aptos', price: 0.062 },
  ],
  Sonic: [
    { symbol: 'S',     name: 'Sonic (Native)', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic', price: 0.82 },
    { symbol: 'FTM',   name: 'Fantom Token', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic', price: 0.82 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sonic', price: 1.00 },
    { symbol: 'EQUAL', name: 'Equalizer DEX', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic', price: 4.80 },
    { symbol: 'BEETS', name: 'Beethoven X', decimals: 18, logoColor: '#00D1FF', listed: true, chain: 'Sonic', price: 0.024 },
  ],
  Sei: [
    { symbol: 'SEI',   name: 'Sei (Native)', decimals: 6, logoColor: '#9B1C2E', listed: true, chain: 'Sei', price: 0.42 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sei', price: 1.00 },
    { symbol: 'ASTRO', name: 'Astroport', decimals: 6, logoColor: '#9B1C2E', listed: true, chain: 'Sei', price: 0.075 },
    { symbol: 'KUDO',  name: 'Kryptonite', decimals: 6, logoColor: '#FF643D', listed: true, chain: 'Sei', price: 0.018 },
  ],
  Near: [
    { symbol: 'NEAR',   name: 'Near (Native)', decimals: 24, logoColor: '#000000', listed: true, chain: 'Near', price: 5.20 },
    { symbol: 'USDC',   name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Near', price: 1.00 },
    { symbol: 'USDT',   name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Near', price: 1.00 },
    { symbol: 'REF',    name: 'Ref Finance', decimals: 18, logoColor: '#00C08B', listed: true, chain: 'Near', price: 0.14 },
    { symbol: 'AURORA', name: 'Aurora', decimals: 18, logoColor: '#70D44B', listed: true, chain: 'Near', price: 0.16 },
  ],
  Blast: [
    { symbol: 'ETH',   name: 'Ether (Native)', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast', price: 3510.0 },
    { symbol: 'USDB',  name: 'Blast USD', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast', price: 1.00 },
    { symbol: 'BLAST', name: 'Blast Token', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast', price: 0.015 },
    { symbol: 'PAC',   name: 'PacMoon', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast', price: 0.045 },
  ],
  Linea: [
    { symbol: 'ETH',  name: 'Ether (Native)', decimals: 18, logoColor: '#121212', listed: true, chain: 'Linea', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Linea', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Linea', price: 1.00 },
    { symbol: 'FOXY', name: 'Foxy', decimals: 18, logoColor: '#FF643D', listed: true, chain: 'Linea', price: 0.012 },
  ],
  Scroll: [
    { symbol: 'ETH',   name: 'Ether (Native)', decimals: 18, logoColor: '#FFEEDA', listed: true, chain: 'Scroll', price: 3510.0 },
    { symbol: 'USDC',  name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Scroll', price: 1.00 },
    { symbol: 'SCR',   name: 'Scroll Token', decimals: 18, logoColor: '#FFEEDA', listed: true, chain: 'Scroll', price: 0.85 },
    { symbol: 'STONE', name: 'StakeStone Ether', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Scroll', price: 3520.0 },
  ],
  zkSync: [
    { symbol: 'ETH',  name: 'Ether (Native)', decimals: 18, logoColor: '#8C8DFC', listed: true, chain: 'zkSync', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'zkSync', price: 1.00 },
    { symbol: 'ZK',   name: 'zkSync Token', decimals: 18, logoColor: '#8C8DFC', listed: true, chain: 'zkSync', price: 0.14 },
    { symbol: 'HOLD', name: 'Holdstation', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'zkSync', price: 2.40 },
  ],
  Mantle: [
    { symbol: 'MNT',  name: 'Mantle (Native)', decimals: 18, logoColor: '#000000', listed: true, chain: 'Mantle', price: 0.78 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Mantle', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Mantle', price: 1.00 },
    { symbol: 'COOK', name: 'mETH Protocol', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Mantle', price: 0.035 },
  ],
  Celo: [
    { symbol: 'CELO',  name: 'Celo (Native)', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo', price: 0.65 },
    { symbol: 'cUSD',  name: 'Celo Dollar', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo', price: 1.00 },
    { symbol: 'cEUR',  name: 'Celo Euro', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo', price: 1.08 },
  ],

  // ── Testnet Tokens (20 Chains) ─────────────────────────────────────────────
  Arc_Testnet: [
    { symbol: 'USDC', name: 'USD Coin (Arc Gas)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Arc Testnet', price: 1.00 },
    { symbol: 'EURC', name: 'Euro Coin (Testnet)', decimals: 6, logoColor: '#1B54B8', listed: true, chain: 'Arc Testnet', price: 1.08 },
    { symbol: 'USDT', name: 'Tether USD (Testnet)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Arc Testnet', price: 1.00 },
    { symbol: 'WETH', name: 'Wrapped Ether (Testnet)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Arc Testnet', price: 3510.0 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin (Testnet)', decimals: 8, logoColor: '#F7931A', listed: true, chain: 'Arc Testnet', price: 67420.0 },
  ],
  Ethereum_Sepolia: [
    { symbol: 'ETH',  name: 'Sepolia Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Ethereum Sepolia', price: 3510.0 },
    { symbol: 'WETH', name: 'Wrapped Ether (Sepolia)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Ethereum Sepolia', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin (Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Ethereum Sepolia', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD (Sepolia)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Ethereum Sepolia', price: 1.00 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin (Sepolia)', decimals: 8, logoColor: '#F7931A', listed: true, chain: 'Ethereum Sepolia', price: 67420.0 },
    { symbol: 'DAI',  name: 'Dai Stablecoin (Sepolia)', decimals: 18, logoColor: '#F4B731', listed: true, chain: 'Ethereum Sepolia', price: 1.00 },
    { symbol: 'LINK', name: 'Chainlink (Sepolia)', decimals: 18, logoColor: '#2A5ADA', listed: true, chain: 'Ethereum Sepolia', price: 14.80 },
    { symbol: 'UNI',  name: 'Uniswap (Sepolia)', decimals: 18, logoColor: '#FF007A', listed: true, chain: 'Ethereum Sepolia', price: 9.72 },
  ],
  Base_Sepolia: [
    { symbol: 'ETH',   name: 'Base Sepolia Ether', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base Sepolia', price: 3510.0 },
    { symbol: 'WETH',  name: 'Wrapped Ether (Base Sepolia)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Base Sepolia', price: 3510.0 },
    { symbol: 'USDC',  name: 'USD Coin (Base Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Base Sepolia', price: 1.00 },
    { symbol: 'BRETT', name: 'Brett (Testnet)', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base Sepolia', price: 0.092 },
    { symbol: 'AERO',  name: 'Aerodrome (Testnet)', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Base Sepolia', price: 0.84 },
  ],
  Arbitrum_Sepolia: [
    { symbol: 'ETH',    name: 'Arbitrum Sepolia Ether', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Arbitrum Sepolia', price: 3510.0 },
    { symbol: 'WETH',   name: 'Wrapped Ether (Arb Sepolia)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Arbitrum Sepolia', price: 3510.0 },
    { symbol: 'USDC',   name: 'USD Coin (Arb Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Arbitrum Sepolia', price: 1.00 },
    { symbol: 'ARB',    name: 'Arbitrum Token (Sepolia)', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Arbitrum Sepolia', price: 1.12 },
    { symbol: 'GMX',    name: 'GMX (Sepolia)', decimals: 18, logoColor: '#303f9f', listed: true, chain: 'Arbitrum Sepolia', price: 28.50 },
    { symbol: 'LINK',   name: 'Chainlink (Arb Sepolia)', decimals: 18, logoColor: '#2A5ADA', listed: true, chain: 'Arbitrum Sepolia', price: 14.80 },
  ],
  Optimism_Sepolia: [
    { symbol: 'ETH',  name: 'OP Sepolia Ether', decimals: 18, logoColor: '#FF0420', listed: true, chain: 'OP Sepolia', price: 3510.0 },
    { symbol: 'WETH', name: 'Wrapped Ether (OP Sepolia)', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'OP Sepolia', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin (OP Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'OP Sepolia', price: 1.00 },
    { symbol: 'OP',   name: 'Optimism Token (Sepolia)', decimals: 18, logoColor: '#FF0420', listed: true, chain: 'OP Sepolia', price: 2.07 },
    { symbol: 'SNX',  name: 'Synthetix (Sepolia)', decimals: 18, logoColor: '#00D1FF', listed: true, chain: 'OP Sepolia', price: 1.92 },
  ],
  Polygon_Amoy: [
    { symbol: 'POL',   name: 'Polygon Amoy POL', decimals: 18, logoColor: '#8247E5', listed: true, chain: 'Polygon Amoy', price: 0.94 },
    { symbol: 'WPOL',  name: 'Wrapped POL (Amoy)', decimals: 18, logoColor: '#8247E5', listed: true, chain: 'Polygon Amoy', price: 0.94 },
    { symbol: 'USDC',  name: 'USD Coin (Amoy)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Polygon Amoy', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD (Amoy)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Polygon Amoy', price: 1.00 },
    { symbol: 'QUICK', name: 'QuickSwap (Amoy)', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'Polygon Amoy', price: 0.048 },
  ],
  Avalanche_Fuji: [
    { symbol: 'AVAX',  name: 'Avalanche Fuji AVAX', decimals: 18, logoColor: '#E84142', listed: true, chain: 'Avalanche Fuji', price: 38.40 },
    { symbol: 'WAVAX', name: 'Wrapped AVAX (Fuji)', decimals: 18, logoColor: '#E84142', listed: true, chain: 'Avalanche Fuji', price: 38.40 },
    { symbol: 'USDC',  name: 'USD Coin (Fuji)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Avalanche Fuji', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD (Fuji)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Avalanche Fuji', price: 1.00 },
    { symbol: 'JOE',   name: 'Trader Joe (Fuji)', decimals: 18, logoColor: '#F56B3A', listed: true, chain: 'Avalanche Fuji', price: 0.42 },
  ],
  Solana_Devnet: [
    { symbol: 'SOL',  name: 'Solana Devnet SOL', decimals: 9, logoColor: '#9945FF', listed: true, chain: 'Solana Devnet', price: 172.50 },
    { symbol: 'WSOL', name: 'Wrapped SOL (Devnet)', decimals: 9, logoColor: '#9945FF', listed: true, chain: 'Solana Devnet', price: 172.50 },
    { symbol: 'USDC', name: 'USD Coin (Devnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Solana Devnet', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD (Devnet)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Solana Devnet', price: 1.00 },
    { symbol: 'JUP',  name: 'Jupiter (Devnet)', decimals: 6, logoColor: '#000000', listed: true, chain: 'Solana Devnet', price: 0.92 },
    { symbol: 'BONK', name: 'Bonk (Devnet)', decimals: 5, logoColor: '#FFA409', listed: true, chain: 'Solana Devnet', price: 0.000022 },
  ],
  BSC_Testnet: [
    { symbol: 'BNB',   name: 'BNB Testnet tBNB', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Testnet', price: 585.0 },
    { symbol: 'WBNB',  name: 'Wrapped BNB (Testnet)', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Testnet', price: 585.0 },
    { symbol: 'USDT',  name: 'Tether USD (Testnet)', decimals: 18, logoColor: '#26A17B', listed: true, chain: 'BNB Testnet', price: 1.00 },
    { symbol: 'USDC',  name: 'USD Coin (Testnet)', decimals: 18, logoColor: '#2775CA', listed: true, chain: 'BNB Testnet', price: 1.00 },
    { symbol: 'BUSD',  name: 'Binance USD (Testnet)', decimals: 18, logoColor: '#F3BA2F', listed: true, chain: 'BNB Testnet', price: 1.00 },
    { symbol: 'CAKE',  name: 'PancakeSwap (Testnet)', decimals: 18, logoColor: '#D1884F', listed: true, chain: 'BNB Testnet', price: 2.15 },
  ],
  Linea_Sepolia: [
    { symbol: 'ETH',  name: 'Linea Sepolia Ether', decimals: 18, logoColor: '#121212', listed: true, chain: 'Linea Sepolia', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin (Linea Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Linea Sepolia', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD (Linea Sepolia)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Linea Sepolia', price: 1.00 },
    { symbol: 'FOXY', name: 'Foxy (Testnet)', decimals: 18, logoColor: '#FF643D', listed: true, chain: 'Linea Sepolia', price: 0.012 },
  ],
  Scroll_Sepolia: [
    { symbol: 'ETH',   name: 'Scroll Sepolia Ether', decimals: 18, logoColor: '#FFEEDA', listed: true, chain: 'Scroll Sepolia', price: 3510.0 },
    { symbol: 'USDC',  name: 'USD Coin (Scroll Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Scroll Sepolia', price: 1.00 },
    { symbol: 'SCR',   name: 'Scroll Token (Sepolia)', decimals: 18, logoColor: '#FFEEDA', listed: true, chain: 'Scroll Sepolia', price: 0.85 },
    { symbol: 'STONE', name: 'StakeStone (Sepolia)', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Scroll Sepolia', price: 3520.0 },
  ],
  zkSync_Sepolia: [
    { symbol: 'ETH',  name: 'zkSync Sepolia Ether', decimals: 18, logoColor: '#8C8DFC', listed: true, chain: 'zkSync Sepolia', price: 3510.0 },
    { symbol: 'USDC', name: 'USD Coin (zkSync Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'zkSync Sepolia', price: 1.00 },
    { symbol: 'ZK',   name: 'zkSync Token (Sepolia)', decimals: 18, logoColor: '#8C8DFC', listed: true, chain: 'zkSync Sepolia', price: 0.14 },
    { symbol: 'HOLD', name: 'Holdstation (Sepolia)', decimals: 18, logoColor: '#28A0F0', listed: true, chain: 'zkSync Sepolia', price: 2.40 },
  ],
  Mantle_Sepolia: [
    { symbol: 'MNT',  name: 'Mantle Sepolia MNT', decimals: 18, logoColor: '#000000', listed: true, chain: 'Mantle Sepolia', price: 0.78 },
    { symbol: 'USDC', name: 'USD Coin (Mantle Sepolia)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Mantle Sepolia', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD (Mantle Sepolia)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Mantle Sepolia', price: 1.00 },
    { symbol: 'COOK', name: 'mETH Protocol (Sepolia)', decimals: 18, logoColor: '#0052FF', listed: true, chain: 'Mantle Sepolia', price: 0.035 },
  ],
  Blast_Sepolia: [
    { symbol: 'ETH',   name: 'Blast Sepolia Ether', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast Sepolia', price: 3510.0 },
    { symbol: 'USDB',  name: 'Blast USD (Sepolia)', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast Sepolia', price: 1.00 },
    { symbol: 'BLAST', name: 'Blast Token (Sepolia)', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast Sepolia', price: 0.015 },
    { symbol: 'PAC',   name: 'PacMoon (Sepolia)', decimals: 18, logoColor: '#FCFC03', listed: true, chain: 'Blast Sepolia', price: 0.045 },
  ],
  Celo_Alfajores: [
    { symbol: 'CELO',  name: 'Celo Alfajores CELO', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo Alfajores', price: 0.65 },
    { symbol: 'cUSD',  name: 'Celo Dollar (Alfajores)', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo Alfajores', price: 1.00 },
    { symbol: 'cEUR',  name: 'Celo Euro (Alfajores)', decimals: 18, logoColor: '#35D07F', listed: true, chain: 'Celo Alfajores', price: 1.08 },
    { symbol: 'USDC',  name: 'USD Coin (Alfajores)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Celo Alfajores', price: 1.00 },
  ],
  Sei_Testnet: [
    { symbol: 'SEI',   name: 'Sei Testnet SEI', decimals: 6, logoColor: '#9B1C2E', listed: true, chain: 'Sei Testnet', price: 0.42 },
    { symbol: 'USDC',  name: 'USD Coin (Sei Testnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sei Testnet', price: 1.00 },
    { symbol: 'ASTRO', name: 'Astroport (Testnet)', decimals: 6, logoColor: '#9B1C2E', listed: true, chain: 'Sei Testnet', price: 0.075 },
    { symbol: 'KUDO',  name: 'Kryptonite (Testnet)', decimals: 6, logoColor: '#FF643D', listed: true, chain: 'Sei Testnet', price: 0.018 },
  ],
  Aptos_Testnet: [
    { symbol: 'APT',  name: 'Aptos Testnet APT', decimals: 8, logoColor: '#2ED8A7', listed: true, chain: 'Aptos Testnet', price: 8.90 },
    { symbol: 'USDC', name: 'USD Coin (Aptos Testnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Aptos Testnet', price: 1.00 },
    { symbol: 'USDT', name: 'Tether USD (Aptos Testnet)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Aptos Testnet', price: 1.00 },
    { symbol: 'THL',  name: 'Thala (Testnet)', decimals: 8, logoColor: '#2ED8A7', listed: true, chain: 'Aptos Testnet', price: 1.25 },
  ],
  Sui_Testnet: [
    { symbol: 'SUI',   name: 'Sui Testnet SUI', decimals: 9, logoColor: '#4DA2FF', listed: true, chain: 'Sui Testnet', price: 1.85 },
    { symbol: 'USDC',  name: 'USD Coin (Sui Testnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sui Testnet', price: 1.00 },
    { symbol: 'USDT',  name: 'Tether USD (Sui Testnet)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Sui Testnet', price: 1.00 },
    { symbol: 'CETUS', name: 'Cetus Protocol (Testnet)', decimals: 9, logoColor: '#4DA2FF', listed: true, chain: 'Sui Testnet', price: 0.18 },
  ],
  Sonic_Testnet: [
    { symbol: 'S',     name: 'Sonic Testnet S', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic Testnet', price: 0.82 },
    { symbol: 'FTM',   name: 'Fantom Token (Testnet)', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic Testnet', price: 0.82 },
    { symbol: 'USDC',  name: 'USD Coin (Sonic Testnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Sonic Testnet', price: 1.00 },
    { symbol: 'EQUAL', name: 'Equalizer DEX (Testnet)', decimals: 18, logoColor: '#1969FF', listed: true, chain: 'Sonic Testnet', price: 4.80 },
  ],
  Near_Testnet: [
    { symbol: 'NEAR',   name: 'Near Testnet NEAR', decimals: 24, logoColor: '#000000', listed: true, chain: 'Near Testnet', price: 5.20 },
    { symbol: 'USDC',   name: 'USD Coin (Near Testnet)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Near Testnet', price: 1.00 },
    { symbol: 'USDT',   name: 'Tether USD (Near Testnet)', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Near Testnet', price: 1.00 },
    { symbol: 'REF',    name: 'Ref Finance (Testnet)', decimals: 18, logoColor: '#00C08B', listed: true, chain: 'Near Testnet', price: 0.14 },
  ],
}

/**
 * Returns the list of tokens specific to a chain, or all unique tokens if "All".
 */
export function getTokensForChain(chainKeyOrName?: string): Token[] {
  if (!chainKeyOrName || chainKeyOrName === 'All') {
    return DEFAULT_TOKEN_LIST
  }

  // Exact key match
  if (CHAIN_TOKENS[chainKeyOrName]) {
    return CHAIN_TOKENS[chainKeyOrName]
  }

  // Search by name, shortName, or id
  const target = chainKeyOrName.toLowerCase().replace(/[\s-_]/g, '')
  const matchedChain = SUPPORTED_CHAINS.find(
    (c) =>
      c.id.toLowerCase().replace(/[\s-_]/g, '') === target ||
      c.name.toLowerCase().replace(/[\s-_]/g, '').includes(target) ||
      c.shortName.toLowerCase().replace(/[\s-_]/g, '') === target
  )

  if (matchedChain && CHAIN_TOKENS[matchedChain.id]) {
    return CHAIN_TOKENS[matchedChain.id]
  }

  return DEFAULT_TOKEN_LIST
}

// Flat deduplicated list of all tokens across all chains
const seen = new Set<string>()
export const DEFAULT_TOKEN_LIST: Token[] = Object.values(CHAIN_TOKENS)
  .flat()
  .filter((t) => {
    if (seen.has(t.symbol)) return false
    seen.add(t.symbol)
    return true
  })

export const SUPPORTED_TOKENS = DEFAULT_TOKEN_LIST.map((t) => t.symbol)
export type SupportedToken = string
