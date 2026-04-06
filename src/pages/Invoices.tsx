import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, FileText, Trash2, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useInvoices } from '../hooks/useInvoices'
import { formatVND } from '../lib/format'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES      = 10 * 1024 * 1024  // 10 MB

type UploadStep =
  | { step: 'idle' }
  | { step: 'uploading' }
  | { step: 'extracting' }
  | { step: 'error'; message: string; pendingInvoiceId: string | null }

export default function Invoices() {
  const { t }                           = useTranslation()
  const { user }                        = useAuth()
  const navigate                        = useNavigate()
  const { invoices, loading, deleteInvoice, createPendingInvoice } = useInvoices()
  const [uploadState, setUploadState]   = useState<UploadStep>({ step: 'idle' })
  const fileInputRef                    = useRef<HTMLInputElement>(null)
  const cameraInputRef                  = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    // T-5-05: Client-side file type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadState({ step: 'error', message: t('invoices.invalid_type'), pendingInvoiceId: null })
      return
    }
    // T-5-06: Client-side file size validation
    if (file.size > MAX_BYTES) {
      setUploadState({ step: 'error', message: t('invoices.too_large'), pendingInvoiceId: null })
      return
    }
    if (!user) return

    setUploadState({ step: 'uploading' })

    // Upload to Supabase Storage: invoices/{user_id}/{uuid}.{ext}
    const ext      = file.type.split('/')[1]   // 'jpeg' | 'png' | 'webp'
    const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      setUploadState({ step: 'error', message: t('invoices.upload_error'), pendingInvoiceId: null })
      return
    }

    // Get signed URL for Vercel API route to fetch (5-minute expiry)
    const { data: signedData } = await supabase.storage
      .from('invoices')
      .createSignedUrl(fileName, 300)

    if (!signedData?.signedUrl) {
      setUploadState({ step: 'error', message: t('invoices.upload_error'), pendingInvoiceId: null })
      return
    }

    // Create pending invoice record in DB
    const invoiceId = await createPendingInvoice(fileName)
    if (!invoiceId) {
      setUploadState({ step: 'error', message: t('invoices.upload_error'), pendingInvoiceId: null })
      return
    }

    // Call Vercel API route with signed URL
    setUploadState({ step: 'extracting' })
    try {
      const response = await fetch('/api/extract-invoice', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          storageUrl: signedData.signedUrl,
          userId:     user.id,
          mediaType:  file.type,
        }),
      })
      const result = await response.json()

      if (!result.ok) {
        setUploadState({ step: 'error', message: t('invoices.extract_error'), pendingInvoiceId: invoiceId })
        return
      }

      // Navigate to confirmation screen, passing extracted data + invoice ID via state
      navigate('/dashboard/invoices/confirm', {
        state: { invoiceId, extracted: result.data },
      })
    } catch {
      setUploadState({ step: 'error', message: t('invoices.extract_error'), pendingInvoiceId: invoiceId })
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('invoices.delete_confirm'))) return
    const result = await deleteInvoice(id)
    if (!result.ok) toast.error(t('errors.delete_failed'))
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <h1 className="text-lg font-medium text-bep-charcoal">{t('invoices.title')}</h1>

      {/* Upload card */}
      <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6 flex flex-col gap-4">
        <p className="text-sm font-medium text-bep-charcoal">{t('invoices.upload_heading')}</p>

        {uploadState.step === 'idle' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              {/* File picker button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Upload size={16} />
                {t('invoices.upload_cta')}
              </button>
              {/* Camera capture button — uses accept with capture */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Camera size={16} />
                {t('invoices.upload_camera')}
              </button>
            </div>
            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {/* D-09: Vietnamese PDF redirect note */}
            <p className="text-xs text-bep-stone">{t('invoices.pdf_note')}</p>
            <p className="text-xs text-bep-stone">{t('invoices.supported_formats')}</p>
          </div>
        )}

        {uploadState.step === 'uploading' && (
          <div className="flex items-center gap-3 py-2">
            <div className="animate-spin w-4 h-4 border-2 border-bep-turmeric border-t-transparent rounded-full" />
            <p className="text-sm text-bep-stone">{t('common.loading')}</p>
          </div>
        )}

        {uploadState.step === 'extracting' && (
          <div className="flex items-center gap-3 py-2">
            <div className="animate-spin w-4 h-4 border-2 border-bep-turmeric border-t-transparent rounded-full" />
            <p className="text-sm text-bep-stone">{t('invoices.extracting')}</p>
          </div>
        )}

        {uploadState.step === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-bep-loss">{uploadState.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setUploadState({ step: 'idle' })}
                className="text-sm text-bep-turmeric hover:text-bep-amber transition-colors"
              >
                {t('invoices.retry')}
              </button>
              {/* Success criteria #6: manual entry fallback when Claude API fails */}
              {uploadState.pendingInvoiceId && (
                <button
                  onClick={() => navigate('/dashboard/invoices/confirm', { state: { invoiceId: uploadState.pendingInvoiceId, manualEntry: true } })}
                  className="text-sm text-bep-stone hover:text-bep-charcoal transition-colors"
                >
                  {t('invoices.manual_entry')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice history */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-bep-charcoal">{t('invoices.history_heading')}</p>

        {loading && (
          <div className="animate-pulse flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-bep-pebble rounded w-full" />
            ))}
          </div>
        )}

        {!loading && invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-bep-cream flex items-center justify-center mb-4">
              <FileText size={20} className="text-bep-turmeric" />
            </div>
            <p className="text-sm font-medium text-bep-charcoal mb-1">{t('invoices.empty_title')}</p>
            <p className="text-sm text-bep-stone max-w-xs">{t('invoices.empty_body')}</p>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div className="bg-bep-surface border border-bep-pebble rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bep-pebble">
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('invoices.col_date')}</th>
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('invoices.col_supplier')}</th>
                  <th className="text-right text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('invoices.col_total')}</th>
                  <th className="text-left text-xs font-medium text-bep-stone uppercase tracking-wider py-2 px-4">{t('invoices.col_status')}</th>
                  <th className="py-2 px-4" />
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-bep-pebble hover:bg-bep-rice transition-colors last:border-0">
                    <td className="py-3 px-4 text-bep-charcoal font-mono tabular-nums">
                      {inv.invoice_date ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-bep-charcoal">
                      {inv.suppliers?.name ?? t('invoices.unknown_supplier')}
                    </td>
                    <td className="py-3 px-4 text-right text-bep-charcoal font-mono tabular-nums">
                      {inv.total_amount != null ? formatVND(inv.total_amount) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'confirmed'
                          ? 'bg-bep-profit-bg text-bep-profit'
                          : 'bg-bep-warning-bg text-bep-warning'
                      }`}>
                        {inv.status === 'confirmed' ? t('invoices.status_confirmed') : t('invoices.status_pending')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-3">
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => navigate('/dashboard/invoices/confirm', { state: { invoiceId: inv.id, extracted: null } })}
                            className="text-bep-stone hover:text-bep-turmeric transition-colors flex items-center gap-1 text-xs"
                          >
                            <Eye size={14} />
                            {t('invoices.review')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="text-bep-stone hover:text-bep-loss transition-colors"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
