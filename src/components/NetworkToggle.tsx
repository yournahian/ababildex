import React from 'react'
import { Globe, FlaskConical } from 'lucide-react'
import { useNetworkStore } from '../hooks/useNetworkStore'

interface NetworkToggleProps {
  compact?: boolean
  className?: string
}

export const NetworkToggle: React.FC<NetworkToggleProps> = ({ compact = false, className = '' }) => {
  const { networkMode, isMainnet, isTestnet, setNetworkMode } = useNetworkStore()

  if (compact) {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-full border border-[var(--border)] bg-[#101010] ${className}`}
        role="group"
        aria-label="Network Mode Selector"
      >
        <button
          type="button"
          onClick={() => setNetworkMode('mainnet')}
          className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
            isMainnet
              ? 'bg-[#5FFBF1]/15 text-[#5FFBF1] border border-[#5FFBF1]/40 shadow-sm'
              : 'text-[#888888] hover:text-white'
          }`}
          title="Switch to all Mainnets"
        >
          <span className={`size-1.5 rounded-full ${isMainnet ? 'bg-[#5FFBF1] animate-pulse' : 'bg-gray-600'}`} />
          Main
        </button>
        <button
          type="button"
          onClick={() => setNetworkMode('testnet')}
          className={`px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
            isTestnet
              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 shadow-sm'
              : 'text-[#888888] hover:text-white'
          }`}
          title="Switch to all Testnets"
        >
          <span className={`size-1.5 rounded-full ${isTestnet ? 'bg-[#F59E0B] animate-pulse' : 'bg-gray-600'}`} />
          Test
        </button>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl border border-[var(--border)] bg-[#121212]/90 backdrop-blur-md shadow-inner ${className}`}
      role="group"
      aria-label="Network Mode Selector"
    >
      <button
        type="button"
        onClick={() => setNetworkMode('mainnet')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
          isMainnet
            ? 'bg-gradient-to-r from-[#5FFBF1]/20 to-[#0052FF]/20 text-[#5FFBF1] border border-[#5FFBF1]/30 shadow-[0_0_12px_rgba(95,251,241,0.25)]'
            : 'text-[#888888] hover:text-white hover:bg-white/5'
        }`}
        title="Switch to all Mainnets"
      >
        <Globe className="size-3.5" />
        <span>Mainnet</span>
        {isMainnet && <span className="size-1.5 rounded-full bg-[#5FFBF1] animate-pulse ml-0.5" />}
      </button>

      <button
        type="button"
        onClick={() => setNetworkMode('testnet')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
          isTestnet
            ? 'bg-gradient-to-r from-[#F59E0B]/20 to-[#FF0420]/20 text-[#F59E0B] border border-[#F59E0B]/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            : 'text-[#888888] hover:text-white hover:bg-white/5'
        }`}
        title="Switch to all Testnets"
      >
        <FlaskConical className="size-3.5" />
        <span>Testnet</span>
        {isTestnet && <span className="size-1.5 rounded-full bg-[#F59E0B] animate-pulse ml-0.5" />}
      </button>
    </div>
  )
}
