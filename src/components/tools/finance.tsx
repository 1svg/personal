import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// ─── Types ────────────────────────────────────────────────────────────────────

type Envelope = { id: number; name: string; percent: number }

const PRESETS = [
  { name: 'Cash', emoji: '💵', suggested: 50 },
  { name: 'Livret', emoji: '🏦', suggested: 50 },
  { name: 'PEA', emoji: '📈', suggested: 50 },
]

const PALETTE = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
]

function fmt(v: number) {
  return v.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

// ─── Donut ────────────────────────────────────────────────────────────────────

function Donut({
  envelopes,
  isOver,
}: {
  envelopes: Envelope[]
  isOver: boolean
}) {
  const r = 36
  const c = 2 * Math.PI * r
  let offset = 0
  const slices = envelopes
    .filter((e) => e.percent > 0)
    .map((e, i) => {
      const dash = (Math.min(e.percent, 100) / 100) * c
      const s = { offset, dash, color: PALETTE[i % PALETTE.length] }
      offset += dash
      return s
    })
  const remaining = Math.max(
    0,
    100 - envelopes.reduce((s, e) => s + e.percent, 0),
  )
  const rdash = (remaining / 100) * c
  const total = envelopes.reduce((s, e) => s + e.percent, 0)

  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      className="shrink-0 -rotate-90"
    >
      {/* Track */}
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        strokeWidth="8"
        stroke="currentColor"
        className="text-border"
      />
      {/* Remaining */}
      {remaining > 0 && (
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          strokeWidth="8"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeDasharray={`${rdash} ${c}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
        />
      )}
      {/* Slices */}
      {slices.map((s, i) => (
        <circle
          key={i}
          cx="44"
          cy="44"
          r={r}
          fill="none"
          strokeWidth="8"
          stroke={isOver ? 'var(--destructive)' : s.color}
          strokeDasharray={`${s.dash} ${c}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="round"
        />
      ))}
      {/* Texte — contre-rotaté pour rester à l'endroit */}
      <text
        x="44"
        y="41"
        textAnchor="middle"
        dominantBaseline="middle"
        transform="rotate(90 44 44)"
        fill={isOver ? 'var(--destructive)' : 'var(--foreground)'}
        style={{
          fontSize: '13px',
          fontFamily: 'Geist Mono, monospace',
          fontWeight: 600,
        }}
      >
        {total.toFixed(0)}%
      </text>
      <text
        x="44"
        y="54"
        textAnchor="middle"
        dominantBaseline="middle"
        transform="rotate(90 44 44)"
        fill="var(--muted-foreground)"
        style={{
          fontSize: '9px',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
        }}
      >
        alloué
      </text>
    </svg>
  )
}

// ─── Ligne enveloppe ──────────────────────────────────────────────────────────

