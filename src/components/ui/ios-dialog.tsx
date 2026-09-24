'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

// Types
export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

// Global Event Emitters
type Listener<T> = (data: T) => void
const toastListeners = new Set<Listener<ToastOptions>>()
let confirmResolver: ((value: boolean) => void) | null = null
const confirmListeners = new Set<Listener<ConfirmOptions | null>>()

export function showIosToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3400) {
  toastListeners.forEach((fn) => fn({ message, type, duration }))
}

export function showIosAlert(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    confirmResolver = () => resolve()
    confirmListeners.forEach((fn) =>
      fn({
        title,
        message,
        confirmText: 'OK',
        cancelText: '',
      })
    )
  })
}

export function showIosConfirm({
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDestructive = false,
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    confirmResolver = resolve
    confirmListeners.forEach((fn) =>
      fn({
        title,
        message,
        confirmText,
        cancelText,
        isDestructive,
      })
    )
  })
}

/**
 * Apple iOS System UI Host Component
 * Renders Dynamic Island-style Toast Notifications and Apple Alert Sheets
 */
export default function IosDialogContainer() {
  const [toast, setToast] = useState<ToastOptions | null>(null)
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)

  // Subscribe to toasts
  useEffect(() => {
    const handleToast: Listener<ToastOptions> = (options) => {
      setToast(options)
      setToastVisible(true)

      const timer = setTimeout(() => {
        setToastVisible(false)
        setTimeout(() => setToast(null), 300)
      }, options.duration || 3400)

      return () => clearTimeout(timer)
    }

    toastListeners.add(handleToast)
    return () => {
      toastListeners.delete(handleToast)
    }
  }, [])

  // Subscribe to confirm dialogs
  useEffect(() => {
    const handleConfirm: Listener<ConfirmOptions | null> = (options) => {
      if (options) {
        setConfirm(options)
        setConfirmVisible(true)
      } else {
        setConfirmVisible(false)
        setTimeout(() => setConfirm(null), 250)
      }
    }

    confirmListeners.add(handleConfirm)
    return () => {
      confirmListeners.delete(handleConfirm)
    }
  }, [])

  const handleConfirmAction = (result: boolean) => {
    setConfirmVisible(false)
    setTimeout(() => {
      setConfirm(null)
      if (confirmResolver) {
        confirmResolver(result)
        confirmResolver = null
      }
    }, 220)
  }

  return (
    <>
      {/* ─── Apple Dynamic Island / Capsule Toast ─── */}
      {toast && (
        <div
          className="fixed top-5 left-1/2 z-[99999] pointer-events-auto"
          style={{
            transform: `translateX(-50%) translateY(${toastVisible ? '0px' : '-24px'}) scale(${toastVisible ? 1 : 0.94})`,
            opacity: toastVisible ? 1 : 0,
            transition: 'all 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <div
            onClick={() => setToastVisible(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer select-none active:scale-[0.96] transition-transform duration-150"
            style={{
              background: 'rgba(24, 25, 28, 0.88)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.2)',
              maxWidth: '92vw',
            }}
          >
            {/* Status Icon */}
            <div className="shrink-0 flex items-center justify-center">
              {toast.type === 'error' && (
                <div className="w-5 h-5 rounded-full bg-[#FF453A]/20 flex items-center justify-center text-[#FF453A]">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 rounded-full bg-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
                  <Info className="w-3.5 h-3.5" />
                </div>
              )}
              {(!toast.type || toast.type === 'success') && (
                <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Message */}
            <p
              className="text-[13px] font-medium tracking-tight text-[#F2F1EF] whitespace-nowrap overflow-hidden text-ellipsis pr-1"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}
            >
              {toast.message}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setToastVisible(false)
              }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#F2F1EF] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Apple Alert / Confirmation Dialog ─── */}
      {confirm && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            opacity: confirmVisible ? 1 : 0,
            transition: 'opacity 0.22s ease-out',
          }}
          onClick={() => handleConfirmAction(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 320,
              maxWidth: '90vw',
              background: 'rgba(32, 33, 36, 0.92)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              border: '0.5px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 22,
              boxShadow: '0 24px 64px -8px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              transform: `scale(${confirmVisible ? 1 : 0.92})`,
              opacity: confirmVisible ? 1 : 0,
              transition: 'all 0.24s cubic-bezier(0.32, 0.72, 0, 1)',
              overflow: 'hidden',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
            }}
          >
            {/* Header info */}
            <div className="pt-6 pb-5 px-6 text-center">
              <h3 className="text-[17px] font-semibold tracking-tight text-[#FFFFFF] mb-1.5">
                {confirm.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#A1A1A6]">
                {confirm.message}
              </p>
            </div>

            {/* iOS Action Buttons Container */}
            <div
              className="flex"
              style={{
                borderTop: '0.5px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {confirm.cancelText ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleConfirmAction(false)}
                    className="flex-1 py-3.5 text-center text-[16px] font-medium text-[#0A84FF] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all"
                    style={{
                      borderRight: '0.5px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {confirm.cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmAction(true)}
                    className={`flex-1 py-3.5 text-center text-[16px] font-semibold active:bg-white/10 active:scale-[0.98] transition-all ${
                      confirm.isDestructive
                        ? 'text-[#FF453A] hover:bg-[#FF453A]/10'
                        : 'text-[#0A84FF] hover:bg-white/5'
                    }`}
                  >
                    {confirm.confirmText}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConfirmAction(true)}
                  className="w-full py-3.5 text-center text-[16px] font-semibold text-[#0A84FF] hover:bg-white/5 active:bg-white/10 active:scale-[0.98] transition-all"
                >
                  {confirm.confirmText || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
