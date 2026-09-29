import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (tab === 'login') {
        await signIn(form.email, form.password)
        navigate('/', { replace: true })
      } else {
        await signUp(form.email, form.password, form.full_name)
        setSuccess('Account created! Check your email to confirm your account.')
        setForm({ email: '', password: '', full_name: '' })
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">9</span>
            </div>
            <span className="font-semibold text-neutral-800 text-xl">
              Nice Up <span className="text-pink-400">Kiddies</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-800">
            {tab === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-neutral-500 text-sm mt-1.5">
            {tab === 'login'
              ? 'Sign in to track your orders and manage your account'
              : 'Join thousands of happy parents'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-cream-50 border border-cream-300 rounded-3xl p-8">
          {/* Tabs */}
          <div className="flex bg-cream-200 rounded-xl p-1 mb-6">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === t ? 'bg-cream-50 text-neutral-800 shadow-soft' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Full Name</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-pink-50 border border-pink-200 text-pink-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 text-sm px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-neutral-600">Terms of Service</span> and{' '}
          <span className="text-neutral-600">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
