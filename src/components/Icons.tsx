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
} from '@web3icons/react'

interface ChainIconProps {
  chain: string | number
  size?: number
  className?: string
}

export const ChainIcon: React.FC<ChainIconProps> = ({ chain, size = 18, className = '' }) => {
  const c = String(chain).toLowerCase()

  if (c.includes('arc') || c === '5042002' || c === '5042') {
    return <NetworkArc size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('eth') || c === '1' || c === '11155111') {
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
  if (c.includes('poly') || c.includes('polygon') || c.includes('matic') || c === '137' || c === '80002') {
    return <NetworkPolygon size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('avax') || c.includes('avalanche') || c === '43114' || c === '43113') {
    return <NetworkAvalanche size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sol') || c === 'solana') {
    return <NetworkSolana size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('bsc') || c.includes('binance') || c.includes('bnb') || c === '56') {
    return <NetworkBinanceSmartChain size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('linea') || c === '59144') {
    return <NetworkLinea size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('scroll') || c === '534352') {
    return <NetworkScroll size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('zksync') || c.includes('zk') || c === '324') {
    return <NetworkZksync size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('mantle') || c.includes('mnt') || c === '5000') {
    return <NetworkMantle size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('blast') || c === '81457') {
    return <NetworkBlast size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('celo') || c === '42220') {
    return <NetworkCelo size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sei') || c === '1329') {
    return <NetworkSeiNetwork size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('aptos') || c.includes('apt')) {
    return <NetworkAptos size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sui')) {
    return <NetworkSui size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('sonic') || c.includes('fantom') || c.includes('ftm') || c === '146' || c === '250') {
    return <NetworkSonic size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
  }
  if (c.includes('near')) {
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
      return <TokenFTM size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'BLAST':
      return <TokenBLAST size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    case 'NATIVE':
    case 'ARC':
      return <NetworkArc size={size} variant="branded" className={`shrink-0 rounded-full ${className}`} />
    default:
      return (
        <div
          className={`shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${className}`}
          style={{ width: size, height: size, background: fallbackColor || 'linear-gradient(135deg, #5FFBF1, #0052FF)' }}
        >
          {s.slice(0, 3)}
        </div>
      )
  }
}
