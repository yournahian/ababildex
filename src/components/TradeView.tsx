import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createChart,
  CandlestickSeries as candlestickSeriesDef,
  LineSeries as lineSeriesDef,
  AreaSeries as areaSeriesDef,
  HistogramSeries as histogramSeriesDef,
  type IChartApi,
  type ISeriesApi,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  BarChart2,
  Activity,
  Clock,
  Layers,
  BookOpen,
  ArrowUpDown,
  Settings,
  Globe,
} from 'lucide-react'
import { DEFAULT_TOKEN_LIST, SUPPORTED_CHAINS, type ChainInfo } from '../data/tokens'
import { TokenIcon, ChainIcon } from './Icons'
import { useClickOutside } from '../hooks/useClickOutside'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
type OrderSide = 'buy' | 'sell'
type OrderType = 'market' | 'limit' | 'stop'
type ChartType = 'candlestick' | 'line' | 'area'

interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface RecentTrade {
  id: string
  price: number
  amount: number
  side: 'buy' | 'sell'
  time: Date
}

interface OpenOrder {
  id: string
  pair: string
  type: OrderType
  side: OrderSide
  price: number
  amount: number
  filled: number
  time: Date
}

// ──────────────────────────────────────────────────────────────────────────────
// Seed data generators (deterministic — no Math.random in render)
// ──────────────────────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = Math.floor(Math.abs(seed) * 100000) || 123456789
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateCandles(pair: TradingPair, count: number, intervalMs: number): OHLCV[] {
  const basePrice = pair.basePrice
  const change24h = pair.change24h
  const charSum = pair.base.split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1) * 37, 0)
  const rng = seededRng(charSum + basePrice * 7919)
  const now = Date.now()
  const candles: OHLCV[] = []

  const isStable = ['USDT', 'EURC', 'DAI', 'USDE', 'PYUSD', 'NATIVE'].includes(pair.base)
  const targetCurrentPrice = basePrice

  if (isStable) {
    const peg = targetCurrentPrice
    const maxBand = peg * 0.0012
    let currentPrice = peg + (rng() - 0.5) * (maxBand * 0.6)

    for (let i = count - 1; i >= 0; i--) {
      const time = Math.floor((now - i * intervalMs) / 1000)
      const open = i === count - 1 ? currentPrice : candles[candles.length - 1].close
      const meanReversion = (peg - open) * 0.16
      const noise = (rng() - 0.5) * (peg * 0.0003)
      let close = open + meanReversion + noise
      close = Math.max(peg - maxBand, Math.min(peg + maxBand, close))
      if (i === 0) close = targetCurrentPrice

      const candleHigh = Math.max(open, close) + rng() * (peg * 0.0002)
      const candleLow = Math.min(open, close) - rng() * (peg * 0.0002)
      const volume = (rng() * 18000 + 4000) * (Math.abs(close - open) > peg * 0.0001 ? 2.5 : 1)

      candles.push({
        time,
        open: +open.toFixed(5),
        high: +candleHigh.toFixed(5),
        low: +candleLow.toFixed(5),
        close: +close.toFixed(5),
        volume: Math.round(volume),
      })
    }
  } else {
    const startPrice = targetCurrentPrice / (1 + (change24h / 100))
    const totalTrend = targetCurrentPrice - startPrice
    const vol = targetCurrentPrice * 0.0035

    const prices: number[] = []
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1)
      const wave = Math.sin(progress * Math.PI * 3.5) * (targetCurrentPrice * 0.012)
      const trend = startPrice + totalTrend * progress
      const noise = (rng() - 0.5) * vol
      let p = trend + wave + noise
      if (i === count - 1) p = targetCurrentPrice
      prices.push(p)
    }

    for (let i = 0; i < count; i++) {
      const time = Math.floor((now - (count - 1 - i) * intervalMs) / 1000)
      const open = i === 0 ? startPrice : prices[i - 1]
      const close = prices[i]
      const wick = rng() * vol * 0.7
      const high = Math.max(open, close) + wick
      const low = Math.min(open, close) - rng() * vol * 0.7
      const volume = targetCurrentPrice * (rng() * 4 + 1) * (Math.abs(close - open) / (vol || 1) + 0.5) * 40

      candles.push({
        time,
        open: +open.toFixed(basePrice > 500 ? 2 : 4),
        high: +high.toFixed(basePrice > 500 ? 2 : 4),
        low: +low.toFixed(basePrice > 500 ? 2 : 4),
        close: +close.toFixed(basePrice > 500 ? 2 : 4),
        volume: Math.round(volume),
      })
    }
  }

  return candles
}

function intervalMs(tf: Timeframe): number {
  return { '1m': 60_000, '5m': 300_000, '15m': 900_000, '1h': 3_600_000, '4h': 14_400_000, '1d': 86_400_000, '1w': 604_800_000 }[tf]
}

