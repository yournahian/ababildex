import { useState } from 'react'
import { Shield, Plus, Trash2, Eye, EyeOff, AlertCircle, CheckCircle2, Edit3, X } from 'lucide-react'
import { toast } from 'sonner'
import { Quest, QuestType, QuestDifficulty } from '../data/quests'
import { Token } from '../data/tokens'
import { TokenIcon } from './Icons'

// Demo admin PIN (in production this would be a real auth system)
const ADMIN_PIN = '1234'

interface AdminPanelProps {
  quests: Quest[]
  tokens: Token[]
  onAddQuest: (q: Quest) => void
  onUpdateQuest: (id: string, updates: Partial<Quest>) => void
  onDeleteQuest: (id: string) => void
  onListToken: (t: Token) => void
  onDelistToken: (symbol: string) => void
  onRemoveToken: (symbol: string) => void
}

type AdminTab = 'quests' | 'tokens' | 'settings'

const EMPTY_QUEST_FORM = {
  title: '',
  description: '',
  type: 'swap' as QuestType,
  difficulty: 'easy' as QuestDifficulty,
  reward: '',
  xpReward: '',
  deadline: '',
  requirement: '',
  maxParticipants: '',
}

const EMPTY_TOKEN_FORM = {
  symbol: '',
  name: '',
  decimals: '18',
  logoColor: '#2775CA',
}

