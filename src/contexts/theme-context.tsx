'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
})

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_theme') as Theme | null
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved)
        document.documentElement.setAttribute('data-admin-theme', saved)
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          setThemeState('dark')
          document.documentElement.setAttribute('data-admin-theme', 'dark')
        }
      }
    } catch {}
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    try {
      localStorage.setItem('admin_theme', t)
      document.documentElement.setAttribute('data-admin-theme', t)
    } catch {}
  }

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAdminTheme() {
  return useContext(ThemeContext)
}
