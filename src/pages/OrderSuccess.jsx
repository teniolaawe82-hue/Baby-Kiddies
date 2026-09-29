import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={36} className="text-blue-500" />
      </div>

      <h1 className="font-serif text-3xl text-neutral-800 mb-3">Order Placed! 🎉</h1>
      <p className="text-neutral-500 mb-2">
        Thank you for your order. We're getting it ready for you!
      </p>

      {orderId && (
        <div className="bg-cream-200 border border-cream-300 rounded-2xl px-5 py-4 mt-6 mb-8">
          <p className="text-xs text-neutral-400 mb-1">Order Reference</p>
          <p className="font-mono text-sm text-neutral-700 break-all">{orderId}</p>
        </div>
      )}

      <div className="bg-cream-50 border border-cream-300 rounded-2xl p-5 mb-8 text-left">
        <div className="flex items-start gap-3">
          <Package size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-1">What happens next?</p>
            <ul className="text-sm text-neutral-500 space-y-1.5">
              <li>• We'll confirm your order and prepare it for shipping</li>
              <li>• Our team will contact you with delivery details</li>
              <li>• You'll receive your order within 2–5 business days</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Continue Shopping <ArrowRight size={15} />
        </Link>
        <Link
          to="/account"
          className="inline-flex items-center justify-center gap-2 border border-blue-300 text-blue-500 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl text-sm transition-colors"
        >
          View My Orders
        </Link>
      </div>
    </div>
  )
}