function candleCount(tf: Timeframe): number {
  return { '1m': 200, '5m': 200, '15m': 150, '1h': 120, '4h': 90, '1d': 180, '1w': 104 }[tf]
}

function generateOrderBook(price: number, side: 'asks' | 'bids'): OrderBookEntry[] {
  const rng = seededRng(price * (side === 'asks' ? 31 : 71) | 0)
  const entries: OrderBookEntry[] = []
  let running = 0
  for (let i = 0; i < 12; i++) {
    const offset = (i + 1) * price * 0.0008 * (rng() + 0.5)
    const p = side === 'asks' ? price + offset : price - offset
    const amt = rng() * 4 + 0.1
    running += amt
    entries.push({ price: p, amount: amt, total: running })
  }
  return entries
}

function generateRecentTrades(price: number): RecentTrade[] {
  const rng = seededRng(price * 99 | 0)
  const trades: RecentTrade[] = []
  let t = Date.now()
  for (let i = 0; i < 20; i++) {
    t -= Math.floor(rng() * 8000 + 500)
    trades.push({
      id: String(i),
      price: price + (rng() - 0.5) * price * 0.002,
      amount: rng() * 2 + 0.01,
      side: rng() > 0.5 ? 'buy' : 'sell',
      time: new Date(t),
    })
  }
  return trades
}

// ──────────────────────────────────────────────────────────────────────────────
// Token + pair catalogue  (per-chain)
// ──────────────────────────────────────────────────────────────────────────────
const QUOTE_TOKENS = ['USDC', 'USDT', 'ETH']

interface TradingPair {
  base: string
  quote: string
  basePrice: number   // USDC reference price (display only)
  change24h: number
  volume24h: number
  color: string
}

/** All possible pairs regardless of chain */
const ALL_PAIRS: TradingPair[] = [
  { base: 'WBTC',   quote: 'USDC', basePrice: 67_420,  change24h:  2.14,  volume24h: 4_200_000, color: '#F7931A' },
  { base: 'WETH',   quote: 'USDC', basePrice: 3_510,   change24h:  1.38,  volume24h: 2_800_000, color: '#627EEA' },
  { base: 'WSOL',   quote: 'USDC', basePrice: 172.5,   change24h: -1.02,  volume24h:   940_000, color: '#9945FF' },
  { base: 'WBNB',   quote: 'USDC', basePrice: 585.0,   change24h:  0.85,  volume24h: 1_120_000, color: '#F3BA2F' },
  { base: 'WAVAX',  quote: 'USDC', basePrice: 38.4,    change24h:  3.21,  volume24h:   520_000, color: '#E84142' },
  { base: 'WPOL',   quote: 'USDC', basePrice: 0.94,    change24h:  1.05,  volume24h:   310_000, color: '#8247E5' },
  { base: 'ARB',    quote: 'USDC', basePrice: 1.12,    change24h: -0.88,  volume24h:   430_000, color: '#28A0F0' },
  { base: 'OP',     quote: 'USDC', basePrice: 2.07,    change24h:  0.54,  volume24h:   290_000, color: '#FF0420' },
  { base: 'LINK',   quote: 'USDC', basePrice: 14.8,    change24h:  2.30,  volume24h:   670_000, color: '#2A5ADA' },
  { base: 'UNI',    quote: 'USDC', basePrice: 9.72,    change24h: -1.40,  volume24h:   340_000, color: '#FF007A' },
  { base: 'AAVE',   quote: 'USDC', basePrice: 108,     change24h:  4.12,  volume24h:   280_000, color: '#B6509E' },
  { base: 'USDT',   quote: 'USDC', basePrice: 1.0002,  change24h:  0.01,  volume24h: 5_600_000, color: '#26A17B' },
  { base: 'EURC',   quote: 'USDC', basePrice: 1.078,   change24h:  0.22,  volume24h:   380_000, color: '#1B54B8' },
  { base: 'DAI',    quote: 'USDC', basePrice: 0.9998,  change24h: -0.02,  volume24h:   210_000, color: '#F4B731' },
  { base: 'USDE',   quote: 'USDC', basePrice: 0.9997,  change24h:  0.00,  volume24h:    95_000, color: '#6366f1' },
  { base: 'PYUSD',  quote: 'USDC', basePrice: 0.9996,  change24h:  0.01,  volume24h:    78_000, color: '#003087' },
  { base: 'MNT',    quote: 'USDC', basePrice: 0.78,    change24h:  1.45,  volume24h:   150_000, color: '#000000' },
  { base: 'CELO',   quote: 'USDC', basePrice: 0.65,    change24h: -0.40,  volume24h:    85_000, color: '#35D07F' },
  { base: 'SEI',    quote: 'USDC', basePrice: 0.42,    change24h:  2.80,  volume24h:   310_000, color: '#9B1C2E' },
  { base: 'SUI',    quote: 'USDC', basePrice: 1.85,    change24h:  3.10,  volume24h:   890_000, color: '#4DA2FF' },
  { base: 'APT',    quote: 'USDC', basePrice: 8.90,    change24h: -1.15,  volume24h:   420_000, color: '#2ED8A7' },
  { base: 'NEAR',   quote: 'USDC', basePrice: 5.20,    change24h:  1.90,  volume24h:   640_000, color: '#000000' },
  { base: 'FTM',    quote: 'USDC', basePrice: 0.82,    change24h:  2.05,  volume24h:   390_000, color: '#1969FF' },
  { base: 'NATIVE', quote: 'USDC', basePrice: 1.00,    change24h:  0.00,  volume24h:   120_000, color: '#5FFBF1' },
]

