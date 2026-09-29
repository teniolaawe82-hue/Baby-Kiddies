import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  pending:    { label: 'Pending',    icon: Clock,        color: 'text-neutral-500',  bg: 'bg-neutral-100' },
  processing: { label: 'Processing', icon: Package,      color: 'text-blue-500',     bg: 'bg-blue-50' },
  shipped:    { label: 'Shipped',    icon: Truck,        color: 'text-blue-600',     bg: 'bg-blue-100' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,  color: 'text-green-600',    bg: 'bg-green-50' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,      color: 'text-pink-500',     bg: 'bg-pink-50' },
}

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function loadOrders() {
      // Get customer record for this user
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customer) { setLoading(false); return }

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, images))')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }
    loadOrders()
  }, [user])

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">My Account</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-neutral-500 hover:text-neutral-700 border border-cream-300 px-4 py-2 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Orders */}
      <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-4">Order History</h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-cream-200 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-cream-50 border border-cream-300 rounded-2xl">
          <Package size={36} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium mb-1">No orders yet</p>
          <p className="text-neutral-400 text-sm mb-5">When you place an order, it'll show up here</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            const StatusIcon = status.icon
            return (
              <div key={order.id} className="bg-cream-50 border border-cream-300 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium text-neutral-800 text-sm">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-NG', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 bg-cream-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {item.products?.images?.[0] ? (
                          <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">🍼</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-700 truncate">{item.product_name}</p>
                        <p className="text-neutral-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-neutral-700 font-medium shrink-0">
                        ₦{(item.unit_price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-200 pt-3 flex justify-between text-sm">
                  <span className="text-neutral-500">Total</span>
                  <span className="font-semibold text-neutral-800">₦{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
