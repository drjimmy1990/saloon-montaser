import { create } from "zustand";
import type { Locale } from "./i18n";

export type ActiveSection = "dashboard" | "channels" | "catalog" | "bookings" | "clients" | "chat" | "blacklist";

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: "ar",
  setLocale: (locale) => set({ locale }),
  activeSection: "dashboard",
  setActiveSection: (activeSection) => set({ activeSection }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
