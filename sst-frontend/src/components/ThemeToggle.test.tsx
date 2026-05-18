import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeToggle } from "./ThemeToggle"

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  it("renders a toggle button with aria-label", () => {
    render(<ThemeToggle />)
    expect(screen.getByRole("button")).toHaveAccessibleName(/light mode|dark mode/i)
  })

  it("toggles the dark class on documentElement when clicked", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    await user.click(screen.getByRole("button"))
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    await user.click(screen.getByRole("button"))
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("persists theme choice to localStorage", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole("button"))
    expect(localStorage.getItem("sst-theme")).toBe("dark")
  })
})
