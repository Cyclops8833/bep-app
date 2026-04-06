import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

function InvoiceIllustration() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      {/* Receipt */}
      <rect x="4" y="4" width="22" height="30" rx="2.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5"/>
      <line x1="9" y1="12" x2="22" y2="12" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45"/>
      <line x1="9" y1="17" x2="18" y2="17" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45"/>
      <line x1="9" y1="22" x2="22" y2="22" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.45"/>
      {/* Camera body overlapping bottom-right */}
      <rect x="20" y="22" width="16" height="12" rx="2.5" fill="#7C2D12"/>
      {/* Camera bump */}
      <rect x="23" y="19.5" width="5" height="3.5" rx="1" fill="#7C2D12"/>
      {/* Lens */}
      <circle cx="28" cy="28" r="3.5" stroke="#FEF3C7" strokeWidth="1.5"/>
      <circle cx="28" cy="28" r="1.5" fill="#FEF3C7"/>
    </svg>
  )
}

function DishIllustration() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      {/* Steam */}
      <path d="M14 16 Q12.5 13 14 10 Q15.5 7 14 4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
      <path d="M20 15 Q18.5 12 20 9 Q21.5 6 20 3" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
      <path d="M26 16 Q24.5 13 26 10 Q27.5 7 26 4" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
      {/* Bowl */}
      <path d="M6 20 C6 29 12 35 20 35 C28 35 34 29 34 20 Z" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.5"/>
      <line x1="6" y1="20" x2="34" y2="20" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      {/* ₫ price badge */}
      <circle cx="33" cy="11" r="6.5" fill="#B45309"/>
      <text x="33" y="14.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FEF3C7" fontFamily="sans-serif">₫</text>
    </svg>
  )
}

