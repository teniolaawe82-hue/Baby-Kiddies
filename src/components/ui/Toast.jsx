import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ id, message, type, onRemove }) {
  const icons = {
    success: <CheckCircle size={16} className="text-blue-500 shrink-0" />,
    error: <XCircle size={16} className="text-pink-500 shrink-0" />,
    info: <Info size={16} className="text-neutral-500 shrink-0" />,
  }

  return (
    <div className="toast-enter pointer-events-auto flex items-center gap-3 bg-white border border-cream-300 rounded-xl px-4 py-3 shadow-card text-sm text-neutral-700 min-w-64 max-w-80">
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-neutral-300 hover:text-neutral-500 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
