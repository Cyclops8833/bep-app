import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Camera, ChefHat, TrendingUp, Check } from 'lucide-react'

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
          style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}
        >
          {t('landing.hero.tagline')}
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
            <div className="w-9 h-9 rounded-full bg-bep-cream flex items-center justify-center mb-4">
              <Camera size={16} className="text-bep-turmeric" />
            </div>
            <h2 className="text-sm font-medium text-bep-charcoal mb-2">
              {t('landing.features.invoice.title')}
            </h2>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.features.invoice.body')}
            </p>
          </div>
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
            <div className="w-9 h-9 rounded-full bg-bep-cream flex items-center justify-center mb-4">
              <ChefHat size={16} className="text-bep-turmeric" />
            </div>
            <h2 className="text-sm font-medium text-bep-charcoal mb-2">
              {t('landing.features.recipe.title')}
            </h2>
            <p className="text-sm text-bep-stone leading-relaxed">
              {t('landing.features.recipe.body')}
            </p>
          </div>
          <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
            <div className="w-9 h-9 rounded-full bg-bep-cream flex items-center justify-center mb-4">
              <TrendingUp size={16} className="text-bep-turmeric" />
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
