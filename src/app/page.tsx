"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { isRTL } from "@/lib/i18n";
import { AppSidebar, MobileSidebar, MobileHeader } from "@/components/layout/app-sidebar";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { ChannelsSection } from "@/components/sections/channels-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { BookingsSection } from "@/components/sections/bookings-section";
import { ClientsSection } from "@/components/sections/clients-section";
import { ChatSection } from "@/components/sections/chat-section";
import { BlacklistSection } from "@/components/sections/blacklist-section";
import { cn } from "@/lib/utils";

const sectionComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardSection,
  channels: ChannelsSection,
  catalog: CatalogSection,
  bookings: BookingsSection,
  clients: ClientsSection,
  chat: ChatSection,
  blacklist: BlacklistSection,
};

export default function Home() {
  const { locale, activeSection } = useAppStore();
  const rtl = isRTL(locale);
  const dir = rtl ? "rtl" : "ltr";

  const SectionComponent = sectionComponents[activeSection] || DashboardSection;

  return (
    <div className={cn("min-h-screen flex flex-col", rtl && "font-arabic")} dir={dir}>
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block" dir={dir}>
          <AppSidebar />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <main className={cn(
            "flex-1 p-4 md:p-6 custom-scrollbar",
            activeSection === "chat" ? "overflow-hidden flex flex-col" : "overflow-auto"
          )}>
            <div
              key={activeSection}
              className={cn(
                "animate-in fade-in-0 duration-200",
                activeSection === "chat" && "flex-1 min-h-0"
              )}
            >
              <SectionComponent />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
