import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/layout/CartDrawer'
import { ToastProvider } from './components/ui/Toast'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Account from './pages/Account'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Admin routes — no store Navbar/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Storefront routes */}
        <Route path="/*" element={<StoreFront />} />
      </Routes>
    </ToastProvider>
  )
}

function StoreFront() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <p className="text-6xl mb-4">🍼</p>
              <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Page Not Found</h1>                                                                                               
              <p className="text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-pink-400 hover:bg-pink-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
