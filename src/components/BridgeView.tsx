import { useState, useCallback } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { AppKit, BridgeChain } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, Info, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useClickOutside } from '../hooks/useClickOutside'
import { SUPPORTED_CHAINS } from '../data/tokens'
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

type BridgeState = 'idle' | 'bridging' | 'success' | 'error'

interface BridgeStep {
  name: string
  state: string
  txHash?: string
  explorerUrl?: string
}

export function BridgeView() {
  const { address, connector, isConnected, chainId: walletChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const [fromChain, setFromChain] = useState('Arc_Testnet')
  const [toChain, setToChain] = useState('Base')
  const [amount, setAmount] = useState('')
  const [bridgeState, setBridgeState] = useState<BridgeState>('idle')
  const [steps, setSteps] = useState<BridgeStep[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  const fromPickerRef = useClickOutside<HTMLDivElement>(() => setShowFromPicker(false), showFromPicker)
  const toPickerRef = useClickOutside<HTMLDivElement>(() => setShowToPicker(false), showToPicker)

  const fromInfo = SUPPORTED_CHAINS.find((c) => c.id === fromChain)
  const toInfo = SUPPORTED_CHAINS.find((c) => c.id === toChain)

  const handleBridge = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter an amount to bridge')
      return
    }
    if (fromChain === toChain) {
      toast.error('Source and destination chains must differ')
      return
    }
    setBridgeState('bridging')
    setErrorMsg(null)
    setSteps([
      { name: 'approve', state: 'pending' },
      { name: 'burn', state: 'pending' },
      { name: 'attestation', state: 'pending' },
      { name: 'mint', state: 'pending' },
    ])

    try {
      if (!connector) throw new Error('Wallet not connected')
      const targetChainId = CHAIN_ID_MAP[fromChain]
      if (targetChainId && walletChainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId })
      }
      const provider = (await connector.getProvider()) as EIP1193Provider
      const adapter = await createViemAdapterFromProvider({ provider })

      const bridgeChainValues = Object.values(BridgeChain) as string[]
      const srcChain = bridgeChainValues.includes(fromChain) ? (fromChain as BridgeChain) : BridgeChain.Arc_Testnet
      const dstChain = bridgeChainValues.includes(toChain) ? (toChain as BridgeChain) : BridgeChain.Base
      const result = await kit.bridge({
        from: { adapter, chain: srcChain },
        to: { adapter, chain: dstChain },
        amount,
      })

      const r = result as unknown as { steps?: BridgeStep[] }
      if (r.steps) setSteps(r.steps)
      setBridgeState('success')
      toast.success('Bridge complete! USDC arrived on ' + (toInfo?.name ?? toChain))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bridge failed'
      setErrorMsg(msg)
      setBridgeState('error')
    }
  }, [amount, fromChain, toChain, connector, walletChainId, switchChainAsync, toInfo])

  const reset = () => {
    setBridgeState('idle')
    setSteps([])
    setErrorMsg(null)
    setAmount('')
  }

  const stepLabel: Record<string, string> = {
    approve: 'Approve USDC',
    burn: 'Burn on source',
    attestation: 'Circle attestation',
    fetchAttestation: 'Circle attestation',
    mint: 'Mint on destination',
  }

  const stepStateColor = (state: string) => {
    if (state === 'success') return 'var(--success)'
    if (state === 'error' || state === 'failed') return 'var(--danger)'
    if (state === 'pending' || state === 'processing') return 'var(--accent)'
    return 'var(--subtle)'
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-10">
      <div className="mb-6">
        <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Bridge</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Move USDC across chains via Circle CCTP. Fast (~20s) and secure.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(172,198,233,0.08)', border: '1px solid rgba(172,198,233,0.18)' }}>
        <Info className="size-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          Powered by <strong style={{ color: 'var(--accent)' }}>Circle CCTP v2</strong>. Transfers in ~8–20 seconds. No bridge fees beyond gas.
        </span>
      </div>

      <div className="rounded-3xl p-5 glass-card space-y-4">
        {/* Chain pair */}
        <div className={`flex items-center gap-2 relative ${showFromPicker || showToPicker ? 'z-30' : 'z-0'}`}>
          {/* From chain */}
          <div className="flex-1 relative" ref={fromPickerRef}>
            <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>From</label>
            <button
              onClick={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false) }}
              className="flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
            >
              <ChainIcon chain={fromChain} size={18} />
              <span className="truncate font-semibold">{fromInfo?.name ?? fromChain}</span>
              <ChevronDown className="size-3.5 ml-auto shrink-0" style={{ color: 'var(--muted)' }} />
            </button>
            {showFromPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFromPicker(false)} />
                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl shadow-2xl" style={{ background: '#141414', border: '1px solid var(--border)' }}>
                  {SUPPORTED_CHAINS.filter((c) => c.id !== toChain).map((c) => (
                    <button key={c.id} onClick={() => { setFromChain(c.id); setShowFromPicker(false) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--ink)' }}>
                      <ChainIcon chain={c.id} size={18} />
                      <span className="font-medium">{c.name}</span>
                      {c.isTestnet && <span className="ml-auto text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}>test</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-center pt-5">
            <ArrowRight className="size-5" style={{ color: 'var(--accent)' }} />
          </div>

          {/* To chain */}
          <div className="flex-1 relative" ref={toPickerRef}>
            <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>To</label>
            <button
              onClick={() => { setShowToPicker(!showToPicker); setShowFromPicker(false) }}
              className="flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink)', border: '1px solid var(--border)' }}
            >
              <ChainIcon chain={toChain} size={18} />
              <span className="truncate font-semibold">{toInfo?.name ?? toChain}</span>
              <ChevronDown className="size-3.5 ml-auto shrink-0" style={{ color: 'var(--muted)' }} />
            </button>
            {showToPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowToPicker(false)} />
                <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl shadow-2xl" style={{ background: '#141414', border: '1px solid var(--border)' }}>
                  {SUPPORTED_CHAINS.filter((c) => c.id !== fromChain).map((c) => (
                    <button key={c.id} onClick={() => { setToChain(c.id); setShowToPicker(false) }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--ink)' }}>
                      <ChainIcon chain={c.id} size={18} />
                      <span className="font-medium">{c.name}</span>
                      {c.isTestnet && <span className="ml-auto text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}>test</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--subtle)' }}>Amount (USDC)</label>
          <div className="rounded-2xl p-4 glass-inner">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(172,198,233,0.12)' }}>
                <TokenIcon symbol="USDC" size={20} />
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>USDC</span>
              </div>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v)
                }}
                placeholder="0.00"
                className="display flex-1 min-w-0 bg-transparent text-2xl font-bold tabular-nums outline-none text-right placeholder:opacity-30"
                style={{ color: 'var(--ink)' }}
                disabled={bridgeState === 'bridging'}
              />
            </div>
          </div>
        </div>

        {/* Steps tracker */}
        {steps.length > 0 && (
          <div className="rounded-2xl p-3 space-y-2" style={{ background: 'rgba(172,198,233,0.04)', border: '1px solid var(--border)' }}>
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="size-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${stepStateColor(step.state)}20`, border: `1px solid ${stepStateColor(step.state)}` }}>
                  {step.state === 'success' ? (
                    <CheckCircle2 className="size-3" style={{ color: 'var(--success)' }} />
                  ) : (step.state === 'pending' || step.state === 'processing') ? (
                    <Loader2 className="size-3 animate-spin" style={{ color: 'var(--accent)' }} />
                  ) : (
                    <span className="text-xs" style={{ color: stepStateColor(step.state) }}>{i + 1}</span>
                  )}
                </div>
                <span className="text-xs font-medium" style={{ color: step.state === 'success' ? 'var(--success)' : 'var(--ink)' }}>
                  {stepLabel[step.name] ?? step.name}
                </span>
                {step.txHash && step.explorerUrl && (
                  <a href={step.explorerUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs mono truncate max-w-[80px]" style={{ color: 'var(--accent)' }}>
                    {step.txHash.slice(0, 8)}…
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Success */}
        {bridgeState === 'success' && (
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(93,200,136,0.08)', border: '1px solid rgba(93,200,136,0.25)' }}>
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Bridge complete</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>USDC arrived on {toInfo?.name ?? toChain}</p>
              <button onClick={reset} className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Bridge again</button>
            </div>
          </div>
        )}

        {/* Error */}
        {bridgeState === 'error' && errorMsg && (
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(240,98,118,0.08)', border: '1px solid rgba(240,98,118,0.25)' }}>
            <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Bridge failed</p>
              <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--ink)' }}>{errorMsg.slice(0, 120)}</p>
              <button onClick={reset} className="text-xs mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Try again</button>
            </div>
          </div>
        )}

        {/* CTA */}
        {bridgeState !== 'success' && (
          !isConnected ? (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <button onClick={show} className="w-full rounded-2xl py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ background: 'var(--accent)', color: '#0a1628' }}>
                  Connect Wallet
                </button>
              )}
            </ConnectKitButton.Custom>
          ) : (
            <button
              onClick={() => void handleBridge()}
              disabled={bridgeState === 'bridging' || !amount}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)', color: '#0a1628' }}
            >
              {bridgeState === 'bridging' && <Loader2 className="size-4 animate-spin" />}
              {bridgeState === 'bridging' ? 'Bridging…' : `Bridge ${amount || '0'} USDC`}
            </button>
          )
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