/** Pairs available per chain (by base symbol) */
const CHAIN_PAIRS: Record<string, string[]> = {
  Arc_Testnet: ['NATIVE', 'USDT', 'EURC', 'PYUSD'],
  Ethereum:    ['WBTC', 'WETH', 'USDT', 'EURC', 'DAI', 'USDE', 'LINK', 'UNI', 'AAVE'],
  Base:        ['WETH', 'USDT', 'EURC', 'DAI', 'UNI', 'AAVE'],
  Arbitrum:    ['WBTC', 'WETH', 'ARB', 'USDT', 'EURC', 'DAI', 'USDE', 'LINK', 'UNI', 'AAVE'],
  Optimism:    ['WETH', 'OP', 'USDT', 'DAI', 'LINK', 'AAVE'],
  Polygon:     ['WBTC', 'WETH', 'WPOL', 'USDT', 'DAI', 'LINK', 'AAVE'],
  Avalanche:   ['WBTC', 'WETH', 'WAVAX', 'USDT', 'LINK'],
  Solana:      ['WSOL', 'WBTC', 'WETH', 'USDT', 'USDE', 'PYUSD'],
  BSC:         ['WBNB', 'WBTC', 'WETH', 'USDT', 'DAI'],
  Linea:       ['WETH', 'USDT', 'DAI'],
  Scroll:      ['WETH', 'USDT', 'EURC'],
  zkSync:      ['WETH', 'USDT', 'DAI'],
  Mantle:      ['MNT', 'WETH', 'USDT'],
  Blast:       ['WETH', 'USDT', 'DAI'],
  Celo:        ['CELO', 'USDT', 'EURC'],
  Sei:         ['SEI', 'USDT', 'USDC'],
  Aptos:       ['APT', 'USDT', 'WETH'],
  Sui:         ['SUI', 'USDT', 'WETH'],
  Sonic:       ['FTM', 'WETH', 'USDT'],
  Near:        ['NEAR', 'WBTC', 'USDT'],
}

function pairsForChain(chainId: string): TradingPair[] {
  const bases = CHAIN_PAIRS[chainId] ?? CHAIN_PAIRS['Ethereum']
  const matched = ALL_PAIRS.filter((p) => bases.includes(p.base))
  return matched.length > 0 ? matched : [ALL_PAIRS[0]]
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function fmt(n: number, dp = 2): string {
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1)    return n.toFixed(dp)
  if (n >= 0.01) return n.toFixed(4)
  return n.toFixed(6)
}