export function AdminPanel({ quests, tokens, onAddQuest, onUpdateQuest, onDeleteQuest, onListToken, onDelistToken, onRemoveToken }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<AdminTab>('quests')
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [questForm, setQuestForm] = useState(EMPTY_QUEST_FORM)
  const [tokenForm, setTokenForm] = useState(EMPTY_TOKEN_FORM)
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null)

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPin('')
    }
  }

  const submitQuest = () => {
    if (!questForm.title || !questForm.description || !questForm.reward || !questForm.deadline) {
      toast.error('Fill in all required fields')
      return
    }
    const quest: Quest = {
      id: editingQuestId ?? `q${Date.now()}`,
      title: questForm.title,
      description: questForm.description,
      type: questForm.type,
      difficulty: questForm.difficulty,
      reward: parseFloat(questForm.reward) || 0,
      xpReward: parseInt(questForm.xpReward) || 100,
      deadline: new Date(questForm.deadline).toISOString(),
      status: new Date(questForm.deadline) > new Date() ? 'active' : 'expired',
      progress: 0,
      requirement: questForm.requirement,
      maxParticipants: questForm.maxParticipants ? parseInt(questForm.maxParticipants) : undefined,
      participants: 0,
      createdAt: new Date().toISOString(),
    }
    if (editingQuestId) {
      onUpdateQuest(editingQuestId, quest)
      toast.success('Quest updated')
    } else {
      onAddQuest(quest)
      toast.success('Quest created and published!')
    }
    setQuestForm(EMPTY_QUEST_FORM)
    setShowQuestForm(false)
    setEditingQuestId(null)
  }

  const startEditQuest = (quest: Quest) => {
    setQuestForm({
      title: quest.title,
      description: quest.description,
      type: quest.type,
      difficulty: quest.difficulty,
      reward: String(quest.reward),
      xpReward: String(quest.xpReward),
      deadline: new Date(quest.deadline).toISOString().slice(0, 16),
      requirement: quest.requirement,
      maxParticipants: quest.maxParticipants ? String(quest.maxParticipants) : '',
    })
    setEditingQuestId(quest.id)
    setShowQuestForm(true)
  }

  const submitToken = () => {
    if (!tokenForm.symbol || !tokenForm.name) {
      toast.error('Fill in symbol and name')
      return
    }
    onListToken({
      symbol: tokenForm.symbol.toUpperCase(),
      name: tokenForm.name,
      decimals: parseInt(tokenForm.decimals) || 18,
      logoColor: tokenForm.logoColor,
      listed: true,
    })
    toast.success(`${tokenForm.symbol.toUpperCase()} listed on the DEX`)
    setTokenForm(EMPTY_TOKEN_FORM)
    setShowTokenForm(false)
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto px-4 pb-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-3xl p-8 glass-card w-full text-center">
          <div className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(172,198,233,0.12)' }}>
            <Shield className="size-7" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="display text-xl font-bold mb-1" style={{ color: 'var(--ink)' }}>Admin Access</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Enter your admin PIN to continue.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="PIN"
            className="w-full text-center text-2xl letter-spacing tracking-[0.5em] rounded-2xl px-4 py-3 outline-none mb-3 bg-transparent"
            style={{ color: 'var(--ink)', border: `1px solid ${pinError ? 'var(--danger)' : 'var(--border-strong)'}` }}
            maxLength={8}
          />
          {pinError && (
            <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>Incorrect PIN. Try again.</p>
          )}
          <p className="text-xs mb-4" style={{ color: 'var(--subtle)' }}>Demo PIN: 1234</p>
          <button
            onClick={handleLogin}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#0a1628' }}
          >
            Unlock Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-5" style={{ color: 'var(--accent)' }} />
            <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Admin Panel</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Manage quests, token listings, and platform settings.</p>
        </div>
        <button onClick={() => setAuthenticated(false)} className="text-xs" style={{ color: 'var(--muted)' }}>Sign out</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--surface-muted)' }}>
        {(['quests', 'tokens', 'settings'] as AdminTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{ background: tab === t ? 'rgba(172,198,233,0.15)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--muted)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Quests tab */}
      {tab === 'quests' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{quests.length} quests</span>
            <button
              onClick={() => { setEditingQuestId(null); setQuestForm(EMPTY_QUEST_FORM); setShowQuestForm(true) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#0a1628' }}
            >
              <Plus className="size-4" /> New Quest
            </button>
          </div>

          {/* Quest form */}
          {showQuestForm && (
            <div className="rounded-3xl p-5 mb-4 glass-card" style={{ border: '1px solid rgba(172,198,233,0.3)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="display font-bold" style={{ color: 'var(--ink)' }}>{editingQuestId ? 'Edit Quest' : 'New Quest'}</h3>
                <button onClick={() => setShowQuestForm(false)}><X className="size-5" style={{ color: 'var(--muted)' }} /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Title *</label>
                    <input value={questForm.title} onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Type</label>
                    <select value={questForm.type} onChange={(e) => setQuestForm({ ...questForm, type: e.target.value as QuestType })}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)', background: 'var(--surface-muted)' }}>
                      {['swap', 'bridge', 'liquidity', 'volume', 'social'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Description *</label>
                  <textarea value={questForm.description} onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                    rows={2} className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none resize-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Difficulty</label>
                    <select value={questForm.difficulty} onChange={(e) => setQuestForm({ ...questForm, difficulty: e.target.value as QuestDifficulty })}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)', background: 'var(--surface-muted)' }}>
                      {['easy', 'medium', 'hard'].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>USDC Reward *</label>
                    <input value={questForm.reward} onChange={(e) => setQuestForm({ ...questForm, reward: e.target.value })}
                      type="number" step="0.01" min="0" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>XP Reward</label>
                    <input value={questForm.xpReward} onChange={(e) => setQuestForm({ ...questForm, xpReward: e.target.value })}
                      type="number" min="0" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Deadline *</label>
                    <input value={questForm.deadline} onChange={(e) => setQuestForm({ ...questForm, deadline: e.target.value })}
                      type="datetime-local" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Requirement text</label>
                    <input value={questForm.requirement} onChange={(e) => setQuestForm({ ...questForm, requirement: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Max Participants</label>
                    <input value={questForm.maxParticipants} onChange={(e) => setQuestForm({ ...questForm, maxParticipants: e.target.value })}
                      type="number" min="0" placeholder="Unlimited" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowQuestForm(false)} className="flex-1 rounded-2xl py-2.5 text-sm font-semibold" style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}>Cancel</button>
                  <button onClick={submitQuest} className="flex-[2] rounded-2xl py-2.5 text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a1628' }}>
                    {editingQuestId ? 'Update Quest' : 'Publish Quest'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quest list */}
          <div className="space-y-2">
            {quests.map((quest) => (
              <div key={quest.id} className="rounded-2xl px-4 py-3 flex items-center gap-3 glass-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{quest.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{quest.type}</span>
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--success)' }}>+${quest.reward.toFixed(2)}</span>
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>·</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full`} style={{
                      background: quest.status === 'active' ? 'rgba(93,200,136,0.1)' : quest.status === 'completed' ? 'rgba(172,198,233,0.1)' : quest.status === 'upcoming' ? 'rgba(245,197,66,0.1)' : 'rgba(240,98,118,0.1)',
                      color: quest.status === 'active' ? 'var(--success)' : quest.status === 'completed' ? 'var(--accent)' : quest.status === 'upcoming' ? 'var(--gold)' : 'var(--danger)',
                    }}>
                      {quest.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {quest.status === 'active' ? (
                    <button onClick={() => onUpdateQuest(quest.id, { status: 'expired' })} title="Deactivate">
                      <EyeOff className="size-4" style={{ color: 'var(--muted)' }} />
                    </button>
                  ) : quest.status !== 'completed' && (
                    <button onClick={() => onUpdateQuest(quest.id, { status: 'active' })} title="Activate">
                      <Eye className="size-4" style={{ color: 'var(--muted)' }} />
                    </button>
                  )}
                  <button onClick={() => startEditQuest(quest)} title="Edit">
                    <Edit3 className="size-4" style={{ color: 'var(--muted)' }} />
                  </button>
                  <button onClick={() => { onDeleteQuest(quest.id); toast.success('Quest deleted') }} title="Delete">
                    <Trash2 className="size-4" style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tokens tab */}
      {tab === 'tokens' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{tokens.length} tokens</span>
            <button
              onClick={() => setShowTokenForm(!showTokenForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#0a1628' }}
            >
              <Plus className="size-4" /> List Token
            </button>
          </div>

          {/* Token form */}
          {showTokenForm && (
            <div className="rounded-3xl p-5 mb-4 glass-card" style={{ border: '1px solid rgba(172,198,233,0.3)' }}>
              <h3 className="display font-bold mb-4" style={{ color: 'var(--ink)' }}>List New Token</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Symbol *</label>
                    <input value={tokenForm.symbol} onChange={(e) => setTokenForm({ ...tokenForm, symbol: e.target.value.toUpperCase() })}
                      placeholder="e.g. LINK" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Full Name *</label>
                    <input value={tokenForm.name} onChange={(e) => setTokenForm({ ...tokenForm, name: e.target.value })}
                      placeholder="e.g. Chainlink" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Decimals</label>
                    <input value={tokenForm.decimals} onChange={(e) => setTokenForm({ ...tokenForm, decimals: e.target.value })}
                      type="number" min="0" max="18" className="w-full rounded-xl px-3 py-2 text-sm bg-transparent outline-none" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: 'var(--subtle)' }}>Logo Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={tokenForm.logoColor} onChange={(e) => setTokenForm({ ...tokenForm, logoColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer" style={{ background: 'none', padding: 0 }} />
                      <input value={tokenForm.logoColor} onChange={(e) => setTokenForm({ ...tokenForm, logoColor: e.target.value })}
                        className="flex-1 rounded-xl px-3 py-2 text-sm bg-transparent outline-none mono" style={{ color: 'var(--ink)', border: '1px solid var(--border-strong)' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowTokenForm(false)} className="flex-1 rounded-2xl py-2.5 text-sm font-semibold" style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}>Cancel</button>
                  <button onClick={submitToken} className="flex-[2] rounded-2xl py-2.5 text-sm font-semibold" style={{ background: 'var(--accent)', color: '#0a1628' }}>List Token</button>
                </div>
              </div>
            </div>
          )}

          {/* Token list */}
          <div className="space-y-2">
            {tokens.map((token) => (
              <div key={token.symbol} className="rounded-2xl px-4 py-3 flex items-center gap-3 glass-card">
                <TokenIcon symbol={token.symbol} size={36} fallbackColor={token.logoColor} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{token.symbol}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{token.name} · {token.decimals} decimals</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: token.listed ? 'rgba(93,200,136,0.1)' : 'rgba(240,98,118,0.1)', color: token.listed ? 'var(--success)' : 'var(--danger)' }}>
                    {token.listed ? 'Listed' : 'Delisted'}
                  </span>
                  {token.listed ? (
                    <button onClick={() => { onDelistToken(token.symbol); toast.success(`${token.symbol} delisted`) }} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(240,98,118,0.1)', color: 'var(--danger)' }}>
                      Delist
                    </button>
                  ) : (
                    <button onClick={() => { onListToken(token); toast.success(`${token.symbol} listed`) }} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(93,200,136,0.1)', color: 'var(--success)' }}>
                      Relist
                    </button>
                  )}
                  <button onClick={() => { onRemoveToken(token.symbol); toast.success(`${token.symbol} removed`) }}>
                    <Trash2 className="size-4" style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="space-y-4">
          {[
            { label: 'Platform Name', value: 'AbabilDEX', desc: 'Display name for the platform.' },
            { label: 'Default Swap Fee (bps)', value: '2', desc: 'Current provider fee: 0.02%. Circle retains 10% of any custom fee.' },
            { label: 'Default Slippage (%)', value: '1.5', desc: 'Default slippage tolerance on all swaps.' },
            { label: 'Max Bridge Amount (USDC)', value: '100,000', desc: 'Maximum per-transfer bridge limit.' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{s.label}</span>
                <span className="text-sm tabular-nums mono" style={{ color: 'var(--accent)' }}>{s.value}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--subtle)' }}>{s.desc}</p>
            </div>
          ))}
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,197,66,0.06)', border: '1px solid rgba(245,197,66,0.2)' }}>
            <AlertCircle className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Platform settings changes take effect immediately. Fee changes apply to new transactions only. This admin panel uses a demo PIN; integrate with your auth system before production.
            </p>
          </div>
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(93,200,136,0.06)', border: '1px solid rgba(93,200,136,0.2)' }}>
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              All swap operations are routed through Circle App Kit + LiFi aggregator. Fee: <strong style={{ color: 'var(--success)' }}>0.02%</strong> (2 bps) — one of the lowest protocol fees available.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
