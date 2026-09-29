import { useState, useCallback } from 'react'
import { Quest, INITIAL_QUESTS } from '../data/quests'

const STORAGE_KEY = 'ababildex_quests'
const LEGACY_STORAGE_KEY = 'nexusdex_quests'

function loadQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Quest[]
  } catch {
    // ignore
  }
  return INITIAL_QUESTS
}

function saveQuests(quests: Quest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests))
  } catch {
    // ignore
  }
}

function expireStale(quests: Quest[]): Quest[] {
  const now = new Date()
  return quests.map((q) => {
    if (q.status === 'active' && new Date(q.deadline) < now) {
      return { ...q, status: 'expired' as const }
    }
    return q
  })
}

function loadQuestsWithExpiry(): Quest[] {
  return expireStale(loadQuests())
}

export function useQuestStore() {
  const [quests, setQuestsState] = useState<Quest[]>(loadQuestsWithExpiry)

  const setQuests = useCallback((updater: Quest[] | ((prev: Quest[]) => Quest[])) => {
    setQuestsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveQuests(next)
      return next
    })
  }, [])

  const addQuest = useCallback((quest: Quest) => {
    setQuests((prev) => [quest, ...prev])
  }, [setQuests])

  const updateQuest = useCallback((id: string, updates: Partial<Quest>) => {
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }, [setQuests])

  const deleteQuest = useCallback((id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id))
  }, [setQuests])

  const markCompleted = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'completed', progress: 100 } : q))
    )
  }, [setQuests])

  return { quests, addQuest, updateQuest, deleteQuest, markCompleted, setQuests }
}
