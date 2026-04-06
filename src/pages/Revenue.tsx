import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronDown, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { useRevenue } from '../hooks/useRevenue'
import { useRecipes } from '../hooks/useRecipes'
import { formatVND, formatVNDShort } from '../lib/format'
import type { RevenueEntry, MenuItemWithCost } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toLocaleDateString('sv-SE')
}

function getLast30Days(): string[] {
  const days: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('sv-SE'))
  }
  return days
}

function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

// ─── Zod schema ─────────────────────────────────────────────────────────────

const revenueSchema = z.object({
  entry_date:      z.string().min(1),
  lump_sum_amount: z.coerce.number().int().positive(),
  notes:           z.string().optional().default(''),
})

type RevenueFormValues = z.infer<typeof revenueSchema>

// ─── DishTileGrid ────────────────────────────────────────────────────────────

interface DishTileGridProps {
  recipes:        MenuItemWithCost[]
  selectedDishes: Map<string, number>
  onToggle:       (recipeId: string, quantity: number | null) => void
}

function DishTileGrid({ recipes, selectedDishes, onToggle }: DishTileGridProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : recipes

  return (
    <div>
      {recipes.length > 15 && (
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('recipes.name_placeholder')}
          className="w-full border border-bep-pebble rounded-lg px-3 py-2 text-sm mb-3 focus:border-bep-turmeric focus:outline-none bg-bep-surface text-bep-charcoal placeholder:text-bep-stone transition-colors"
        />
      )}
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(recipe => {
          const isSelected = selectedDishes.has(recipe.id)
          const qty = selectedDishes.get(recipe.id) ?? 1
          return (
            <div
              key={recipe.id}
              onClick={() => !isSelected && onToggle(recipe.id, 1)}
              className={`rounded-lg p-3 text-sm cursor-pointer transition-colors min-h-[44px] flex flex-col justify-between ${
                isSelected
                  ? 'bg-bep-cream border-2 border-bep-turmeric font-semibold text-bep-charcoal'
                  : 'bg-bep-surface border border-bep-pebble text-bep-charcoal hover:border-bep-turmeric'
              }`}
            >
              <span className="leading-tight">{recipe.name}</span>
              {isSelected && (
                <div className="mt-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={e => {
                        const v = parseInt(e.target.value, 10)
                        if (!isNaN(v) && v > 0) onToggle(recipe.id, v)
                      }}
                      className="w-full text-center text-sm font-semibold border border-bep-turmeric bg-white rounded px-2 py-1 font-mono tabular-nums focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => onToggle(recipe.id, null)}
                      className="text-bep-stone hover:text-bep-loss text-lg leading-none transition-colors px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── RevenueForm ─────────────────────────────────────────────────────────────

interface RevenueFormProps {
  editing:        RevenueEntry | null
  entries:        RevenueEntry[]
  recipes:        MenuItemWithCost[]
  onSave:         (values: RevenueFormValues, dishes: Map<string, number>, editingId?: string) => Promise<boolean>
  onCancel:       () => void
  formRef:        React.RefObject<HTMLDivElement>
}

function RevenueForm({ editing, entries, recipes, onSave, onCancel, formRef }: RevenueFormProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'lump' | 'dishes'>('lump')
  const [selectedDishes, setSelectedDishes] = useState<Map<string, number>>(new Map())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      entry_date:      todayISO(),
      lump_sum_amount: undefined,
      notes:           '',
    },
  })

  const watchedDate = watch('entry_date')
  const hasEntryForDate = entries.some(
    e => e.entry_date === watchedDate && e.id !== editing?.id
  )
  const hasSavedEntryForDate = entries.some(e => e.entry_date === watchedDate)

  // When the selected date already has an entry, pre-fill the amount so
  // the form validates even if the user is on the "By dish" tab
  useEffect(() => {
    if (editing) return
    const existing = entries.find(e => e.entry_date === watchedDate)
    if (existing) {
      setValue('lump_sum_amount', existing.lump_sum_amount)
      setValue('notes', existing.notes ?? '')
    }
  }, [watchedDate, entries, editing, setValue])

  useEffect(() => {
    if (editing) {
      reset({
        entry_date:      editing.entry_date,
        lump_sum_amount: editing.lump_sum_amount,
        notes:           editing.notes ?? '',
      })
      if (editing.revenue_entry_dishes) {
        const map = new Map<string, number>()
        editing.revenue_entry_dishes.forEach(d => map.set(d.recipe_id, d.quantity))
        setSelectedDishes(map)
      } else {
        setSelectedDishes(new Map())
      }
    } else {
      reset({
        entry_date:      todayISO(),
        lump_sum_amount: undefined,
        notes:           '',
      })
      setSelectedDishes(new Map())
    }
  }, [editing, reset])

  const handleToggleDish = (recipeId: string, quantity: number | null) => {
    setSelectedDishes(prev => {
      const next = new Map(prev)
      if (quantity === null) {
        next.delete(recipeId)
      } else {
        next.set(recipeId, quantity)
      }
      return next
    })
  }

  const onSubmit = async (data: RevenueFormValues) => {
    setSaveError(false)
    setSaving(true)

    // Unique-date conflict: if adding and date already has an entry, switch to edit mode
    if (!editing && hasEntryForDate) {
      const existing = entries.find(e => e.entry_date === data.entry_date)
      if (existing) {
        const ok = await onSave(data, selectedDishes, existing.id)
        if (!ok) setSaveError(true)
        setSaving(false)
        return
      }
    }

    const ok = await onSave(data, selectedDishes, editing?.id)
    if (!ok) setSaveError(true)
    setSaving(false)
  }

  const formTitle = editing
    ? t('revenue.edit_title', { date: formatDisplayDate(editing.entry_date) })
    : t('revenue.add_title')

  return (
    <div ref={formRef} className="bg-bep-surface border border-bep-pebble rounded-xl p-4">
      <p className="text-sm text-bep-stone mb-3">{formTitle}</p>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-bep-pebble mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('lump')}
          className={`pb-2 text-sm transition-colors flex items-center gap-1 ${
            activeTab === 'lump'
              ? 'border-b-2 border-bep-turmeric text-bep-charcoal font-semibold'
              : 'text-bep-stone hover:text-bep-charcoal'
          }`}
        >
          {t('revenue.tab_lump')}
          {hasSavedEntryForDate && (
            <span className="text-bep-profit text-xs">●</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dishes')}
          className={`pb-2 text-sm transition-colors flex items-center gap-1 ${
            activeTab === 'dishes'
              ? 'border-b-2 border-bep-turmeric text-bep-charcoal font-semibold'
              : 'text-bep-stone hover:text-bep-charcoal'
          }`}
        >
          {t('revenue.tab_dishes')}
          <span className="text-xs text-bep-stone ml-1">{t('revenue.optional_label')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {activeTab === 'lump' && (
          <>
            <div className="flex gap-3">
              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-bep-stone uppercase tracking-wider">
                  {t('revenue.date_label')}
                </label>
                <input
                  type="date"
                  {...register('entry_date')}
                  className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-bep-stone uppercase tracking-wider">
                  {t('revenue.amount_label')}
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="5000000"
                  {...register('lump_sum_amount')}
                  className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal font-mono tabular-nums focus:outline-none focus:border-bep-turmeric transition-colors"
                />
                {errors.lump_sum_amount && (
                  <p className="text-xs text-bep-loss">{t('revenue.validation_amount_positive')}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-bep-stone uppercase tracking-wider">
                {t('revenue.notes_label')}
              </label>
              <textarea
                rows={2}
                {...register('notes')}
                placeholder={t('revenue.notes_placeholder')}
                className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors resize-none"
              />
            </div>
          </>
        )}

        {activeTab === 'dishes' && (
          <DishTileGrid
            recipes={recipes}
            selectedDishes={selectedDishes}
            onToggle={handleToggleDish}
          />
        )}

        {saveError && (
          <p className="text-xs text-bep-loss">{t('revenue.error_save')}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-bep-lacquer text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-bep-lacquer/90 transition-colors disabled:opacity-50"
          >
            {saving ? t('common.loading') : (editing ? t('revenue.save_edit') : t('revenue.save_new'))}
          </button>
          {editing && (
            <button
              type="button"
              onClick={onCancel}
              className="text-bep-stone hover:text-bep-charcoal bg-transparent text-sm transition-colors"
            >
              {t('revenue.cancel_edit')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ─── RevenueSummaryCard ───────────────────────────────────────────────────────

interface RevenueSummaryCardProps {
  entries: RevenueEntry[]
  loading: boolean
}

function RevenueSummaryCard({ entries, loading }: RevenueSummaryCardProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="bg-bep-profit-bg rounded-xl p-4 mt-6 flex gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1">
            <div className="animate-pulse h-8 bg-bep-pebble/50 rounded w-24 mb-1" />
            <div className="animate-pulse h-3 bg-bep-pebble/30 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 29)
  const cutoffISO = cutoff.toLocaleDateString('sv-SE')

  const recent = entries.filter(e => e.entry_date >= cutoffISO)
  const total = recent.reduce((sum, e) => sum + e.lump_sum_amount, 0)
  const daysLogged = recent.length
  const avg = daysLogged > 0 ? Math.round(total / daysLogged) : 0

  return (
    <div className="bg-bep-profit-bg rounded-xl p-4 mt-6 flex gap-6">
      <div className="flex-1">
        <p className="text-2xl font-semibold font-mono tabular-nums text-bep-charcoal">{formatVNDShort(total)}</p>
        <p className="text-xs text-bep-stone mt-0.5">{t('revenue.summary_total')}</p>
      </div>
      <div className="flex-1">
        <p className="text-2xl font-semibold font-mono tabular-nums text-bep-charcoal">{daysLogged}</p>
        <p className="text-xs text-bep-stone mt-0.5">{t('revenue.summary_days')}</p>
      </div>
      <div className="flex-1">
        <p className="text-2xl font-semibold font-mono tabular-nums text-bep-charcoal">{formatVNDShort(avg)}</p>
        <p className="text-xs text-bep-stone mt-0.5">{t('revenue.summary_avg')}</p>
      </div>
    </div>
  )
}

// ─── EntryRow ─────────────────────────────────────────────────────────────────

interface EntryRowProps {
  entry:    RevenueEntry
  onEdit:   (entry: RevenueEntry) => void
  onDelete: (entry: RevenueEntry) => void
}

function EntryRow({ entry, onEdit, onDelete }: EntryRowProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const hasDishes = (entry.revenue_entry_dishes?.length ?? 0) > 0

  return (
    <>
      <div className="bg-bep-surface border-b border-bep-pebble px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-bep-charcoal">{formatDisplayDate(entry.entry_date)}</span>
            {hasDishes && (
              <span className="text-xs text-bep-stone mt-0.5">
                {t('revenue.col_dishes', { count: entry.revenue_entry_dishes!.length })}
              </span>
            )}
          </div>
          <span className="font-mono tabular-nums text-sm text-bep-charcoal ml-auto mr-2">
            {formatVND(entry.lump_sum_amount)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasDishes && (
            <button
              type="button"
              onClick={() => setExpanded(prev => !prev)}
              aria-label={expanded ? t('revenue.collapse_dishes') : t('revenue.expand_dishes')}
              className="text-bep-stone hover:text-bep-turmeric transition-colors"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(entry)}
            aria-label={t('revenue.edit_entry')}
            className="text-bep-stone hover:text-bep-turmeric transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            aria-label={t('revenue.delete_entry')}
            className="text-bep-stone hover:text-bep-loss transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && hasDishes && (
        <div className="bg-bep-cream border-b border-bep-turmeric/20 px-4 py-2">
          <ul className="flex flex-col gap-1.5">
            {entry.revenue_entry_dishes!.map(dish => (
              <li key={dish.id} className="flex items-center justify-between text-sm">
                <span className="text-bep-charcoal">{dish.menu_items?.name ?? dish.recipe_id}</span>
                <span className="font-mono tabular-nums text-bep-turmeric font-semibold">× {dish.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

// ─── MissingDayRow ────────────────────────────────────────────────────────────

function MissingDayRow({ date }: { date: string }) {
  const { t } = useTranslation()
  return (
    <div className="text-xs text-bep-stone italic py-2 px-4 border-b border-bep-pebble/50 flex items-center gap-2">
      <span>{formatDisplayDate(date)}</span>
      <span className="text-bep-stone/60">{t('revenue.missing_day')}</span>
    </div>
  )
}

// ─── RevenueHistoryList ───────────────────────────────────────────────────────

interface RevenueHistoryListProps {
  entries:  RevenueEntry[]
  loading:  boolean
  onEdit:   (entry: RevenueEntry) => void
  onDelete: (entry: RevenueEntry) => void
}

function RevenueHistoryList({ entries, loading, onEdit, onDelete }: RevenueHistoryListProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="mt-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="animate-pulse h-12 bg-bep-pebble/50 rounded-lg mb-2" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
          <TrendingUp size={20} className="text-bep-turmeric" />
        </div>
        <p className="text-sm font-semibold text-bep-charcoal mb-1">{t('revenue.empty_title')}</p>
        <p className="text-sm text-bep-stone max-w-xs">{t('revenue.empty_body')}</p>
      </div>
    )
  }

  const last30 = getLast30Days()
  const entryByDate = new Map(entries.map(e => [e.entry_date, e]))

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-bep-pebble">
      {last30.map(date => {
        const entry = entryByDate.get(date)
        return entry
          ? <EntryRow key={date} entry={entry} onEdit={onEdit} onDelete={onDelete} />
          : <MissingDayRow key={date} date={date} />
      })}
    </div>
  )
}

// ─── Revenue (page) ───────────────────────────────────────────────────────────

export default function Revenue() {
  const { t } = useTranslation()
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useRevenue()
  const { recipes } = useRecipes()
  const [editing, setEditing] = useState<RevenueEntry | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const handleEdit = (entry: RevenueEntry) => {
    setEditing(entry)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditing(null)
  }

  const handleDelete = async (entry: RevenueEntry) => {
    if (!window.confirm(t('revenue.delete_confirm'))) return
    await deleteEntry(entry.id)
  }

  const handleSave = async (
    values: RevenueFormValues,
    dishes: Map<string, number>,
    editingId?: string,
  ): Promise<boolean> => {
    const dishInputs = Array.from(dishes.entries()).map(([recipe_id, quantity]) => ({
      recipe_id,
      quantity,
    }))

    const entryInput = {
      entry_date:      values.entry_date,
      lump_sum_amount: values.lump_sum_amount,
      notes:           values.notes ?? null,
    }

    const ok = editingId
      ? await updateEntry(editingId, entryInput, dishInputs)
      : await addEntry(entryInput, dishInputs)

    if (ok) setEditing(null)
    return ok
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <h1 className="text-lg font-semibold text-bep-charcoal mb-4">{t('revenue.title')}</h1>

      <RevenueForm
        editing={editing}
        entries={entries}
        recipes={recipes}
        onSave={handleSave}
        onCancel={handleCancel}
        formRef={formRef}
      />

      <RevenueSummaryCard entries={entries} loading={loading} />

      <RevenueHistoryList
        entries={entries}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
