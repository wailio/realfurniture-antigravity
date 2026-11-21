'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface IosMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  checked?: boolean
  destructive?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface IosMenuProps {
  items: IosMenuItem[]
  isOpen: boolean
  onClose: () => void
  align?: 'left' | 'right'
  minWidth?: number | string
  className?: string
  style?: React.CSSProperties
}

/**
 * Authentic Apple iOS/macOS Frosted Glass Context Popover Menu
 * Exactly matches Image 5 from user references:
 * - Dark charcoal/slate frosted glass: rgba(40, 44, 52, 0.94) + blur(20px)
 * - 14px squircle radius, 1px translucent border
 * - Active checkmark indicator (✓)
 * - iOS system electric blue highlight (#0A84FF) on item hover
 */
export function IosMenu({
  items,
  isOpen,
  onClose,
  align = 'right',
  minWidth = 210,
  className = '',
  style = {},
}: IosMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className={`ios-popover-menu ${className}`}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        [align === 'right' ? 'right' : 'left']: 0,
        zIndex: 9999,
        minWidth,
        background: 'rgba(38, 43, 53, 0.94)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: 14,
        padding: '5px',
        boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.38), 0 6px 14px rgba(0, 0, 0, 0.18)',
        animation: 'iosMenuEnter 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transformOrigin: align === 'right' ? 'top right' : 'top left',
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => {
          const isDestructive = item.destructive

          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return
                if (item.onClick) item.onClick()
                onClose()
              }}
              className="ios-menu-item group"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                width: '100%',
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: isDestructive ? '#FF453A' : '#F5F5F7',
                fontSize: 13,
                fontWeight: 450,
                letterSpacing: '-0.01em',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.4 : 1,
                textAlign: 'left',
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (item.disabled) return
                e.currentTarget.style.background = isDestructive ? '#FF453A' : '#0A84FF'
                e.currentTarget.style.color = '#FFFFFF'
                const check = e.currentTarget.querySelector('.ios-check-icon') as HTMLElement
                if (check) check.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                if (item.disabled) return
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = isDestructive ? '#FF453A' : '#F5F5F7'
                const check = e.currentTarget.querySelector('.ios-check-icon') as HTMLElement
                if (check) check.style.color = '#0A84FF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                {/* Checkmark icon for selection */}
                <div style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.checked && (
                    <Check
                      className="ios-check-icon"
                      style={{ width: 13, height: 13, color: '#0A84FF', strokeWidth: 2.5 }}
                    />
                  )}
                </div>

                {item.icon && (
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                )}

                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </div>

              {item.badge !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#F5F5F7',
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * iOS-style Select Dropdown (as seen in Image 5 "All services" trigger)
 */
export interface IosSelectOption {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface IosSelectProps {
  options: IosSelectOption[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  className?: string
  buttonStyle?: React.CSSProperties
  menuStyle?: React.CSSProperties
  align?: 'left' | 'right'
}

export function IosSelect({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  className = '',
  buttonStyle = {},
  menuStyle = {},
  align = 'left',
}: IosSelectProps) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.id === value)

  const menuItems: IosMenuItem[] = options.map((opt) => ({
    id: opt.id,
    label: opt.label,
    icon: opt.icon,
    badge: opt.badge,
    checked: opt.id === value,
    onClick: () => onChange(opt.id),
  }))

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 13px',
          borderRadius: 9999,
          background: '#FFFFFF',
          border: '1px solid #DFE3E8',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          fontSize: 12.5,
          fontWeight: 550,
          color: '#0F172A',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...buttonStyle,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DFE3E8')}
      >
        {current?.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{current.icon}</span>}
        <span>{current?.label || placeholder}</span>
        <ChevronDown style={{ width: 13, height: 13, color: '#64748B', strokeWidth: 2 }} />
      </button>

      <IosMenu
        items={menuItems}
        isOpen={open}
        onClose={() => setOpen(false)}
        align={align}
        style={menuStyle}
      />
    </div>
  )
}

/**
 * Authentic Apple iOS Toggle Switch
 * Exactly as seen in Image 5 bottom right ("[O   ] Only be...")
 */
export interface IosToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  sublabel?: string
  size?: 'sm' | 'md'
  color?: string
}

export function IosToggle({
  checked,
  onChange,
  disabled = false,
  label,
  sublabel,
  size = 'md',
  color = '#34C759', // Apple iOS standard active green
}: IosToggleProps) {
  const width = size === 'sm' ? 36 : 44
  const height = size === 'sm' ? 20 : 26
  const knobSize = size === 'sm' ? 16 : 22
  const offset = checked ? width - knobSize - 2 : 2

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
      onClick={(e) => {
        if (disabled) return
        e.preventDefault()
        onChange(!checked)
      }}
    >
      {(label || sublabel) && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {label && <span style={{ fontSize: 13, fontWeight: 550, color: '#0F172A' }}>{label}</span>}
          {sublabel && <span style={{ fontSize: 11.5, color: '#64748B' }}>{sublabel}</span>}
        </div>
      )}

      {/* Switch track */}
      <div
        style={{
          width,
          height,
          borderRadius: 9999,
          background: checked ? color : '#E5E5EA',
          position: 'relative',
          transition: 'background-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
          flexShrink: 0,
        }}
      >
        {/* Switch thumb/knob */}
        <div
          style={{
            width: knobSize,
            height: knobSize,
            borderRadius: 9999,
            background: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.12)',
            position: 'absolute',
            top: 2,
            left: offset,
            transition: 'left 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
      </div>
    </label>
  )
}
