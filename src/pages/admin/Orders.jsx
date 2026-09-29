import { useEffect, useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending:    'bg-neutral-100 text-neutral-500',
  processing: 'bg-blue-50 text-blue-500',
  shipped:    'bg-blue-100 text-blue-600',
  delivered:  'bg-green-50 text-green-600',
  cancelled:  'bg-pink-50 text-pink-500',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const load = useCallback(async () => {
    let query = supabase
      .from('orders')
      .select('*, customers(full_name, email, phone), order_items(product_name, quantity, unit_price)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function updateStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Orders</h1>
          <p className="text-neutral-500 text-sm mt-1">{orders.length} {filter === 'all' ? 'total' : filter} orders</p>
        </div>
        {/* Filter tabs */}
        <div className="flex bg-cream-200 rounded-xl p-1 gap-1">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                filter === s ? 'bg-cream-50 text-neutral-800 shadow-soft' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream-50 border border-cream-300 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-cream-200 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-neutral-600 font-medium">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {orders.map((order) => (
              <div key={order.id}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-cream-100 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {order.customers?.full_name} • {new Date(order.created_at).toLocaleDateString('en-NG')}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-neutral-800 shrink-0">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </p>

                  {/* Status selector */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 capitalize ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === order.id && (
                  <div className="px-16 pb-5 bg-cream-50">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Customer info */}
                      <div>
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Customer</p>
                        <p className="text-sm text-neutral-700">{order.customers?.full_name}</p>
                        <p className="text-sm text-neutral-500">{order.customers?.email}</p>
                        <p className="text-sm text-neutral-500">{order.customers?.phone}</p>
                      </div>

                      {/* Shipping */}
                      <div>
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Shipping Address</p>
                        <p className="text-sm text-neutral-700">{order.shipping_address?.address}</p>
                        <p className="text-sm text-neutral-500">{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Items Ordered</p>
                      <div className="space-y-2">
                        {order.order_items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-neutral-700">{item.product_name} × {item.quantity}</span>
                            <span className="text-neutral-800 font-medium">₦{(item.unit_price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 bg-cream-200 rounded-xl px-4 py-3 text-sm text-neutral-600">
                        <span className="font-medium">Note: </span>{order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
