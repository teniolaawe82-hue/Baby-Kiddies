import { Link } from 'react-router-dom'

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'Clothing', to: '/shop?category=clothing' },
    { label: 'Toys', to: '/shop?category=toys' },
    { label: 'Nursery', to: '/shop?category=nursery' },
    { label: 'Feeding', to: '/shop?category=feeding' },
  ],
  Help: [
    { label: 'Track Order', to: '/account' },
    { label: 'Returns', to: '#' },
    { label: 'Shipping Info', to: '#' },
    { label: 'FAQs', to: '#' },
  ],
  Account: [
    { label: 'My Account', to: '/account' },
    { label: 'Sign In', to: '/login' },
    { label: 'Register', to: '/login?tab=signup' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-cream-200 border-t border-cream-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <span className="font-semibold text-neutral-800 text-lg">
                Nice Up <span className="text-pink-400">Kiddies</span>
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-56">
              Thoughtfully curated baby essentials for every stage of your little one's journey.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-4">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cream-300 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Nice Up Kiddies. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Designed with ♥ for little ones
          </p>
        </div>
      </div>
    </footer>
  )
}
