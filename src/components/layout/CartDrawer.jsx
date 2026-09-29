import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const FREE_SHIPPING_THRESHOLD = 20000

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, totalItems } = useCart()

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 overlay-enter"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col shadow-modal cart-drawer-enter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-300">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-neutral-700" />
            <h2 className="font-semibold text-neutral-800">
              Cart
              {totalItems > 0 && (
                <span className="ml-2 text-xs bg-pink-100 text-pink-500 font-medium px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-cream-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping tracker */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs text-blue-600 mb-2">
              {remaining === 0
                ? '🎉 You qualify for free delivery!'
                : `Add ₦${remaining.toLocaleString()} more for free delivery`}
            </p>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center">
                <ShoppingBag size={28} className="text-neutral-300" />
              </div>
              <div>
                <p className="font-medium text-neutral-700 mb-1">Your cart is empty</p>
                <p className="text-sm text-neutral-400">Add items to get started</p>
              </div>
              <button
                onClick={closeCart}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} onRemove={removeItem} onUpdateQty={updateQty} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-300 px-6 py-5 bg-cream-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-500">Subtotal</span>
              <span className="font-semibold text-neutral-800 text-base">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
            <Link to="/checkout" onClick={closeCart}>
              <button className="w-full flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-medium py-3.5 rounded-xl text-sm transition-colors">
                Checkout <ArrowRight size={16} />
              </button>
            </Link>
            <button
              onClick={closeCart}
              className="w-full mt-2 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function CartItem({ item, onRemove, onUpdateQty }) {
  const imageUrl = item.images?.[0] || null

  return (
    <div className="flex gap-3.5 py-3 border-b border-cream-200 last:border-0">
      {/* Image */}
      <div className="w-18 h-18 rounded-xl bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🍼</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">{item.name}</p>
        <p className="text-sm text-neutral-500 mt-0.5">₦{Number(item.price).toLocaleString()}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Qty control */}
          <div className="flex items-center border border-cream-300 rounded-xl overflow-hidden">
            <button
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              className="p-1.5 hover:bg-cream-200 transition-colors"
            >
              <Minus size={13} className="text-neutral-600" />
            </button>
            <span className="px-3 text-sm font-medium text-neutral-800">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              className="p-1.5 hover:bg-cream-200 transition-colors"
            >
              <Plus size={13} className="text-neutral-600" />
            </button>
          </div>

          {/* Line total */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-neutral-800">
              ₦{(item.price * item.quantity).toLocaleString()}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-neutral-300 hover:text-pink-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
