import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Package } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Shop', to: '/shop' },
  { label: 'Clothing', to: '/shop?category=clothing' },
  { label: 'Toys', to: '/shop?category=toys' },
  { label: 'Nursery', to: '/shop?category=nursery' },
  { label: 'Feeding', to: '/shop?category=feeding' },
]

export default function Navbar() {
  const { totalItems, toggleCart } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-sm border-b border-cream-300">
      {/* Announcement Bar */}
      <div className="bg-blue-300 text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        Free delivery on orders over ₦20,000 🚚
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">9</span>
            </div>
            <span className="font-semibold text-neutral-800 text-lg tracking-tight">
              Nice Up <span className="text-pink-400">Kiddies</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-xl font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-cream-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={toggleCart}
              id="cart-button"
              className="relative p-2.5 rounded-xl text-neutral-600 hover:bg-cream-200 hover:text-neutral-900 transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2.5 rounded-xl text-neutral-600 hover:bg-cream-200 hover:text-neutral-900 transition-colors"
              >
                <User size={20} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-cream-50 border border-cream-300 rounded-2xl shadow-card py-2 z-50">
                  {user ? (
                    <>
                      <p className="px-4 py-2 text-xs text-neutral-400 truncate border-b border-cream-200 mb-1">
                        {user.email}
                      </p>
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-200 transition-colors"
                      >
                        <Package size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <User size={15} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-200 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-200 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/login?tab=signup"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-200 transition-colors"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2.5 rounded-xl text-neutral-600 hover:bg-cream-200 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-cream-300 pt-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm rounded-xl font-medium transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-neutral-700 hover:bg-cream-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
