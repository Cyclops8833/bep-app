import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import { useIngredients } from '../hooks/useIngredients'
import { useSuppliers } from '../hooks/useSuppliers'
import { matchIngredient, matchSupplier, confidenceCellClass } from '../lib/invoiceMatch'
import { formatVND } from '../lib/format'
import type { ExtractedInvoice, IngredientWithRelations } from '../types'

interface LineFormState {
  extracted_name:  string
  ingredient_id:   string    // '' = no match / create new
  quantity:        number
  unit:            string
  unit_price:      number
  confidence_tier: 'high' | 'low' | 'none'  // stored for cell tinting, not submitted
}

interface FormValues {
  supplier_id:  string     // '' = no match / create new
  invoice_date: string
  lines:        LineFormState[]
}

export default function InvoiceConfirm() {
  const { t }                          = useTranslation()
  const location                       = useLocation()
  const navigate                       = useNavigate()
  const { confirmInvoice }             = useInvoices()
  const { ingredients, updateIngredient } = useIngredients()
  const { suppliers }                  = useSuppliers()
  const [saving, setSaving]            = useState(false)
  const [supplierConfidence, setSupplierConfidence] = useState<'high' | 'low' | 'none'>('none')

  const { invoiceId, extracted } = (location.state ?? {}) as {
    invoiceId?: string
    extracted?: ExtractedInvoice | null
  }

  // If navigated here without state, go back
  useEffect(() => {
    if (!invoiceId) navigate('/dashboard/invoices')
  }, [invoiceId, navigate])

  // Compute initial form values from Claude extraction + Fuse.js matching
  const defaultValues = useMemo((): FormValues => {
    if (!extracted) {
      return { supplier_id: '', invoice_date: '', lines: [] }
    }

    // Supplier match (D-05/D-06/D-07)
    const supplierMatch = matchSupplier(extracted.supplier_name ?? null, suppliers)
    setSupplierConfidence(supplierMatch.confidence)

    // Line items — match each extracted item against ingredients
    const lines: LineFormState[] = (extracted.line_items ?? []).map(item => {
      const match = matchIngredient(item.name, ingredients as IngredientWithRelations[])
      return {
        extracted_name:  item.name,
        ingredient_id:   match.ingredient?.id ?? '',
        quantity:        item.quantity,
        unit:            item.unit,
        unit_price:      item.unit_price,
        confidence_tier: match.confidence,
      }
    })

    return {
      supplier_id:  supplierMatch.supplier?.id ?? '',
      invoice_date: extracted.invoice_date ?? '',
      lines,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extracted, ingredients.length, suppliers.length])

  const { control, register, handleSubmit, watch } = useForm<FormValues>({ defaultValues })
  const { fields } = useFieldArray({ control, name: 'lines' })
  const watchedLines = watch('lines')

  async function handleConfirm(values: FormValues) {
    if (!invoiceId || saving) return
    setSaving(true)

    // T-5-09: Price updates only happen here, after explicit user confirmation
    // Call updateIngredient for each confirmed matched line
    for (const line of values.lines) {
      if (!line.ingredient_id) continue
      const ingredient = (ingredients as IngredientWithRelations[]).find(i => i.id === line.ingredient_id)
      if (!ingredient) continue
      if (ingredient.current_price !== line.unit_price) {
        await updateIngredient(ingredient.id, {
          name:          ingredient.name,
          unit:          ingredient.unit,
          current_price: line.unit_price,
          supplier_id:   ingredient.supplier_id ?? null,
        })
      }
    }

    // Calculate total amount
    const totalAmount = values.lines.reduce((sum, l) => sum + (l.quantity * l.unit_price), 0)

    const ok = await confirmInvoice(
      invoiceId,
      values.supplier_id || null,
      values.invoice_date || null,
      values.lines.map(l => ({
        extracted_name: l.extracted_name,
        ingredient_id:  l.ingredient_id || null,
        quantity:       l.quantity,
        unit:           l.unit,
        unit_price:     l.unit_price,
        line_total:     Math.round(l.quantity * l.unit_price),
      })),
      totalAmount,
    )

    setSaving(false)
    if (ok) navigate('/dashboard/invoices')
  }

  if (!invoiceId) return null

  const supplierCellClass = confidenceCellClass(supplierConfidence)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/invoices')}
          className="text-bep-stone hover:text-bep-charcoal transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-medium text-bep-charcoal">{t('invoices.confirm_title')}</h1>
      </div>

      <form onSubmit={handleSubmit(handleConfirm)} id="confirm-form" className="flex flex-col gap-6">

        {/* D-05: Supplier section — ABOVE the line items table, visually distinct */}
        <div className={`bg-bep-surface border border-bep-pebble rounded-xl p-4 flex flex-col gap-3 ${supplierCellClass}`}>
          <p className="text-xs font-medium text-bep-stone uppercase tracking-wider">
            {t('invoices.supplier_section')}
          </p>
          {extracted?.supplier_name && (
            <p className="text-sm text-bep-stone">
              {t('invoices.extracted_as')}: <span className="font-medium text-bep-charcoal">{extracted.supplier_name}</span>
            </p>
          )}
          <div className="flex gap-4 items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                {t('invoices.supplier_label')}
              </label>
              <Controller
                name="supplier_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
                  >
                    {/* D-06: "Add new supplier" is first option when no match */}
                    <option value="">{t('invoices.add_new_supplier')}</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                {t('invoices.invoice_date_label')}
              </label>
              <input
                type="date"
                {...register('invoice_date')}
                className="bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
              />
            </div>
          </div>
          {/* Confidence hint for supplier section */}
          {supplierConfidence === 'low' && (
            <p className="text-xs text-bep-warning">{t('invoices.low_confidence_hint')}</p>
          )}
          {supplierConfidence === 'none' && extracted?.supplier_name && (
            <p className="text-xs text-bep-stone">{t('invoices.no_supplier_match')}</p>
          )}
        </div>

        {/* Line items table */}
        {fields.length > 0 && (
          <div className="bg-bep-surface border border-bep-pebble rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bep-pebble">
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[180px]">{t('invoices.col_extracted')}</th>
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[180px]">{t('invoices.col_ingredient')}</th>
                  <th className="text-right text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[80px]">{t('invoices.col_qty')}</th>
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[60px]">{t('invoices.col_unit')}</th>
                  <th className="text-right text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[120px]">{t('invoices.col_unit_price')}</th>
                  <th className="text-right text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-3 w-[120px]">{t('invoices.col_line_total')}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => {
                  const line       = watchedLines[idx]
                  const cellClass  = confidenceCellClass(field.confidence_tier)
                  const ingredient = line?.ingredient_id
                    ? (ingredients as IngredientWithRelations[]).find(i => i.id === line.ingredient_id)
                    : null
                  const oldPrice   = ingredient?.current_price ?? null
                  const newPrice   = line?.unit_price ?? 0
                  const lineTotal  = Math.round((line?.quantity ?? 0) * (line?.unit_price ?? 0))

                  return (
                    <tr key={field.id} className={`border-b border-bep-pebble last:border-0 ${cellClass}`}>
                      {/* Extracted name — read-only */}
                      <td className={`py-2 px-3 text-bep-charcoal text-xs ${cellClass}`}>
                        {field.extracted_name}
                      </td>

                      {/* Ingredient match dropdown — D-01/D-02/D-03 */}
                      <td className={`py-2 px-3 ${cellClass}`}>
                        <Controller
                          name={`lines.${idx}.ingredient_id`}
                          control={control}
                          render={({ field: f }) => (
                            <select
                              {...f}
                              className="w-full bg-transparent border border-bep-pebble rounded px-2 py-1 text-xs text-bep-charcoal focus:outline-none focus:border-bep-turmeric transition-colors"
                            >
                              {/* D-03: "Create new ingredient" is first option */}
                              <option value="">{t('invoices.create_new_ingredient')}</option>
                              {(ingredients as IngredientWithRelations[]).map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                              ))}
                            </select>
                          )}
                        />
                        {/* D-04: Old → new price side-by-side for every matched line */}
                        {ingredient && oldPrice != null && (
                          <p className="mt-0.5 text-xs font-mono tabular-nums whitespace-nowrap">
                            <span className="text-bep-stone line-through">{formatVND(oldPrice)}</span>
                            <span className="text-bep-stone mx-1">→</span>
                            <span className="text-bep-turmeric">{formatVND(newPrice)}</span>
                          </p>
                        )}
                      </td>

                      {/* Quantity — editable */}
                      <td className={`py-2 px-3 ${cellClass}`}>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          {...register(`lines.${idx}.quantity`, { valueAsNumber: true })}
                          className="w-full bg-transparent border border-bep-pebble rounded px-2 py-1 text-xs text-right font-mono tabular-nums focus:outline-none focus:border-bep-turmeric transition-colors"
                        />
                      </td>

                      {/* Unit — editable */}
                      <td className={`py-2 px-3 ${cellClass}`}>
                        <input
                          type="text"
                          {...register(`lines.${idx}.unit`)}
                          className="w-full bg-transparent border border-bep-pebble rounded px-2 py-1 text-xs focus:outline-none focus:border-bep-turmeric transition-colors"
                        />
                      </td>

                      {/* Unit price — editable */}
                      <td className={`py-2 px-3 ${cellClass}`}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          {...register(`lines.${idx}.unit_price`, { valueAsNumber: true })}
                          className="w-full bg-transparent border border-bep-pebble rounded px-2 py-1 text-xs text-right font-mono tabular-nums focus:outline-none focus:border-bep-turmeric transition-colors"
                        />
                      </td>

                      {/* Line total — computed, read-only */}
                      <td className={`py-2 px-3 text-right font-mono tabular-nums text-xs text-bep-charcoal ${cellClass}`}>
                        {formatVND(lineTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {fields.length === 0 && (
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-8 text-center">
            <p className="text-sm text-bep-stone">{t('invoices.no_lines_extracted')}</p>
          </div>
        )}
      </form>

      {/* Footer — sticky confirm/cancel buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t border-bep-pebble">
        <button
          type="button"
          onClick={() => navigate('/dashboard/invoices')}
          className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t('common.cancel')}
        </button>
        {/* T-5-11: disabled after first save to prevent double-confirmation */}
        <button
          type="submit"
          form="confirm-form"
          disabled={saving}
          className="flex items-center gap-2 bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} />
          {saving ? t('common.loading') : t('invoices.confirm_save')}
        </button>
      </div>
    </div>
  )
}
