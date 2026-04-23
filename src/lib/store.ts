import { create } from "zustand";
import type { Locale } from "./i18n";

export type ActiveSection = "dashboard" | "channels" | "catalog" | "bookings" | "clients" | "chat" | "blacklist" | "settings";

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  userRole: "admin" | "team" | null;
  setUserRole: (role: "admin" | "team" | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  userPermissions: string[];
  setUserPermissions: (permissions: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  locale: "ar",
  setLocale: (locale) => set({ locale }),
  activeSection: "dashboard",
  setActiveSection: (activeSection) => set({ activeSection }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  activeChatId: null,
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  userRole: null,
  setUserRole: (userRole) => set({ userRole }),
  userName: null,
  setUserName: (userName) => set({ userName }),
  userPermissions: [],
  setUserPermissions: (userPermissions) => set({ userPermissions }),
}));
