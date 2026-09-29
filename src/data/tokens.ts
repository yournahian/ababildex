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

export const SUPPORTED_CHAINS: ChainInfo[] = [
  { id: 'Arc_Testnet', chainId: 5042002, name: 'Arc Testnet', shortName: 'ARC', isTestnet: true, color: '#5FFBF1', explorerUrl: 'https://testnet.arcscan.io' },
  { id: 'Ethereum', chainId: 1, name: 'Ethereum', shortName: 'ETH', isTestnet: false, color: '#627EEA', explorerUrl: 'https://etherscan.io' },
  { id: 'Base', chainId: 8453, name: 'Base', shortName: 'BASE', isTestnet: false, color: '#0052FF', explorerUrl: 'https://basescan.org' },
  { id: 'Arbitrum', chainId: 42161, name: 'Arbitrum', shortName: 'ARB', isTestnet: false, color: '#28A0F0', explorerUrl: 'https://arbiscan.io' },
  { id: 'Optimism', chainId: 10, name: 'Optimism', shortName: 'OP', isTestnet: false, color: '#FF0420', explorerUrl: 'https://optimistic.etherscan.io' },
  { id: 'Polygon', chainId: 137, name: 'Polygon', shortName: 'POL', isTestnet: false, color: '#8247E5', explorerUrl: 'https://polygonscan.com' },
  { id: 'Avalanche', chainId: 43114, name: 'Avalanche', shortName: 'AVAX', isTestnet: false, color: '#E84142', explorerUrl: 'https://snowtrace.io' },
  { id: 'Solana', chainId: 101, name: 'Solana', shortName: 'SOL', isTestnet: false, color: '#9945FF', explorerUrl: 'https://solscan.io' },
  { id: 'BSC', chainId: 56, name: 'BNB Chain', shortName: 'BNB', isTestnet: false, color: '#F3BA2F', explorerUrl: 'https://bscscan.com' },
  { id: 'Linea', chainId: 59144, name: 'Linea', shortName: 'LINEA', isTestnet: false, color: '#121212', explorerUrl: 'https://lineascan.build' },
  { id: 'Scroll', chainId: 534352, name: 'Scroll', shortName: 'SCR', isTestnet: false, color: '#FFEEDA', explorerUrl: 'https://scrollscan.com' },
  { id: 'zkSync', chainId: 324, name: 'zkSync Era', shortName: 'ZK', isTestnet: false, color: '#8C8DFC', explorerUrl: 'https://era.zksync.network' },
  { id: 'Mantle', chainId: 5000, name: 'Mantle', shortName: 'MNT', isTestnet: false, color: '#000000', explorerUrl: 'https://mantlescan.xyz' },
  { id: 'Blast', chainId: 81457, name: 'Blast', shortName: 'BLAST', isTestnet: false, color: '#FCFC03', explorerUrl: 'https://blastscan.io' },
  { id: 'Celo', chainId: 42220, name: 'Celo', shortName: 'CELO', isTestnet: false, color: '#35D07F', explorerUrl: 'https://celoscan.io' },
  { id: 'Sei', chainId: 1329, name: 'Sei Network', shortName: 'SEI', isTestnet: false, color: '#9B1C2E', explorerUrl: 'https://seitrace.com' },
  { id: 'Aptos', chainId: 2, name: 'Aptos', shortName: 'APT', isTestnet: false, color: '#2ED8A7', explorerUrl: 'https://explorer.aptoslabs.com' },
  { id: 'Sui', chainId: 784, name: 'Sui', shortName: 'SUI', isTestnet: false, color: '#4DA2FF', explorerUrl: 'https://suiscan.xyz' },
  { id: 'Sonic', chainId: 146, name: 'Sonic (Fantom)', shortName: 'S', isTestnet: false, color: '#1969FF', explorerUrl: 'https://sonicscan.org' },
  { id: 'Near', chainId: 397, name: 'Near Protocol', shortName: 'NEAR', isTestnet: false, color: '#000000', explorerUrl: 'https://nearblocks.io' },
]

export const CHAIN_TOKENS: Record<string, Token[]> = {
  Arc_Testnet: [
    { symbol: 'USDC', name: 'USD Coin (Gas)', decimals: 6, logoColor: '#2775CA', listed: true, chain: 'Arc Testnet', price: 1.00 },
    { symbol: 'EURC', name: 'Euro Coin', decimals: 6, logoColor: '#1B54B8', listed: true, chain: 'Arc Testnet', price: 1.08 },
    { symbol: 'USDT', name: 'Tether USD', decimals: 6, logoColor: '#26A17B', listed: true, chain: 'Arc Testnet', price: 1.00 },
    { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoColor: '#627EEA', listed: true, chain: 'Arc Testnet', price: 3510.0 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoColor: '#F7931A', listed: true, chain: 'Arc Testnet', price: 67420.0 },
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
  const target = chainKeyOrName.toLowerCase()
  const matchedChain = SUPPORTED_CHAINS.find(
    (c) =>
      c.id.toLowerCase() === target ||
      c.name.toLowerCase().includes(target) ||
      c.shortName.toLowerCase() === target
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
