import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { ArrowUpDown, ArrowLeftRight, Droplets, Trophy, Shield, CandlestickChart } from 'lucide-react'
import { SwapView } from './components/SwapView'
import { BridgeView } from './components/BridgeView'
import { DexView } from './components/DexView'
import { QuestsView } from './components/QuestsView'
import { AdminPanel } from './components/AdminPanel'
import { TradeView } from './components/TradeView'
import { useQuestStore } from './hooks/useQuestStore'
import { useTokenStore } from './hooks/useTokenStore'

type Tab = 'swap' | 'bridge' | 'trade' | 'dex' | 'quests' | 'admin'

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'swap',   label: 'Swap',   icon: <ArrowUpDown className="size-4.5" /> },
  { id: 'bridge', label: 'Bridge', icon: <ArrowLeftRight className="size-4.5" /> },
  { id: 'trade',  label: 'Trade',  icon: <CandlestickChart className="size-4.5" /> },
  { id: 'dex',    label: 'DEX',    icon: <Droplets className="size-4.5" /> },
  { id: 'quests', label: 'Quests', icon: <Trophy className="size-4.5" /> },
  { id: 'admin',  label: 'Admin',  icon: <Shield className="size-4.5" /> },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('swap')

  const { quests, addQuest, updateQuest, deleteQuest, markCompleted } = useQuestStore()
  const { tokens, listToken, delistToken, removeToken } = useTokenStore()

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-30" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#5FFBF1]/30 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-4">
          {/* Logo without glow */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setTab('swap')}>
            <img src="/ababil-logo.svg" alt="Ababil Logo" className="size-7 object-contain" />
            <div className="flex items-center leading-none">
              <span className="display text-base font-extrabold tracking-tight text-white">Ababil <span className="text-[#5FFBF1]">DEX</span></span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === item.id ? 'rgba(95,251,241,0.12)' : 'transparent',
                  color: tab === item.id ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ConnectKitButton />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className={tab === 'trade' ? 'flex-1 overflow-hidden pb-16 sm:pb-0' : 'flex-1 pt-6 sm:pt-8 pb-20 sm:pb-8'}>
        {tab === 'swap'   && <SwapView />}
        {tab === 'bridge' && <BridgeView />}
        {tab === 'trade'  && <TradeView />}
        {tab === 'dex'    && <DexView tokens={tokens} />}
        {tab === 'quests' && <QuestsView quests={quests} onComplete={markCompleted} />}
        {tab === 'admin'  && (
          <AdminPanel
            quests={quests}
            tokens={tokens}
            onAddQuest={addQuest}
            onUpdateQuest={updateQuest}
            onDeleteQuest={deleteQuest}
            onListToken={listToken}
            onDelistToken={delistToken}
            onRemoveToken={removeToken}
          />
        )}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center" style={{ background: 'rgba(13,13,13,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-all"
            style={{ color: tab === item.id ? 'var(--accent)' : 'var(--subtle)' }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
