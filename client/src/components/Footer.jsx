import { useState } from 'react'
import { MapPinIcon, MessageCircleIcon, SendIcon } from './Icons'
import { BRAND, whatsappLink, whatsappNumber } from '../lib/format'
import './Footer.css'

const CURRENT_YEAR = new Date().getFullYear()

function displayPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  const grouped = digits.replace(/^(\d{2})(\d{3})(\d{3,4})(\d{3,5})$/, '$1 $2-$3-$4')
  return grouped === digits ? `+${digits}` : `+${grouped}`
}

export default function Footer({ settings = {}, categories = [], onSelectCategory }) {
  const { phone, address, tagline } = settings
  const [number, setNumber] = useState('')
  const [error, setError] = useState('')

  const helpLink = whatsappLink(
    phone,
    `Halo Admin ${BRAND}, saya ingin bertanya tentang produk.`,
  )
  const mapsLink = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null
  const phoneLabel = displayPhone(phone)
  const quickCategories = categories.slice(0, 4)

  const handleSubmit = (event) => {
    event.preventDefault()
    const digits = whatsappNumber(number)

    if (digits.length < 8) {
      setError('Masukkan nomor WhatsApp yang valid.')
      return
    }

    const link = whatsappLink(
      phone,
      `Halo Admin ${BRAND}, saya ${number.trim()}. Boleh minta info produk terbaru?`,
    )

    if (!link) {
      setError('Nomor admin belum diatur.')
      return
    }

    setError('')
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__glow" aria-hidden="true" />

          <p className="site-footer__wordmark">
            {BRAND}
            <span className="site-footer__mark" aria-hidden="true" />
          </p>
          <p className="site-footer__tagline">
            {tagline || 'Pakaian untuk setiap gerak.'}
          </p>

          {helpLink ? (
            <form className="site-footer__form" onSubmit={handleSubmit} noValidate>
              <label className="visually-hidden" htmlFor="footer-wa">
                Nomor WhatsApp
              </label>
              <input
                id="footer-wa"
                className="site-footer__input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Nomor WhatsApp kamu"
                value={number}
                onChange={(event) => {
                  setNumber(event.target.value)
                  if (error) setError('')
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'footer-wa-error' : undefined}
              />
              <button
                type="submit"
                className="site-footer__submit"
                aria-label="Minta info lewat WhatsApp"
              >
                <SendIcon size={15} />
              </button>
            </form>
          ) : null}

          {error ? (
            <p className="site-footer__error" id="footer-wa-error" role="alert">
              {error}
            </p>
          ) : (
            <p className="site-footer__hint">
              Kami balas lewat WhatsApp, bukan email.
            </p>
          )}
        </div>

        <nav className="site-footer__col" aria-label="Jelajahi">
          <h2 className="site-footer__heading">Jelajahi</h2>
          <ul className="site-footer__links">
            <li>
              <a href="#katalog" onClick={() => onSelectCategory?.('')}>
                Semua produk
              </a>
            </li>
            {quickCategories.map((category) => (
              <li key={category.id}>
                <a href="#katalog" onClick={() => onSelectCategory?.(category.id)}>
                  {category.name}
                </a>
              </li>
            ))}
            <li>
              <a href="#katalog">Katalog</a>
            </li>
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Kontak</h2>
          <address className="site-footer__address">
            {address && (
              <p>
                <MapPinIcon size={14} />
                {mapsLink ? (
                  <a href={mapsLink} target="_blank" rel="noreferrer">
                    {address}
                  </a>
                ) : (
                  address
                )}
              </p>
            )}
            {phoneLabel && (
              <p>
                <MessageCircleIcon size={14} />
                <a href={`tel:+${whatsappNumber(phone)}`}>{phoneLabel}</a>
              </p>
            )}
          </address>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__heading">Terhubung</h2>
          {helpLink ? (
            <a
              className="site-footer__cta"
              href={helpLink}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircleIcon size={16} />
              <span>Chat admin</span>
            </a>
          ) : null}
          <p className="site-footer__note">
            Stok, ukuran, dan ongkir dikonfirmasi langsung oleh admin toko.
          </p>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>
          © {CURRENT_YEAR} {BRAND} · Pakaian untuk setiap gerak.
        </p>
        <p>Pemesanan lewat WhatsApp, tanpa akun.</p>
      </div>
    </footer>
  )
}
