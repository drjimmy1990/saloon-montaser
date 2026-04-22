"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ShieldBan,
  Search,
  Plus,
  Phone,
  Hash,
  Clock,
  X,
  Ban,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type IdentifierType = "phone" | "id";

interface BlacklistEntry {
  id: number;
  identifier: string;
  identifierAr: string;
  type: IdentifierType;
  reason: string;
  reasonAr: string;
  dateAdded: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialEntries: BlacklistEntry[] = [
  {
    id: 1,
    identifier: "+966 55 999 0000",
    identifierAr: "+966 55 999 0000",
    type: "phone",
    reason: "Spam messages and abusive language towards bot",
    reasonAr: "رسائل مزعجة ولغة مسيئة تجاه البوت",
    dateAdded: "2025-02-28",
  },
  {
    id: 2,
    identifier: "USER-78234",
    identifierAr: "USER-78234",
    type: "id",
    reason: "Fraudulent booking attempts with fake information",
    reasonAr: "محاولات حجز احتيالية بمعلومات وهمية",
    dateAdded: "2025-02-25",
  },
  {
    id: 3,
    identifier: "+966 50 111 3333",
    identifierAr: "+966 50 111 3333",
    type: "phone",
    reason: "Repeated cancellation of confirmed bookings",
    reasonAr: "إلغاء متكرر للحجوزات المؤكدة",
    dateAdded: "2025-02-20",
  },
  {
    id: 4,
    identifier: "USER-55021",
    identifierAr: "USER-55021",
    type: "id",
    reason: "Attempted to exploit pricing loopholes",
    reasonAr: "محاولة استغلال ثغرات التسعير",
    dateAdded: "2025-02-15",
  },
];

// ─── Config Maps ──────────────────────────────────────────────────────────────

const typeConfig: Record<
  IdentifierType,
  {
    label: string;
    labelAr: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: typeof Phone;
  }
> = {
  phone: {
    label: "Phone",
    labelAr: "رقم الهاتف",
    bgColor: "bg-terracotta-50 dark:bg-terracotta-900/20",
    textColor: "text-terracotta-700 dark:text-terracotta-400",
    borderColor: "border-terracotta-200 dark:border-terracotta-800/40",
    icon: Phone,
  },
  id: {
    label: "User ID",
    labelAr: "معرف المستخدم",
    bgColor: "bg-sand-50 dark:bg-sand-900/20",
    textColor: "text-sand-700 dark:text-sand-400",
    borderColor: "border-sand-200 dark:border-sand-800/40",
    icon: Hash,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BlacklistSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [entries, setEntries] = useState<BlacklistEntry[]>(initialEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BlacklistEntry | null>(
    null
  );

  // Form state
  const [formIdentifier, setFormIdentifier] = useState("");
  const [formType, setFormType] = useState<IdentifierType>("phone");
  const [formReason, setFormReason] = useState("");
  const [formReasonAr, setFormReasonAr] = useState("");

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    return entries.filter((e) => {
      const id = e.identifier.toLowerCase();
      const reason = rtl ? e.reasonAr : e.reason;
      return (
        id.includes(searchQuery.toLowerCase()) ||
        reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [entries, searchQuery, rtl]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormIdentifier("");
    setFormType("phone");
    setFormReason("");
    setFormReasonAr("");
  };

  const handleAdd = () => {
    if (!formIdentifier.trim()) return;

    const newEntry: BlacklistEntry = {
      id: Math.max(0, ...entries.map((e) => e.id)) + 1,
      identifier: formIdentifier,
      identifierAr: formIdentifier,
      type: formType,
      reason: formReason || "No reason provided",
      reasonAr: formReasonAr || "لم يتم تقديم سبب",
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setEntries((prev) => [newEntry, ...prev]);
    setAddDialogOpen(false);
    resetForm();
  };

  const openDeleteDialog = (entry: BlacklistEntry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedEntry) return;
    setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
    setDeleteDialogOpen(false);
    setSelectedEntry(null);
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const renderTypeBadge = (type: IdentifierType) => {
    const config = typeConfig[type];
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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2
          className={cn(
            "text-2xl font-bold tracking-tight",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "blacklist.title")}
        </h2>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "blacklist.subtitle")}
        </p>
      </div>

      {/* Action Bar */}
      <div
        className={cn(
          "flex flex-col sm:flex-row gap-3",
          rtl && "sm:flex-row-reverse"
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
            className={cn(
              rtl ? "pr-9 pl-3" : "pl-9 pr-3",
              rtl && "font-arabic text-right"
            )}
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setAddDialogOpen(true);
          }}
          className={cn(
            "gap-2 shrink-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            rtl && "font-arabic flex-row-reverse"
          )}
        >
          <Ban className="w-4 h-4" />
          {t(locale, "blacklist.addEntry")}
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 py-0">
        <CardContent className="p-4">
          <div
            className={cn("flex items-center gap-3", rtl && "flex-row-reverse")}
          >
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-800/30 shrink-0">
              <ShieldBan className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className={cn("min-w-0", rtl && "text-right")}>
              <p
                className={cn(
                  "text-xs font-medium text-muted-foreground",
                  rtl && "font-arabic"
                )}
              >
                {t(locale, "blacklist.totalBlocked")}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {entries.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blacklist Entries */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card className="py-0">
            <CardContent className="p-8">
              <div
                className={cn(
                  "flex flex-col items-center justify-center text-muted-foreground gap-2",
                  rtl && "font-arabic"
                )}
              >
                <ShieldBan className="w-8 h-8 opacity-50" />
                <p className="text-sm">{t(locale, "noData")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const config = typeConfig[entry.type];
            const TypeIcon = config.icon;
            return (
              <Card
                key={entry.id}
                className={cn("py-0 border hover:shadow-md transition-shadow duration-200", config.borderColor)}
              >
                <CardContent className="p-4">
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "p-2.5 rounded-xl shrink-0 mt-0.5",
                        config.bgColor
                      )}
                    >
                      <TypeIcon
                        className={cn("w-5 h-5", config.textColor)}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1",
                          rtl && "flex-row-reverse"
                        )}
                      >
                        <span
                          className={cn(
                            "font-semibold text-sm font-mono",
                            rtl && "text-right"
                          )}
                          dir="ltr"
                        >
                          {entry.identifier}
                        </span>
                        {renderTypeBadge(entry.type)}
                      </div>
                      <p
                        className={cn(
                          "text-sm text-muted-foreground mb-2",
                          rtl && "font-arabic text-right"
                        )}
                      >
                        {rtl ? entry.reasonAr : entry.reason}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs text-muted-foreground",
                          rtl && "flex-row-reverse font-arabic"
                        )}
                      >
                        <Clock className="w-3 h-3" />
                        <span dir="ltr">{entry.dateAdded}</span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => openDeleteDialog(entry)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">
                        {t(locale, "blacklist.deleteEntry")}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-lg", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={rtl && "font-arabic text-right"}>
              {t(locale, "blacklist.addEntry")}
            </DialogTitle>
            <DialogDescription className={rtl && "font-arabic text-right"}>
              {rtl
                ? "أضف رقم هاتف أو معرف إلى القائمة السوداء"
                : "Add a phone number or user ID to the blacklist"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Identifier */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "blacklist.identifier")}
              </Label>
              <Input
                value={formIdentifier}
                onChange={(e) => setFormIdentifier(e.target.value)}
                placeholder={
                  formType === "phone"
                    ? "+966 5X XXX XXXX"
                    : "USER-XXXXX"
                }
                dir="ltr"
                className={rtl ? "text-right" : ""}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "blacklist.identifierType")}
              </Label>
              <Select
                value={formType}
                onValueChange={(val) => setFormType(val as IdentifierType)}
              >
                <SelectTrigger className={cn("w-full", rtl && "font-arabic")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone" className={rtl ? "font-arabic" : ""}>
                    <div className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
                      <Phone className="w-3.5 h-3.5" />
                      {t(locale, "blacklist.phoneType")}
                    </div>
                  </SelectItem>
                  <SelectItem value="id" className={rtl ? "font-arabic" : ""}>
                    <div className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
                      <Hash className="w-3.5 h-3.5" />
                      {t(locale, "blacklist.idType")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "blacklist.blockReason")}
              </Label>
              <Textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder={
                  rtl
                    ? "سبب الحظر بالإنجليزية"
                    : "Reason for blocking in English"
                }
                rows={3}
                className={rtl ? "font-arabic text-right" : ""}
              />
              <Textarea
                value={formReasonAr}
                onChange={(e) => setFormReasonAr(e.target.value)}
                placeholder="سبب الحظر بالعربية"
                rows={3}
                className="font-arabic text-right"
                dir="rtl"
              />
            </div>
          </div>
          <DialogFooter
            className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}
          >
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              className={cn(
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                rtl && "font-arabic"
              )}
            >
              {t(locale, "blacklist.addEntry")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader className={cn(rtl && "text-right items-end")}>
            <AlertDialogTitle className={rtl && "font-arabic text-right"}>
              {t(locale, "blacklist.deleteEntry")}
            </AlertDialogTitle>
            <AlertDialogDescription className={rtl && "font-arabic text-right"}>
              {t(locale, "blacklist.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedEntry && (
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                rtl && "flex-row-reverse"
              )}
            >
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 shrink-0">
                <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className={cn("min-w-0", rtl && "text-right")}>
                <p className="font-semibold font-mono" dir="ltr">
                  {selectedEntry.identifier}
                </p>
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    rtl && "font-arabic"
                  )}
                >
                  {rtl ? selectedEntry.reasonAr : selectedEntry.reason}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter
            className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}
          >
            <AlertDialogCancel className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t(locale, "confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
