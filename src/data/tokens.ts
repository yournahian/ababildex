export interface Token {
  symbol: string
  name: string
  decimals: number
  logoColor: string
  listed: boolean
  price?: number // display only, not real-time
  change24h?: number
}

export interface ChainInfo {
  id: string        // Circle SDK chain name
  chainId: number
  name: string
  shortName: string
  isTestnet: boolean
  color: string
}

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'Arc_Testnet', chainId: 5042002, name: 'Arc Testnet', shortName: 'ARC', isTestnet: true, color: '#5FFBF1' },
  { id: 'Ethereum', chainId: 1, name: 'Ethereum', shortName: 'ETH', isTestnet: false, color: '#627EEA' },
  { id: 'Base', chainId: 8453, name: 'Base', shortName: 'BASE', isTestnet: false, color: '#0052FF' },
  { id: 'Arbitrum', chainId: 42161, name: 'Arbitrum', shortName: 'ARB', isTestnet: false, color: '#28A0F0' },
  { id: 'Optimism', chainId: 10, name: 'Optimism', shortName: 'OP', isTestnet: false, color: '#FF0420' },
  { id: 'Polygon', chainId: 137, name: 'Polygon', shortName: 'POL', isTestnet: false, color: '#8247E5' },
  { id: 'Avalanche', chainId: 43114, name: 'Avalanche', shortName: 'AVAX', isTestnet: false, color: '#E84142' },
  { id: 'Solana', chainId: 0, name: 'Solana', shortName: 'SOL', isTestnet: false, color: '#9945FF' },
  { id: 'BSC', chainId: 56, name: 'BNB Chain', shortName: 'BNB', isTestnet: false, color: '#F3BA2F' },
  { id: 'Linea', chainId: 59144, name: 'Linea', shortName: 'LINEA', isTestnet: false, color: '#121212' },
  { id: 'Scroll', chainId: 534352, name: 'Scroll', shortName: 'SCR', isTestnet: false, color: '#FFEEDA' },
  { id: 'zkSync', chainId: 324, name: 'zkSync Era', shortName: 'ZK', isTestnet: false, color: '#8C8DFC' },
  { id: 'Mantle', chainId: 5000, name: 'Mantle', shortName: 'MNT', isTestnet: false, color: '#000000' },
  { id: 'Blast', chainId: 81457, name: 'Blast', shortName: 'BLAST', isTestnet: false, color: '#FCFC03' },
  { id: 'Celo', chainId: 42220, name: 'Celo', shortName: 'CELO', isTestnet: false, color: '#35D07F' },
  { id: 'Sei', chainId: 1329, name: 'Sei Network', shortName: 'SEI', isTestnet: false, color: '#9B1C2E' },
  { id: 'Aptos', chainId: 0, name: 'Aptos', shortName: 'APT', isTestnet: false, color: '#2ED8A7' },
  { id: 'Sui', chainId: 0, name: 'Sui', shortName: 'SUI', isTestnet: false, color: '#4DA2FF' },
  { id: 'Sonic', chainId: 146, name: 'Sonic (Fantom)', shortName: 'S', isTestnet: false, color: '#1969FF' },
  { id: 'Near', chainId: 0, name: 'Near Protocol', shortName: 'NEAR', isTestnet: false, color: '#000000' },
]

export const DEFAULT_TOKEN_LIST: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoColor: '#2775CA', listed: true, price: 1.00 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, price: 1.0002 },
  { symbol: 'EURC', name: 'Euro Coin', decimals: 6, logoColor: '#1B54B8', listed: true, price: 1.078 },
  { symbol: 'DAI',  name: 'Dai Stablecoin', decimals: 18, logoColor: '#F4B731', listed: true, price: 0.9998 },
  { symbol: 'WETH', name: 'Wrapped ETH', decimals: 18, logoColor: '#627EEA', listed: true, price: 3510.0 },
  { symbol: 'WBTC', name: 'Wrapped BTC', decimals: 8, logoColor: '#F7931A', listed: true, price: 67420.0 },
  { symbol: 'WSOL', name: 'Wrapped SOL', decimals: 9, logoColor: '#9945FF', listed: true, price: 172.5 },
  { symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, logoColor: '#F3BA2F', listed: true, price: 585.0 },
  { symbol: 'WAVAX', name: 'Wrapped AVAX', decimals: 18, logoColor: '#E84142', listed: true, price: 38.4 },
  { symbol: 'WPOL', name: 'Wrapped POL', decimals: 18, logoColor: '#8247E5', listed: true, price: 0.94 },
  { symbol: 'ARB', name: 'Arbitrum', decimals: 18, logoColor: '#28A0F0', listed: true, price: 1.12 },
  { symbol: 'OP', name: 'Optimism', decimals: 18, logoColor: '#FF0420', listed: true, price: 2.07 },
  { symbol: 'LINK', name: 'Chainlink', decimals: 18, logoColor: '#2A5ADA', listed: true, price: 14.8 },
  { symbol: 'UNI', name: 'Uniswap', decimals: 18, logoColor: '#FF007A', listed: true, price: 9.72 },
  { symbol: 'AAVE', name: 'Aave', decimals: 18, logoColor: '#B6509E', listed: true, price: 108.0 },
  { symbol: 'PYUSD', name: 'PayPal USD', decimals: 6, logoColor: '#003087', listed: true, price: 0.9996 },
  { symbol: 'USDE', name: 'USDe', decimals: 18, logoColor: '#6366f1', listed: true, price: 0.9997 },
  { symbol: 'MNT', name: 'Mantle', decimals: 18, logoColor: '#000000', listed: true, price: 0.78 },
  { symbol: 'CELO', name: 'Celo', decimals: 18, logoColor: '#35D07F', listed: true, price: 0.65 },
  { symbol: 'SEI', name: 'Sei', decimals: 6, logoColor: '#9B1C2E', listed: true, price: 0.42 },
  { symbol: 'SUI', name: 'Sui', decimals: 9, logoColor: '#4DA2FF', listed: true, price: 1.85 },
  { symbol: 'APT', name: 'Aptos', decimals: 8, logoColor: '#2ED8A7', listed: true, price: 8.90 },
  { symbol: 'NEAR', name: 'Near Protocol', decimals: 24, logoColor: '#000000', listed: true, price: 5.20 },
  { symbol: 'FTM', name: 'Sonic (Fantom)', decimals: 18, logoColor: '#1969FF', listed: true, price: 0.82 },
  { symbol: 'NATIVE', name: 'Native Gas', decimals: 18, logoColor: '#5FFBF1', listed: true, price: 1.00 },
]

export const SUPPORTED_TOKENS = [
  'USDC', 'USDT', 'EURC', 'DAI', 'WETH', 'WBTC', 'WSOL', 'WBNB', 'WAVAX', 'WPOL',
  'ARB', 'OP', 'LINK', 'UNI', 'AAVE', 'PYUSD', 'USDE', 'MNT', 'CELO', 'SEI', 'SUI', 'APT', 'NEAR', 'FTM', 'NATIVE',
] as const

export type SupportedToken = typeof SUPPORTED_TOKENS[number]
