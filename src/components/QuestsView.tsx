import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { CheckCircle2, Clock, Trophy, Zap, ArrowRight, Users, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Quest, QuestType, QuestDifficulty } from '../data/quests'
import { TokenIcon } from './Icons'

interface QuestsViewProps {
  quests: Quest[]
  onComplete: (id: string) => void
}

const TYPE_ICON: Record<QuestType, React.ReactNode> = {
  swap:      <ArrowRight className="size-4" />,
  bridge:    <Zap className="size-4" />,
  liquidity: <Users className="size-4" />,
  social:    <Trophy className="size-4" />,
  volume:    <Trophy className="size-4" />,
}

const DIFFICULTY_COLORS: Record<QuestDifficulty, { bg: string; text: string; label: string }> = {
  easy:   { bg: 'rgba(93,200,136,0.12)',  text: 'var(--success)',  label: 'Easy'   },
  medium: { bg: 'rgba(245,197,66,0.12)',  text: 'var(--gold)',     label: 'Medium' },
  hard:   { bg: 'rgba(155,141,242,0.12)', text: 'var(--purple)',   label: 'Hard'   },
}

function timeLeft(deadline: string): string {
  const ms = new Date(deadline).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 48) return `${Math.floor(h / 24)}d left`
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

export function QuestsView({ quests, onComplete }: QuestsViewProps) {
  const { isConnected } = useAccount()
  const [filter, setFilter] = useState<'all' | QuestType>('all')

  const active = quests.filter((q) => q.status === 'active' && (filter === 'all' || q.type === filter))
  const completed = quests.filter((q) => q.status === 'completed')
  const upcoming = quests.filter((q) => q.status === 'upcoming')

  const totalXp = completed.reduce((s, q) => s + q.xpReward, 0)
  const totalReward = completed.reduce((s, q) => s + q.reward, 0)

  const handleClaim = (quest: Quest) => {
    if (!isConnected) {
      toast.error('Connect your wallet to claim quest rewards')
      return
    }
    if (quest.status === 'upcoming') {
      toast.info('This quest starts soon')
      return
    }
    onComplete(quest.id)
    toast.success(`Quest completed! +${quest.xpReward} XP earned`)
  }

  const types: Array<'all' | QuestType> = ['all', 'swap', 'bridge', 'liquidity', 'volume', 'social']

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Daily Quests</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Complete quests to earn USDC rewards and XP. New quests drop every day at 00:00 UTC.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl px-4 py-3 glass-card">
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Total XP</p>
          <p className="display text-xl font-bold tabular-nums" style={{ color: 'var(--gold)' }}>{totalXp.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl px-4 py-3 glass-card">
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Rewards Earned</p>
          <p className="display text-xl font-bold tabular-nums" style={{ color: 'var(--success)' }}>${totalReward.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl px-4 py-3 glass-card">
          <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Completed</p>
          <p className="display text-xl font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{completed.length}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              background: filter === t ? 'rgba(172,198,233,0.18)' : 'var(--surface-muted)',
              color: filter === t ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${filter === t ? 'rgba(172,198,233,0.35)' : 'var(--border)'}`,
            }}
          >
            {t === 'all' ? 'All Quests' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Connect prompt */}
      {!isConnected && (
        <div className="rounded-2xl px-5 py-4 mb-4 flex items-center gap-4" style={{ background: 'rgba(172,198,233,0.06)', border: '1px solid rgba(172,198,233,0.18)' }}>
          <Lock className="size-5 shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Connect to claim rewards</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Your wallet is needed to track progress and receive USDC.</p>
          </div>
          <ConnectKitButton.Custom>
            {({ show }) => (
              <button onClick={show} className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--accent)', color: '#0a1628' }}>
                Connect
              </button>
            )}
          </ConnectKitButton.Custom>
        </div>
      )}

      {/* Active quests */}
      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming quests */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Coming Soon</h2>
          <div className="space-y-3">
            {upcoming.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--subtle)' }}>Completed</h2>
          <div className="space-y-3">
            {completed.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={handleClaim} />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && upcoming.length === 0 && completed.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <Trophy className="size-10 mx-auto mb-3 opacity-25" />
          <p className="text-sm">No quests found. Check back soon!</p>
        </div>
      )}
    </div>
  )
}

function QuestCard({ quest, onClaim }: { quest: Quest; onClaim: (q: Quest) => void }) {
  const diff = DIFFICULTY_COLORS[quest.difficulty]
  const isUpcoming = quest.status === 'upcoming'
  const isCompleted = quest.status === 'completed'
  const isExpired = quest.status === 'expired'

  return (
    <div
      className="rounded-2xl p-4 glass-card transition-all"
      style={{ opacity: isExpired ? 0.5 : 1 }}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isCompleted ? 'rgba(93,200,136,0.15)' : isUpcoming ? 'rgba(172,198,233,0.08)' : 'rgba(172,198,233,0.12)', color: isCompleted ? 'var(--success)' : 'var(--accent)' }}>
          {isCompleted ? <CheckCircle2 className="size-5" /> : TYPE_ICON[quest.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{quest.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: diff.bg, color: diff.text }}>{diff.label}</span>
          </div>
          <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--muted)' }}>{quest.description}</p>

          {/* Progress bar */}
          {!isUpcoming && (
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--subtle)' }}>
                <span>{quest.requirement}</span>
                <span className="tabular-nums">{quest.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${quest.progress}%`, background: isCompleted ? 'var(--success)' : 'var(--accent)' }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* Reward */}
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--success)' }}>
              <TokenIcon symbol="USDC" size={14} />
              +${quest.reward.toFixed(2)} USDC
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--gold)' }}>
              +{quest.xpReward} XP
            </span>
            {/* Participants */}
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
              <Users className="size-3" />
              {quest.participants.toLocaleString()}
              {quest.maxParticipants ? `/${quest.maxParticipants.toLocaleString()}` : ''}
            </span>
            {/* Time */}
            {!isCompleted && !isExpired && (
              <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: isUpcoming ? 'var(--muted)' : 'var(--subtle)' }}>
                <Clock className="size-3" />
                {isUpcoming ? 'Upcoming' : timeLeft(quest.deadline)}
              </span>
            )}
            {isExpired && <span className="text-xs ml-auto" style={{ color: 'var(--danger)' }}>Expired</span>}
            {isCompleted && <span className="text-xs ml-auto font-semibold" style={{ color: 'var(--success)' }}>Claimed</span>}
          </div>
        </div>

        {/* Claim button */}
        {!isCompleted && !isExpired && (
          <button
            onClick={() => onClaim(quest)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: isUpcoming ? 'var(--surface-muted)' : 'rgba(172,198,233,0.15)',
              color: isUpcoming ? 'var(--subtle)' : 'var(--accent)',
              border: '1px solid var(--border)',
            }}
          >
            {isUpcoming ? 'Soon' : 'Claim'}
          </button>
        )}
      </div>
    </div>
  )
}
