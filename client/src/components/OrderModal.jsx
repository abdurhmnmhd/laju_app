import { useEffect, useRef, useState } from 'react'
import {
  AlertIcon,
  CloseIcon,
  MessageCircleIcon,
  MinusIcon,
  PlusIcon,
} from './Icons'
import { formatPrice, MAX_QTY, SIZE_OPTIONS } from '../lib/format'
import './OrderModal.css'

export default function OrderModal({ product, initial, onClose, onReview }) {
  const [size, setSize] = useState(initial?.size || 'M')
  const [quantity, setQuantity] = useState(initial?.quantity || 1)
  const [name, setName] = useState(initial?.name || '')
  const [address, setAddress] = useState(initial?.address || '')
  const [note, setNote] = useState(initial?.note || '')
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)

  const sheetRef = useRef(null)
  const nameRef = useRef(null)
  const addressRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheetRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const subtotal = (Number(product.price) || 0) * quantity
  const showBanner = attempted && Boolean(errors.name || errors.address)

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!name.trim()) nextErrors.name = 'Nama lengkap wajib diisi.'
    if (!address.trim()) nextErrors.address = 'Alamat pengiriman wajib diisi.'

    setErrors(nextErrors)
    setAttempted(true)

    if (nextErrors.name) {
      nameRef.current?.focus()
      return
    }
    if (nextErrors.address) {
      addressRef.current?.focus()
      return
    }

    onReview({ product, size, quantity, name, address, note })
  }

  const updateName = (value) => {
    setName(value)
    if (errors.name) setErrors((current) => ({ ...current, name: '' }))
  }

  const updateAddress = (value) => {
    setAddress(value)
    if (errors.address) setErrors((current) => ({ ...current, address: '' }))
  }

  return (
    <div
      className="sheet-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="sheet"
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="sheet__handle" aria-hidden="true" />

        <div className="sheet__head">
          <div className="sheet__heading">
            <h2 className="sheet__title" id="order-title">
              Siapkan pesananmu
            </h2>
            <p className="sheet__subtitle">
              Pilih ukuran, lalu isi detail untuk admin toko.
            </p>
          </div>
          <button
            type="button"
            className="sheet__close"
            onClick={onClose}
            aria-label="Tutup formulir"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {showBanner && (
          <div className="form-alert" role="alert">
            <AlertIcon size={16} />
            <p>Lengkapi nama dan alamat sebelum lanjut.</p>
          </div>
        )}

        <div className="sheet-product">
          <div className="sheet-product__media">
            {product.image ? (
              <img src={product.image} alt="" loading="lazy" />
            ) : (
              <span aria-hidden="true">
                {product.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="sheet-product__detail">
            <p className="sheet-product__category">{product.categoryName}</p>
            <p className="sheet-product__name">{product.name}</p>
            <p className="sheet-product__price">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="field">
          <div className="field__label-row">
            <span className="field__label" id="size-label">
              Ukuran <span aria-hidden="true">*</span>
            </span>
            <span className="field__hint">Panduan ukuran</span>
          </div>
          <div
            className="size-options"
            role="group"
            aria-labelledby="size-label"
          >
            {SIZE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`size-option${size === option ? ' is-selected' : ''}`}
                aria-pressed={size === option}
                onClick={() => setSize(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="qty-row">
          <div>
            <p className="field__label">
              Jumlah <span aria-hidden="true">*</span>
            </p>
            <p className="field__hint">Maks. {MAX_QTY} per pesanan</p>
          </div>
          <div className="qty-stepper">
            <button
              type="button"
              className="qty-stepper__button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              aria-label="Kurangi jumlah"
            >
              <MinusIcon size={14} />
            </button>
            <span className="qty-stepper__value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="qty-stepper__button"
              onClick={() =>
                setQuantity((value) => Math.min(MAX_QTY, value + 1))
              }
              disabled={quantity >= MAX_QTY}
              aria-label="Tambah jumlah"
            >
              <PlusIcon size={14} />
            </button>
          </div>
        </div>

        <hr className="sheet__divider" />

        <div className="field">
          <label className="field__label" htmlFor="order-name">
            Nama lengkap <span aria-hidden="true">*</span>
          </label>
          <input
            id="order-name"
            ref={nameRef}
            className={`field__control${errors.name ? ' has-error' : ''}`}
            value={name}
            onChange={(event) => updateName(event.target.value)}
            placeholder="Nama penerima"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'order-name-error' : undefined}
          />
          {errors.name && (
            <p className="field__error" id="order-name-error">
              <AlertIcon size={12} />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="order-address">
            Alamat pengiriman <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="order-address"
            ref={addressRef}
            className={`field__control field__control--area${
              errors.address ? ' has-error' : ''
            }`}
            value={address}
            onChange={(event) => updateAddress(event.target.value)}
            placeholder="Jalan, nomor rumah, kecamatan, kota, kode pos"
            rows={2}
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? 'order-address-error' : undefined}
          />
          {errors.address && (
            <p className="field__error" id="order-address-error">
              <AlertIcon size={12} />
              <span>{errors.address}</span>
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="order-note">
            Catatan (opsional)
          </label>
          <input
            id="order-note"
            className="field__control"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: konfirmasi ukuran terlebih dahulu"
          />
        </div>

        <div className="sheet__checkout">
          <div className="sheet__summary">
            <span>Subtotal · {quantity} produk</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <button type="submit" className="btn btn--primary">
            <MessageCircleIcon size={18} />
            <span>Siapkan pesan WhatsApp</span>
          </button>
          <p className="sheet__note">
            Belum mengirim pesanan. Kamu bisa meninjau pesan dahulu.
          </p>
        </div>
      </form>
    </div>
  )
}
