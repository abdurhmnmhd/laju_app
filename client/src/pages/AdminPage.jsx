import { useEffect, useMemo, useState } from 'react'
import { BRAND, formatPrice } from '../lib/format'
import { requestJson } from '../lib/api'
import './AdminPage.css'

const emptyProduct = {
  name: '',
  categoryId: '',
  price: '',
  stockStatus: 'Tersedia',
  description: '',
  imageUrl: '',
  photo: null,
}

function authOptions(token, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  }
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = await requestJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      onLogin(payload.token, payload.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <a className="admin-brand" href="/">{BRAND}<span /></a>
        <p className="admin-eyebrow">Area admin</p>
        <h1>Kelola toko dengan mudah.</h1>
        <p className="admin-muted">Masuk untuk mengatur katalog, stok, dan informasi toko.</p>
        <form className="admin-form" onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="admin-alert" role="alert">{error}</p>}
          <button className="admin-button admin-button--primary" disabled={loading}>
            {loading ? 'Memeriksa…' : 'Masuk ke dashboard'}
          </button>
        </form>
        <a className="admin-back" href="/">← Kembali ke katalog</a>
      </div>
    </main>
  )
}

function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(product || emptyProduct)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-panel admin-form" onSubmit={submit}>
      <div className="admin-panel__head">
        <div>
          <p className="admin-eyebrow">{product ? 'Edit produk' : 'Produk baru'}</p>
          <h2>{product ? product.name : 'Tambah produk'}</h2>
        </div>
        <button type="button" className="admin-button admin-button--ghost" onClick={onCancel}>Batal</button>
      </div>
      <div className="admin-form__grid">
        <label>Nama produk<input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
        <label>Kategori
          <select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} required>
            <option value="">Pilih kategori</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>Harga (IDR)<input type="number" min="0" value={form.price} onChange={(event) => update('price', event.target.value)} required /></label>
        <label>Status stok
          <select value={form.stockStatus} onChange={(event) => update('stockStatus', event.target.value)}>
            <option value="Tersedia">Tersedia</option>
            <option value="Habis">Habis</option>
          </select>
        </label>
      </div>
      <label>Deskripsi<textarea rows="4" value={form.description || ''} onChange={(event) => update('description', event.target.value)} /></label>
      <label>URL gambar (opsional)<input value={form.imageUrl || form.image || ''} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" /></label>
      <label>Upload gambar (opsional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => update('photo', event.target.files?.[0] || null)} /></label>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      <button className="admin-button admin-button--primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan produk'}</button>
    </form>
  )
}

