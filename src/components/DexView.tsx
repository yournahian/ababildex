import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Droplets, TrendingUp, Plus, Search, ExternalLink, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useClickOutside } from '../hooks/useClickOutside'
import { useNetworkStore } from '../hooks/useNetworkStore'
import { Token, SUPPORTED_CHAINS, getChainsForMode, getTokensForChain } from '../data/tokens'
import { ChainIcon, TokenIcon } from './Icons'

interface Pool {
  id: string
  token0: string
  token1: string
  color0: string
  color1: string
  tvl: string
  apr: string
  volume24h: string
  chain: string
}

const MAINNET_POOLS: Pool[] = [
  { id: 'p1', token0: 'USDC', token1: 'USDT', color0: '#2775CA', color1: '#26A17B', tvl: '4.2M', apr: '12.4%', volume24h: '840K', chain: 'Arc' },
  { id: 'p2', token0: 'USDC', token1: 'WETH', color0: '#2775CA', color1: '#627EEA', tvl: '8.7M', apr: '18.2%', volume24h: '1.4M', chain: 'Ethereum' },
  { id: 'p3', token0: 'USDC', token1: 'WBTC', color0: '#2775CA', color1: '#F7931A', tvl: '12.1M', apr: '9.8%', volume24h: '2.1M', chain: 'Base' },
  { id: 'p4', token0: 'EURC', token1: 'USDC', color0: '#1B54B8', color1: '#2775CA', tvl: '2.8M', apr: '15.6%', volume24h: '560K', chain: 'Arbitrum' },
  { id: 'p5', token0: 'DAI', token1: 'USDC', color0: '#F4B731', color1: '#2775CA', tvl: '6.3M', apr: '11.1%', volume24h: '920K', chain: 'Optimism' },
  { id: 'p6', token0: 'SOL', token1: 'USDC', color0: '#9945FF', color1: '#2775CA', tvl: '18.5M', apr: '24.2%', volume24h: '4.8M', chain: 'Solana' },
  { id: 'p7', token0: 'POL', token1: 'USDT', color0: '#8247E5', color1: '#26A17B', tvl: '3.6M', apr: '14.8%', volume24h: '710K', chain: 'Polygon' },
  { id: 'p8', token0: 'AVAX', token1: 'USDC', color0: '#E84142', color1: '#2775CA', tvl: '5.9M', apr: '16.5%', volume24h: '1.1M', chain: 'Avalanche' },
  { id: 'p9', token0: 'BNB', token1: 'USDT', color0: '#F3BA2F', color1: '#26A17B', tvl: '9.4M', apr: '13.2%', volume24h: '1.9M', chain: 'BSC' },
  { id: 'p10', token0: 'SUI', token1: 'USDC', color0: '#4DA2FF', color1: '#2775CA', tvl: '4.8M', apr: '28.4%', volume24h: '1.3M', chain: 'Sui' },
]

const TESTNET_POOLS: Pool[] = [
  { id: 'tp1', token0: 'USDC', token1: 'NATIVE', color0: '#2775CA', color1: '#5FFBF1', tvl: '1.2M', apr: '16.4%', volume24h: '320K', chain: 'Arc Testnet' },
  { id: 'tp2', token0: 'USDC', token1: 'WETH', color0: '#2775CA', color1: '#627EEA', tvl: '2.5M', apr: '21.2%', volume24h: '610K', chain: 'Ethereum Sepolia' },
  { id: 'tp3', token0: 'USDC', token1: 'USDT', color0: '#2775CA', color1: '#26A17B', tvl: '3.8M', apr: '14.5%', volume24h: '940K', chain: 'Base Sepolia' },
  { id: 'tp4', token0: 'ARB', token1: 'USDC', color0: '#28A0F0', color1: '#2775CA', tvl: '1.9M', apr: '18.6%', volume24h: '430K', chain: 'Arbitrum Sepolia' },
  { id: 'tp5', token0: 'OP', token1: 'USDC', color0: '#FF0420', color1: '#2775CA', tvl: '1.4M', apr: '19.1%', volume24h: '280K', chain: 'OP Sepolia' },
  { id: 'tp6', token0: 'SOL', token1: 'USDC', color0: '#9945FF', color1: '#2775CA', tvl: '4.1M', apr: '26.8%', volume24h: '1.1M', chain: 'Solana Devnet' },
  { id: 'tp7', token0: 'POL', token1: 'USDC', color0: '#8247E5', color1: '#2775CA', tvl: '1.1M', apr: '17.2%', volume24h: '250K', chain: 'Polygon Amoy' },
  { id: 'tp8', token0: 'AVAX', token1: 'USDC', color0: '#E84142', color1: '#2775CA', tvl: '2.0M', apr: '20.5%', volume24h: '510K', chain: 'Avalanche Fuji' },
  { id: 'tp9', token0: 'tBNB', token1: 'USDC', color0: '#F3BA2F', color1: '#2775CA', tvl: '2.6M', apr: '15.8%', volume24h: '670K', chain: 'BNB Testnet' },
  { id: 'tp10', token0: 'SUI', token1: 'USDC', color0: '#4DA2FF', color1: '#2775CA', tvl: '1.8M', apr: '31.4%', volume24h: '490K', chain: 'Sui Testnet' },
]

