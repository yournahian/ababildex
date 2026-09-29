export type QuestType = 'swap' | 'bridge' | 'liquidity' | 'social' | 'volume'
export type QuestDifficulty = 'easy' | 'medium' | 'hard'
export type QuestStatus = 'active' | 'completed' | 'expired' | 'upcoming'

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  difficulty: QuestDifficulty
  reward: number       // USDC reward amount (display)
  xpReward: number
  deadline: string     // ISO date string
  status: QuestStatus
  progress: number     // 0-100
  requirement: string
  participants: number
  maxParticipants?: number
  createdAt: string
}

// In-memory store (persisted to localStorage by the hook)
export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'First Swap',
    description: 'Execute your first token swap on any supported chain.',
    type: 'swap',
    difficulty: 'easy',
    reward: 0.50,
    xpReward: 100,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    progress: 0,
    requirement: 'Complete 1 swap',
    participants: 3421,
    maxParticipants: 10000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q2',
    title: 'Cross-Chain Pioneer',
    description: 'Bridge USDC from Arc Testnet to any other supported chain.',
    type: 'bridge',
    difficulty: 'medium',
    reward: 2.00,
    xpReward: 250,
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'active',
    progress: 0,
    requirement: 'Bridge at least 1 USDC',
    participants: 1842,
    maxParticipants: 5000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q3',
    title: 'Volume Champion',
    description: 'Reach $100 total swap volume in a single day.',
    type: 'volume',
    difficulty: 'hard',
    reward: 10.00,
    xpReward: 500,
    deadline: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    progress: 0,
    requirement: '$100 swap volume',
    participants: 892,
    maxParticipants: 1000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q4',
    title: 'Liquidity Provider',
    description: 'Add liquidity to any pool on the DEX.',
    type: 'liquidity',
    difficulty: 'medium',
    reward: 3.00,
    xpReward: 300,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'active',
    progress: 0,
    requirement: 'Provide liquidity once',
    participants: 2100,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q5',
    title: 'Multi-Chain Explorer',
    description: 'Execute swaps on 3 different blockchains.',
    type: 'swap',
    difficulty: 'hard',
    reward: 5.00,
    xpReward: 450,
    deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'upcoming',
    progress: 0,
    requirement: 'Swap on 3 chains',
    participants: 0,
    createdAt: new Date().toISOString(),
  },
]