function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── Pair Selector ──────────────────────────────────────────────────────────────
function PairSelector({ selected, onSelect, pairs }: { selected: TradingPair; onSelect: (p: TradingPair) => void; pairs: TradingPair[] }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = pairs.filter(
    (p) =>
      p.base.toLowerCase().includes(search.toLowerCase()) ||
      p.quote.toLowerCase().includes(search.toLowerCase())
  )

  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
      >
        <TokenIcon symbol={selected.base} size={20} fallbackColor={selected.color} />
        <span className="display font-bold text-sm" style={{ color: 'var(--ink)' }}>
          {selected.base}/{selected.quote}
        </span>
        <ChevronDown className="size-3.5" style={{ color: 'var(--muted)' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{ background: '#141414', border: '1px solid var(--border)' }}
          >
            <div className="p-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pairs..."
                className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)' }}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.base + p.quote}
                  onClick={() => { onSelect(p); setOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
                  style={{ background: selected.base === p.base ? 'rgba(95,251,241,0.08)' : 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <TokenIcon symbol={p.base} size={18} fallbackColor={p.color} />
                    <span style={{ color: 'var(--ink)' }}>{p.base}/{p.quote}</span>
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: p.change24h >= 0 ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Chain Selector ─────────────────────────────────────────────────────────────
function ChainSelector({ selected, onSelect }: { selected: ChainInfo; onSelect: (c: ChainInfo) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        title="Select chain"
      >
        <ChainIcon chain={selected.name} size={16} />
        <span style={{ color: 'var(--ink)' }}>{selected.shortName}</span>
        <ChevronDown className="size-3" style={{ color: 'var(--subtle)' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1 w-56 rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{ background: '#141414', border: '1px solid var(--border)' }}
          >
            <div className="px-3 py-2 flex items-center gap-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <Globe className="size-3.5" style={{ color: 'var(--muted)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Select Network</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {SUPPORTED_CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors text-left"
                  style={{ background: selected.id === c.id ? 'rgba(95,251,241,0.08)' : 'transparent' }}
                >
                  <ChainIcon chain={c.name} size={18} />
                  <span style={{ color: selected.id === c.id ? 'var(--accent)' : 'var(--ink)' }} className="font-semibold">
                    {c.name}
                  </span>
                  {c.isTestnet && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(95,251,241,0.12)', color: 'var(--accent)' }}>
                      testnet
                    </span>
                  )}
                  {selected.id === c.id && (
                    <span className="ml-auto size-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Order Book ─────────────────────────────────────────────────────────────────
function OrderBook({ price, pair }: { price: number; pair: TradingPair }) {
  const asks = generateOrderBook(price, 'asks').reverse()
  const bids = generateOrderBook(price, 'bids')

  const maxTotal = Math.max(...asks.map((a) => a.total), ...bids.map((b) => b.total))

  const Row = ({ entry, side }: { entry: OrderBookEntry; side: 'ask' | 'bid' }) => {
    const pct = (entry.total / maxTotal) * 100
    const barColor = side === 'ask' ? 'rgba(240,98,118,0.15)' : 'rgba(93,200,136,0.15)'
    return (
      <div className="relative flex items-center px-2 py-0.5 text-xs tabular-nums hover:bg-white/5 cursor-default select-none">
        <div
          className="absolute inset-y-0 right-0"
          style={{ width: `${pct}%`, background: barColor, transition: 'width 0.3s ease' }}
        />
        <span className="flex-1 font-medium" style={{ color: side === 'ask' ? 'var(--danger)' : 'var(--success)' }}>
          {fmt(entry.price)}
        </span>
        <span className="flex-1 text-right" style={{ color: 'var(--muted)' }}>
          {entry.amount.toFixed(4)}
        </span>
        <span className="flex-1 text-right" style={{ color: 'var(--subtle)' }}>
          {entry.total.toFixed(3)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-2 py-1.5 text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--subtle)' }}>
        <span className="flex-1">Price ({pair.quote})</span>
        <span className="flex-1 text-right">Amount ({pair.base})</span>
        <span className="flex-1 text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        {asks.map((a, i) => <Row key={i} entry={a} side="ask" />)}
      </div>

      {/* Mid price */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{ background: 'rgba(172,198,233,0.06)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="display text-sm font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
          {fmt(price)}
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>≈ ${fmt(price)}</span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-y-auto">
        {bids.map((b, i) => <Row key={i} entry={b} side="bid" />)}
      </div>
    </div>
  )
}

// ── Recent Trades ──────────────────────────────────────────────────────────────
function RecentTrades({ price, pair }: { price: number; pair: TradingPair }) {
  const trades = generateRecentTrades(price)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-2 py-1.5 text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--subtle)' }}>
        <span className="flex-1">Price ({pair.quote})</span>
        <span className="flex-1 text-right">Amount ({pair.base})</span>
        <span className="flex-1 text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {trades.map((t) => (
          <div key={t.id} className="flex items-center px-2 py-0.5 text-xs tabular-nums hover:bg-white/5 select-none">
            <span className="flex-1 font-medium" style={{ color: t.side === 'buy' ? 'var(--success)' : 'var(--danger)' }}>
              {fmt(t.price)}
            </span>
            <span className="flex-1 text-right" style={{ color: 'var(--muted)' }}>{t.amount.toFixed(4)}</span>
            <span className="flex-1 text-right mono text-[10px]" style={{ color: 'var(--subtle)' }}>{fmtTime(t.time)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Order Form ─────────────────────────────────────────────────────────────────
function OrderForm({ pair, lastPrice, connected }: { pair: TradingPair; lastPrice: number; connected: boolean }) {
  const [side, setSide] = useState<OrderSide>('buy')
  const [orderType, setOrderType] = useState<OrderType>('limit')
  const [price, setPrice] = useState(String(lastPrice.toFixed(4)))
  const [amount, setAmount] = useState('')
  const [total, setTotal] = useState('')
  const [orders, setOrders] = useState<OpenOrder[]>([])
  const [submitted, setSubmitted] = useState(false)

  const handleAmountChange = useCallback((v: string) => {
    setAmount(v)
    const p = parseFloat(price) || lastPrice
    const a = parseFloat(v)
    if (!isNaN(a)) setTotal((p * a).toFixed(2))
    else setTotal('')
  }, [price, lastPrice])

  const handleTotalChange = useCallback((v: string) => {
    setTotal(v)
    const p = parseFloat(price) || lastPrice
    const t = parseFloat(v)
    if (!isNaN(t) && p > 0) setAmount((t / p).toFixed(6))
    else setAmount('')
  }, [price, lastPrice])

  const pctButtons = [25, 50, 75, 100]

  const handlePct = (pct: number) => {
    const bal = side === 'buy' ? 1000 : 1 // demo balance
    const t = (bal * pct) / 100
    handleTotalChange(t.toFixed(2))
  }

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return
    const order: OpenOrder = {
      id: String(Date.now()),
      pair: `${pair.base}/${pair.quote}`,
      type: orderType,
      side,
      price: parseFloat(price) || lastPrice,
      amount: parseFloat(amount),
      filled: 0,
      time: new Date(),
    }
    setOrders((prev) => [order, ...prev.slice(0, 9)])
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
    setAmount('')
    setTotal('')
  }

  const cancelOrder = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Buy / Sell tabs */}
      <div className="flex p-1.5 gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setSide('buy')}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: side === 'buy' ? 'rgba(93,200,136,0.18)' : 'transparent', color: side === 'buy' ? 'var(--success)' : 'var(--muted)', border: side === 'buy' ? '1px solid rgba(93,200,136,0.3)' : '1px solid transparent' }}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide('sell')}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: side === 'sell' ? 'rgba(240,98,118,0.18)' : 'transparent', color: side === 'sell' ? 'var(--danger)' : 'var(--muted)', border: side === 'sell' ? '1px solid rgba(240,98,118,0.3)' : '1px solid transparent' }}
        >
          Sell / Short
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Order type */}
        <div className="flex gap-1">
          {(['market', 'limit', 'stop'] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className="flex-1 py-1 rounded-lg text-xs font-medium capitalize transition-all"
              style={{ background: orderType === t ? 'var(--surface-muted)' : 'transparent', color: orderType === t ? 'var(--accent)' : 'var(--subtle)', border: '1px solid var(--border)' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Price */}
        {orderType !== 'market' && (
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--subtle)' }}>Price ({pair.quote})</label>
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full px-3 py-2 rounded-xl text-sm tabular-nums outline-none transition"
              style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)' }}
            />
          </div>
        )}
        {orderType === 'market' && (
          <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--subtle)' }}>
            Market · ~{fmt(lastPrice)} {pair.quote}
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--subtle)' }}>Amount ({pair.base})</label>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-xl text-sm tabular-nums outline-none"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)' }}
          />
        </div>

        {/* Pct buttons */}
        <div className="flex gap-1">
          {pctButtons.map((p) => (
            <button
              key={p}
              onClick={() => handlePct(p)}
              className="flex-1 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
              style={{ background: 'var(--surface-muted)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--subtle)' }}>Total ({pair.quote})</label>
          <input
            inputMode="decimal"
            value={total}
            onChange={(e) => handleTotalChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="w-full px-3 py-2 rounded-xl text-sm tabular-nums outline-none"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink)' }}
          />
        </div>

        {/* Fee info */}
        <div className="flex justify-between text-xs" style={{ color: 'var(--subtle)' }}>
          <span>Fee (0.05%)</span>
          <span className="tabular-nums">
            {total ? `~${(parseFloat(total) * 0.0005).toFixed(4)} ${pair.quote}` : '—'}
          </span>
        </div>

        {/* Submit */}
        {!connected ? (
          <div className="flex justify-center pt-1">
            <ConnectKitButton />
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || submitted}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: submitted ? (side === 'buy' ? 'rgba(93,200,136,0.35)' : 'rgba(240,98,118,0.35)') : side === 'buy' ? 'rgba(93,200,136,0.25)' : 'rgba(240,98,118,0.25)',
              color: side === 'buy' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${side === 'buy' ? 'rgba(93,200,136,0.4)' : 'rgba(240,98,118,0.4)'}`,
            }}
          >
            {submitted ? 'Order Placed!' : `${side === 'buy' ? 'Buy' : 'Sell'} ${pair.base}`}
          </button>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-center" style={{ color: 'var(--subtle)' }}>
          Demo mode. Orders are simulated and no real funds move.
        </p>
      </div>

      {/* Open orders */}
      {orders.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="px-3 pt-2 pb-1 flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Open Orders ({orders.length})</span>
          </div>
          <div className="max-h-36 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs"
                style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: o.side === 'buy' ? 'var(--success)' : 'var(--danger)' }}>
                  {o.side.toUpperCase()}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--ink)' }}>{fmt(o.price)}</span>
                <span className="tabular-nums" style={{ color: 'var(--muted)' }}>{o.amount.toFixed(4)}</span>
                <button
                  onClick={() => cancelOrder(o.id)}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--danger)', background: 'rgba(240,98,118,0.12)' }}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Candlestick Chart ──────────────────────────────────────────────────────────
function CandleChart({
  pair,
  timeframe,
  chartType,
  onPriceUpdate,
}: {
  pair: TradingPair
  timeframe: Timeframe
  chartType: ChartType
  onPriceUpdate: (price: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const volSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const buildChart = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Destroy old
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b82a0',
        fontFamily: "'JetBrains Mono', Menlo, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(172,198,233,0.35)', width: 1, labelBackgroundColor: '#1a2940' },
        horzLine: { color: 'rgba(172,198,233,0.35)', width: 1, labelBackgroundColor: '#1a2940' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)', scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
    })
    chartRef.current = chart

    const candles = generateCandles(pair, candleCount(timeframe), intervalMs(timeframe))
    const lastPrice = candles[candles.length - 1].close
    onPriceUpdate(lastPrice)

    type LWTime = import('lightweight-charts').Time

    // Volume series (shared background pane)
    const volSeries = chart.addSeries(histogramSeriesDef, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
    })
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
    volSeries.setData(candles.map((c) => ({
      time: c.time as LWTime,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(95,251,241,0.35)' : 'rgba(240,98,118,0.35)',
    })))
    volSeriesRef.current = volSeries

    if (chartType === 'candlestick') {
      const cs = chart.addSeries(candlestickSeriesDef, {
        upColor: '#5FFBF1',
        downColor: '#f06276',
        borderUpColor: '#5FFBF1',
        borderDownColor: '#f06276',
        wickUpColor: '#5FFBF1',
        wickDownColor: '#f06276',
      })
      cs.setData(candles.map((c) => ({
        time: c.time as LWTime,
        open: c.open, high: c.high, low: c.low, close: c.close,
      })))
      candleSeriesRef.current = cs
    } else if (chartType === 'line') {
      const ls = chart.addSeries(lineSeriesDef, { color: '#5FFBF1', lineWidth: 2 })
      ls.setData(candles.map((c) => ({ time: c.time as LWTime, value: c.close })))
      lineSeriesRef.current = ls
    } else {
      const as = chart.addSeries(areaSeriesDef, {
        lineColor: '#5FFBF1',
        topColor: 'rgba(95,251,241,0.25)',
        bottomColor: 'rgba(95,251,241,0.01)',
        lineWidth: 2,
      })
      as.setData(candles.map((c) => ({ time: c.time as LWTime, value: c.close })))
      areaSeriesRef.current = as
    }

    chart.timeScale().fitContent()

    // Live tick simulation
    if (tickRef.current) clearInterval(tickRef.current)
    const tickInterval = 2000
    let lastCandle = candles[candles.length - 1]
    const isStable = ['USDT', 'EURC', 'DAI', 'USDE', 'PYUSD', 'NATIVE'].includes(pair.base)

    tickRef.current = setInterval(() => {
      const rng = seededRng(Date.now() % 1000000)
      const maxDelta = isStable ? 0.0001 : lastCandle.close * 0.0006
      const delta = (rng() - 0.5) * 2 * maxDelta
      const meanPull = (pair.basePrice - lastCandle.close) * 0.15
      const newClose = Math.max(lastCandle.close + delta + meanPull, pair.basePrice * 0.1)
      const now = Math.floor(Date.now() / 1000)
      const barTime = Math.floor(now / (intervalMs(timeframe) / 1000)) * (intervalMs(timeframe) / 1000)

      const updated: OHLCV = {
        time: barTime,
        open: lastCandle.time === barTime ? lastCandle.open : lastCandle.close,
        high: Math.max(lastCandle.time === barTime ? lastCandle.high : lastCandle.close, newClose),
        low:  Math.min(lastCandle.time === barTime ? lastCandle.low : lastCandle.close, newClose),
        close: newClose,
        volume: lastCandle.volume + Math.round(rng() * 40),
      }

      type LWT = import('lightweight-charts').Time
      if (chartType === 'candlestick' && candleSeriesRef.current) {
        candleSeriesRef.current.update({ time: updated.time as LWT, open: updated.open, high: updated.high, low: updated.low, close: updated.close })
      } else if (chartType === 'line' && lineSeriesRef.current) {
        lineSeriesRef.current.update({ time: updated.time as LWT, value: updated.close })
      } else if (chartType === 'area' && areaSeriesRef.current) {
        areaSeriesRef.current.update({ time: updated.time as LWT, value: updated.close })
      }

      lastCandle = updated
      onPriceUpdate(newClose)
    }, tickInterval)
  }, [pair, timeframe, chartType, onPriceUpdate])

  useEffect(() => {
    const checkAndInit = () => {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (width > 0 && height > 0) {
        if (!chartRef.current) {
          buildChart()
        } else {
          chartRef.current.resize(width, height)
        }
      }
    }

    checkAndInit()
    const rafId = requestAnimationFrame(checkAndInit)
    const timerId = setTimeout(checkAndInit, 120)

    const ro = new ResizeObserver(() => {
      checkAndInit()
    })
    if (containerRef.current) ro.observe(containerRef.current)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timerId)
      ro.disconnect()
      if (tickRef.current) clearInterval(tickRef.current)
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
    }
  }, [buildChart])

  return <div ref={containerRef} className="w-full h-full min-h-[380px]" style={{ minHeight: '380px' }} />
}

// ── Ticker Bar ─────────────────────────────────────────────────────────────────
function TickerBar({ pair, price, chain }: { pair: TradingPair; price: number; chain: ChainInfo }) {
  const isUp = pair.change24h >= 0
  const isStable = ['USDT', 'EURC', 'DAI', 'USDE', 'PYUSD', 'NATIVE'].includes(pair.base)
  const high = isStable ? Math.max(price, 1.0006) : price * (1 + Math.max(Math.abs(pair.change24h) / 100 * 0.8, 0.012))
  const low  = isStable ? Math.min(price, 0.9995) : price * (1 - Math.max(Math.abs(pair.change24h) / 100 * 0.8, 0.012))

  return (
    <div className="flex items-center gap-5 px-4 py-2 overflow-x-auto text-xs shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Chain pill with ChainIcon */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
        style={{ background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.2)', color: 'var(--ink)' }}
      >
        <ChainIcon chain={chain.name} size={15} />
        <span>{chain.name}</span>
      </div>

      <div>
        <span className="display text-xl font-bold tabular-nums mr-1.5" style={{ color: isUp ? 'var(--success)' : 'var(--danger)' }}>
          {fmt(price)}
        </span>
        <span style={{ color: 'var(--muted)' }}>{pair.quote}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isUp ? <TrendingUp className="size-3.5" style={{ color: 'var(--success)' }} /> : <TrendingDown className="size-3.5" style={{ color: 'var(--danger)' }} />}
        <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)' }}>
          {isUp ? '+' : ''}{pair.change24h.toFixed(2)}%
        </span>
      </div>

      <StatItem label="24h High" value={fmt(high)} />
      <StatItem label="24h Low"  value={fmt(low)}  />
      <StatItem label="24h Vol"  value={fmtVol(pair.volume24h)} />
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0">
      <span style={{ color: 'var(--subtle)' }}>{label} </span>
      <span className="tabular-nums font-medium" style={{ color: 'var(--ink-2)' }}>{value}</span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// TradeView root
// ──────────────────────────────────────────────────────────────────────────────
export function TradeView() {
  const { isConnected } = useAccount()

  // Chain state — default to Arc Testnet
  const defaultChain = SUPPORTED_CHAINS[0]
  const [chain, setChainState] = useState<ChainInfo>(defaultChain)

  // Pair state — driven by chain
  const initialPairs = pairsForChain(defaultChain.id)
  const [pair, setPairState] = useState<TradingPair>(initialPairs[0])
  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [livePrice, setLivePrice] = useState(initialPairs[0].basePrice)
  const [rightPanel, setRightPanel] = useState<'book' | 'trades'>('book')
  const [mobileTab, setMobileTab] = useState<'chart' | 'book' | 'order'>('chart')

  const chainPairs = pairsForChain(chain.id)

  const setChain = useCallback((c: ChainInfo) => {
    setChainState(c)
    const pairs = pairsForChain(c.id)
    const first = pairs[0]
    setPairState(first)
    setLivePrice(first.basePrice)
  }, [])

  const setPair = useCallback((p: TradingPair) => {
    setPairState(p)
    setLivePrice(p.basePrice)
  }, [])

  const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

  return (
    <div className="flex flex-col h-full min-h-[calc(100dvh-120px)] sm:h-[calc(100dvh-56px)]" style={{ background: 'var(--bg)' }}>
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0 overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,22,40,0.7)' }}>
        {/* Chain selector first */}
        <ChainSelector selected={chain} onSelect={setChain} />
        <div className="h-4 w-px shrink-0" style={{ background: 'var(--border)' }} />
        <PairSelector selected={pair} onSelect={setPair} pairs={chainPairs} />

        {/* Timeframe */}
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className="px-2 py-1 rounded text-xs font-medium transition-colors shrink-0"
              style={{ background: timeframe === tf ? 'rgba(172,198,233,0.14)' : 'transparent', color: timeframe === tf ? 'var(--accent)' : 'var(--subtle)' }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart type */}
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          <button onClick={() => setChartType('candlestick')} title="Candlestick" className="p-1.5 rounded transition-colors" style={{ background: chartType === 'candlestick' ? 'rgba(172,198,233,0.14)' : 'transparent', color: chartType === 'candlestick' ? 'var(--accent)' : 'var(--subtle)' }}>
            <BarChart2 className="size-3.5" />
          </button>
          <button onClick={() => setChartType('line')} title="Line" className="p-1.5 rounded transition-colors" style={{ background: chartType === 'line' ? 'rgba(172,198,233,0.14)' : 'transparent', color: chartType === 'line' ? 'var(--accent)' : 'var(--subtle)' }}>
            <Activity className="size-3.5" />
          </button>
          <button onClick={() => setChartType('area')} title="Area" className="p-1.5 rounded transition-colors" style={{ background: chartType === 'area' ? 'rgba(172,198,233,0.14)' : 'transparent', color: chartType === 'area' ? 'var(--accent)' : 'var(--subtle)' }}>
            <Layers className="size-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <button className="p-1.5 rounded transition-colors" style={{ color: 'var(--subtle)' }} title="Settings">
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Ticker */}
      <TickerBar pair={pair} price={livePrice} chain={chain} />

      {/* Mobile navigation tabs (visible on mobile only) */}
      <div className="sm:hidden flex shrink-0" style={{ borderBottom: '1px solid var(--border)', background: '#101010' }}>
        <button
          onClick={() => setMobileTab('chart')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
          style={{
            color: mobileTab === 'chart' ? 'var(--accent)' : 'var(--subtle)',
            borderBottom: mobileTab === 'chart' ? '2px solid var(--accent)' : '2px solid transparent',
            background: mobileTab === 'chart' ? 'rgba(95,251,241,0.08)' : 'transparent',
          }}
        >
          <BarChart2 className="size-3.5" />
          <span>Chart</span>
        </button>
        <button
          onClick={() => setMobileTab('book')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
          style={{
            color: mobileTab === 'book' ? 'var(--accent)' : 'var(--subtle)',
            borderBottom: mobileTab === 'book' ? '2px solid var(--accent)' : '2px solid transparent',
            background: mobileTab === 'book' ? 'rgba(95,251,241,0.08)' : 'transparent',
          }}
        >
          <BookOpen className="size-3.5" />
          <span>Order Book</span>
        </button>
        <button
          onClick={() => setMobileTab('order')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
          style={{
            color: mobileTab === 'order' ? 'var(--accent)' : 'var(--subtle)',
            borderBottom: mobileTab === 'order' ? '2px solid var(--accent)' : '2px solid transparent',
            background: mobileTab === 'order' ? 'rgba(95,251,241,0.08)' : 'transparent',
          }}
        >
          <ArrowUpDown className="size-3.5" />
          <span>Place Order</span>
        </button>
      </div>

      {/* Mobile View panels */}
      <div className="sm:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
        {mobileTab === 'chart' && (
          <div className="flex-1 h-full min-h-[420px] w-full flex flex-col">
            <CandleChart
              pair={pair}
              timeframe={timeframe}
              chartType={chartType}
              onPriceUpdate={setLivePrice}
            />
          </div>
        )}

        {mobileTab === 'book' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setRightPanel('book')}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
                style={{ color: rightPanel === 'book' ? 'var(--accent)' : 'var(--subtle)', borderBottom: rightPanel === 'book' ? '2px solid var(--accent)' : '2px solid transparent' }}
              >
                <BookOpen className="size-3.5" /> Order Book
              </button>
              <button
                onClick={() => setRightPanel('trades')}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
                style={{ color: rightPanel === 'trades' ? 'var(--accent)' : 'var(--subtle)', borderBottom: rightPanel === 'trades' ? '2px solid var(--accent)' : '2px solid transparent' }}
              >
                <Clock className="size-3.5" /> Recent Trades
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightPanel === 'book'
                ? <OrderBook price={livePrice} pair={pair} />
                : <RecentTrades price={livePrice} pair={pair} />
              }
            </div>
          </div>
        )}

        {mobileTab === 'order' && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center">
            <div className="w-full max-w-sm">
              <OrderForm key={pair.base} pair={pair} lastPrice={livePrice} connected={isConnected} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Main body: chart | order-book | order-form */}
      <div className="hidden sm:flex flex-1 overflow-hidden">
        {/* Chart area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1">
            <CandleChart
              pair={pair}
              timeframe={timeframe}
              chartType={chartType}
              onPriceUpdate={setLivePrice}
            />
          </div>
        </div>

        {/* Right column: order book + recent trades */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 220, borderLeft: '1px solid var(--border)' }}
        >
          {/* Book / Trades tab */}
          <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setRightPanel('book')}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
              style={{ color: rightPanel === 'book' ? 'var(--accent)' : 'var(--subtle)', borderBottom: rightPanel === 'book' ? '2px solid var(--accent)' : '2px solid transparent' }}
            >
              <BookOpen className="size-3.5" /> Book
            </button>
            <button
              onClick={() => setRightPanel('trades')}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition-colors"
              style={{ color: rightPanel === 'trades' ? 'var(--accent)' : 'var(--subtle)', borderBottom: rightPanel === 'trades' ? '2px solid var(--accent)' : '2px solid transparent' }}
            >
              <Clock className="size-3.5" /> Trades
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightPanel === 'book'
              ? <OrderBook price={livePrice} pair={pair} />
              : <RecentTrades price={livePrice} pair={pair} />
            }
          </div>
        </div>

        {/* Order form column */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: 240, borderLeft: '1px solid var(--border)' }}
        >
          <div className="px-3 py-2 shrink-0 flex items-center gap-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <ArrowUpDown className="size-3.5" style={{ color: 'var(--muted)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Place Order</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <OrderForm key={pair.base} pair={pair} lastPrice={livePrice} connected={isConnected} />
          </div>
        </div>
      </div>
    </div>
  )
}

// silence unused import warning for Token
void (DEFAULT_TOKEN_LIST)
void QUOTE_TOKENS
