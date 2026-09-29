import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Tag, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, categories: 0, revenue: 0, pending: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: products },
        { count: orders },
        { count: categories },
        { count: pending },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*, customers(full_name)').order('created_at', { ascending: false }).limit(5),
      ])

      // Calculate revenue
      const { data: revenueData } = await supabase.from('orders').select('total_amount').neq('status', 'cancelled')
      const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

      setStats({ products: products || 0, orders: orders || 0, categories: categories || 0, revenue, pending: pending || 0 })
      setRecentOrders(ordersData || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-pink-100 text-pink-500' },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'bg-cream-300 text-neutral-600' },
    { label: 'Total Revenue', value: `₦${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-cream-50 border border-cream-300 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-neutral-800">
              {loading ? <span className="bg-cream-200 rounded w-16 h-6 block animate-pulse" /> : value}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending notice */}
      {stats.pending > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8">
          <Clock size={18} className="text-pink-400 shrink-0" />
          <p className="text-sm text-pink-700">
            You have <strong>{stats.pending}</strong> pending {stats.pending === 1 ? 'order' : 'orders'} waiting to be processed.{' '}
            <a href="/admin/orders" className="underline font-medium">View Orders →</a>
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-cream-50 border border-cream-300 rounded-2xl">
        <div className="px-6 py-4 border-b border-cream-300">
          <h2 className="font-semibold text-neutral-800 text-sm">Recent Orders</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-cream-200 rounded-xl animate-pulse" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-cream-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-neutral-400">{order.customers?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-800">₦{Number(order.total_amount).toLocaleString()}</p>
                  <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'pending' ? 'bg-neutral-100 text-neutral-500' :
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                    order.status === 'cancelled' ? 'bg-pink-50 text-pink-500' :
                    'bg-blue-50 text-blue-500'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
