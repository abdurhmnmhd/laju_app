import { CloseIcon, SearchIcon } from './Icons'

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-bar" role="search">
      <SearchIcon size={17} className="search-bar__icon" />
      <label className="visually-hidden" htmlFor="catalog-search">
        Cari produk
      </label>
      <input
        id="catalog-search"
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
        >
          <CloseIcon size={15} />
        </button>
      )}
    </div>
  )
}
