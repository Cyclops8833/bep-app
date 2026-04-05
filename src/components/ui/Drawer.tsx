import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer: ReactNode
}

export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[480px] bg-bep-surface border-l border-bep-pebble flex flex-col z-50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bep-pebble">
          <h2 className="text-base font-medium text-bep-charcoal">{title}</h2>
          <button onClick={onClose} className="text-bep-stone hover:text-bep-charcoal transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {children}
        </div>
        <div className="px-6 py-4 border-t border-bep-pebble flex justify-end gap-3">
          {footer}
        </div>
      </div>
    </>
  )
}
