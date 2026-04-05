import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Camera, ChefHat, TrendingUp } from 'lucide-react'

export default function Landing() {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT('vi')

  return (
    <div className="min-h-screen bg-bep-rice">
      {/* Nav */}
      <header className="h-14 bg-bep-surface border-b border-bep-pebble flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <span
            className="text-2xl font-medium text-bep-lacquer tracking-tight"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: '-0.02em' }}
          >
            {t('common.app_name')}
          </span>
          <div className="flex items-center gap-3">
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

      {/* Hero */}
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

      {/* Feature highlights */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
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

      {/* How it works */}
      <section className="bg-bep-cream border-y border-bep-pebble">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-medium text-bep-stone uppercase tracking-wider text-center mb-10">
            {t('landing.how.heading')}
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {(['step1', 'step2', 'step3'] as const).map((step, i) => (
              <div key={step} className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-bep-lacquer text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                    {t(`landing.how.${step}.label`)}
                  </span>
                </div>
                <h2 className="text-sm font-medium text-bep-charcoal">
                  {t(`landing.how.${step}.title`)}
                </h2>
                <p className="text-sm text-bep-stone leading-relaxed">
                  {t(`landing.how.${step}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1
          className="text-2xl font-medium text-bep-charcoal mb-3"
          style={{ letterSpacing: '-0.02em' }}
        >
          {t('landing.cta_footer.heading')}
        </h1>
        <p className="text-sm text-bep-stone mb-8">
          {t('landing.cta_footer.body')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {t('landing.cta_footer.cta_signup')}
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-bep-turmeric hover:text-bep-amber transition-colors"
          >
            {t('landing.cta_footer.cta_login')}
          </Link>
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
