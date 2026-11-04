import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  GridIcon,
  InfoIcon,
  MapPinIcon,
  MenuIcon,
  MessageCircleIcon,
} from './Icons'
import { BRAND, whatsappLink } from '../lib/format'
import './Header.css'

function useScrolled(threshold) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

function Brand({ as = 'a' }) {
  const content = (
    <>
      <span className="brand__word">{BRAND}</span>
      <span className="brand__mark" aria-hidden="true" />
    </>
  )

  if (as === 'div') {
    return <div className="brand">{content}</div>
  }

  return (
    <a className="brand" href="#katalog" aria-label={`${BRAND}, kembali ke katalog`}>
      {content}
    </a>
  )
}

function NavItem({ id, label, active, onOpen, onLeave, onToggle, children }) {
  const isOpen = active === id

  return (
    <li
      className={`site-nav__item${isOpen ? ' is-open' : ''}`}
      onMouseEnter={() => onOpen(id)}
      onMouseLeave={() => onLeave(id)}
    >
      <button
        type="button"
        className="site-nav__trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => onToggle(id)}
      >
        {label}
        <ChevronDownIcon size={14} className="site-nav__chevron" />
      </button>
      <div className="nav-panel" data-open={isOpen}>
        {children}
      </div>
    </li>
  )
}

function PanelGrid({ items, single = false, onNavigate, note }) {
  return (
    <>
      <ul className={`nav-panel__grid${single ? ' nav-panel__grid--single' : ''}`}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.title}>
              <a
                className="nav-card"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={() => onNavigate?.(item)}
              >
                <span className="nav-card__icon">
                  <Icon size={16} />
                </span>
                <span className="nav-card__text">
                  <span className="nav-card__title">{item.title}</span>
                  {item.description ? (
                    <span className="nav-card__desc">{item.description}</span>
                  ) : null}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
      {note ? <p className="nav-panel__note">{note}</p> : null}
    </>
  )
}

export default function Header({
  variant = 'catalog',
  settings = {},
  categories = [],
  onSelectCategory,
  onBack,
}) {
  const [openMenu, setOpenMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolled(10)
  const headerRef = useRef(null)

  // Tutup menu saat Escape atau saat klik di luar header.
  useEffect(() => {
    if (!openMenu && !mobileOpen) return

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setOpenMenu(null)
      setMobileOpen(false)
    }

    const onPointerDown = (event) => {
      if (headerRef.current?.contains(event.target)) return
      setOpenMenu(null)
      setMobileOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [openMenu, mobileOpen])

  // Kunci scroll halaman selama menu ponsel terbuka.
  useEffect(() => {
    if (!mobileOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  if (variant === 'review') {
    return (
      <header className={`site-header site-header--review${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__bar">
          <button type="button" className="header-back" onClick={onBack}>
            <ArrowLeftIcon size={18} />
            <span>Kembali</span>
          </button>
          <Brand as="div" />
        </div>
      </header>
    )
  }

  const { phone, address } = settings
  const helpLink = whatsappLink(
    phone,
    `Halo Admin ${BRAND}, saya ingin bertanya tentang produk.`,
  )
  const mapsLink = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  const productItems = [
    {
      title: 'Semua produk',
      description: 'Seluruh koleksi yang tersedia',
      href: '#katalog',
      icon: GridIcon,
      categoryId: '',
    },
    ...categories.map((category) => ({
      title: category.name,
      description: 'Filter katalog',
      href: '#katalog',
      icon: GridIcon,
      categoryId: category.id,
    })),
  ]

  const storeItems = [
    {
      title: 'Cara pesan',
      description: 'Pilih produk, lanjut lewat WhatsApp',
      href: '#katalog',
      icon: InfoIcon,
    },
    ...(helpLink
      ? [
          {
            title: 'Chat admin',
            description: 'Tanya stok, ukuran, dan ongkir',
            href: helpLink,
            icon: MessageCircleIcon,
            external: true,
          },
        ]
      : []),
    ...(mapsLink
      ? [
          {
            title: 'Alamat toko',
            description: address,
            href: mapsLink,
            icon: MapPinIcon,
            external: true,
          },
        ]
      : []),
  ]

  const open = (id) => setOpenMenu(id)
  const leave = (id) => setOpenMenu((current) => (current === id ? null : current))
  const toggle = (id) => setOpenMenu((current) => (current === id ? null : id))
  const closeAll = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  const pickCategory = (item) => {
    closeAll()
    onSelectCategory?.(item.categoryId)
  }

  return (
    <header
      ref={headerRef}
      className={`site-header${scrolled ? ' is-scrolled' : ''}`}
    >
      <div className="site-header__bar">
        <Brand />

        <nav className="site-nav" aria-label="Navigasi utama">
          <ul className="site-nav__list">
            <NavItem
              id="produk"
              label="Produk"
              active={openMenu}
              onOpen={open}
              onLeave={leave}
              onToggle={toggle}
            >
              <PanelGrid
                items={productItems}
                onNavigate={pickCategory}
                note={
                  <>
                    Butuh rekomendasi?{' '}
                    <a href="#katalog" onClick={closeAll}>
                      Lihat katalog lengkap
                    </a>
                  </>
                }
              />
            </NavItem>

            <NavItem
              id="toko"
              label="Toko"
              active={openMenu}
              onOpen={open}
              onLeave={leave}
              onToggle={toggle}
            >
              <PanelGrid
                items={storeItems}
                single
                onNavigate={closeAll}
                note={
                  <>
                    Semua pesanan dikonfirmasi admin lewat WhatsApp.
                  </>
                }
              />
            </NavItem>

            <li>
              <a className="site-nav__link" href="#katalog">
                Katalog
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          {helpLink ? (
            <a
              className="header-help"
              href={helpLink}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircleIcon size={17} />
              <span>Tanya kami</span>
            </a>
          ) : (
            <span className="header-help">
              <MessageCircleIcon size={17} />
              <span>Tanya kami</span>
            </span>
          )}

          <button
            type="button"
            className="header-menu"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="site-mobile" id="site-mobile-menu">
          <div className="site-mobile__group">
            <p className="site-mobile__label">Produk</p>
            {productItems.map((item) => (
              <a
                key={item.title}
                className="site-mobile__link"
                href={item.href}
                onClick={() => pickCategory(item)}
              >
                {item.title}
              </a>
            ))}
          </div>

          <div className="site-mobile__group">
            <p className="site-mobile__label">Toko</p>
            {storeItems.map((item) => (
              <a
                key={item.title}
                className="site-mobile__link"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={closeAll}
              >
                {item.title}
              </a>
            ))}
          </div>

          {helpLink ? (
            <a
              className="site-mobile__cta"
              href={helpLink}
              target="_blank"
              rel="noreferrer"
              onClick={closeAll}
            >
              <MessageCircleIcon size={16} />
              <span>Chat admin</span>
            </a>
          ) : (
            <a className="site-mobile__cta" href="#katalog" onClick={closeAll}>
              <ArrowRightIcon size={14} />
              <span>Buka katalog</span>
            </a>
          )}
        </div>
      )}
    </header>
  )
}
