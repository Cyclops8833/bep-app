import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Truck } from 'lucide-react'
import { useSuppliers } from '../hooks/useSuppliers'
import { Drawer } from '../components/ui/Drawer'
import type { Supplier } from '../types'

const schema = z.object({
  name:  z.string().min(1),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function SupplierForm({
  editing,
  onSave,
}: {
  editing: Supplier | null
  onSave: (data: { name: string; phone: string | null; notes: string | null }) => Promise<void>
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  editing?.name  ?? '',
      phone: editing?.phone ?? '',
      notes: editing?.notes ?? '',
    },
  })

  const onSubmit = async (raw: FormData) => {
    await onSave({
      name:  raw.name,
      phone: raw.phone || null,
      notes: raw.notes || null,
    })
  }

  return (
    <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('suppliers.name_label')}
        </label>
        <input
          type="text"
          autoFocus
          {...register('name')}
          placeholder={t('suppliers.name_placeholder')}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
        />
        {errors.name && <p className="text-xs text-bep-loss">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('suppliers.phone_label')}
        </label>
        <input
          type="text"
          {...register('phone')}
          placeholder={t('suppliers.phone_placeholder')}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
          {t('suppliers.notes_label')}
        </label>
        <textarea
          {...register('notes')}
          placeholder={t('suppliers.notes_placeholder')}
          rows={3}
          className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors resize-none"
        />
      </div>

      <button type="submit" form="supplier-form" disabled={isSubmitting} className="hidden" />
    </form>
  )
}

export default function Suppliers() {
  const { t } = useTranslation()
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliers()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const openAdd = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (s: Supplier) => { setEditing(s); setDrawerOpen(true) }
  const closeDrawer = () => setDrawerOpen(false)

  const handleSave = async (data: { name: string; phone: string | null; notes: string | null }) => {
    const ok = editing
      ? await updateSupplier(editing.id, data)
      : await addSupplier(data)
    if (ok) closeDrawer()
  }

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(t('suppliers.delete_confirm'))) return
    await deleteSupplier(s.id)
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-bep-charcoal">{t('suppliers.title')}</h1>
        <button
          onClick={openAdd}
          className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {t('suppliers.add')}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-bep-pebble rounded-lg" />)}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
            <Truck size={20} className="text-bep-turmeric" />
          </div>
          <p className="text-sm font-medium text-bep-charcoal mb-1">{t('suppliers.empty_title')}</p>
          <p className="text-sm text-bep-stone mb-4 max-w-xs">{t('suppliers.empty_body')}</p>
          <button
            onClick={openAdd}
            className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {t('suppliers.add')}
          </button>
        </div>
      ) : (
        <div className="bg-bep-surface border border-bep-pebble rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bep-pebble">
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('suppliers.col_name')}</th>
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('suppliers.col_phone')}</th>
                <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('suppliers.col_notes')}</th>
                <th className="py-2 px-4" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} className="border-b border-bep-pebble last:border-0 hover:bg-bep-rice transition-colors">
                  <td className="py-3 px-4 font-medium text-bep-charcoal">{s.name}</td>
                  <td className="py-3 px-4 text-bep-stone">{s.phone ?? '—'}</td>
                  <td className="py-3 px-4 text-bep-stone truncate max-w-xs">{s.notes ?? '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs text-bep-stone hover:text-bep-turmeric transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-xs text-bep-stone hover:text-bep-loss transition-colors"
                      >
                        {t('common.delete')}
                      </button>
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
        title={editing ? t('suppliers.edit') : t('suppliers.add')}
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
              form="supplier-form"
              className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t('common.save')}
            </button>
          </>
        }
      >
        <SupplierForm editing={editing} onSave={handleSave} />
      </Drawer>
    </div>
  )
}
