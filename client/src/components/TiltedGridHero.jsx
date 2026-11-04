import { useEffect, useId, useRef, useState } from 'react'
import './TiltedGridHero.css'

/* Satu baris gambar berputar mengelilingi silinder: bagian tengah terlihat
 * datar, ujung-ujungnya melengkung ke arah layar lalu memudar. Karena kotak
 * CSS tidak bisa dibengkokkan, tiap ubin dipotong menjadi irisan tipis dan
 * setiap irisan diputar sedikit pada sumbu silinder. */

// Irisan per ubin. Lebih sedikit mulai terlihat sebagai segitiga.
const SLICES = 16

// Jarak kamera dari layar, sebagai kelipatan jari-jari silinder.
const CAMERA = 1.6

/**
 * Jari-jari silinder, sebagai bagian dari lebar hero, yang menempatkan tepi
 * bingkai `bend` radian di sepanjang busur bila dilihat lewat kamera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, diselesaikan untuk r.
 */
function arc(bend) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend))
}

// Ubin tidak pernah lebih lebar dari bagian ini dari hero, agar di ponsel
// ubin tetangga tetap terlihat.
const MAX_WIDTH = 55

/**
 * Menempatkan loop pada silinder. Sudut dikembalikan dalam derajat: `unit`
 * adalah busur yang ditempuh satu tinggi ubin, `limit` seberapa jauh pusat
 * ubin bisa pergi sebelum seluruh ubin keluar layar, dan `sweep` seberapa
 * jauh ujung loop berada. Loop melewati `limit`, sehingga ubin hanya
 * membungkus saat tidak terlihat.
 */
function measure(width, height, tile, aspect, gap, bend) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  )
  const radius = width * arc(bend)
  if (!(h > 0) || !(radius > 0)) {
    return { columns: 2, sweep: 0, unit: 0, limit: 0 }
  }
  const deg = (rad) => (rad * 180) / Math.PI
  const unit = deg(h / radius)
  const pitch = (aspect + gap / 100) * unit
  const limit = deg(bend) + (aspect * unit) / 2
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)))
  const round = (n) => +n.toFixed(4)
  const sweep = round((columns * pitch) / 2)
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  }
}

/**
 * @param {{
 *   images: { src: string, alt?: string }[],
 *   speed?: number,
 *   tileHeight?: number,
 *   aspectRatio?: number,
 *   gap?: number,
 *   axis?: number,
 *   curve?: number,
 *   fade?: number,
 *   children?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className = '',
  style,
  ...props
}) {
  const ref = useRef(null)
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const orbit = `tgh-o-${id}`
  const tile = `tgh-t-${id}`
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180

  // Null sampai observer selesai mengukur hero, sehingga tata letak awal
  // yang salah ukuran tidak pernah tampil.
  const [layout, setLayout] = useState(null)

  // Gambar yang ditampilkan tiap ubin, sebagai posisi dalam deretan gambar.
  // Hanya berubah saat ubin membungkus, di luar pandangan.
  const [shown, setShown] = useState({})

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend)
      setLayout((prev) =>
        prev?.columns === next.columns &&
        prev.sweep === next.sweep &&
        prev.unit === next.unit
          ? prev
          : next,
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [tileHeight, aspectRatio, gap, bend])

  // Muat semua gambar lebih awal. Ubin mengambil gambar berikutnya tepat
  // sebelum kembali terlihat, terlalu telat untuk mulai memuatnya saat itu.
  useEffect(() => {
    for (const { src } of images) {
      const preload = new Image()
      preload.src = src
    }
  }, [images])

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend)

  // Setiap panjang adalah kelipatan tinggi ubin, yang mengikuti tinggi hero
  // sampai MAX_WIDTH membatasinya di layar sempit.
  const u = (n) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`

  const r = 100 * arc(bend)
  const radius = `${+r.toFixed(3)}cqw`
  // Keluar ke sumbu, berputar, masuk lagi.
  const turn = (deg) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`

  // Di luar `limit` ubin sepenuhnya keluar layar, jadi disembunyikan.
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4)
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    // Menjeda, bukan menghapus animasi, menjaga baris tetap utuh: setiap
    // ubin sudah ditempatkan oleh delay negatifnya.
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`

  const share = aspectRatio / SLICES
  const duration = columns * speed
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${
    100 - fade
  }%,transparent)`

  return (
    <div
      ref={ref}
      className={`tgh ${className}`.trim()}
      {...props}
      style={{ containerType: 'size', ...style }}
    >
      <style>{css}</style>

      <div
        aria-hidden="true"
        className={`tgh__band${layout ? ' is-ready' : ''}`}
        style={{
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          // Ubin `columns - 1` mulai paling dekat pintu keluar dan ubin 0
          // paling belakang, sehingga urutannya sesuai kemunculan.
          const first = columns - 1 - t
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)]
          return (
            <div
              key={t}
              className={`tgh__tile ${tile}`}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: 'preserve-3d',
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(event) => {
                // elapsedTime menghitung seluruh loop, termasuk event yang terlewat.
                const lap = Math.round(event.elapsedTime / duration)
                setShown((prev) => {
                  const next = lap * columns + first
                  return prev[t] === next ? prev : { ...prev, [t]: next }
                })
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div key={k} className="tgh__slice" style={{
                  // Setiap irisan mulai dari pusat ubin dan diputar ke
                  // tempatnya sendiri pada busur.
                  left: u((aspectRatio - share) / 2),
                  // Satu piksel lebih lebar dari bagiannya, agar irisan
                  // bertetangga bertumpuk dan tidak ada garis rambut.
                  width:
                    k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                  height: u(1),
                  transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                }}>
                  {img ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? '') : ''}
                      draggable={false}
                      className="tgh__img"
                      style={{
                        left: u(-k * share),
                        width: u(aspectRatio),
                        height: u(1),
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {children}
    </div>
  )
}

export default TiltedGridHero
