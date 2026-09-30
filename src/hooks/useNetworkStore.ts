import { useSyncExternalStore } from 'react'

export type NetworkMode = 'mainnet' | 'testnet'

const STORAGE_KEY = 'ababildex_network_mode'

let currentMode: NetworkMode = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'testnet' || saved === 'mainnet') return saved
  } catch {
    // ignore
  }
  return 'mainnet'
})()

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function setNetworkMode(mode: NetworkMode) {
  if (currentMode === mode) return
  currentMode = mode
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // ignore
  }
  emitChange()
}

export function toggleNetworkMode() {
  setNetworkMode(currentMode === 'mainnet' ? 'testnet' : 'mainnet')
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): NetworkMode {
  return currentMode
}

export interface NetworkStoreState {
  networkMode: NetworkMode
  isTestnet: boolean
  isMainnet: boolean
  setNetworkMode: (m: NetworkMode) => void
  toggleNetworkMode: () => void
}

export function useNetworkStore<T = NetworkStoreState>(
  selector?: (state: NetworkStoreState) => T
): T {
  const mode = useSyncExternalStore(subscribe, getSnapshot, () => 'mainnet' as NetworkMode)

  const state: NetworkStoreState = {
    networkMode: mode,
    isTestnet: mode === 'testnet',
    isMainnet: mode === 'mainnet',
    setNetworkMode,
    toggleNetworkMode,
  }

  if (selector) {
    return selector(state)
  }
  return state as unknown as T
}
