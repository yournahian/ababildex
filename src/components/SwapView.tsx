import { useState, useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { AppKit, SwapChain } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import { ArrowUpDown, ChevronDown, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useClickOutside } from '../hooks/useClickOutside'
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS, DEFAULT_TOKEN_LIST, type SupportedToken } from '../data/tokens'
import { ChainIcon, TokenIcon } from './Icons'

const kit = new AppKit()

const CHAIN_ID_MAP: Record<string, number> = {
  Arc_Testnet: 5042002,
  Ethereum: 1,
  Base: 8453,
  Arbitrum: 42161,
  Optimism: 10,
  Polygon: 137,
  Avalanche: 43114,
}

type SwapState = 'idle' | 'estimating' | 'reviewing' | 'swapping' | 'success' | 'error'

interface Estimate {
  estimatedOutput: { amount: string; token: string }
  fees: Array<{ type: string; amount: string; token: string }>
}

export function SwapView() {
  const { address, connector, isConnected, chainId: walletChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const [fromChain, setFromChain] = useState('Arc_Testnet')
  const [tokenIn, setTokenIn] = useState<SupportedToken>('USDC')
  const [tokenOut, setTokenOut] = useState<SupportedToken>('USDT')
  const [amountIn, setAmountIn] = useState('')
  const [swapState, setSwapState] = useState<SwapState>('idle')
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showFromChainPicker, setShowFromChainPicker] = useState(false)
  const [showTokenInPicker, setShowTokenInPicker] = useState(false)
  const [showTokenOutPicker, setShowTokenOutPicker] = useState(false)

  const fromChainPickerRef = useClickOutside<HTMLDivElement>(() => setShowFromChainPicker(false), showFromChainPicker)
  const tokenInPickerRef = useClickOutside<HTMLDivElement>(() => setShowTokenInPicker(false), showTokenInPicker)
  const tokenOutPickerRef = useClickOutside<HTMLDivElement>(() => setShowTokenOutPicker(false), showTokenOutPicker)

  const isArcOnArc = fromChain.includes('Arc') && (
    (tokenIn === 'USDC' && tokenOut === 'NATIVE') ||
    (tokenIn === 'NATIVE' && tokenOut === 'USDC')
  )

  const getAdapter = useCallback(async () => {
    if (!connector) throw new Error('Wallet not connected')
    const targetChainId = CHAIN_ID_MAP[fromChain]
    if (targetChainId && walletChainId !== targetChainId) {
      await switchChainAsync({ chainId: targetChainId })
    }
    const provider = (await connector.getProvider()) as EIP1193Provider
    return createViemAdapterFromProvider({ provider })
  }, [connector, fromChain, walletChainId, switchChainAsync])

  const handleEstimate = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      toast.error('Enter an amount to swap')
      return
    }
    if (isArcOnArc) {
      toast.error('USDC and NATIVE are the same asset on Arc')
      return
    }
    if (tokenIn === tokenOut) {
      toast.error('Select different tokens to swap')
      return
    }
    setSwapState('estimating')
    setErrorMsg(null)
    try {
      const adapter = await getAdapter()
      const chainValues = Object.values(SwapChain) as string[]
      const chainId = chainValues.includes(fromChain) ? (fromChain as SwapChain) : SwapChain.Arc_Testnet
      const est = await kit.estimateSwap({
        from: { adapter, chain: chainId },
        tokenIn,
        tokenOut,
        amountIn,
      })
      setEstimate(est as unknown as Estimate)
      setSwapState('reviewing')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Estimation failed'
      setErrorMsg(msg)
      setSwapState('error')
    }
  }, [amountIn, getAdapter, fromChain, tokenIn, tokenOut, isArcOnArc])

  const handleSwap = useCallback(async () => {
    if (!estimate) return
    setSwapState('swapping')
    setErrorMsg(null)
    try {
      const adapter = await getAdapter()
      toast.info('Swaps route through LiFi aggregator. By proceeding, you agree to their terms of service.')
      const swapChainValues = Object.values(SwapChain) as string[]
      const swapChain = swapChainValues.includes(fromChain) ? (fromChain as SwapChain) : SwapChain.Arc_Testnet
      const result = await kit.swap({
        from: { adapter, chain: swapChain },
        tokenIn,
        tokenOut,
        amountIn,
        config: { slippageBps: 150 },
      })
      const r = result as unknown as { txHash?: string; explorerUrl?: string }
      setTxHash(r.txHash ?? null)
      setSwapState('success')
      toast.success('Swap completed!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Swap failed'
      setErrorMsg(msg)
      setSwapState('error')
    }
  }, [estimate, getAdapter, fromChain, tokenIn, tokenOut, amountIn])

  const reset = () => {
    setSwapState('idle')
    setEstimate(null)
    setTxHash(null)
    setErrorMsg(null)
    setAmountIn('')
  }

  const flipTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setEstimate(null)
    if (swapState === 'reviewing') setSwapState('idle')
  }

  const chainInfo = SUPPORTED_CHAINS.find((c) => c.id === fromChain)
  const isLoading = swapState === 'estimating' || swapState === 'swapping'

  return (
    <div className="max-w-md mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Swap</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Swap tokens across 18+ blockchains. Powered by Circle App Kit + LiFi.
        </p>
      </div>

      {/* Fee badge */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(172,198,233,0.08)', border: '1px solid rgba(172,198,233,0.18)' }}>
        <Info className="size-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Provider fee: <strong style={{ color: 'var(--accent)' }}>0.02%</strong> — one of the lowest in DeFi. Slippage: 1.5%.
        </span>
      </div>

      <div className="rounded-3xl p-5 glass-card space-y-3">

        {/* Chain selector */}
        <div className={`relative ${showFromChainPicker ? 'z-40' : 'z-10'}`} ref={fromChainPickerRef}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>Chain</label>
          <button
            onClick={() => setShowFromChainPicker(!showFromChainPicker)}
            className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
          >
            <ChainIcon chain={fromChain} size={20} />
            <span className="font-semibold">{chainInfo?.name ?? fromChain}</span>
            <ChevronDown className="size-4 ml-auto" style={{ color: 'var(--muted)' }} />
          </button>
          {showFromChainPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFromChainPicker(false)} />
              <div className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-xl overflow-hidden shadow-2xl" style={{ background: '#141414', border: '1px solid var(--border)' }}>
                {SUPPORTED_CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setFromChain(c.id); setShowFromChainPicker(false); setEstimate(null) }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--ink)' }}
                  >
                    <ChainIcon chain={c.id} size={20} />
                    <span className="font-medium">{c.name}</span>
                    {c.isTestnet && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}>testnet</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Token In */}
        <div className={`relative ${showTokenInPicker ? 'z-30' : 'z-0'}`}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>You pay</label>
          <div className={`rounded-2xl p-4 glass-inner relative ${showTokenInPicker ? 'z-30' : 'z-0'}`}>
            <div className="flex items-center gap-3">
              <div className="relative" ref={tokenInPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowTokenInPicker(!showTokenInPicker)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}
                >
                  <TokenIcon symbol={tokenIn} size={22} />
                  <span>{tokenIn}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </button>
                {showTokenInPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTokenInPicker(false)} />
                    <div className="absolute z-50 left-0 mt-1 w-52 max-h-64 overflow-y-auto rounded-xl shadow-2xl" style={{ background: '#141414', border: '1px solid var(--border)' }}>
                      {SUPPORTED_TOKENS.map((t) => {
                        const meta = DEFAULT_TOKEN_LIST.find((tk) => tk.symbol === t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { setTokenIn(t); setShowTokenInPicker(false); setEstimate(null) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: t === tokenIn ? 'var(--accent)' : 'var(--ink)' }}
                          >
                            <TokenIcon symbol={t} size={20} />
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-xs leading-none">{t}</span>
                              {meta?.name && <span className="text-[10px] text-muted opacity-60 leading-tight mt-0.5">{meta.name}</span>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              <input
                inputMode="decimal"
                value={amountIn}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  if (v === '' || /^\d*\.?\d*$/.test(v)) { setAmountIn(v); setEstimate(null) }
                }}
                placeholder="0.00"
                className="display flex-1 min-w-0 bg-transparent text-2xl font-bold tabular-nums outline-none text-right placeholder:opacity-30"
                style={{ color: 'var(--ink)' }}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center relative z-0">
          <button
            type="button"
            onClick={flipTokens}
            className="size-9 rounded-xl flex items-center justify-center transition-all hover:rotate-180 active:scale-95"
            style={{ background: 'rgba(95,251,241,0.1)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            <ArrowUpDown className="size-4" />
          </button>
        </div>

        {/* Token Out */}
        <div className={`relative ${showTokenOutPicker ? 'z-20' : 'z-0'}`}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>You receive</label>
          <div className={`rounded-2xl p-4 glass-inner relative ${showTokenOutPicker ? 'z-20' : 'z-0'}`}>
            <div className="flex items-center gap-3">
              <div className="relative" ref={tokenOutPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowTokenOutPicker(!showTokenOutPicker)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}
                >
                  <TokenIcon symbol={tokenOut} size={22} />
                  <span>{tokenOut}</span>
                  <ChevronDown className="size-3.5 opacity-70" />
                </button>
                {showTokenOutPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowTokenOutPicker(false)} />
                    <div className="absolute z-50 left-0 mt-1 w-52 max-h-64 overflow-y-auto rounded-xl shadow-2xl" style={{ background: '#141414', border: '1px solid var(--border)' }}>
                      {SUPPORTED_TOKENS.map((t) => {
                        const meta = DEFAULT_TOKEN_LIST.find((tk) => tk.symbol === t)
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { setTokenOut(t); setShowTokenOutPicker(false); setEstimate(null) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: t === tokenOut ? 'var(--accent)' : 'var(--ink)' }}
                          >
                            <TokenIcon symbol={t} size={20} />
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-xs leading-none">{t}</span>
                              {meta?.name && <span className="text-[10px] text-muted opacity-60 leading-tight mt-0.5">{meta.name}</span>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className="display flex-1 min-w-0 text-2xl font-bold tabular-nums text-right opacity-60" style={{ color: 'var(--ink)' }}>
                {swapState === 'reviewing' && estimate ? estimate.estimatedOutput.amount : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Estimate preview */}
        {swapState === 'reviewing' && estimate && (
          <div className="rounded-2xl p-3 space-y-1.5" style={{ background: 'rgba(172,198,233,0.06)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted)' }}>Estimated output</span>
              <span className="tabular-nums font-semibold" style={{ color: 'var(--ink)' }}>{estimate.estimatedOutput.amount} {estimate.estimatedOutput.token}</span>
            </div>
            {estimate.fees.map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Fee ({f.type})</span>
                <span className="tabular-nums" style={{ color: 'var(--muted)' }}>{f.amount} {f.token}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted)' }}>Slippage</span>
              <span className="tabular-nums" style={{ color: 'var(--muted)' }}>1.5%</span>
            </div>
            <p className="text-xs mt-1 pt-1.5" style={{ color: 'var(--subtle)', borderTop: '1px solid var(--border)' }}>
              Routed via LiFi aggregator. Subject to their terms of service.
            </p>
          </div>
        )}

        {/* Success */}
        {swapState === 'success' && (
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(93,200,136,0.08)', border: '1px solid rgba(93,200,136,0.25)' }}>
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Swap complete</p>
              {txHash && <p className="text-xs mt-1 mono opacity-70" style={{ color: 'var(--ink)' }}>{txHash.slice(0, 20)}…</p>}
              <button onClick={reset} className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Swap again</button>
            </div>
          </div>
        )}

        {/* Error */}
        {swapState === 'error' && errorMsg && (
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(240,98,118,0.08)', border: '1px solid rgba(240,98,118,0.25)' }}>
            <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Swap failed</p>
              <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--ink)' }}>{errorMsg.slice(0, 120)}</p>
              <button onClick={reset} className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Try again</button>
            </div>
          </div>
        )}

        {/* CTA */}
        {swapState !== 'success' && (
          <>
            {!isConnected ? (
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <button
                    onClick={show}
                    className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'var(--accent)', color: '#0a1628' }}
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectKitButton.Custom>
            ) : swapState === 'reviewing' ? (
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-semibold transition-all"
                  style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleSwap()}
                  disabled={isLoading}
                  className="flex-[2] rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--accent)', color: '#0a1628' }}
                >
                  Confirm Swap
                </button>
              </div>
            ) : (
              <button
                onClick={() => void handleEstimate()}
                disabled={isLoading || !amountIn || !!isArcOnArc}
                className="w-full rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)', color: '#0a1628' }}
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {swapState === 'estimating' ? 'Getting quote…' : swapState === 'swapping' ? 'Swapping…' : 'Get Quote'}
              </button>
            )}
          </>
        )}

        {address && (
          <p className="text-xs text-center mono" style={{ color: 'var(--subtle)' }}>
            {address.slice(0, 6)}…{address.slice(-4)}
          </p>
        )}
      </div>
    </div>
  )
}
