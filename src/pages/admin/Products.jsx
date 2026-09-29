import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Star, Eye, EyeOff, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'

const EMPTY_FORM = {
  name: '', description: '', price: '', stock_quantity: '',
  category_id: '', is_featured: false, is_active: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts(prods || [])
    setCategories(cats || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setExistingImages([])
    setError('')
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      is_active: product.is_active,
    })
    setImageFiles([])
    setExistingImages(product.images || [])
    setError('')
    setModalOpen(true)
  }

  async function uploadImages() {
    const urls = []
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(path, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      setError('Name and price are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const newImageUrls = await uploadImages()
      const allImages = [...existingImages, ...newImageUrls]

      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity) || 0,
        category_id: form.category_id || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
        images: allImages,
      }

      if (editProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }

      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  async function toggleActive(product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  function removeExistingImage(url) {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Products</h1>
          <p className="text-neutral-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-cream-50 border border-cream-300 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded-xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-neutral-600 font-medium mb-1">No products yet</p>
            <p className="text-neutral-400 text-sm">Click "Add Product" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-200 border-b border-cream-300">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-cream-100 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cream-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : <span className="text-lg">🍼</span>}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 line-clamp-1">{product.name}</p>
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-pink-400">
                              <Star size={10} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{product.categories?.name || '—'}</td>
                    <td className="px-5 py-4 font-medium text-neutral-800">₦{Number(product.price).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`font-medium ${product.stock_quantity === 0 ? 'text-pink-400' : 'text-neutral-700'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleActive(product)} className="focus:outline-none">
                        {product.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                            <Eye size={11} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-400 px-2 py-1 rounded-full font-medium">
                            <EyeOff size={11} /> Hidden
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-neutral-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Product Name *" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base"
                placeholder="e.g. Organic Cotton Romper"
              />
            </FormField>
            <FormField label="Category">
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input-base"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Price (₦) *" required>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-base"
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Stock Quantity">
              <input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="input-base"
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="input-base resize-none"
              placeholder="Describe this product..."
            />
          </FormField>

          {/* Images */}
          <FormField label="Product Images">
            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImages.map((url) => (
                  <div key={url} className="relative w-16 h-16 rounded-xl overflow-hidden border border-cream-300">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-0.5 right-0.5 bg-neutral-800/60 text-white rounded-full p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 hover:text-neutral-800 border border-dashed border-cream-400 rounded-xl px-4 py-3 hover:border-blue-300 transition-colors">
              <Upload size={16} />
              {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
              />
            </label>
          </FormField>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 accent-pink-400 rounded"
              />
              <span className="text-sm text-neutral-700">Featured product</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-blue-400 rounded"
              />
              <span className="text-sm text-neutral-700">Active (visible in store)</span>
            </label>
          </div>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm text-neutral-600 hover:text-neutral-800 border border-cream-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .input-base {
          width: 100%;
          padding: 10px 14px;
          background: var(--color-cream-100);
          border: 1px solid var(--color-cream-300);
          border-radius: 12px;
          font-size: 0.875rem;
          color: var(--color-neutral-800);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus { border-color: var(--color-blue-300); }
        select.input-base { cursor: pointer; }
      `}</style>
    </div>
  )
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
        {label}{required && <span className="text-pink-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
