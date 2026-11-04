export default function CategoryPilss({ categories, activeCategory, onSelect }) {
  return (
    <div className="category-pills" role="group" aria-label="Filter kategori">
      <button
        type="button"
        className={`category-pill${activeCategory ? '' : ' is-active'}`}
        aria-pressed={!activeCategory}
        onClick={() => onSelect('')}
      >
        Semua
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category.id}
          className={`category-pill${
            activeCategory === category.id ? ' is-active' : ''
          }`}
          aria-pressed={activeCategory === category.id}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
