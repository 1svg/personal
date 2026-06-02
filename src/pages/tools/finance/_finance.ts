function initFinanceTool() {
  const incomeInputEl = document.getElementById(
    'income-input',
  ) as HTMLInputElement | null
  const fixedInputEl = document.getElementById(
    'fixed-input',
  ) as HTMLInputElement | null
  const freeOutputEl = document.getElementById(
    'free-output',
  ) as HTMLParagraphElement | null
  const allocatedPercentOutputEl = document.getElementById(
    'allocated-percent-output',
  ) as HTMLParagraphElement | null
  const remainingPercentOutputEl = document.getElementById(
    'remaining-percent-output',
  ) as HTMLParagraphElement | null
  const remainingAmountOutputEl = document.getElementById(
    'remaining-amount-output',
  ) as HTMLParagraphElement | null
  const allocationWarningEl = document.getElementById(
    'allocation-warning',
  ) as HTMLParagraphElement | null
  const allocationProgressEl = document.getElementById(
    'allocation-progress',
  ) as HTMLDivElement | null
  const envelopesListEl = document.getElementById(
    'envelopes-list',
  ) as HTMLDivElement | null
  const emptyEnvelopesEl = document.getElementById(
    'empty-envelopes',
  ) as HTMLDivElement | null
  const addBtnEl = document.getElementById(
    'add-envelope',
  ) as HTMLButtonElement | null
  const presetBtnEl = document.getElementById(
    'preset-envelopes',
  ) as HTMLButtonElement | null
  const resetBtnEl = document.getElementById(
    'reset-form',
  ) as HTMLButtonElement | null

  if (
    !incomeInputEl ||
    !fixedInputEl ||
    !freeOutputEl ||
    !allocatedPercentOutputEl ||
    !remainingPercentOutputEl ||
    !remainingAmountOutputEl ||
    !allocationWarningEl ||
    !allocationProgressEl ||
    !envelopesListEl ||
    !emptyEnvelopesEl ||
    !addBtnEl ||
    !presetBtnEl ||
    !resetBtnEl
  ) {
    return
  }

  const incomeInput = incomeInputEl
  const fixedInput = fixedInputEl
  const freeOutput = freeOutputEl
  const allocatedPercentOutput = allocatedPercentOutputEl
  const remainingPercentOutput = remainingPercentOutputEl
  const remainingAmountOutput = remainingAmountOutputEl
  const allocationWarning = allocationWarningEl
  const allocationProgress = allocationProgressEl
  const envelopesList = envelopesListEl
  const emptyEnvelopes = emptyEnvelopesEl
  const addBtn = addBtnEl
  const presetBtn = presetBtnEl
  const resetBtn = resetBtnEl

  type Envelope = {
    id: number
    name: string
    percent: number
  }

  let envelopes: Envelope[] = []
  let nextId = 1

  function formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  function formatPercent(value: number): string {
    return `${value.toFixed(0)} %`
  }

  function getFreeAmount(): number {
    const income = parseFloat(incomeInput.value) || 0
    const fixed = parseFloat(fixedInput.value) || 0
    return Math.max(0, income - fixed)
  }

  function getAllocatedPercent(): number {
    return envelopes.reduce(
      (sum, envelope) => sum + (Number(envelope.percent) || 0),
      0,
    )
  }

  function getEnvelopeAmount(percent: number, freeAmount: number): number {
    return freeAmount * (percent / 100)
  }

  function recalculate(): void {
    const freeAmount = getFreeAmount()
    const allocatedPercent = getAllocatedPercent()
    const remainingPercent = 100 - allocatedPercent
    const remainingAmount = getEnvelopeAmount(
      Math.max(0, remainingPercent),
      freeAmount,
    )

    freeOutput.textContent = formatCurrency(freeAmount)
    allocatedPercentOutput.textContent = formatPercent(allocatedPercent)
    remainingPercentOutput.textContent = formatPercent(remainingPercent)
    remainingAmountOutput.textContent = formatCurrency(remainingAmount)

    allocatedPercentOutput.classList.toggle(
      'text-red-500',
      allocatedPercent > 100,
    )
    remainingPercentOutput.classList.toggle(
      'text-red-500',
      remainingPercent < 0,
    )
    remainingAmountOutput.classList.toggle('text-red-500', remainingPercent < 0)
    allocationWarning.classList.toggle('hidden', allocatedPercent <= 100)

    const progress = Math.min(allocatedPercent, 100)
    allocationProgress.style.width = `${progress}%`
    allocationProgress.classList.toggle('bg-red-500', allocatedPercent > 100)
    allocationProgress.classList.toggle('bg-primary', allocatedPercent <= 100)

    const amountNodes = document.querySelectorAll<HTMLElement>(
      '[data-envelope-amount]',
    )
    amountNodes.forEach((node) => {
      const id = Number(node.dataset.envelopeAmount)
      const envelope = envelopes.find((item) => item.id === id)
      if (!envelope) return

      const amount = getEnvelopeAmount(envelope.percent, freeAmount)
      node.textContent = formatCurrency(amount)
    })
  }

  function createEnvelopeRow(env: Envelope): HTMLDivElement {
    const row = document.createElement('div')
    row.className =
      'envelope-row border-border bg-muted/20 rounded-md border p-3'
    row.innerHTML = `
      <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px_160px_auto] md:items-end">
        <div class="space-y-2">
          <label class="text-muted-foreground text-xs font-medium">
            Nom de l’enveloppe
          </label>
          <input
            type="text"
            value="${env.name}"
            placeholder="Ex: Courses"
            class="border-border bg-background w-full rounded border p-2 text-sm"
            data-id="${env.id}"
            data-field="name"
          />
        </div>

        <div class="space-y-2">
          <label class="text-muted-foreground text-xs font-medium">
            Pourcentage
          </label>
          <div class="relative">
            <input
              type="number"
              min="0"
              step="1"
              value="${env.percent}"
              placeholder="20"
              class="border-border bg-background w-full rounded border p-2 pr-8 text-sm"
              data-id="${env.id}"
              data-field="percent"
            />
            <span class="text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm">%</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-muted-foreground text-xs font-medium">
            Montant calculé
          </label>
          <div
            class="border-border bg-background text-foreground flex h-10 items-center rounded border px-3 text-sm font-medium"
            data-envelope-amount="${env.id}"
          >
            0,00 €
          </div>
        </div>

        <button
          type="button"
          data-id="${env.id}"
          class="delete-btn text-muted-foreground hover:text-destructive rounded border border-transparent p-2 transition-colors"
          aria-label="Supprimer l’enveloppe"
          title="Supprimer"
        >
          ✕
        </button>
      </div>
    `
    return row
  }

  function bindEnvelopeEvents(): void {
    const rowInputs = document.querySelectorAll<HTMLInputElement>(
      '.envelope-row input',
    )
    rowInputs.forEach((input) => {
      input.addEventListener('input', (event) => {
        const target = event.currentTarget
        if (!(target instanceof HTMLInputElement)) return

        const id = Number(target.dataset.id)
        const field = target.dataset.field
        const envelope = envelopes.find((item) => item.id === id)
        if (!envelope) return

        if (field === 'name') {
          envelope.name = target.value
        }

        if (field === 'percent') {
          envelope.percent = Math.max(0, parseFloat(target.value) || 0)
        }

        recalculate()
      })
    })

    const deleteButtons =
      document.querySelectorAll<HTMLButtonElement>('.delete-btn')
    deleteButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const target = event.currentTarget
        if (!(target instanceof HTMLButtonElement)) return

        const id = Number(target.dataset.id)
        envelopes = envelopes.filter((item) => item.id !== id)
        renderEnvelopes()
      })
    })
  }

  function renderEnvelopes(): void {
    emptyEnvelopes.style.display = envelopes.length === 0 ? 'block' : 'none'

    const existingRows = document.querySelectorAll('.envelope-row')
    existingRows.forEach((row) => row.remove())

    envelopes.forEach((env) => {
      const row = createEnvelopeRow(env)
      envelopesList.appendChild(row)
    })

    bindEnvelopeEvents()
    recalculate()
  }

  function addEnvelope(name = '', percent = 0): void {
    envelopes.push({
      id: nextId++,
      name,
      percent,
    })
    renderEnvelopes()
  }

  function fillPresetEnvelopes(): void {
    envelopes = [
      { id: nextId++, name: 'Courses', percent: 35 },
      { id: nextId++, name: 'Transport', percent: 15 },
      { id: nextId++, name: 'Loisirs', percent: 20 },
      { id: nextId++, name: 'Épargne', percent: 30 },
    ]
    renderEnvelopes()
  }

  addBtn.addEventListener('click', () => {
    addEnvelope()
  })

  presetBtn.addEventListener('click', () => {
    fillPresetEnvelopes()
  })

  resetBtn.addEventListener('click', () => {
    incomeInput.value = ''
    fixedInput.value = ''
    envelopes = []
    nextId = 1
    renderEnvelopes()
  })

  incomeInput.addEventListener('input', recalculate)
  fixedInput.addEventListener('input', recalculate)

  renderEnvelopes()
}

initFinanceTool()
