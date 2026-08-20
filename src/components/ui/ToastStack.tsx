import { useEffect } from 'react'
import { useStore } from '../../state/Store'

export function ToastStack() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex w-[min(380px,calc(100%-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} onDone={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ id, message, onDone }: { id: string; message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800)
    return () => clearTimeout(t)
  }, [id, onDone])
  return (
    <div className="pointer-events-auto rounded-lg bg-navy px-4 py-3 text-sm text-white">
      {message}
    </div>
  )
}
