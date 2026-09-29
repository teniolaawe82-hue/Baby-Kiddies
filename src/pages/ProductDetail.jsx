import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('id', id)
        .eq('is_active', true)
        .single()
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  function handleAddToCart() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-cream-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-cream-200 rounded-lg w-24 animate-pulse" />
            <div className="h-8 bg-cream-200 rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-cream-200 rounded-lg animate-pulse" />
            <div className="h-4 bg-cream-200 rounded-lg w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-neutral-700 font-medium mb-2">Product not found</p>
        <Link to="/shop" className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : [null]
  const inStock = product.stock_quantity > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
        <Link to="/" className="hover:text-neutral-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-neutral-600 transition-colors">Shop</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link
              to={`/shop?category=${product.categories.slug}`}
              className="hover:text-neutral-600 transition-colors"
            >
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-700 truncate max-w-40">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-square bg-cream-200 rounded-3xl overflow-hidden mb-4">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-30">🍼</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? 'border-blue-400' : 'border-cream-300'
                  }`}
                >
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-cream-200 flex items-center justify-center text-xl">🍼</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categories?.name && (
            <Link
              to={`/shop?category=${product.categories.slug}`}
              className="inline-block text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3 hover:text-blue-600"
            >
              {product.categories.name}
            </Link>
          )}

          <h1 className="font-serif text-3xl text-neutral-800 mb-4 leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-semibold text-neutral-800 mb-6">
            ₦{Number(product.price).toLocaleString()}
          </p>

          {/* Stock status */}
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full mb-6 ${
            inStock ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
          }`}>
            <Package size={14} />
            {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-2">About this product</h2>
              <p className="text-neutral-500 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || added}
            className={`w-full flex items-center justify-center gap-2.5 font-medium py-4 rounded-2xl text-sm transition-all duration-200 ${
              added
                ? 'bg-blue-400 text-white'
                : inStock
                ? 'bg-pink-400 hover:bg-pink-500 text-white'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <><Check size={18} /> Added to Cart</>
            ) : (
              <><ShoppingCart size={18} /> {inStock ? 'Add to Cart' : 'Out of Stock'}</>
            )}
          </button>

          <Link to="/shop">
            <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              <ArrowLeft size={15} /> Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
