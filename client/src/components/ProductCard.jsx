import { useState } from 'react'
import { formatPrice, isAvailable, SIZE_OPTIONS } from '../lib/format'

export default function ProductCard({ product, onOrder }) {
  const [imageFailed, setImageFailed] = useState(false)
  const available = isAvailable(product)

  return (
    <article className={`product-card${available ? '' : ' is-empty'}`}>
      <div className="product-card__media">
        {product.image && !imageFailed ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="product-card__placeholder" aria-hidden="true">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span
          className={`stock-pill${available ? ' stock-pill--available' : ''}`}
        >
          <span className="stock-pill__dot" aria-hidden="true" />
          {available ? 'Tersedia' : 'Stok habis'}
        </span>
      </div>

      <div className="product-card__info">
        <p className="product-card__category">{product.categoryName}</p>
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__sizes">{SIZE_OPTIONS.join(' · ')}</p>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>

      <button
        type="button"
        className="product-card__order"
        disabled={!available}
        onClick={() => onOrder(product)}
      >
        {available ? '+ Pesan via WhatsApp' : 'Stok habis'}
      </button>
    </article>
  )
}
