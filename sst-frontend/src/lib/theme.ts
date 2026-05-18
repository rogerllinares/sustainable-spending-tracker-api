export type Theme = "light" | "dark"

const STORAGE_KEY = "sst-theme"

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === "light" || v === "dark" ? v : null
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

export function setTheme(theme: Theme): void {
  window.localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getSystemTheme()
  applyTheme(theme)
  return theme
}
