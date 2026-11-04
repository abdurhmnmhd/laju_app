const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const BRAND = 'LAJU'
export const SIZE_OPTIONS = ['S', 'M', 'L', 'XL']
export const MAX_QTY = 10

export function formatPrice(value) {
  return rupiah.format(Number(value) || 0)
}

export function isAvailable(product) {
  return String(product?.stockStatus || '').toLowerCase() === 'tersedia'
}

export function whatsappNumber(phone) {
  return String(phone || '').replace(/\D/g, '')
}

export function whatsappLink(phone, message) {
  const digits = whatsappNumber(phone)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildOrderMessage({ product, size, quantity, name, address, note }) {
  const lines = [
    `Halo Admin ${BRAND}, saya ingin memesan:`,
    '',
    `Produk: ${product.name}`,
    `Ukuran: ${size}`,
    `Jumlah: ${quantity}`,
    `Subtotal: ${formatPrice(product.price * quantity)}`,
    `Nama: ${name.trim()}`,
    `Alamat: ${address.trim()}`,
  ]

  if (note.trim()) {
    lines.push(`Catatan: ${note.trim()}`)
  }

  lines.push(
    '',
    'Boleh konfirmasi stok, ongkir, dan cara pembayarannya? Terima kasih.',
  )

  return lines.join('\n')
}
