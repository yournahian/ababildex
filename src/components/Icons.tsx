import React from 'react'
import {
  NetworkArc,
  NetworkEthereum,
  NetworkBase,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkPolygon,
  NetworkAvalanche,
  NetworkSolana,
  NetworkBinanceSmartChain,
  NetworkLinea,
  NetworkScroll,
  NetworkZksync,
  NetworkMantle,
  NetworkBlast,
  NetworkCelo,
  NetworkSeiNetwork,
  NetworkAptos,
  NetworkSui,
  NetworkSonic,
  NetworkNearProtocol,
  TokenUSDC,
  TokenUSDT,
  TokenEURC,
  TokenDAI,
  TokenETH,
  TokenWBTC,
  TokenPYUSD,
  TokenUSDE,
  TokenSOL,
  TokenAVAX,
  TokenPOL,
  TokenBNB,
  TokenARB,
  TokenOP,
  TokenLINK,
  TokenUNI,
  TokenAAVE,
  TokenMNT,
  TokenCELO,
  TokenSEI,
  TokenSUI,
  TokenAPT,
  TokenNEAR,
  TokenFTM,
  TokenBLAST,
  TokenCRV,
  TokenQUICK,
  TokenPNG,
} from '@web3icons/react'
import { DEFAULT_TOKEN_LIST } from '../data/tokens'

interface ChainIconProps {
  chain: string | number
  size?: number
  className?: string
}

export const ChainIcon: React.FC<ChainIconProps> = ({ chain, size = 18, className = '' }) => {
  const c = String(chain).toLowerCase()

  if (c.includes('arc') || c === '5042002' || c === '5042001' || c === '5042') {
    return <NetworkArc size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('eth') || c.includes('sepolia') || c === '1' || c === '11155111' || c === 'sep') {
    return <NetworkEthereum size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('base') || c === '8453' || c === '84532') {
    return <NetworkBase size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('arb') || c === '42161' || c === '421614') {
    return <NetworkArbitrumOne size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('op') || c.includes('optimism') || c === '10' || c === '11155420') {
    return <NetworkOptimism size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('poly') || c.includes('polygon') || c.includes('amoy') || c.includes('matic') || c === '137' || c === '80002') {
    return <NetworkPolygon size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('avax') || c.includes('avalanche') || c.includes('fuji') || c === '43114' || c === '43113') {
    return <NetworkAvalanche size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sol') || c.includes('devnet') || c === 'solana' || c === '101' || c === '103') {
    return <NetworkSolana size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('bsc') || c.includes('binance') || c.includes('bnb') || c === '56' || c === '97' || c.includes('tbnb')) {
    return <NetworkBinanceSmartChain size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('linea') || c === '59144' || c === '59141') {
    return <NetworkLinea size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('scroll') || c === '534352' || c === '534351') {
    return <NetworkScroll size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('zksync') || c.includes('zk') || c === '324' || c === '300') {
    return <NetworkZksync size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('mantle') || c.includes('mnt') || c === '5000' || c === '5003') {
    return <NetworkMantle size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('blast') || c === '81457' || c === '168587773') {
    return <NetworkBlast size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('celo') || c.includes('alfajores') || c === '42220' || c === '44787') {
    return <NetworkCelo size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sei') || c === '1329' || c === '1328') {
    return <NetworkSeiNetwork size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('aptos') || c.includes('apt') || c === '2' || c === '3') {
    return <NetworkAptos size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sui') || c === '784' || c === '785') {
    return <NetworkSui size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sonic') || c.includes('fantom') || c.includes('ftm') || c === '146' || c === '64165' || c === '250') {
    return <NetworkSonic size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('near') || c === '397' || c === '398') {
    return <NetworkNearProtocol size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }

  // Fallback
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] text-white uppercase ${className}`}
      style={{ width: size, height: size, background: 'linear-gradient(135deg, #5FFBF1, #0052FF)' }}
    >
      {String(chain).slice(0, 1)}
    </div>
  )
}

interface TokenIconProps {
  symbol: string
  size?: number
  className?: string
  fallbackColor?: string
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, size = 20, className = '', fallbackColor }) => {
  const s = (symbol || '').toUpperCase()

  switch (s) {
    case 'USDC':
      return <TokenUSDC size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'USDT':
      return <TokenUSDT size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'EURC':
      return <TokenEURC size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'DAI':
      return <TokenDAI size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WETH':
    case 'ETH':
      return <TokenETH size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WBTC':
    case 'BTC':
      return <TokenWBTC size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'PYUSD':
      return <TokenPYUSD size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'USDE':
    case 'USDB':
      return <TokenUSDE size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WSOL':
    case 'SOL':
      return <TokenSOL size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WBNB':
    case 'BNB':
      return <TokenBNB size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WAVAX':
    case 'AVAX':
      return <TokenAVAX size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'WPOL':
    case 'POL':
    case 'MATIC':
      return <TokenPOL size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'ARB':
      return <TokenARB size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'OP':
      return <TokenOP size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'LINK':
      return <TokenLINK size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'UNI':
      return <TokenUNI size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'AAVE':
      return <TokenAAVE size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'MNT':
      return <TokenMNT size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'CELO':
      return <TokenCELO size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'SEI':
      return <TokenSEI size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'SUI':
      return <TokenSUI size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'APT':
      return <TokenAPT size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'NEAR':
      return <TokenNEAR size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'FTM':
    case 'S':
      return <TokenFTM size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'BLAST':
      return <TokenBLAST size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'CRV':
      return <TokenCRV size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'QUICK':
      return <TokenQUICK size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'PNG':
      return <TokenPNG size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'NATIVE':
    case 'ARC':
      return <NetworkArc size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    default: {
      const meta = DEFAULT_TOKEN_LIST.find((tk) => tk.symbol.toUpperCase() === s)
      const bg = fallbackColor || meta?.logoColor || '#2775CA'
      return (
        <div
          className={`shrink-0 rounded-full flex items-center justify-center font-bold text-[9px] text-white shadow-sm uppercase ${className}`}
          style={{ width: size, height: size, background: bg }}
        >
          {s.slice(0, 3)}
        </div>
      )
    }
  }
}
