import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import CategoryPilss from '../components/CategoryPilss'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import OrderModal from '../components/OrderModal'
import TiltedGridHero from '../components/TiltedGridHero'
import OrderReview from './OrderReview'
import { requestJson } from '../lib/api'
import campaignImage from '../assets/campaign.jpg'
import './ProductList.css'

const SKELETON_COUNT = 6

function ProductSkeletons() {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div className="product-card product-card--skeleton" key={index}>
          <div className="product-card__media" />
          <div className="product-card__info">
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line--medium" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductList() {
  const [settings, setSettings] = useState({})
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [draft, setDraft] = useState(null)
  const [reviewOrder, setReviewOrder] = useState(null)

  const requestId = useRef(0)

  // Debounce the search box so typing does not fire a request per keypress.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Store settings and categories are static enough to load once.
  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      requestJson('/api/store'),
      requestJson('/api/categories'),
    ]).then(([storeResult, categoryResult]) => {
      if (cancelled) return

      if (storeResult.status === 'fulfilled') {
        setSettings(storeResult.value.data || {})
      }
      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.data || [])
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch products whenever the debounced search, category, or retry token changes.
  useEffect(() => {
    const id = ++requestId.current
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (activeCategory) params.set('categoryId', activeCategory)
    const query = params.toString()

    requestJson(`/api/products${query ? `?${query}` : ''}`)
      .then((payload) => {
        if (id !== requestId.current) return

        setProducts(payload.data || [])
        setError('')
      })
      .catch((err) => {
        if (id !== requestId.current) return
        setError(err.message || 'Gagal memuat produk')
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }, [debouncedSearch, activeCategory, reloadToken])

  const resetFilters = () => {
    if (!search && !activeCategory) return
    setSearch('')
    setActiveCategory('')
    setLoading(true)
  }

  const selectCategory = (categoryId) => {
    if (categoryId === activeCategory) return
    setActiveCategory(categoryId)
    setLoading(true)
  }

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadToken((token) => token + 1)
  }

  const updateSearch = (value) => {
    setSearch(value)
    setLoading(true)
  }

  const openOrder = (product) => {
    setDraft(null)
    setSelectedProduct(product)
  }

  const closeOrder = () => {
    setSelectedProduct(null)
    setDraft(null)
  }

  const goToReview = (order) => {
    setDraft(order)
    setSelectedProduct(null)
    setReviewOrder(order)
  }

  const backToOrder = () => {
    setReviewOrder(null)
    setSelectedProduct(draft?.product ?? null)
  }

  const hasFilter = Boolean(debouncedSearch || activeCategory)
  const showingSkeleton = loading && products.length === 0

  // Foto produk menjadi isi hero; campaign.jpg hanya cadangan sebelum data tiba.
  const heroImages = useMemo(() => {
    const shots = products
      .map((product) => ({ src: product.image, alt: product.name }))
      .filter((shot) => Boolean(shot.src))
    return shots.length > 0 ? shots : [{ src: campaignImage, alt: '' }]
  }, [products])

  if (reviewOrder) {
    return (
      <OrderReview
        order={reviewOrder}
        phone={settings.phone}
        onBack={backToOrder}
      />
    )
  }

  return (
    <div className="catalog-page">
      <Header
        settings={settings}
        categories={categories}
        onSelectCategory={selectCategory}
      />

      <main className="catalog">
        <section className="hero" aria-label="Koleksi performa">
          <TiltedGridHero
            images={heroImages}
            speed={5}
            tileHeight={26}
            axis={60}
            curve={78}
            fade={10}
          >
            <div className="hero__content">
              <div className="hero__intro">
                <p className="hero__eyebrow">Support Your Perform</p>
                <h1 className="hero__title">
                  <span>Bergerak</span>
                  <span>tanpa batas.</span>
                </h1>
              </div>
              <p className="hero__sub">
                Build For Your Body.
              </p>
            </div>
          </TiltedGridHero>
        </section>

        <section className="catalog__body" id="katalog">
          <div className="catalog__head">
            <div className="catalog__headline">
              <h2 className="catalog__title">Siap untuk sesi berikutnya?</h2>
              <p className="catalog__count" aria-live="polite">
                {showingSkeleton
                  ? 'Memuat produk…'
                  : `${products.length} produk${hasFilter ? ' ditemukan' : ' tersedia'}`}
              </p>
            </div>
            {hasFilter && (
              <button
                type="button"
                className="catalog__reset"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>

          <SearchBar
            value={search}
            onChange={updateSearch}
            placeholder="Cari pakaian untuk gerakmu"
          />

          <CategoryPilss
            categories={categories}
            activeCategory={activeCategory}
            onSelect={selectCategory}
          />

          {error ? (
            <div className="catalog-state catalog-state--error">
              <p className="catalog-state__title">Katalog belum bisa dimuat</p>
              <p>{error}</p>
              <button
                type="button"
                className="catalog-state__action"
                onClick={retry}
              >
                Coba lagi
              </button>
            </div>
          ) : showingSkeleton ? (
            <ProductSkeletons />
          ) : products.length === 0 ? (
            <div className="catalog-state">
              <p className="catalog-state__title">Belum ada produk di sini</p>
              <p>Coba kata kunci atau kategori lain.</p>
              <button
                type="button"
                className="catalog-state__action"
                onClick={resetFilters}
              >
                Lihat semua produk
              </button>
            </div>
          ) : (
            <div className="product-grid" aria-busy={loading}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={openOrder}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={selectCategory}
      />

      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          initial={draft}
          onClose={closeOrder}
          onReview={goToReview}
        />
      )}
    </div>
  )
}
