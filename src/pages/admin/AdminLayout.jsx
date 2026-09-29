import { Navigate, Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Tag },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
]

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-cream-200 border-r border-cream-300 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-cream-300">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="font-semibold text-neutral-800 text-sm">
              Nice Up <span className="text-pink-400">Kiddies</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-400 ml-9">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-200 text-blue-700'
                    : 'text-neutral-600 hover:bg-cream-300 hover:text-neutral-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-neutral-500 hover:text-neutral-700 hover:bg-cream-300 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-cream-100">
        <Outlet />
      </main>
    </div>
  )
}
