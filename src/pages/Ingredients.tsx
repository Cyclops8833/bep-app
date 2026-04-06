import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package } from 'lucide-react'
import { useIngredients } from '../hooks/useIngredients'
import { useSuppliers } from '../hooks/useSuppliers'
import { Drawer } from '../components/ui/Drawer'
import { PriceSparkline } from '../components/features/PriceSparkline'
import { formatVND } from '../lib/format'
import type { IngredientWithRelations, Unit } from '../types'

const UNITS: Unit[] = ['g', 'kg', 'ml', 'L', 'piece', 'bunch', 'bottle']

const schema = z.object({
  name:          z.string().min(1),
  unit:          z.enum(['g', 'kg', 'ml', 'L', 'piece', 'bunch', 'bottle']),
  current_price: z.number().min(0),
  supplier_id:   z.string().nullable(),
})

type FormData = z.infer<typeof schema>

function IngredientForm({
  editing,
  onSave,
}: {
  editing: IngredientWithRelations | null
  onSave: (data: FormData) => Promise<void>
}) {
  const { t } = useTranslation()
  const { suppliers } = useSuppliers()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          editing?.name          ?? '',
      unit:          editing?.unit          ?? 'kg',
      current_price: editing?.current_price ?? 0,
      supplier_id:   editing?.supplier_id   ?? '',
    },
  })

  return (
    <form id="ingredient-form" onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('ingredients.name_label')}
        </label>
        <input
          type="text"
          autoFocus
          {...register('name')}
          placeholder={t('ingredients.name_placeholder')}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
        />
        {errors.name && <p className="text-xs text-bep-loss">{errors.name.message}</p>}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
            {t('ingredients.unit_label')}
          </label>
          <select
            {...register('unit')}
            className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
          >
            {UNITS.map(u => (
              <option key={u} value={u}>{t(`units.${u}`)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
            {t('ingredients.price_label')}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            {...register('current_price', { valueAsNumber: true })}
            placeholder={t('ingredients.price_placeholder')}
            className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors font-mono tabular-nums"
          />
          {errors.current_price && <p className="text-xs text-bep-loss">{errors.current_price.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('ingredients.supplier_label')}
        </label>
        <select
          {...register('supplier_id')}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
        >
          <option value="">{t('ingredients.supplier_none')}</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" form="ingredient-form" disabled={isSubmitting} className="hidden" />
    </form>
  )
}

export default function Ingredients() {
  const { t } = useTranslation()
  const { ingredients, loading, addIngredient, updateIngredient, deleteIngredient } = useIngredients()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<IngredientWithRelations | null>(null)

  const openAdd = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (i: IngredientWithRelations) => { setEditing(i); setDrawerOpen(true) }
  const closeDrawer = () => setDrawerOpen(false)

  const handleSave = async (data: {
    name: string
    unit: Unit
    current_price: number
    supplier_id: string | null
  }) => {
    const result = editing
      ? await updateIngredient(editing.id, { ...data, supplier_id: data.supplier_id || null })
      : await addIngredient({ ...data, supplier_id: data.supplier_id || null })
    if (result.ok) {
      closeDrawer()
    } else {
      toast.error(t('errors.save_failed'))
    }
  }

  const handleDelete = async (i: IngredientWithRelations) => {
    if (!window.confirm(t('ingredients.delete_confirm'))) return
    const result = await deleteIngredient(i.id)
    if (!result.ok) toast.error(t('errors.delete_failed'))
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-bep-charcoal">{t('ingredients.title')}</h1>
        <button
          onClick={openAdd}
          className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t('ingredients.add')}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-bep-pebble rounded w-full" />)}
        </div>
      ) : ingredients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
            <Package size={20} className="text-bep-turmeric" />
          </div>
          <p className="text-sm font-medium text-bep-charcoal mb-1">{t('ingredients.empty_title')}</p>
          <p className="text-sm text-bep-stone mb-4 max-w-xs">{t('ingredients.empty_body')}</p>
          <button
            onClick={openAdd}
            className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t('ingredients.add')}
          </button>
        </div>
      ) : (
        <div className="bg-bep-surface border border-bep-pebble rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bep-pebble">
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('ingredients.col_name')}</th>
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('ingredients.col_unit')}</th>
                <th className="text-right text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('ingredients.col_price')}</th>
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('ingredients.col_supplier')}</th>
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('ingredients.col_history')}</th>
                <th className="py-2 px-4" />
              </tr>
            </thead>
            <tbody>
              {ingredients.map(i => (
                <tr key={i.id} className="border-b border-bep-pebble last:border-0 hover:bg-bep-rice transition-colors">
                  <td className="py-3 px-4 font-medium text-bep-charcoal">{i.name}</td>
                  <td className="py-3 px-4 text-bep-stone">{t(`units.${i.unit}`)}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-bep-charcoal">{formatVND(i.current_price)}</td>
                  <td className="py-3 px-4 text-bep-stone">{i.suppliers?.name ?? '—'}</td>
                  <td className="py-3 px-4">
                    <PriceSparkline history={i.ingredient_price_history} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(i)} className="text-xs text-bep-stone hover:text-bep-turmeric transition-colors">{t('common.edit')}</button>
                      <button onClick={() => handleDelete(i)} className="text-xs text-bep-stone hover:text-bep-loss transition-colors">{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? t('ingredients.edit') : t('ingredients.add')}
        footer={
          <>
            <button
              onClick={closeDrawer}
              className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              form="ingredient-form"
              className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t('common.save')}
            </button>
          </>
        }
      >
        <IngredientForm editing={editing} onSave={handleSave} />
      </Drawer>
    </div>
  )
}
