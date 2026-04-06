import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { GoogleIcon } from '../components/GoogleIcon'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  const onSubmit = async (data: FormData) => {
    setAuthError(null)
    const { data: authData, error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      setAuthError(t('auth.error.invalid_credentials'))
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user!.id)
      .single()
    navigate(profile ? '/dashboard' : '/onboarding', { replace: true })
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="min-h-screen bg-bep-rice flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <p className="font-ui text-2xl font-medium text-bep-lacquer text-center mb-8" style={{ letterSpacing: '-0.02em' }}>
          Bếp
        </p>

        <div className="bg-bep-surface border border-bep-pebble rounded-xl p-6">
          <h1 className="text-lg font-medium text-bep-charcoal mb-1">{t('auth.login.title')}</h1>
          <p className="text-sm text-bep-stone mb-6">{t('auth.login.subtitle')}</p>

          <button
            onClick={handleGoogle}
            disabled={googleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-2 border border-bep-pebble hover:border-bep-turmeric hover:text-bep-turmeric text-bep-stone text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            {t('auth.login.google')}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-bep-pebble" />
            <span className="text-xs text-bep-stone">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-bep-pebble" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                {t('auth.login.email')}
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
              />
              {errors.email && <p className="text-xs text-bep-loss">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-bep-stone uppercase tracking-wider">
                {t('auth.login.password')}
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full bg-bep-surface border border-bep-pebble rounded-lg px-3 py-2 text-sm text-bep-charcoal placeholder:text-bep-stone focus:outline-none focus:border-bep-turmeric transition-colors"
              />
              {errors.password && <p className="text-xs text-bep-loss">{errors.password.message}</p>}
            </div>

            {authError && <p className="text-sm text-bep-loss">{authError}</p>}

            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className="bg-bep-lacquer hover:bg-bep-turmeric text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('common.loading') : t('auth.login.submit')}
            </button>
          </form>
        </div>

        <p className="text-sm text-center text-bep-stone mt-4">
          {t('auth.login.no_account')}{' '}
          <Link to="/signup" className="text-bep-turmeric hover:underline">
            {t('auth.login.signup_link')}
          </Link>
        </p>

      </div>
    </div>
  )
}
