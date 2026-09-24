import { useState } from 'react'
import { Flame, Trophy, Shield, Download, Smartphone, Smile, Angry } from 'lucide-react'
import {
  getSettings,
  setSettings,
  getStreak,
  getProfile,
  getDebts,
  getCheckins,
  exportAllData,
  deleteAllData,
} from '../lib/storage'
import type { RoastTone } from '../lib/tone'
import { dailyAllowance, spentOn, todayKey } from '../lib/daily'
import { inr } from '../lib/format'

function last7Keys(): string[] {
  const out: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(todayKey(d))
  }
  return out
}

export function Me() {
  const streak = getStreak()
  const [goal, setGoal] = useState(getSettings().savingsGoalPct)
  const [tone, setTone] = useState<RoastTone>(getSettings().roastTone)

  const profile = getProfile()
  const debts = getDebts()
  const emis = debts.length ? debts.reduce((s, d) => s + (d.minPayment || 0), 0) : profile.existingEmis
  const allowance = dailyAllowance(profile.netMonthlyIncome, emis, goal)
  const checkins = getCheckins()
  const week = last7Keys().map((k) => ({ key: k, spent: spentOn(checkins, k), day: k.slice(8) }))
  const maxSpent = Math.max(allowance, ...week.map((w) => w.spent), 1)

  function updateGoal(v: number) { setGoal(v); setSettings({ savingsGoalPct: v }) }
  function updateTone(t: RoastTone) { setTone(t); setSettings({ roastTone: t }) }

  function exportData() {
    try {
      const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `broke-data-${new Date().toISOString().slice(0, 10)}.json`
      link.href = url; link.click()
      URL.revokeObjectURL(url)
    } catch { window.alert('Could not export right now. Try again.') }
  }

  function resetAll() {
    if (!window.confirm('Wipe all your Broke? data on this device? This cannot be undone.')) return
    deleteAllData()
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-7">
      <div>
        <span className="tag">Your money life</span>
        <h1 className="mt-3 text-4xl font-black leading-none">You</h1>
      </div>

      {/* Streak */}
      <div className="card flex items-center justify-around p-6">
        <Stat Icon={Flame} big={streak.current} label="Current streak" tint="text-danger" />
        <div className="h-10 w-px bg-white/10" />
        <Stat Icon={Trophy} big={streak.longest} label="Longest ever" tint="text-warn" />
      </div>

      {/* Weekly trends */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-black uppercase tracking-tight text-paper">This week</span>
          <span className="font-display text-xs font-bold text-paper/45">spend vs daily budget</span>
        </div>
        <div className="mt-4 flex h-28 items-end justify-between gap-2">
          {week.map((w) => {
            const h = Math.round((w.spent / maxSpent) * 100)
            const over = allowance > 0 && w.spent > allowance
            return (
              <div key={w.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className={['w-full max-w-[26px] rounded-t-md transition-all', over ? 'bg-danger' : w.spent > 0 ? 'bg-go' : 'bg-white/10'].join(' ')}
                    style={{ height: `${Math.max(4, h)}%` }}
                  />
                </div>
                <span className="font-display text-[10px] font-bold text-paper/40">{w.day}</span>
              </div>
            )
          })}
        </div>
        {allowance > 0 && (
          <p className="mt-2 text-[11px] font-semibold text-paper/45">Daily budget ≈ {inr(allowance)}. Green = under, red = over.</p>
        )}
      </div>

      {/* Savings goal */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-black uppercase tracking-tight text-paper">Savings goal</span>
          <span className="font-display text-xl font-black text-pop">{goal}%</span>
        </div>
        <p className="mt-1 text-xs font-semibold text-paper/55">We hold back this slice of income before working out your daily budget.</p>
        <input type="range" min={0} max={50} step={5} value={goal} onChange={(e) => updateGoal(Number(e.target.value))} className="mt-3 w-full" />
      </div>

      {/* Roast tone */}
      <div className="card p-5">
        <span className="font-display text-sm font-black uppercase tracking-tight text-paper">Verdict tone</span>
        <p className="mt-1 text-xs font-semibold text-paper/55">How hard should Broke? roast your spending?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ToneBtn active={tone === 'honest'} onClick={() => updateTone('honest')} Icon={Smile} label="Honest" sub="Straight & kind" />
          <ToneBtn active={tone === 'brutal'} onClick={() => updateTone('brutal')} Icon={Angry} label="Brutal" sub="No mercy" />
        </div>
      </div>

      {/* Privacy */}
      <div className="card p-5">
        <div className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-tight text-paper">
          <Shield className="h-4 w-4 text-go" /> Your data stays on your phone
        </div>
        <p className="mt-1 text-xs font-semibold text-paper/60">
          Broke? runs fully on this device — no account, no server, nothing uploaded. Export a copy or wipe it any time.
        </p>
        <button type="button" onClick={exportData} className="mt-3 inline-flex items-center gap-1.5 font-display text-xs font-black uppercase tracking-wide text-pop">
          <Download className="h-3.5 w-3.5" /> Export my data (JSON)
        </button>
      </div>

      {/* Install hint */}
      <div className="card p-4">
        <div className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-tight text-paper">
          <Smartphone className="h-4 w-4" /> Add to home screen
        </div>
        <p className="mt-1 text-xs font-semibold text-paper/55">
          Install Broke? like an app: browser menu → “Add to Home Screen”. Opens full-screen, keeps your streak one tap away.
        </p>
      </div>

      <button type="button" onClick={resetAll} className="self-center font-display text-xs font-bold uppercase tracking-wide text-danger/80 underline">
        Reset all my data
      </button>
    </div>
  )
}

function Stat({ Icon, big, label, tint }: { Icon: typeof Flame; big: number; label: string; tint: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5">
        <Icon className={['h-6 w-6', tint].join(' ')} />
        <span className="font-display text-3xl font-black tabular-nums text-paper">{big}</span>
      </div>
      <div className="mt-1 font-display text-[10px] font-black uppercase tracking-wider text-paper/45">{label}</div>
    </div>
  )
}

function ToneBtn({ active, onClick, Icon, label, sub }: { active: boolean; onClick: () => void; Icon: typeof Smile; label: string; sub: string }) {
  return (
    <button type="button" onClick={onClick}
      className={['rounded-2xl border p-3 text-left transition-colors', active ? 'border-pop bg-pop/20' : 'border-line bg-elev'].join(' ')}>
      <div className="flex items-center gap-2">
        <Icon className={['h-5 w-5', active ? 'text-pop' : 'text-paper/60'].join(' ')} />
        <span className="font-display text-sm font-black uppercase text-paper">{label}</span>
      </div>
      <span className="mt-0.5 block font-display text-[10px] font-bold uppercase tracking-wide text-paper/45">{sub}</span>
    </button>
  )
}
