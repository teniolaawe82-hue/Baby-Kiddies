import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/shop/ProductCard'

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at:desc' },
  { label: 'Price: Low to High', value: 'price:asc' },
  { label: 'Price: High to Low', value: 'price:desc' },
  { label: 'Name A-Z', value: 'name:asc' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('created_at:desc')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const selectedCategory = searchParams.get('category') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const [col, order] = sort.split(':')

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order(col, { ascending: order === 'asc' })

    if (selectedCategory) {
      // filter by category slug
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [selectedCategory, sort, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  function setCategory(slug) {
    const params = new URLSearchParams(searchParams)
    if (slug) params.set('category', slug)
    else params.delete('category')
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800">Shop</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block
          w-full lg:w-56 shrink-0
        `}>
          <div className="bg-cream-50 border border-cream-300 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-neutral-800 text-sm">Filters</h2>
              {selectedCategory && (
                <button
                  onClick={() => setCategory('')}
                  className="text-xs text-pink-400 hover:text-pink-500 flex items-center gap-1"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">Categories</p>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                    !selectedCategory ? 'bg-blue-100 text-blue-600 font-medium' : 'text-neutral-600 hover:bg-cream-200'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'text-neutral-600 hover:bg-cream-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search + Sort toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:border-blue-300 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                className="lg:hidden flex items-center gap-2 border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-700 bg-cream-50"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-cream-200 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-neutral-700 font-medium mb-1">No products found</p>
              <p className="text-neutral-400 text-sm">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('') }}
                className="mt-5 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