type DexTab = 'pools' | 'tokens'

interface DexViewProps {
  tokens: Token[]
}

export function DexView({ tokens }: DexViewProps) {
  const { isConnected, address } = useAccount()
  const networkMode = useNetworkStore((s) => s.networkMode)
  const availableChains = getChainsForMode(networkMode)
  const [tab, setDexTab] = useState<DexTab>('pools')
  const [search, setSearch] = useState('')
  const [showLiquidityModal, setShowLiquidityModal] = useState(false)
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [tokenA, setTokenA] = useState('USDC')
  const [tokenB, setTokenB] = useState('USDT')
  const [showTokenAPicker, setShowTokenAPicker] = useState(false)
  const [showTokenBPicker, setShowTokenBPicker] = useState(false)
  const [chainFilter, setChainFilter] = useState('All')
  const [showChainFilter, setShowChainFilter] = useState(false)

  // Reset chain filter when networkMode changes
  useEffect(() => {
    setChainFilter('All')
  }, [networkMode])

  const chainFilterRef = useClickOutside<HTMLDivElement>(() => setShowChainFilter(false), showChainFilter)
  const tokenAPickerRef = useClickOutside<HTMLDivElement>(() => setShowTokenAPicker(false), showTokenAPicker)
  const tokenBPickerRef = useClickOutside<HTMLDivElement>(() => setShowTokenBPicker(false), showTokenBPicker)

  const openAddLiquidity = (pool?: Pool) => {
    if (pool) {
      setSelectedPool(pool)
      setTokenA(pool.token0)
      setTokenB(pool.token1)
    } else {
      setSelectedPool(null)
      setTokenA('USDC')
      setTokenB('USDT')
    }
    setShowTokenAPicker(false)
    setShowTokenBPicker(false)
    setShowLiquidityModal(true)
  }

  const activePools = networkMode === 'mainnet' ? MAINNET_POOLS : TESTNET_POOLS

  const listedTokens = tokens.filter((t) => t.listed)
  const filteredPools = activePools.filter((p) => {
    const matchesSearch =
      p.token0.toLowerCase().includes(search.toLowerCase()) ||
      p.token1.toLowerCase().includes(search.toLowerCase()) ||
      p.chain.toLowerCase().includes(search.toLowerCase())
    const matchesChain = chainFilter === 'All' || p.chain.toLowerCase().includes(chainFilter.toLowerCase())
    return matchesSearch && matchesChain
  })
  const filteredTokens = listedTokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  )

  const chains = ['All', ...availableChains.map((c) => c.shortName)]

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>DEX</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Liquidity pools and token markets across all chains.</p>
        </div>
        <button
          onClick={() => openAddLiquidity()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#000000' }}
        >
          <Plus className="size-4" /> Add Liquidity
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total TVL', value: '$34.1M' },
          { label: '24h Volume', value: '$5.8M' },
          { label: 'Active Pools', value: '142' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl px-4 py-3 glass-card">
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{stat.label}</p>
            <p className="display text-lg font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + search + chain filter */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-muted)' }}>
          {(['pools', 'tokens'] as DexTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setDexTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: tab === t ? 'rgba(95,251,241,0.15)' : 'transparent',
                color: tab === t ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chain filter dropdown */}
        {tab === 'pools' && (
          <div className={`relative ${showChainFilter ? 'z-40' : 'z-10'}`} ref={chainFilterRef}>
            <button
              onClick={() => setShowChainFilter(!showChainFilter)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
            >
              {chainFilter !== 'All' && <ChainIcon chain={chainFilter} size={14} />}
              <span>{chainFilter === 'All' ? 'All Chains' : chainFilter}</span>
              <ChevronDown className="size-3.5 opacity-60 ml-0.5" />
            </button>
            {showChainFilter && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowChainFilter(false)} />
                <div
                  className="absolute z-50 left-0 mt-1 w-44 max-h-60 overflow-y-auto rounded-xl shadow-2xl"
                  style={{ background: '#141414', border: '1px solid var(--border)' }}
                >
                  {chains.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setChainFilter(c); setShowChainFilter(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left"
                      style={{ color: chainFilter === c ? 'var(--accent)' : 'var(--ink)' }}
                    >
                      {c !== 'All' ? <ChainIcon chain={c} size={14} /> : <span className="size-3.5 rounded-full border border-white/20 inline-block" />}
                      <span>{c === 'All' ? 'All Chains' : c}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: 'var(--subtle)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-transparent rounded-xl pl-8 pr-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>

      {/* Pools tab */}
      {tab === 'pools' && (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
            <span className="col-span-4">Pool</span>
            <span className="col-span-2 text-right">TVL</span>
            <span className="col-span-2 text-right">APR</span>
            <span className="col-span-2 text-right">24h Vol</span>
            <span className="col-span-2 text-right">Chain</span>
          </div>
          {filteredPools.map((pool) => (
            <div
              key={pool.id}
              className="grid grid-cols-12 items-center px-4 py-3 rounded-2xl cursor-pointer hover:bg-white/4 transition-colors glass-card"
              onClick={() => openAddLiquidity(pool)}
            >
              <div className="col-span-4 flex items-center gap-2.5">
                <div className="relative flex items-center">
                  <TokenIcon symbol={pool.token0} size={24} className="ring-2 ring-[#0a1628]" />
                  <TokenIcon symbol={pool.token1} size={24} className="-ml-2 ring-2 ring-[#0a1628]" />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{pool.token0}/{pool.token1}</span>
              </div>
              <span className="col-span-2 text-sm tabular-nums text-right" style={{ color: 'var(--ink)' }}>${pool.tvl}</span>
              <span className="col-span-2 text-sm tabular-nums text-right font-semibold" style={{ color: 'var(--success)' }}>{pool.apr}</span>
              <span className="col-span-2 text-sm tabular-nums text-right" style={{ color: 'var(--muted)' }}>${pool.volume24h}</span>
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <ChainIcon chain={pool.chain} size={15} />
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>{pool.chain}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tokens tab */}
      {tab === 'tokens' && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
            <span className="col-span-5">Token</span>
            <span className="col-span-3 text-right">Decimals</span>
            <span className="col-span-4 text-right">Status</span>
          </div>
          {filteredTokens.map((token) => (
            <div key={token.symbol} className="grid grid-cols-12 items-center px-4 py-3 rounded-2xl glass-card">
              <div className="col-span-5 flex items-center gap-2.5">
                <TokenIcon symbol={token.symbol} size={28} fallbackColor={token.logoColor} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{token.symbol}</p>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>{token.name}</p>
                </div>
              </div>
              <span className="col-span-3 text-sm tabular-nums text-right" style={{ color: 'var(--muted)' }}>{token.decimals}</span>
              <div className="col-span-4 flex justify-end">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: token.listed ? 'rgba(93,200,136,0.1)' : 'rgba(240,98,118,0.1)', color: token.listed ? 'var(--success)' : 'var(--danger)' }}>
                  {token.listed ? 'Listed' : 'Delisted'}
                </span>
              </div>
            </div>
          ))}
          {filteredTokens.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
              <TrendingUp className="size-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tokens found</p>
            </div>
          )}
        </div>
      )}

      {/* Liquidity Modal */}
      {showLiquidityModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowLiquidityModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6"
            style={{ background: '#0d0d0d', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>
                Add Liquidity — {tokenA}/{tokenB}
              </h2>
              <button onClick={() => setShowLiquidityModal(false)} className="text-sm hover:text-white transition-colors" style={{ color: 'var(--muted)' }}>Close</button>
            </div>
            <div className="space-y-3">
              {/* Token A */}
              <div className={`rounded-2xl p-4 glass-inner relative ${showTokenAPicker ? 'z-30' : 'z-10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Token A</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Balance: —</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative" ref={tokenAPickerRef}>
                    <button
                      type="button"
                      onClick={() => { setShowTokenAPicker(!showTokenAPicker); setShowTokenBPicker(false) }}
                      className="flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded-xl transition-all hover:bg-white/10"
                      style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}
                    >
                      <TokenIcon symbol={tokenA} size={18} />
                      <span>{tokenA}</span>
                      <ChevronDown className="size-3.5 opacity-70 ml-0.5" />
                    </button>
                    {showTokenAPicker && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowTokenAPicker(false)} />
                        <div
                          className="absolute z-40 left-0 mt-1 w-48 max-h-56 overflow-y-auto rounded-xl shadow-2xl"
                          style={{ background: '#141414', border: '1px solid var(--border)' }}
                        >
                          {listedTokens.map((t) => (
                            <button
                              key={t.symbol}
                              type="button"
                              onClick={() => { setTokenA(t.symbol); setShowTokenAPicker(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
                              style={{ color: tokenA === t.symbol ? 'var(--accent)' : 'var(--ink)' }}
                            >
                              <TokenIcon symbol={t.symbol} size={18} />
                              <div className="flex flex-col">
                                <span className="font-semibold">{t.symbol}</span>
                                <span className="text-[10px] text-muted opacity-60 leading-tight">{t.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input placeholder="0.00" className="display flex-1 min-w-0 bg-transparent text-xl font-bold tabular-nums outline-none text-right placeholder:opacity-30" style={{ color: 'var(--ink)' }} />
                </div>
              </div>

              <div className="flex justify-center">
                <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                  <Plus className="size-3.5" style={{ color: 'var(--accent)' }} />
                </div>
              </div>

              {/* Token B */}
              <div className={`rounded-2xl p-4 glass-inner relative ${showTokenBPicker ? 'z-30' : 'z-0'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>Token B</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Balance: —</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative" ref={tokenBPickerRef}>
                    <button
                      type="button"
                      onClick={() => { setShowTokenBPicker(!showTokenBPicker); setShowTokenAPicker(false) }}
                      className="flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1.5 rounded-xl transition-all hover:bg-white/10"
                      style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}
                    >
                      <TokenIcon symbol={tokenB} size={18} />
                      <span>{tokenB}</span>
                      <ChevronDown className="size-3.5 opacity-70 ml-0.5" />
                    </button>
                    {showTokenBPicker && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowTokenBPicker(false)} />
                        <div
                          className="absolute z-40 left-0 mt-1 w-48 max-h-56 overflow-y-auto rounded-xl shadow-2xl"
                          style={{ background: '#141414', border: '1px solid var(--border)' }}
                        >
                          {listedTokens.map((t) => (
                            <button
                              key={t.symbol}
                              type="button"
                              onClick={() => { setTokenB(t.symbol); setShowTokenBPicker(false) }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
                              style={{ color: tokenB === t.symbol ? 'var(--accent)' : 'var(--ink)' }}
                            >
                              <TokenIcon symbol={t.symbol} size={18} />
                              <div className="flex flex-col">
                                <span className="font-semibold">{t.symbol}</span>
                                <span className="text-[10px] text-muted opacity-60 leading-tight">{t.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input placeholder="0.00" className="display flex-1 min-w-0 bg-transparent text-xl font-bold tabular-nums outline-none text-right placeholder:opacity-30" style={{ color: 'var(--ink)' }} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.15)' }}>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Estimated APR</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--success)' }}>{selectedPool?.apr ?? '14.5%'}</span>
              </div>

              {!isConnected ? (
                <ConnectKitButton.Custom>
                  {({ show }) => (
                    <button
                      onClick={show}
                      className="w-full rounded-2xl py-3.5 text-sm font-bold shadow-[0_0_20px_rgba(95,251,241,0.25)] hover:shadow-[0_0_28px_rgba(95,251,241,0.4)] transition-all"
                      style={{ background: 'var(--accent)', color: '#000000' }}
                    >
                      Connect Wallet to Add Liquidity
                    </button>
                  )}
                </ConnectKitButton.Custom>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Liquidity supplied to ${tokenA}/${tokenB} pool!`)
                    setShowLiquidityModal(false)
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(95,251,241,0.25)] hover:shadow-[0_0_28px_rgba(95,251,241,0.4)] hover:opacity-95"
                  style={{ background: 'var(--accent)', color: '#000000' }}
                >
                  Supply Liquidity
                </button>
              )}

              <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
                Note: Liquidity provision on this testnet demo simulates LP pool deposit across chains with instant settlement.
              </p>
              {isConnected && (
                <div className="flex items-center gap-1.5 text-xs pt-1" style={{ color: 'var(--subtle)' }}>
                  <Droplets className="size-3.5" style={{ color: 'var(--accent)' }} />
                  <span>Connected as: <span className="mono">{address?.slice(0, 6)}…{address?.slice(-4)}</span></span>
                  <ExternalLink className="size-3 ml-auto" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
