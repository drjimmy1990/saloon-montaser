"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { isRTL } from "@/lib/i18n";
import { AppSidebar, MobileSidebar, MobileHeader } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, setUserRole, setUserName, userRole, userPermissions, setUserPermissions } = useAppStore();
  const rtl = isRTL(locale);
  const dir = rtl ? "rtl" : "ltr";
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setUserRole(data.role);
          setUserName(data.name);
          const perms = data.permissions || [];
          setUserPermissions(perms);
          
          if (data.role === 'team') {
            const section = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
            // Redirect away from settings explicitly
            if (section === 'settings') {
              router.replace(perms.length > 0 ? `/${perms[0] === 'dashboard' ? '' : perms[0]}` : '/');
            } 
            // Redirect away if section not in permissions
            else if (perms.length > 0 && !perms.includes(section) && section !== 'dashboard') {
              router.replace(`/${perms[0] === 'dashboard' ? '' : perms[0]}`);
            }
          }
        }
      })
      .catch(console.error);
  }, [pathname, router]);

  // Protect restricted pages during render to prevent flash of unauthorized content
  if (userRole === 'team') {
    const section = pathname === '/' ? 'dashboard' : pathname.replace('/', '');
    if (section === 'settings' || (userPermissions.length > 0 && !userPermissions.includes(section) && section !== 'dashboard')) {
      return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>; 
    }
  }

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
            pathname === "/chat" ? "overflow-hidden flex flex-col" : "overflow-auto"
          )}>
            <div
              key={pathname}
              className={cn(
                "animate-in fade-in-0 duration-200",
                pathname === "/chat" && "flex-1 min-h-0"
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
