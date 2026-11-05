import { useState } from 'react'
import { BRAND } from '../lib/format'
import { requestJson } from '../lib/api'
import './AdminLogin.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Halaman masuk admin bergaya split-screen: formulir di panel kiri,
 * foto olahraga penuh di panel kanan. Diadaptasi dari komponen
 * "Login" milik @lavikatiyar di 21st.dev.
 */
export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clearFieldError = (field) => {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const submit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Masukkan alamat email yang valid.'
    }
    if (!password) {
      nextErrors.password = 'Password wajib diisi.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setError('')
    setLoading(true)
    try {
      const payload = await requestJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      onLogin(payload.token, payload.user, remember)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <section className="login__form">
        <div className="login__inner">
          <a className="login__brand" href="/">
            {BRAND}
            <span aria-hidden="true" />
          </a>

          <header className="login__head">
            <h1>Selamat datang!</h1>
            <p>Masuk untuk mengatur katalog, stok, dan pesanan toko.</p>
          </header>

          <form className="login__fields" onSubmit={submit} noValidate>
            <div className="login__field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                placeholder="email@contoh.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearFieldError('email')
                }}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p className="login__field-error" id="login-email-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="login__field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearFieldError('password')
                }}
                disabled={loading}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p className="login__field-error" id="login-password-error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="login__row">
              <label className="login__check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  disabled={loading}
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                className="login__link"
                aria-expanded={showHint}
                aria-controls="login-password-hint"
                onClick={() => setShowHint((value) => !value)}
              >
                Lupa password?
              </button>
            </div>

            {showHint && (
              <p className="login__hint" id="login-password-hint">
                Reset password dilakukan oleh pengelola toko. Hubungi admin lewat
                WhatsApp yang tertera di halaman katalog.
              </p>
            )}

            {error && (
              <p className="login__alert" role="alert">
                {error}
              </p>
            )}

            <button className="login__submit" type="submit" disabled={loading}>
              {loading && <span className="login__spinner" aria-hidden="true" />}
              {loading ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          <p className="login__foot">
            Bukan admin? <a href="/">Kembali ke katalog</a>.
          </p>
        </div>
      </section>

      <aside className="login__visual">
        <img
          src="/login-sports.webp"
          alt="Pelari sprint di lintasan atletik pada malam hari"
          width="1200"
          height="800"
          decoding="async"
        />
        <div className="login__scrim" aria-hidden="true" />
        <div className="login__caption">
          <p className="login__caption-eyebrow">{BRAND} sport</p>
          <p className="login__caption-title">Katalog sportswear &amp; perlengkapan latihan.</p>
        </div>
      </aside>
    </main>
  )
}
