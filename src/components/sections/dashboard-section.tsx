"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Radio,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

// ─── Direct hex colors (NOT CSS variable references) ─────────────────────────
const COLORS = {
  sage: "#778a7e",
  sand: "#b09e7c",
  terracotta: "#d9703e",
} as const;

// ─── Mock Data ───────────────────────────────────────────────────────────────

const kpiData = [
  {
    key: "activeChannels",
    value: "3",
    change: "+1",
    trend: "up" as const,
    icon: Radio,
    colorClass: "sage" as const,
  },
  {
    key: "totalMessages",
    value: "2,847",
    change: "+12.5%",
    trend: "up" as const,
    icon: MessageSquare,
    colorClass: "sand" as const,
  },
  {
    key: "totalBookings",
    value: "184",
    change: "+8.2%",
    trend: "up" as const,
    icon: CalendarCheck,
    colorClass: "terracotta" as const,
  },
  {
    key: "conversionRate",
    value: "6.5%",
    change: "-0.3%",
    trend: "down" as const,
    icon: TrendingUp,
    colorClass: "primary" as const,
  },
];

const channelPerformanceData = [
  { channel: "WhatsApp", channelAr: "واتساب", messages: 1420 },
  { channel: "Facebook", channelAr: "فيسبوك", messages: 856 },
  { channel: "Instagram", channelAr: "انستجرام", messages: 571 },
];

/** Per-bar fill colors mapped by channel name */
const channelColors: Record<string, string> = {
  WhatsApp: COLORS.sage,
  Facebook: COLORS.sand,
  Instagram: COLORS.terracotta,
};

const weeklyTrendData = [
  { day: "Mon", dayAr: "الإثنين", messages: 320, bookings: 22 },
  { day: "Tue", dayAr: "الثلاثاء", messages: 450, bookings: 31 },
  { day: "Wed", dayAr: "الأربعاء", messages: 380, bookings: 27 },
  { day: "Thu", dayAr: "الخميس", messages: 520, bookings: 38 },
  { day: "Fri", dayAr: "الجمعة", messages: 410, bookings: 29 },
  { day: "Sat", dayAr: "السبت", messages: 390, bookings: 24 },
  { day: "Sun", dayAr: "الأحد", messages: 377, bookings: 13 },
];

const recentBookings = [
  {
    id: 1,
    clientName: "Ahmed Al-Rashid",
    clientNameAr: "أحمد الراشد",
    service: "Home Cleaning",
    serviceAr: "تنظيف المنزل",
    channel: "WhatsApp",
    channelAr: "واتساب",
    date: "2025-01-15",
    status: "confirmed" as const,
  },
  {
    id: 2,
    clientName: "Sara Mansour",
    clientNameAr: "سارة منصور",
    service: "AC Maintenance",
    serviceAr: "صيانة المكيفات",
    channel: "Facebook",
    channelAr: "فيسبوك",
    date: "2025-01-15",
    status: "pending" as const,
  },
  {
    id: 3,
    clientName: "Khalid Bin Nasser",
    clientNameAr: "خالد بن ناصر",
    service: "Plumbing",
    serviceAr: "سباكة",
    channel: "Instagram",
    channelAr: "انستجرام",
    date: "2025-01-14",
    status: "completed" as const,
  },
  {
    id: 4,
    clientName: "Fatima Hassan",
    clientNameAr: "فاطمة حسن",
    service: "Painting",
    serviceAr: "دهانات",
    channel: "WhatsApp",
    channelAr: "واتساب",
    date: "2025-01-14",
    status: "cancelled" as const,
  },
  {
    id: 5,
    clientName: "Omar Al-Farsi",
    clientNameAr: "عمر الفارسي",
    service: "Electrical Work",
    serviceAr: "أعمال كهربائية",
    channel: "Facebook",
    channelAr: "فيسبوك",
    date: "2025-01-13",
    status: "confirmed" as const,
  },
];

// ─── Chart Configs ───────────────────────────────────────────────────────────
// Colors are direct hex values so recharts can render them without CSS resolution

