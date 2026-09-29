import { useState, useCallback } from 'react'
import { Token, DEFAULT_TOKEN_LIST } from '../data/tokens'

const STORAGE_KEY = 'ababildex_tokens'
const LEGACY_STORAGE_KEY = 'nexusdex_tokens'

function loadTokens(): Token[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Token[]
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_TOKEN_LIST.length) {
        return parsed
      }
      // If cached list is smaller than default, merge
      const seen = new Set(parsed.map((t) => t.symbol))
      const merged = [...parsed]
      for (const def of DEFAULT_TOKEN_LIST) {
        if (!seen.has(def.symbol)) {
          merged.push(def)
          seen.add(def.symbol)
        }
      }
      return merged
    }
  } catch {
    // ignore
  }
  return DEFAULT_TOKEN_LIST
}

function saveTokens(tokens: Token[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // ignore
  }
}

export function useTokenStore() {
  const [tokens, setTokensState] = useState<Token[]>(loadTokens)

  const setTokens = useCallback((updater: Token[] | ((prev: Token[]) => Token[])) => {
    setTokensState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveTokens(next)
      return next
    })
  }, [])

  const listToken = useCallback((token: Token) => {
    setTokens((prev) => {
      const exists = prev.find((t) => t.symbol === token.symbol)
      if (exists) return prev.map((t) => t.symbol === token.symbol ? { ...t, listed: true } : t)
      return [{ ...token, listed: true }, ...prev]
    })
  }, [setTokens])

  const delistToken = useCallback((symbol: string) => {
    setTokens((prev) => prev.map((t) => t.symbol === symbol ? { ...t, listed: false } : t))
  }, [setTokens])

  const removeToken = useCallback((symbol: string) => {
    setTokens((prev) => prev.filter((t) => t.symbol !== symbol))
  }, [setTokens])

  const listedTokens = tokens.filter((t) => t.listed)

  return { tokens, listedTokens, listToken, delistToken, removeToken, setTokens }
}
