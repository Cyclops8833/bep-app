import { useTranslation } from 'react-i18next'
import { NavLink, Routes, Route } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Truck,
  FileText,
  TrendingUp,
  Receipt,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import Suppliers from './Suppliers'
import Ingredients from './Ingredients'

const navItems = [
  { to: '/dashboard',             label: 'nav.dashboard',   icon: LayoutDashboard, end: true },
  { to: '/dashboard/recipes',     label: 'nav.recipes',     icon: BookOpen },
  { to: '/dashboard/ingredients', label: 'nav.ingredients', icon: Package },
  { to: '/dashboard/suppliers',   label: 'nav.suppliers',   icon: Truck },
  { to: '/dashboard/invoices',    label: 'nav.invoices',    icon: FileText },
  { to: '/dashboard/revenue',     label: 'nav.revenue',     icon: TrendingUp },
  { to: '/dashboard/vat',         label: 'nav.vat',         icon: Receipt },
]

function Placeholder({ labelKey }: { labelKey: string }) {
  const { t } = useTranslation()
  return (
    <div className="p-6">
      <h1 className="text-lg font-medium text-bep-charcoal">{t(labelKey)}</h1>
      <p className="text-sm text-bep-stone mt-1">Coming soon</p>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const { profile } = useProfile()

  return (
    <div className="min-h-screen bg-bep-rice flex">

      {/* Sidebar */}
      <aside className="w-[220px] bg-bep-surface border-r border-bep-pebble flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-bep-pebble">
          <p className="font-ui text-xl font-medium text-bep-lacquer" style={{ letterSpacing: '-0.02em' }}>Bếp</p>
          {profile && (
            <p className="text-xs text-bep-stone mt-0.5 truncate">{profile.business_name}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-bep-cream text-bep-turmeric font-medium'
                    : 'text-bep-stone hover:bg-bep-cream hover:text-bep-turmeric'
                }`
              }
            >
              <Icon size={16} />
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-bep-pebble">
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-bep-stone hover:bg-bep-cream hover:text-bep-turmeric transition-colors"
          >
            <LogOut size={16} />
            <span>{t('common.sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <Routes>
          <Route index element={<Placeholder labelKey="nav.dashboard" />} />
          <Route path="recipes"     element={<Placeholder labelKey="nav.recipes" />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="suppliers"   element={<Suppliers />} />
          <Route path="invoices"    element={<Placeholder labelKey="nav.invoices" />} />
          <Route path="revenue"     element={<Placeholder labelKey="nav.revenue" />} />
          <Route path="vat"         element={<Placeholder labelKey="nav.vat" />} />
        </Routes>
      </main>

    </div>
  )
}