const channelChartConfig = {
  messages: {
    label: "Messages",
  },
  whatsapp: {
    label: "WhatsApp",
    color: COLORS.sage,
  },
  facebook: {
    label: "Facebook",
    color: COLORS.sand,
  },
  instagram: {
    label: "Instagram",
    color: COLORS.terracotta,
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  messages: {
    label: "Messages",
    color: COLORS.sage,
  },
  bookings: {
    label: "Bookings",
    color: COLORS.terracotta,
  },
} satisfies ChartConfig;

// ─── Color Maps ──────────────────────────────────────────────────────────────

const kpiColorMap = {
  sage: {
    bg: "bg-sage-50 dark:bg-sage-900/30",
    iconBg: "bg-sage-100 dark:bg-sage-800/50",
    iconText: "text-sage-600 dark:text-sage-400",
    border: "border-sage-200 dark:border-sage-800/50",
  },
  sand: {
    bg: "bg-sand-50 dark:bg-sand-900/30",
    iconBg: "bg-sand-100 dark:bg-sand-800/50",
    iconText: "text-sand-600 dark:text-sand-400",
    border: "border-sand-200 dark:border-sand-800/50",
  },
  terracotta: {
    bg: "bg-terracotta-50 dark:bg-terracotta-900/30",
    iconBg: "bg-terracotta-100 dark:bg-terracotta-800/50",
    iconText: "text-terracotta-600 dark:text-terracotta-400",
    border: "border-terracotta-200 dark:border-terracotta-800/50",
  },
  primary: {
    bg: "bg-primary/5",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    border: "border-primary/20",
  },
};

const statusConfig: Record<
  string,
  {
    label: string;
    labelAr: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  confirmed: { label: "Confirmed", labelAr: "مؤكد", variant: "default" },
  pending: { label: "Pending", labelAr: "قيد الانتظار", variant: "secondary" },
  completed: { label: "Completed", labelAr: "مكتمل", variant: "outline" },
  cancelled: { label: "Cancelled", labelAr: "ملغي", variant: "destructive" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  return (
    <div className="space-y-6">
      {/* ── Title Area ──────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h2
          className={cn(
            "text-2xl font-bold tracking-tight",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "dashboard.title")}
        </h2>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "dashboard.subtitle")}
        </p>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const colors = kpiColorMap[kpi.colorClass];
          return (
            <Card
              key={kpi.key}
              className={cn(
                "overflow-hidden border hover:shadow-md transition-shadow duration-200 cursor-default",
                colors.border,
                colors.bg
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div
                  className={cn(
                    "flex items-center gap-3",
                    rtl && "flex-row-reverse"
                  )}
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "p-2.5 rounded-xl shrink-0",
                      colors.iconBg
                    )}
                  >
                    <Icon className={cn("w-5 h-5", colors.iconText)} />
                  </div>

                  {/* Text content */}
                  <div
                    className={cn(
                      "flex-1 min-w-0 overflow-hidden",
                      rtl && "text-right"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium text-muted-foreground truncate",
                        rtl && "font-arabic"
                      )}
                    >
                      {t(locale, `dashboard.${kpi.key}`)}
                    </p>
                    <div
                      className={cn(
                        "flex items-baseline flex-wrap gap-2 mt-1",
                        rtl && "flex-row-reverse"
                      )}
                    >
                      <span className="text-2xl font-bold tabular-nums">
                        {kpi.value}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium flex items-center gap-0.5",
                          kpi.trend === "up"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {kpi.trend === "up" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Charts Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Channel Performance — Horizontal Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className={cn("text-base", rtl && "font-arabic text-right")}
            >
              {t(locale, "dashboard.channelPerformance")}
            </CardTitle>
            <CardDescription
              className={cn(rtl && "font-arabic text-right")}
            >
              {t(locale, "dashboard.messagesByChannel")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={channelChartConfig} className="h-[260px] w-full">
              <BarChart
                data={channelPerformanceData}
                layout="vertical"
                margin={{
                  top: 8,
                  right: rtl ? 16 : 0,
                  left: rtl ? 0 : 16,
                  bottom: 8,
                }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey={rtl ? "channelAr" : "channel"}
                  tickLine={false}
                  axisLine={false}
                  width={rtl ? 65 : 80}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="messages"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={36}
                >
                  {channelPerformanceData.map((entry) => (
                    <Cell
                      key={entry.channel}
                      fill={channelColors[entry.channel]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend — Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className={cn("text-base", rtl && "font-arabic text-right")}
            >
              {t(locale, "dashboard.weeklyTrend")}
            </CardTitle>
            <CardDescription
              className={cn(rtl && "font-arabic text-right")}
            >
              {locale === "ar"
                ? "الرسائل والحجوزات خلال الأسبوع"
                : "Messages & bookings over the week"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyChartConfig} className="h-[260px] w-full">
              <AreaChart
                data={weeklyTrendData}
                margin={{
                  top: 8,
                  right: rtl ? 0 : 8,
                  left: rtl ? 8 : 0,
                  bottom: 8,
                }}
              >
                <defs>
                  <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.sage} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.sage} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.terracotta}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.terracotta}
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={rtl ? "dayAr" : "day"}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke={COLORS.sage}
                  strokeWidth={2}
                  fill="url(#fillMessages)"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke={COLORS.terracotta}
                  strokeWidth={2}
                  fill="url(#fillBookings)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Bookings Table ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-base", rtl && "font-arabic text-right")}>
            {t(locale, "dashboard.recentBookings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Horizontal scroll wrapper for mobile */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className={cn("whitespace-nowrap", rtl && "text-right font-arabic")}
                  >
                    {t(locale, "bookings.clientName")}
                  </TableHead>
                  <TableHead
                    className={cn("whitespace-nowrap", rtl && "text-right font-arabic")}
                  >
                    {t(locale, "catalog.productCategory")}
                  </TableHead>
                  <TableHead
                    className={cn("whitespace-nowrap", rtl && "text-right font-arabic")}
                  >
                    {t(locale, "bookings.channelSource")}
                  </TableHead>
                  <TableHead
                    className={cn("whitespace-nowrap", rtl && "text-right font-arabic")}
                  >
                    {t(locale, "date")}
                  </TableHead>
                  <TableHead
                    className={cn("whitespace-nowrap", rtl && "text-right font-arabic")}
                  >
                    {t(locale, "status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => {
                  const status = statusConfig[booking.status];
                  return (
                    <TableRow key={booking.id} className="hover:bg-muted/50">
                      <TableCell
                        className={cn(
                          "font-medium whitespace-nowrap",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {rtl ? booking.clientNameAr : booking.clientName}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {rtl ? booking.serviceAr : booking.service}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {rtl ? booking.channelAr : booking.channel}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums whitespace-nowrap",
                          rtl && "text-right"
                        )}
                      >
                        {booking.date}
                      </TableCell>
                      <TableCell className={cn(rtl && "text-right")}>
                        <Badge
                          variant={status.variant}
                          className={cn("text-[11px]", rtl && "font-arabic")}
                        >
                          {rtl ? status.labelAr : status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