function MarginIllustration() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
      {/* Area fill */}
      <path d="M3 36 L3 26 L11 21 L20 17 L28 12 L34 9 L34 36 Z" fill="#FEF3C7"/>
      {/* Trend line */}
      <polyline points="3,26 11,21 20,17 28,12 34,9" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Baseline */}
      <line x1="3" y1="36" x2="34" y2="36" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.25"/>
      {/* Data points */}
      <circle cx="3" cy="26" r="2.5" fill="#B45309"/>
      <circle cx="11" cy="21" r="2.5" fill="#B45309"/>
      <circle cx="20" cy="17" r="2.5" fill="#B45309"/>
      <circle cx="28" cy="12" r="2.5" fill="#B45309"/>
      {/* Final point — green success */}
      <circle cx="34" cy="9" r="5.5" fill="#059669"/>
      <polyline points="31.5,9 33.5,11 36.5,6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Landing() {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi' || i18n.language.startsWith('vi')

  const freeFeatures = ['f1', 'f2', 'f3', 'f4'] as const
  const proFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const

  return (
    <div className="min-h-screen bg-bep-rice">

      {/* Nav */}
      <header className="h-14 bg-bep-surface border-b border-bep-pebble flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <span
            className="text-2xl font-medium text-bep-lacquer"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: '-0.02em' }}
          >
            {t('common.app_name')}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => i18n.changeLanguage(isVi ? 'en' : 'vi')}
              className="text-xs font-medium text-bep-stone hover:text-bep-turmeric transition-colors border border-bep-pebble rounded px-2 py-1"
            >
              {isVi ? 'EN' : 'VI'}
            </button>
            <Link
              to="/login"
              className="text-sm font-medium text-bep-stone hover:text-bep-turmeric transition-colors"
            >
              {t('landing.hero.cta_login')}
            </Link>
            <Link
              to="/signup"
              className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t('landing.hero.cta_signup')}
            </Link>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1
          className="text-4xl font-medium text-bep-charcoal mb-4"
          style={{ letterSpacing: '-0.02em', lineHeight: 1.25 }}
        >
          {t('landing.hero.tagline')}
          {isVi && (
            <span className="block text-bep-stone font-normal mt-1">
              {t('landing.hero.tagline_en')}
            </span>
          )}
        </h1>
        <p className="text-base text-bep-stone max-w-xl mx-auto mb-8 leading-relaxed">
          {t('landing.hero.body')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {t('landing.hero.cta_signup')}
          </Link>
          <Link
            to="/login"
            className="bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {t('landing.hero.cta_login')}
          </Link>
        </div>
      </section>

      {/* 2 — Problem */}
      <section className="border-y border-bep-pebble bg-bep-surface">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-16 items-center">
          <div>
            <p className="text-base font-medium text-bep-charcoal mb-3 leading-snug">
              {t('landing.problem.heading')}
            </p>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.problem.reason')}
            </p>
          </div>
          <div className="bg-bep-cream border border-bep-pebble rounded-xl p-5 flex flex-col gap-3">
            <p className="text-xs font-medium text-bep-stone uppercase tracking-wider">
              {t('landing.problem.example_label')}
            </p>
            <p className="text-sm text-bep-charcoal leading-relaxed">
              {t('landing.problem.example')}
            </p>
            <p className="text-sm font-medium text-bep-turmeric border-t border-bep-pebble pt-3">
              {t('landing.problem.reframe')}
            </p>
          </div>
        </div>
      </section>

      {/* 3 — Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-medium text-bep-stone uppercase tracking-wider text-center mb-8">
          {t('landing.features.heading')}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-bep-cream flex items-center justify-center mb-5">
              <InvoiceIllustration />
            </div>
            <h2 className="text-sm font-medium text-bep-charcoal mb-2">
              {t('landing.features.invoice.title')}
            </h2>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.features.invoice.body')}
            </p>
          </div>
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-bep-cream flex items-center justify-center mb-5">
              <DishIllustration />
            </div>
            <h2 className="text-sm font-medium text-bep-charcoal mb-2">
              {t('landing.features.recipe.title')}
            </h2>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.features.recipe.body')}
            </p>
          </div>
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-bep-cream flex items-center justify-center mb-5">
              <MarginIllustration />
            </div>
            <h2 className="text-sm font-medium text-bep-charcoal mb-2">
              {t('landing.features.margin.title')}
            </h2>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.features.margin.body')}
            </p>
          </div>
        </div>
      </section>

      {/* 4 — Pricing */}
      <section className="bg-bep-cream border-y border-bep-pebble">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2
            className="text-2xl font-medium text-bep-charcoal text-center mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t('landing.pricing.headline')}
          </h2>
          <p className="text-sm text-bep-stone text-center mb-10">
            {t('landing.pricing.sub')}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl mx-auto">

            {/* Free tier */}
            <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">
                  {t('landing.pricing.free.name')}
                </p>
                <p className="text-2xl font-medium text-bep-charcoal font-mono tabular-nums">
                  {t('landing.pricing.free.price')}
                </p>
                <span className="inline-block mt-2 text-xs font-medium text-bep-turmeric bg-bep-cream border border-bep-pebble px-2 py-0.5 rounded-full">
                  {t('landing.pricing.free.trial_badge')}
                </span>
              </div>
              <div className="border-t border-bep-pebble pt-4 flex flex-col gap-2">
                <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">
                  {t('landing.pricing.free.after_trial')}
                </p>
                {freeFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={13} className="text-bep-stone flex-shrink-0" />
                    <span className="text-sm text-bep-stone">{t(`landing.pricing.free.${f}`)}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/signup"
                className="mt-auto bg-transparent border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors text-center"
              >
                {t('landing.pricing.free.cta')}
              </Link>
            </div>

            {/* Pro tier */}
            <div className="bg-bep-surface border-2 border-bep-lacquer rounded-xl p-6 flex flex-col gap-4 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bep-lacquer text-white text-xs font-medium px-3 py-0.5 rounded-full whitespace-nowrap">
                {t('landing.pricing.pro.badge')}
              </span>
              <div>
                <p className="text-xs font-medium text-bep-stone uppercase tracking-wider mb-1">
                  {t('landing.pricing.pro.name')}
                </p>
                <div className="flex items-baseline gap-0.5">
                  <p className="text-2xl font-medium text-bep-charcoal font-mono tabular-nums">
                    {t('landing.pricing.pro.price')}
                  </p>
                  <span className="text-sm text-bep-stone">{t('landing.pricing.pro.period')}</span>
                </div>
                <p className="text-xs text-bep-turmeric mt-1.5">
                  {t('landing.pricing.pro.pho_note')}
                </p>
              </div>
              <div className="border-t border-bep-pebble pt-4 flex flex-col gap-2">
                {proFeatures.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={13} className="text-bep-turmeric flex-shrink-0" />
                    <span className="text-sm text-bep-charcoal">{t(`landing.pricing.pro.${f}`)}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/signup"
                className="mt-auto bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors text-center"
              >
                {t('landing.pricing.pro.cta')}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="border-t border-bep-pebble">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span
            className="text-base font-medium text-bep-lacquer"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: '-0.02em' }}
          >
            {t('common.app_name')}
          </span>
          <span className="text-xs text-bep-stone">© 2026</span>
        </div>
      </footer>

    </div>
  )
}
