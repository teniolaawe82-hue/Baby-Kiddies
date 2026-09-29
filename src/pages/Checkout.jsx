import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shipping = subtotal >= 20000 ? 0 : 2500
  const total = subtotal + shipping

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      // 1. Create or find customer
      const customerPayload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        user_id: user?.id || null,
      }
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .insert(customerPayload)
        .select()
        .single()
      if (customerErr) throw customerErr

      // 2. Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: total,
          shipping_address: {
            address: form.address,
            city: form.city,
            state: form.state,
          },
          notes: form.notes || null,
          status: 'pending',
        })
        .select()
        .single()
      if (orderErr) throw orderErr

      // 3. Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }))
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      // 4. Clear cart and navigate to success
      clearCart()
      navigate(`/order-success?order=${order.id}`)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="text-neutral-300 mx-auto mb-4" />
        <h2 className="font-semibold text-neutral-700 text-lg mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 text-sm mb-6">Add some items before checking out</p>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium">
          <ArrowLeft size={15} /> Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold text-neutral-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact */}
          <section className="bg-cream-50 border border-cream-300 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-800 mb-5 text-sm uppercase tracking-wider">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} required className="sm:col-span-2" />
            </div>
          </section>

          {/* Shipping */}
          <section className="bg-cream-50 border border-cream-300 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-800 mb-5 text-sm uppercase tracking-wider">Delivery Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Street Address" name="address" value={form.address} onChange={handleChange} required className="sm:col-span-2" />
              <Field label="City" name="city" value={form.city} onChange={handleChange} required />
              <Field label="State" name="state" value={form.state} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Order Notes (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-cream-50 border border-cream-300 rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-neutral-800 mb-5 text-sm uppercase tracking-wider">Order Summary</h2>

            <div className="divide-y divide-cream-200 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="text-neutral-700 font-medium line-clamp-1">{item.name}</p>
                    <p className="text-neutral-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-neutral-800 font-medium shrink-0 ml-4">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-300 pt-4 space-y-2.5">
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-blue-500 font-medium">Free</span> : `₦${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-neutral-800 border-t border-cream-300 pt-2.5 text-base">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-4 rounded-2xl text-sm transition-colors"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Placing Order...</> : 'Place Order'}
            </button>

            {!user && (
              <p className="text-xs text-neutral-400 text-center mt-4">
                <Link to="/login" className="text-blue-500 hover:underline">Sign in</Link> to track your orders
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, required, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-blue-300 transition-colors"
      />
    </div>
  )
}