function Dashboard({ user, token, onLogout }) {
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [settings, setSettings] = useState({})
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [productPayload, categoryPayload, storePayload] = await Promise.all([
        requestJson('/api/products'),
        requestJson('/api/categories'),
        requestJson('/api/store'),
      ])
      setProducts(productPayload.data || [])
      setCategories(categoryPayload.data || [])
      setSettings(storePayload.data || {})
    } catch (err) {
      setNotice(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const saveProduct = async (form) => {
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'photo' && key !== 'image') body.append(key, value)
    })
    if (form.photo) body.append('photo', form.photo)
    const path = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
    await requestJson(path, authOptions(token, { method: editingProduct ? 'PUT' : 'POST', body }))
    setShowProductForm(false)
    setEditingProduct(null)
    setNotice('Produk berhasil disimpan.')
    await loadData()
  }

  const toggleStock = async (product) => {
    await requestJson(`/api/products/${product.id}/stock`, authOptions(token, { method: 'PATCH' }))
    await loadData(false)
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`Hapus ${product.name}?`)) return
    await requestJson(`/api/products/${product.id}`, authOptions(token, { method: 'DELETE' }))
    setNotice('Produk berhasil dihapus.')
    await loadData()
  }

  const addCategory = async (event) => {
    event.preventDefault()
    setCategoryError('')
    try {
      await requestJson('/api/categories', authOptions(token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      }))
      setCategoryName('')
      setNotice('Kategori berhasil ditambahkan.')
      await loadData()
    } catch (err) {
      setCategoryError(err.message)
    }
  }

  const removeCategory = async (category) => {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return
    try {
      await requestJson(`/api/categories/${category.id}`, authOptions(token, { method: 'DELETE' }))
      setNotice('Kategori berhasil dihapus.')
      await loadData()
    } catch (err) {
      setCategoryError(err.message)
    }
  }

  const saveSettings = async (event) => {
    event.preventDefault()
    const payload = await requestJson('/api/store', authOptions(token, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }))
    setSettings(payload.data || settings)
    setNotice('Pengaturan toko berhasil disimpan.')
  }

  const stats = useMemo(() => ({
    total: products.length,
    available: products.filter((product) => product.stockStatus === 'Tersedia').length,
    categories: categories.length,
  }), [products, categories])

  return (
    <div className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/">{BRAND}<span /></a>
        <div className="admin-header__user"><span>{user?.name || 'Admin'}</span><button onClick={onLogout}>Keluar</button></div>
      </header>
      <main className="admin-main">
        <div className="admin-welcome"><div><p className="admin-eyebrow">Dashboard</p><h1>Halo, {user?.name || 'Admin'}.</h1></div><a className="admin-button admin-button--ghost" href="/">Lihat katalog</a></div>
        <div className="admin-stats">
          <div><span>Total produk</span><strong>{stats.total}</strong></div>
          <div><span>Produk tersedia</span><strong>{stats.available}</strong></div>
          <div><span>Kategori</span><strong>{stats.categories}</strong></div>
        </div>
        {notice && <p className="admin-notice">{notice}</p>}
        <nav className="admin-tabs" aria-label="Menu admin">
          <button className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>Produk</button>
          <button className={tab === 'categories' ? 'is-active' : ''} onClick={() => setTab('categories')}>Kategori</button>
          <button className={tab === 'settings' ? 'is-active' : ''} onClick={() => setTab('settings')}>Pengaturan toko</button>
        </nav>
        {loading ? <div className="admin-panel"><p className="admin-muted">Memuat data…</p></div> : (
          <>
            {tab === 'products' && (
              showProductForm ? <ProductForm product={editingProduct} categories={categories} onSave={saveProduct} onCancel={() => { setShowProductForm(false); setEditingProduct(null) }} /> : (
                <section className="admin-panel">
                  <div className="admin-panel__head"><div><p className="admin-eyebrow">Katalog</p><h2>Daftar produk</h2></div><button className="admin-button admin-button--primary" onClick={() => setShowProductForm(true)}>+ Tambah produk</button></div>
                  <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr></thead><tbody>
                    {products.map((product) => {
                      const isAvailable = product.stockStatus === 'Tersedia'
                      return (
                        <tr key={product.id}>
                          <td><div className="admin-product"><img src={product.image} alt="" /><span>{product.name}</span></div></td>
                          <td>{product.categoryName}</td>
                          <td>{formatPrice(product.price)}</td>
                          <td>
                            <button
                              type="button"
                              className={`admin-stock ${isAvailable ? 'is-available' : ''}`}
                              role="switch"
                              aria-checked={isAvailable}
                              aria-label={`${product.name}: stok ${isAvailable ? 'tersedia' : 'habis'}`}
                              onClick={() => toggleStock(product)}
                            >
                              <span className="admin-stock__track"><span className="admin-stock__thumb" /></span>
                              <span className="admin-stock__label">{isAvailable ? 'Tersedia' : 'Habis'}</span>
                            </button>
                          </td>
                          <td><div className="admin-actions"><button onClick={() => { setEditingProduct(product); setShowProductForm(true) }}>Edit</button><button className="is-danger" onClick={() => removeProduct(product)}>Hapus</button></div></td>
                        </tr>
                      )
                    })}
                  </tbody></table></div>
                </section>
              )
            )}
            {tab === 'categories' && <section className="admin-panel"><div className="admin-panel__head"><div><p className="admin-eyebrow">Organisasi</p><h2>Kategori produk</h2></div></div><form className="admin-inline-form" onSubmit={addCategory}><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Nama kategori baru" required /><button className="admin-button admin-button--primary">Tambah</button></form>{categoryError && <p className="admin-alert">{categoryError}</p>}<div className="admin-category-list">{categories.map((category) => <div key={category.id}><span>{category.name}<small>{category.productCount} produk</small></span><button className="is-danger" onClick={() => removeCategory(category)}>Hapus</button></div>)}</div></section>}
            {tab === 'settings' && <form className="admin-panel admin-form" onSubmit={saveSettings}><div className="admin-panel__head"><div><p className="admin-eyebrow">Identitas</p><h2>Pengaturan toko</h2></div><button className="admin-button admin-button--primary">Simpan</button></div><label>Nama toko<input value={settings.storeName || ''} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} /></label><label>Tagline<input value={settings.tagline || ''} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} /></label><label>Nomor WhatsApp<input value={settings.phone || ''} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} placeholder="6281234567890" /></label><label>Alamat<textarea rows="3" value={settings.address || ''} onChange={(event) => setSettings({ ...settings, address: event.target.value })} /></label></form>}
          </>
        )}
      </main>
    </div>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('laju-admin-session')) || null } catch { return null }
  })

  const login = (token, user) => {
    const next = { token, user }
    localStorage.setItem('laju-admin-session', JSON.stringify(next))
    setSession(next)
  }

  const logout = () => {
    localStorage.removeItem('laju-admin-session')
    setSession(null)
  }

  if (!session?.token) return <Login onLogin={login} />
  return <Dashboard user={session.user} token={session.token} onLogout={logout} />
}
