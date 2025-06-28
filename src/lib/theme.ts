// Theme management utilities
import { ThemeMode } from "../types";

export function setTheme(theme: ThemeMode): void {
  const root = window.document.documentElement;
  
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  
  localStorage.setItem("theme", theme);
}

export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  
  const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
  
  if (savedTheme) {
    return savedTheme;
  }
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function initializeTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}