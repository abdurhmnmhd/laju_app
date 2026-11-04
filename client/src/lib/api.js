const CONNECTION_ERROR =
  'Tidak dapat terhubung ke server. Pastikan API berjalan di http://localhost:5000 (cd server && npm run dev).'

function statusError(status) {
  if (status === 502 || status === 503 || status === 504) {
    return 'API tidak merespons. Pastikan server berjalan di http://localhost:5000 (cd server && npm run dev).'
  }
  if (status === 404) {
    return 'Endpoint API tidak ditemukan.'
  }
  return `Server mengirim respons tidak valid (HTTP ${status}).`
}

/**
 * Fetch + parse JSON tanpa melempar error mentah seperti
 * "Unexpected end of JSON input" saat body kosong / bukan JSON.
 */
export async function requestJson(path, options) {
  let response

  try {
    response = await fetch(path, options)
  } catch {
    throw new Error(CONNECTION_ERROR)
  }

  const raw = await response.text()
  let payload = null

  if (raw.trim()) {
    try {
      payload = JSON.parse(raw)
    } catch {
      payload = null
    }
  }

  if (!payload) {
    throw new Error(statusError(response.status))
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || statusError(response.status))
  }

  return payload
}