function EnvelopeRow({
  env,
  index,
  freeAmount,
  onUpdate,
  onDelete,
}: {
  env: Envelope
  index: number
  freeAmount: number
  onUpdate: (id: number, field: 'name' | 'percent', v: string) => void
  onDelete: (id: number) => void
}) {
  const amount = freeAmount * (env.percent / 100)
  return (
    <div className="group hover:bg-muted/50 grid grid-cols-[10px_1fr_auto_76px_28px] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
      />

      <Input
        type="text"
        placeholder="Nom…"
        value={env.name}
        onChange={(e) => onUpdate(env.id, 'name', e.target.value)}
        className="placeholder:text-muted-foreground/40 h-8 border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
      />

      <span className="text-muted-foreground font-mono text-sm tabular-nums">
        {fmt(amount)}
      </span>

      <div className="relative">
        <Input
          type="number"
          min="0"
          max="100"
          step="1"
          placeholder="0"
          value={env.percent || ''}
          onChange={(e) => onUpdate(env.id, 'percent', e.target.value)}
          className="h-8 pr-6 text-right text-sm tabular-nums"
        />
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs">
          %
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        aria-label="Supprimer"
        onClick={() => onDelete(env.id)}
        className="hover:text-destructive h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function FinanceTool() {
  const [income, setIncome] = useState('')
  const [fixed, setFixed] = useState('')
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)

  const incomeVal = parseFloat(income) || 0
  const fixedVal = parseFloat(fixed) || 0
  const freeAmount = Math.max(0, incomeVal - fixedVal)
  const allocatedPct = envelopes.reduce((s, e) => s + (e.percent || 0), 0)
  const remainingPct = 100 - allocatedPct
  const remainingAmount = freeAmount * (Math.max(0, remainingPct) / 100)
  const isOver = allocatedPct > 100

  const addEnvelope = useCallback((name = '', percent = 0) => {
    setEnvelopes((prev) => {
      const id = prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1
      return [...prev, { id, name, percent }]
    })
    setPopoverOpen(false)
  }, [])

  const updateEnvelope = useCallback(
    (id: number, field: 'name' | 'percent', v: string) => {
      setEnvelopes((prev) =>
        prev.map((e) =>
          e.id !== id
            ? e
            : {
                ...e,
                [field]:
                  field === 'percent' ? Math.max(0, parseFloat(v) || 0) : v,
              },
        ),
      )
    },
    [],
  )

  const deleteEnvelope = useCallback((id: number) => {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* ── Revenus ── */}
      <div className="overflow-hidden rounded-xl border">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Revenus
          </p>
        </div>
        <Separator />
        <div className="divide-border grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
          {[
            {
              id: 'income',
              label: 'Revenus totaux',
              val: income,
              set: setIncome,
              placeholder: '2 500',
            },
            {
              id: 'fixed',
              label: 'Charges fixes',
              val: fixed,
              set: setFixed,
              placeholder: '1 200',
            },
          ].map(({ id, label, val, set, placeholder }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <Label
                htmlFor={id}
                className="text-muted-foreground shrink-0 text-sm font-normal"
              >
                {label}
              </Label>
              <div className="relative w-32">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  €
                </span>
                <Input
                  id={id}
                  type="number"
                  min="0"
                  step="1"
                  placeholder={placeholder}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="pr-2 pl-7 text-right text-sm font-medium tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Répartition ── */}
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Répartition
          </p>
          {isOver && (
            <Badge variant="destructive" className="text-xs">
              +{(allocatedPct - 100).toFixed(0)}% dépassement
            </Badge>
          )}
        </div>
        <Separator />
        <div className="flex items-center gap-5 p-4">
          {/* Donut */}
          <Donut envelopes={envelopes} isOver={isOver} />

          {/* Stats */}
          <div className="flex flex-1 flex-col gap-2.5">
            {[
              {
                label: 'Reste à allouer',
                main: fmt(remainingAmount),
                sub: `${Math.max(0, remainingPct).toFixed(0)}% restant`,
              },
              {
                label: 'Disponible total',
                main: fmt(freeAmount),
                sub: 'après charges',
              },
              {
                label: 'Revenus bruts',
                main: fmt(incomeVal),
                sub: `− ${fmt(fixedVal)} charges`,
              },
            ].map(({ label, main, sub }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-muted-foreground text-sm">{label}</span>
                <div className="flex items-baseline gap-1.5 text-right">
                  <span className="font-mono text-sm font-medium tabular-nums">
                    {main}
                  </span>
                  <span className="text-muted-foreground text-xs">{sub}</span>
                </div>
              </div>
            ))}

            {/* Barre */}
            <div className="bg-border mt-0.5 h-1 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(allocatedPct, 100)}%`,
                  background: isOver
                    ? 'var(--destructive)'
                    : `linear-gradient(to right, ${PALETTE[0]}, ${PALETTE[2]})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Enveloppes ── */}
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Enveloppes
            </p>
            {envelopes.length > 0 && (
              <Badge
                variant="muted"
                className="h-5 px-1.5 text-[10px] font-medium"
              >
                {envelopes.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {envelopes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="text-muted-foreground h-7 px-2 text-xs"
                onClick={() => {
                  setEnvelopes([])
                  setIncome('')
                  setFixed('')
                }}
              >
                Réinitialiser
              </Button>
            )}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  type="button"
                  className="h-7 gap-1.5 px-3 text-xs"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ajouter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2" align="end">
                <p className="text-muted-foreground px-2 pt-0.5 pb-1.5 text-[10px] font-medium tracking-widest uppercase">
                  Presets
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {PRESETS.map((p) => {
                    const exists = envelopes.some(
                      (e) => e.name.toLowerCase() === p.name.toLowerCase(),
                    )
                    return (
                      <Button
                        key={p.name}
                        variant="ghost"
                        size="sm"
                        type="button"
                        disabled={exists}
                        className="h-8 justify-start gap-2 text-sm font-normal"
                        onClick={() => addEnvelope(p.name, p.suggested)}
                      >
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                      </Button>
                    )
                  })}
                </div>
                <Separator className="my-1.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="w-full justify-start gap-2 text-sm font-normal"
                  onClick={() => addEnvelope('', 0)}
                >
                  <span>✏️</span>
                  <span>Personnalisée…</span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Separator />

        {envelopes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl border">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-muted-foreground"
              >
                <rect x="2" y="5" width="20" height="16" rx="2" />
                <path d="M2 10h20M6 15h4M14 15h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Aucune enveloppe</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Clique sur{' '}
                <span className="text-foreground font-medium">+ Ajouter</span>{' '}
                pour commencer.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* En-têtes colonnes */}
            <div className="grid grid-cols-[10px_1fr_auto_76px_28px] items-center gap-3 px-2 pt-0.5 pb-1">
              <span />
              <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                Nom
              </span>
              <span className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                Montant
              </span>
              <span className="text-muted-foreground text-right text-[10px] font-medium tracking-widest uppercase">
                Part
              </span>
              <span />
            </div>
            <Separator className="mb-1" />

            {envelopes.map((env, i) => (
              <EnvelopeRow
                key={env.id}
                env={env}
                index={i}
                freeAmount={freeAmount}
                onUpdate={updateEnvelope}
                onDelete={deleteEnvelope}
              />
            ))}

            {/* Total */}
            <Separator className="mt-1" />
            <div className="grid grid-cols-[10px_1fr_auto_76px_28px] items-center gap-3 px-2 py-2">
              <span />
              <span className="text-muted-foreground text-sm">Total</span>
              <span
                className={`font-mono text-sm font-medium tabular-nums ${isOver ? 'text-destructive' : ''}`}
              >
                {fmt(freeAmount * (Math.min(allocatedPct, 100) / 100))}
              </span>
              <span
                className={`text-right font-mono text-sm font-medium tabular-nums ${isOver ? 'text-destructive' : ''}`}
              >
                {allocatedPct.toFixed(0)}%
              </span>
              <span />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
