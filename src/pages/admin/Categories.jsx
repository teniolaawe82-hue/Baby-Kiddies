import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('name')
    setCategories(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function openAdd() {
    setEditCat(null)
    setForm({ name: '', slug: '' })
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat) {
    setEditCat(cat)
    setForm({ name: cat.name, slug: cat.slug })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { name: form.name, slug: form.slug || slugify(form.name) }
      if (editCat) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editCat.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)
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
    if (!confirm('Delete this category? Products in this category will become uncategorised.')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Categories</h1>
          <p className="text-neutral-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-cream-50 border border-cream-300 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-cream-200 rounded-xl animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="text-neutral-600 font-medium mb-1">No categories yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-200 border-b border-cream-300">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Products</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-cream-100 transition-colors">
                  <td className="px-5 py-4 font-medium text-neutral-800">{cat.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-neutral-400">{cat.slug}</td>
                  <td className="px-5 py-4 text-neutral-500">{cat.products?.[0]?.count ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-neutral-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value, slug: slugify(e.target.value) })}
              placeholder="e.g. Clothing"
              className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm focus:outline-none focus:border-blue-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated"
              className="w-full px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-300 transition-colors"
            />
          </div>
          {error && <div className="bg-pink-50 border border-pink-200 text-pink-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-neutral-600 border border-cream-300 rounded-xl hover:text-neutral-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editCat ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
