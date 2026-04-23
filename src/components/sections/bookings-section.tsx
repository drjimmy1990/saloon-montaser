"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  RefreshCw,
  MessageCircle,
  Phone,
  MapPin,
  Hash,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type ChannelSource = "whatsapp" | "facebook" | "instagram";

export interface Booking {
  id: string;
  client_id: string;
  client?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
    avatar_url?: string;
  };
  serviceSummary: string;
  channelType: ChannelSource;
  bookingDate: string;
  status: BookingStatus;
  createdAt?: string;
}

// ─── Config Maps ──────────────────────────────────────────────────────────────

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    labelAr: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: typeof Clock;
  }
> = {
  pending: {
    label: "Pending",
    labelAr: "قيد الانتظار",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    labelAr: "مؤكد",
    bgColor: "bg-sage-50 dark:bg-sage-900/20",
    textColor: "text-sage-700 dark:text-sage-400",
    borderColor: "border-sage-200 dark:border-sage-800/40",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    labelAr: "ملغي",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800/40",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    labelAr: "مكتمل",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    icon: CheckCircle2,
  },
};

const channelConfig: Record<
  ChannelSource,
  {
    label: string;
    labelAr: string;
    bgColor: string;
    textColor: string;
    icon: typeof MessageCircle;
  }
> = {
  whatsapp: {
    label: "WhatsApp",
    labelAr: "واتساب",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
    icon: MessageCircle,
  },
  facebook: {
    label: "Facebook",
    labelAr: "ماسنجر",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: MessageCircle,
  },
  instagram: {
    label: "Instagram",
    labelAr: "انستجرام",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-700 dark:text-pink-400",
    icon: MessageCircle,
  },
};

const statCardConfig = [
  {
    key: "total",
    labelKey: "dashboard.totalBookings",
    labelKeyAr: "dashboard.totalBookings",
    icon: CalendarCheck,
    colorClass: "primary" as const,
  },
  {
    key: "pending",
    labelKey: "pending",
    labelKeyAr: "pending",
    icon: Clock,
    colorClass: "amber" as const,
  },
  {
    key: "confirmed",
    labelKey: "confirmed",
    labelKeyAr: "confirmed",
    icon: CheckCircle2,
    colorClass: "sage" as const,
  },
  {
    key: "cancelled",
    labelKey: "cancelled",
    labelKeyAr: "cancelled",
    icon: XCircle,
    colorClass: "red" as const,
  },
];

