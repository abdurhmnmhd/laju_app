import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import {
  ArrowRightIcon,
  CopyIcon,
  InfoIcon,
  MessageCircleIcon,
} from '../components/Icons'
import {
  BRAND,
  buildOrderMessage,
  formatPrice,
  whatsappLink,
} from '../lib/format'
import './OrderReview.css'

export default function OrderReview({ order, phone, onBack }) {
  const { product, size, quantity } = order
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  const subtotal = (Number(product.price) || 0) * quantity
  const message = buildOrderMessage(order)
  const link = whatsappLink(phone, message)

  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="review-page">
      <Header variant="review" onBack={onBack} />

      <main className="review">
        <div className="review__inner">
          <div className="review__intro">
            <p className="review__stage">
              <span>01 PILIH &amp; ISI</span>
              <ArrowRightIcon size={12} />
              <span className="is-current">02 LANJUT CHAT</span>
            </p>
            <h1 className="review__title">
              <span>Pesanmu siap.</span>
              <span>Lanjutkan di WhatsApp.</span>
            </h1>
            <p className="review__lead">
              Periksa detail berikut. Pesan akan dibuka di WhatsApp untuk
              dikirim ke admin {BRAND}.
            </p>
          </div>

          <section className="review-card" aria-label="Ringkasan produk">
            <div className="review-card__product">
              <div className="review-card__media">
                {product.image ? (
                  <img src={product.image} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">
                    {product.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="review-card__detail">
                <p className="review-card__name">{product.name}</p>
                <p className="review-card__meta">
                  Ukuran {size} · {quantity} buah
                </p>
                <p className="review-card__price">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            <hr className="review-card__divider" />

            <div className="review-card__subtotal">
              <span>Subtotal produk</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="review-card__note">
              Belum termasuk ongkir. Dikonfirmasi saat chat.
            </p>
          </section>

          <section className="review-preview">
            <div className="review-preview__head">
              <h2>Pratinjau pesan WhatsApp</h2>
              <button
                type="button"
                className="review-preview__copy"
                onClick={copyMessage}
              >
                <CopyIcon size={13} />
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <div className="review-preview__body">
              {message.split('\n\n').map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <p className="review-info">
            <InfoIcon size={15} />
            <span>
              Ini bukan konfirmasi pesanan atau pembayaran. Pesanan disepakati
              bersama admin melalui chat.
            </span>
          </p>

          <div className="review-actions">
            {link ? (
              <a
                className="btn btn--primary"
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircleIcon size={18} />
                <span>Buka WhatsApp &amp; lanjut chat</span>
              </a>
            ) : (
              <p className="review-actions__warning" role="alert">
                Nomor WhatsApp toko belum diatur. Hubungi admin untuk
                menyelesaikan pesanan.
              </p>
            )}
            <button type="button" className="btn btn--ghost" onClick={onBack}>
              Ubah detail pesanan
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
