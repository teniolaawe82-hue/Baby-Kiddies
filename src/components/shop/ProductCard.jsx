import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const imageUrl = product.images?.[0] || null
  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="group bg-cream-50 border border-cream-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-cream-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">🍼</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="bg-pink-300 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-neutral-700 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {/* Category */}
        {product.categories?.name && (
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-1">
            {product.categories.name}
          </p>
        )}

        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-neutral-800 text-sm leading-snug mb-2 hover:text-blue-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <p className="text-base font-semibold text-neutral-800">
            ₦{Number(product.price).toLocaleString()}
          </p>

          <button
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 bg-pink-400 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all duration-200"
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
