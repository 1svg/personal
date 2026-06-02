import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

type Envelope = { id: number; name: string; percent: number }

const PRESETS = [
  { name: 'Cash', percent: 0, emoji: '🛒' },
  { name: 'Livret', percent: 0, emoji: '🛒' },
  { name: 'PEA', percent: 0, emoji: '🛒' },
]

function formatCurrency(value: number) {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export default function FinanceTool() {
  const [income, setIncome] = useState('')
  const [fixed, setFixed] = useState('')
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [nextId, setNextId] = useState(1)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const freeAmount = Math.max(
    0,
    (parseFloat(income) || 0) - (parseFloat(fixed) || 0),
  )
  const allocatedPercent = envelopes.reduce((s, e) => s + (e.percent || 0), 0)
  const remainingPercent = 100 - allocatedPercent
  const remainingAmount = freeAmount * (Math.max(0, remainingPercent) / 100)
  const isOver = allocatedPercent > 100

  const addEnvelope = useCallback(
    (name = '', percent = 0) => {
      setEnvelopes((prev) => [...prev, { id: nextId, name, percent }])
      setNextId((n) => n + 1)
      setPopoverOpen(false)
    },
    [nextId],
  )

  const updateEnvelope = useCallback(
    (id: number, field: 'name' | 'percent', value: string) => {
      setEnvelopes((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                [field]:
                  field === 'percent'
                    ? Math.max(0, parseFloat(value) || 0)
                    : value,
              }
            : e,
        ),
      )
    },
    [],
  )

  const deleteEnvelope = useCallback((id: number) => {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const reset = useCallback(() => {
    setIncome('')
    setFixed('')
    setEnvelopes([])
    setNextId(1)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Carte revenus */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="bg-muted/20 space-y-4 rounded-md p-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-input">Revenus totaux</Label>
              <Input
                id="income-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="2500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixed-input">Charges fixes</Label>
              <Input
                id="fixed-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="1200"
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-border/50 mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
          {[
            {
              label: 'Reste disponible',
              value: formatCurrency(freeAmount),
              red: false,
            },
            {
              label: '% alloué',
              value: `${allocatedPercent.toFixed(0)} %`,
              red: isOver,
            },
            {
              label: '% restant',
              value: `${remainingPercent.toFixed(0)} %`,
              red: isOver,
            },
            {
              label: 'Montant restant',
              value: formatCurrency(remainingAmount),
              red: isOver,
            },
          ].map(({ label, value, red }) => (
            <div key={label}>
              <p className="text-muted-foreground text-xs font-medium">
                {label}
              </p>
              <p
                className={`mt-1 font-mono text-lg font-semibold ${red ? 'text-destructive' : ''}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <Progress
          value={Math.min(allocatedPercent, 100)}
          className={`mt-4 ${isOver ? '*:data-[slot=progress-indicator]:bg-destructive' : ''}`}
        />

        {isOver && (
          <p className="text-destructive mt-3 text-sm font-medium">
            Le total des enveloppes dépasse 100 % du reste disponible.
          </p>
        )}
      </div>

      {/* Carte enveloppes */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold">Enveloppes</h2>

          <div className="relative flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setPopoverOpen((o) => !o)}
            >
              <span className="mr-1">+</span>
              Ajouter une enveloppe
            </Button>

            {popoverOpen && (
              <>
                {/* Overlay pour fermer en cliquant dehors */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPopoverOpen(false)}
                />
                <div className="border-border bg-background absolute top-10 right-0 z-20 w-64 rounded-xl border p-3 shadow-lg">
                  <p className="mb-1 text-sm font-semibold">
                    Choisir une enveloppe
                  </p>
                  <p className="text-muted-foreground mb-3 text-xs">
                    Clique pour l'ajouter à ta répartition.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => (
                      <Button
                        key={p.name}
                        variant="outline"
                        size="sm"
                        type="button"
                        className="justify-start"
                        onClick={() => {
                          const exists = envelopes.some(
                            (e) =>
                              e.name.toLowerCase() === p.name.toLowerCase(),
                          )
                          if (!exists) addEnvelope(p.name, p.percent)
                          else setPopoverOpen(false)
                        }}
                      >
                        {p.emoji} {p.name}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="col-span-2 justify-start"
                      onClick={() => addEnvelope('', 0)}
                    >
                      ✏️ Personnalisée…
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Button variant="outline" size="sm" type="button" onClick={reset}>
              ↺ Réinitialiser
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {envelopes.length === 0 ? (
            <div className="border-border text-muted-foreground rounded-md border border-dashed px-4 py-8 text-center text-sm">
              Aucune enveloppe ajoutée. Clique sur "Ajouter une enveloppe" pour
              commencer.
            </div>
          ) : (
            envelopes.map((env) => (
              <div
                key={env.id}
                className="border-border bg-muted/20 rounded-md border p-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px_160px_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>Nom de l'enveloppe</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Courses"
                      value={env.name}
                      onChange={(e) =>
                        updateEnvelope(env.id, 'name', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pourcentage</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="20"
                        value={env.percent || ''}
                        onChange={(e) =>
                          updateEnvelope(env.id, 'percent', e.target.value)
                        }
                        className="pr-8"
                      />
                      <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Montant calculé</Label>
                    <div className="border-border bg-background flex h-9 items-center rounded-md border px-3 text-sm font-medium">
                      {formatCurrency(freeAmount * (env.percent / 100))}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="text-muted-foreground hover:text-destructive mt-6"
                    onClick={() => deleteEnvelope(env.id)}
                    aria-label="Supprimer l'enveloppe"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