const statColorMap = {
  primary: {
    bg: "bg-primary/5",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    border: "border-primary/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-800/30",
    iconText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  sage: {
    bg: "bg-sage-50 dark:bg-sage-900/20",
    iconBg: "bg-sage-100 dark:bg-sage-800/30",
    iconText: "text-sage-600 dark:text-sage-400",
    border: "border-sage-200 dark:border-sage-800/40",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    iconBg: "bg-red-100 dark:bg-red-800/30",
    iconText: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/40",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingsSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus>("pending");

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookings();
  }, []);

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const name = b.client?.name || "";
      const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const channelMatch =
        channelFilter === "all" || b.channelType === channelFilter;
      const statusMatch = statusFilter === "all" || b.status === statusFilter;
      return nameMatch && channelMatch && statusMatch;
    });
  }, [bookings, searchQuery, channelFilter, statusFilter]);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setUpdateStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
    
    setUpdateStatusDialogOpen(false);
    setSelectedBooking(null);
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const renderStatusBadge = (status: BookingStatus) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 text-[11px] font-medium border",
          config.bgColor,
          config.textColor,
          config.borderColor
        )}
      >
        <Icon className="w-3 h-3" />
        {rtl ? config.labelAr : config.label}
      </Badge>
    );
  };

  const renderChannelBadge = (channel: ChannelSource) => {
    const config = channelConfig[channel] || channelConfig.whatsapp;
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 text-[11px] font-medium border",
          config.bgColor,
          config.textColor
        )}
      >
        <Icon className="w-3 h-3" />
        {rtl ? config.labelAr : config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="space-y-1">
        <h2
          className={cn(
            "text-2xl font-bold tracking-tight",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "bookings.title")}
        </h2>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "bookings.subtitle")}
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-3",
          ""
        )}
      >
        <div className="relative flex-1 min-w-0">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
              rtl ? "right-3" : "left-3"
            )}
          />
          <Input
            placeholder={t(locale, "search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(rtl ? "pr-9 pl-3" : "pl-9 pr-3", rtl && "font-arabic text-right")}
          />
        </div>

        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className={cn("w-full sm:w-[180px]", rtl && "font-arabic")}>
            <SelectValue placeholder={t(locale, "bookings.allChannels")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className={rtl ? "font-arabic" : ""}>
              {t(locale, "bookings.allChannels")}
            </SelectItem>
            <SelectItem value="whatsapp" className={rtl ? "font-arabic" : ""}>
              {t(locale, "channels.whatsapp")}
            </SelectItem>
            <SelectItem value="facebook" className={rtl ? "font-arabic" : ""}>
              {t(locale, "channels.facebook")}
            </SelectItem>
            <SelectItem value="instagram" className={rtl ? "font-arabic" : ""}>
              {t(locale, "channels.instagram")}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={cn("w-full sm:w-[180px]", rtl && "font-arabic")}>
            <SelectValue placeholder={t(locale, "bookings.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className={rtl ? "font-arabic" : ""}>
              {t(locale, "bookings.allStatuses")}
            </SelectItem>
            <SelectItem value="pending" className={rtl ? "font-arabic" : ""}>
              {t(locale, "pending")}
            </SelectItem>
            <SelectItem value="confirmed" className={rtl ? "font-arabic" : ""}>
              {t(locale, "confirmed")}
            </SelectItem>
            <SelectItem value="cancelled" className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancelled")}
            </SelectItem>
            <SelectItem value="completed" className={rtl ? "font-arabic" : ""}>
              {t(locale, "completed")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCardConfig.map((stat) => {
          const Icon = stat.icon;
          const colors = statColorMap[stat.colorClass];
          const value =
            stat.key === "total"
              ? stats.total
              : stats[stat.key as keyof typeof stats];
          return (
            <Card
              key={stat.key}
              className={cn(
                "border hover:shadow-md transition-shadow duration-200 cursor-default py-0",
                colors.border,
                colors.bg
              )}
            >
              <CardContent className="p-4">
                <div className={cn("flex items-center gap-3", "")}>
                  <div
                    className={cn(
                      "p-2 rounded-xl shrink-0",
                      colors.iconBg
                    )}
                  >
                    <Icon className={cn("w-4 h-4", colors.iconText)} />
                  </div>
                  <div className={cn("min-w-0", rtl && "text-right")}>
                    <p
                      className={cn(
                        "text-xs font-medium text-muted-foreground truncate",
                        rtl && "font-arabic"
                      )}
                    >
                      {stat.key === "total"
                        ? t(locale, "dashboard.totalBookings")
                        : t(locale, stat.key)}
                    </p>
                    <p className="text-xl font-bold tabular-nums">
                      {isLoading ? "..." : value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bookings Table */}
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.clientName")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.clientPhone")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.serviceSummary")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.channelSource")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.bookingDate")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "bookings.bookingStatus")}
                  </TableHead>
                  <TableHead
                    className={cn(
                      rtl && "text-right font-arabic"
                    )}
                  >
                    {t(locale, "actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className={cn(
                        "h-24 text-center text-muted-foreground",
                        rtl && "font-arabic"
                      )}
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className={cn(
                        "h-24 text-center text-muted-foreground",
                        rtl && "font-arabic"
                      )}
                    >
                      {t(locale, "noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/50">
                      <TableCell
                        className={cn(
                          "font-medium",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {booking.client?.name || 'Unknown'}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums text-muted-foreground",
                          rtl && "text-right"
                        )}
                      >
                        {booking.client?.phone || 'N/A'}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "max-w-[200px] truncate",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {booking.serviceSummary}
                      </TableCell>
                      <TableCell className={rtl ? "text-right" : ""}>
                        {renderChannelBadge(booking.channelType)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums",
                          rtl && "text-right"
                        )}
                      >
                        {booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : ""}
                      </TableCell>
                      <TableCell className={rtl ? "text-right" : ""}>
                        {renderStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell className={rtl ? "text-right" : ""}>
                        <DropdownMenu dir={rtl ? "rtl" : "ltr"}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">
                                {t(locale, "actions")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={rtl ? "start" : "end"}>
                            <DropdownMenuLabel className={rtl ? "font-arabic" : ""}>
                              {t(locale, "actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(booking)}
                              className={cn("gap-2", rtl && "font-arabic")}
                            >
                              <Eye className="w-4 h-4" />
                              {t(locale, "bookings.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking)}
                              className={cn("gap-2", rtl && "font-arabic")}
                            >
                              <RefreshCw className="w-4 h-4" />
                              {t(locale, "bookings.updateStatus")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-lg", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "bookings.viewDetails")}
            </DialogTitle>
            <DialogDescription className={cn(rtl && "font-arabic text-right")}>
              {rtl ? "تفاصيل الحجز" : "Booking details"}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              {/* Booking ID */}
              <div
                className={cn(
                  "flex items-center gap-2 text-sm text-muted-foreground",
                  ""
                )}
              >
                <Hash className="w-4 h-4 shrink-0" />
                <span className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">#{selectedBooking.id}</span>
              </div>

              <Separator />

              {/* Client Info */}
              <div className="space-y-3">
                <div
                  className={cn(
                    "flex items-start gap-3",
                    ""
                  )}
                >
                  <div className="p-2 rounded-lg bg-sage-50 dark:bg-sage-900/20 shrink-0">
                    <CalendarCheck className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                  </div>
                  <div className={cn("min-w-0", rtl && "text-right")}>
                    <p className="font-semibold">
                      {selectedBooking.client?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.serviceSummary}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-3",
                    ""
                  )}
                >
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm tabular-nums">
                    {selectedBooking.client?.phone || 'N/A'}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-3",
                    ""
                  )}
                >
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm">
                    {selectedBooking.client?.address || 'No address provided'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Booking Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(rtl && "text-right")}>
                  <p
                    className={cn(
                      "text-xs text-muted-foreground mb-1",
                      rtl && "font-arabic"
                    )}
                  >
                    {t(locale, "bookings.bookingDate")}
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {new Date(selectedBooking.bookingDate || selectedBooking.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className={cn(rtl && "text-right")}>
                  <p
                    className={cn(
                      "text-xs text-muted-foreground mb-1",
                      rtl && "font-arabic"
                    )}
                  >
                    {t(locale, "bookings.channelSource")}
                  </p>
                  <div className={cn(rtl && "flex justify-end")}>
                    {renderChannelBadge(selectedBooking.channelType)}
                  </div>
                </div>
                <div className={cn(rtl && "text-right")}>
                  <p
                    className={cn(
                      "text-xs text-muted-foreground mb-1",
                      rtl && "font-arabic"
                    )}
                  >
                    {t(locale, "bookings.bookingStatus")}
                  </p>
                  <div className={cn(rtl && "flex justify-end")}>
                    {renderStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter
            className={cn("")}
          >
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onOpenChange={setUpdateStatusDialogOpen}
      >
        <DialogContent
          className={cn("sm:max-w-md", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={cn(rtl && "font-arabic text-right")}>
              {t(locale, "bookings.updateStatus")}
            </DialogTitle>
            <DialogDescription className={cn(rtl && "font-arabic text-right")}>
              {selectedBooking
                ? rtl
                  ? `تحديث حالة الحجز #${selectedBooking.id}`
                  : `Update status for booking #${selectedBooking.id}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {/* Current Status */}
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                  ""
                )}
              >
                <span
                  className={cn(
                    "text-sm text-muted-foreground",
                    rtl && "font-arabic"
                  )}
                >
                  {rtl ? "الحالة الحالية:" : "Current status:"}
                </span>
                {renderStatusBadge(selectedBooking.status)}
              </div>

              {/* New Status Select */}
              <div className="space-y-2">
                <label
                  className={cn(
                    "text-sm font-medium",
                    rtl && "font-arabic text-right block"
                  )}
                >
                  {rtl ? "الحالة الجديدة" : "New Status"}
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(val) => setNewStatus(val as BookingStatus)}
                >
                  <SelectTrigger
                    className={cn("w-full", rtl && "font-arabic")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className={rtl ? "font-arabic" : ""}>
                      {t(locale, "pending")}
                    </SelectItem>
                    <SelectItem value="confirmed" className={rtl ? "font-arabic" : ""}>
                      {t(locale, "confirmed")}
                    </SelectItem>
                    <SelectItem value="cancelled" className={rtl ? "font-arabic" : ""}>
                      {t(locale, "cancelled")}
                    </SelectItem>
                    <SelectItem value="completed" className={rtl ? "font-arabic" : ""}>
                      {t(locale, "completed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div
                className={cn(
                  "flex items-center gap-3",
                  ""
                )}
              >
                <span
                  className={cn(
                    "text-sm text-muted-foreground",
                    rtl && "font-arabic"
                  )}
                >
                  {rtl ? "بعد التحديث:" : "After update:"}
                </span>
                {renderStatusBadge(newStatus)}
              </div>
            </div>
          )}
          <DialogFooter
            className={cn("")}
          >
            <Button
              variant="outline"
              onClick={() => setUpdateStatusDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "cancel")}
            </Button>
            <Button onClick={confirmStatusUpdate} className={rtl ? "font-arabic" : ""}>
              {t(locale, "confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
