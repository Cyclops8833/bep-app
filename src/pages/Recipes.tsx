import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Trash2 } from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import { useIngredients } from '../hooks/useIngredients'
import { Drawer } from '../components/ui/Drawer'
import { MarginBadge } from '../components/ui/MarginBadge'
import { formatVND } from '../lib/format'
import type { MenuItemWithCost } from '../types'

const menuItemSchema = z.object({
  name:          z.string().min(1),
  selling_price: z.number().min(1),
  category:      z.string().optional(),
})

type MenuItemForm = z.infer<typeof menuItemSchema>

interface LineState {
  ingredient_id: string
  quantity: number
}

function RecipeForm({
  lines,
  setLines,
}: {
  lines: LineState[]
  setLines: React.Dispatch<React.SetStateAction<LineState[]>>
}) {
  const { t } = useTranslation()
  const { ingredients } = useIngredients()
  const { register, formState: { errors } } = useFormContext<MenuItemForm>()

  const addLine = () => {
    const first = ingredients.find(i => !lines.some(l => l.ingredient_id === i.id))
    if (first) setLines(prev => [...prev, { ingredient_id: first.id, quantity: 1 }])
  }

  const updateLine = (idx: number, field: keyof LineState, value: string | number) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx))
  }

  const totalCost = lines.reduce((sum, line) => {
    const ing = ingredients.find(i => i.id === line.ingredient_id)
    return sum + line.quantity * (ing?.current_price ?? 0)
  }, 0)

  return (
    <form id="recipe-form" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('recipes.name_label')}
        </label>
        <input
          type="text"
          autoFocus
          {...register('name')}
          placeholder={t('recipes.name_placeholder')}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
        />
        {errors.name && <p className="text-xs text-bep-loss">{errors.name.message}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
            {t('recipes.price_label')}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            {...register('selling_price', { valueAsNumber: true })}
            placeholder={t('recipes.price_placeholder')}
            className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors font-mono tabular-nums"
          />
          {errors.selling_price && <p className="text-xs text-bep-loss">{errors.selling_price.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
            {t('recipes.category_label')}
          </label>
          <input
            type="text"
            {...register('category')}
            placeholder={t('recipes.category_placeholder')}
            className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
          />
        </div>
      </div>

      {/* Recipe builder */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('recipes.ingredients_section')}
        </p>

        {lines.length > 0 && (
          <div className="flex flex-col gap-2">
            {lines.map((line, idx) => {
              const ing = ingredients.find(i => i.id === line.ingredient_id)
              const lineCost = line.quantity * (ing?.current_price ?? 0)
              return (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={line.ingredient_id}
                    onChange={e => updateLine(idx, 'ingredient_id', e.target.value)}
                    className="flex-1 bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
                  >
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={line.quantity}
                    onChange={e => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors font-mono tabular-nums text-right"
                  />
                  <span className="text-xs text-bep-stone w-6 shrink-0">{ing?.unit ?? ''}</span>
                  <span className="text-xs font-mono tabular-nums text-bep-stone w-20 text-right shrink-0">
                    {formatVND(lineCost)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-bep-stone hover:text-bep-loss transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addLine}
          disabled={ingredients.length === 0}
          className="self-start text-sm text-bep-turmeric hover:text-bep-amber transition-colors disabled:opacity-40"
        >
          + {t('recipes.add_line')}
        </button>
      </div>

      {/* Running totals */}
      {lines.length > 0 && (
        <div className="bg-bep-rice border border-bep-pebble rounded-lg px-4 py-3 flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-bep-stone">{t('recipes.total_cost')}</span>
            <span className="font-mono tabular-nums text-bep-charcoal">{formatVND(totalCost)}</span>
          </div>
        </div>
      )}
    </form>
  )
}

export default function Recipes() {
  const { t } = useTranslation()
  const { recipes, loading, saveRecipe, deleteRecipe } = useRecipes()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItemWithCost | null>(null)
  const [lines, setLines] = useState<LineState[]>([])
  const [lineError, setLineError] = useState(false)
  const [saving, setSaving] = useState(false)

  const methods = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { name: '', selling_price: 0, category: '' },
  })

  const openAdd = () => {
    setEditing(null)
    setLines([])
    setLineError(false)
    methods.reset({ name: '', selling_price: 0, category: '' })
    setDrawerOpen(true)
  }

  const openEdit = (r: MenuItemWithCost) => {
    setEditing(r)
    setLines(r.recipe_lines.map(l => ({ ingredient_id: l.ingredient_id, quantity: l.quantity })))
    setLineError(false)
    methods.reset({ name: r.name, selling_price: r.selling_price, category: r.category ?? '' })
    setDrawerOpen(true)
  }

  const closeDrawer = () => setDrawerOpen(false)

  const handleSave = methods.handleSubmit(async (data) => {
    if (lines.length === 0) { setLineError(true); return }
    setLineError(false)
    setSaving(true)
    const result = await saveRecipe(
      { name: data.name, selling_price: data.selling_price, category: data.category ?? null },
      lines,
      editing?.id,
    )
    setSaving(false)
    if (result.ok) {
      closeDrawer()
    }
  })

  const handleDelete = async (r: MenuItemWithCost) => {
    if (!window.confirm(t('recipes.delete_confirm'))) return
    await deleteRecipe(r.id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-bep-charcoal">{t('recipes.title')}</h1>
        <button
          onClick={openAdd}
          className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t('recipes.add')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-bep-pebble rounded-xl h-40" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
            <BookOpen size={20} className="text-bep-turmeric" />
          </div>
          <p className="text-sm font-medium text-bep-charcoal mb-1">{t('recipes.empty_title')}</p>
          <p className="text-sm text-bep-stone mb-4 max-w-xs">{t('recipes.empty_body')}</p>
          <button
            onClick={openAdd}
            className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t('recipes.add')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {recipes.map(r => (
            <div key={r.id} className="bg-bep-surface border border-bep-pebble flex flex-col rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-bep-charcoal truncate">{r.name}</p>
                  {r.category && <p className="text-xs text-bep-stone mt-0.5">{r.category}</p>}
                </div>
                <MarginBadge margin={r.gross_margin} />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-bep-stone">{t('recipes.selling_price')}</span>
                  <span className="font-mono tabular-nums text-bep-charcoal">{formatVND(r.selling_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bep-stone">{t('recipes.cost_label')}</span>
                  <span className="font-mono tabular-nums text-bep-charcoal">{formatVND(r.cost_per_dish)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-3 border-t border-bep-pebble">
                <button
                  onClick={() => openEdit(r)}
                  className="text-xs text-bep-stone hover:text-bep-turmeric transition-colors"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(r)}
                  className="text-xs text-bep-stone hover:text-bep-loss transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormProvider {...methods}>
        <Drawer
          open={drawerOpen}
          onClose={closeDrawer}
          title={editing ? t('recipes.edit') : t('recipes.add')}
          footer={
            <>
              <button
                onClick={closeDrawer}
                className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </>
          }
        >
          <>
            <RecipeForm lines={lines} setLines={setLines} />
            {lineError && (
              <p className="text-sm text-bep-loss">{t('recipes.no_ingredients_warning')}</p>
            )}
          </>
        </Drawer>
      </FormProvider>
    </div>
  )
}
