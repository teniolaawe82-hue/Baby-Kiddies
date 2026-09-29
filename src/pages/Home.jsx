import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Leaf, Truck, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/shop/ProductCard'

const categories = [
  { label: 'Clothing', slug: 'clothing', emoji: '👕', bg: 'bg-blue-100', text: 'text-blue-600' },
  { label: 'Toys', slug: 'toys', emoji: '🧸', bg: 'bg-pink-100', text: 'text-pink-500' },
  { label: 'Nursery', slug: 'nursery', emoji: '🛏️', bg: 'bg-cream-300', text: 'text-neutral-600' },
  { label: 'Feeding', slug: 'feeding', emoji: '🍼', bg: 'bg-blue-50', text: 'text-blue-500' },
  { label: 'Bath & Skincare', slug: 'bath-skincare', emoji: '🛁', bg: 'bg-pink-50', text: 'text-pink-400' },
]

const trustItems = [
  { icon: ShieldCheck, label: 'Baby Safe', desc: 'All products meet safety standards' },
  { icon: Leaf, label: 'Organic Options', desc: 'Thoughtfully sourced materials' },
  { icon: Truck, label: 'Fast Delivery', desc: 'Nationwide delivery available' },
  { icon: Heart, label: 'Curated With Love', desc: 'Hand-picked for your little one' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8)
      setFeatured(data || [])
      setLoading(false)
    }
    loadFeatured()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-cream-100 border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 max-w-xl">
            <span className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              Trusted by 10,000+ parents
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-neutral-800 leading-tight mb-5">
              Everything your little one needs
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed mb-8 max-w-md">
              Thoughtfully curated baby essentials — from their first smile to their first steps.
              Safe, beautiful, and made to last.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-colors"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop?featured=true"
                className="inline-flex items-center gap-2 border border-blue-300 text-blue-500 hover:bg-blue-50 font-medium px-7 py-3.5 rounded-xl text-sm transition-colors"
              >
                Featured Items
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 md:w-88 md:h-88 bg-blue-100 rounded-3xl flex items-center justify-center">
                <span className="text-9xl">🍼</span>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-cream-50 border border-cream-300 rounded-2xl px-4 py-2.5 shadow-card">
                <p className="text-xs text-neutral-400">New arrivals</p>
                <p className="text-sm font-semibold text-neutral-800">This week</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-pink-400 text-white rounded-2xl px-4 py-2.5 shadow-card">
                <p className="text-xs opacity-80">Happy babies</p>
                <p className="text-sm font-semibold">10,000+ 🎉</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">Shop by Category</h2>
            <p className="text-neutral-500 text-sm mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/shop" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
            All Products <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className={`${cat.bg} rounded-2xl p-5 text-center hover:shadow-card transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <p className={`text-sm font-medium ${cat.text}`}>{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-cream-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-800">Featured Products</h2>
              <p className="text-neutral-500 text-sm mt-1">Hand-picked just for you</p>
            </div>
            <Link to="/shop" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-cream-100 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-4xl mb-3">🛍️</p>
              <p>No featured products yet. Add some from the admin panel!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center p-5 bg-cream-50 border border-cream-300 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Icon size={22} className="text-blue-500" />
              </div>
              <p className="font-medium text-neutral-800 text-sm mb-1">{label}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
