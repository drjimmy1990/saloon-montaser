"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  StickyNote,
  User,
  ShieldBan,
  Ban,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  name: string;
  nameAr: string;
  phone: string;
  phoneAr: string;
  address: string;
  addressAr: string;
  notes: string;
  notesAr: string;
  blocked: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialClients: Client[] = [
  {
    id: 1,
    name: "Ahmed Al-Rashid",
    nameAr: "أحمد الراشد",
    phone: "+966 55 123 4567",
    phoneAr: "+966 55 123 4567",
    address: "23 King Fahd Rd, Riyadh",
    addressAr: "23 طريق الملك فهد، الرياض",
    notes: "VIP customer, prefers WhatsApp communication",
    notesAr: "عميل مميز، يفضل التواصل عبر واتساب",
    blocked: false,
  },
  {
    id: 2,
    name: "Sara Mansour",
    nameAr: "سارة منصور",
    phone: "+966 50 987 6543",
    phoneAr: "+966 50 987 6543",
    address: "15 Palm Towers, Jeddah",
    addressAr: "15 أبراج النخيل، جدة",
    notes: "Regular client, monthly cleaning service",
    notesAr: "عميلة منتظمة، خدمة تنظيف شهرية",
    blocked: false,
  },
  {
    id: 3,
    name: "Khalid Bin Nasser",
    nameAr: "خالد بن ناصر",
    phone: "+966 54 456 7890",
    phoneAr: "+966 54 456 7890",
    address: "8 Al Olaya District, Riyadh",
    addressAr: "8 حي العليا، الرياض",
    notes: "Corporate account - Al Nasser Holdings",
    notesAr: "حساب مؤسسي - مجموعة الناصر القابضة",
    blocked: false,
  },
  {
    id: 4,
    name: "Fatima Hassan",
    nameAr: "فاطمة حسن",
    phone: "+966 56 321 0987",
    phoneAr: "+966 56 321 0987",
    address: "42 Marina Walk, Jeddah",
    addressAr: "42 مارينا ووك، جدة",
    notes: "Prefers afternoon appointments",
    notesAr: "تفضل المواعيد بعد الظهر",
    blocked: false,
  },
  {
    id: 5,
    name: "Omar Al-Farsi",
    nameAr: "عمر الفارسي",
    phone: "+966 59 654 3210",
    phoneAr: "+966 59 654 3210",
    address: "7 Corniche Road, Dammam",
    addressAr: "7 طريق الكورنيش، الدمام",
    notes: "Has annual maintenance contract",
    notesAr: "لديه عقد صيانة سنوي",
    blocked: false,
  },
  {
    id: 6,
    name: "Layla Al-Maktoum",
    nameAr: "ليلى المكتوم",
    phone: "+966 53 111 2222",
    phoneAr: "+966 53 111 2222",
    address: "19 Al Nakheel, Riyadh",
    addressAr: "19 النخيل، الرياض",
    notes: "New client, referred by Sara Mansour",
    notesAr: "عميلة جديدة، أحالتها سارة منصور",
    blocked: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientsSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockingClient, setBlockingClient] = useState<Client | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formAddressAr, setFormAddressAr] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formNotesAr, setFormNotesAr] = useState("");

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    return clients.filter((c) => {
      const name = rtl ? c.nameAr : c.name;
      const phone = c.phone;
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery)
      );
    });
  }, [clients, searchQuery, rtl]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormName("");
    setFormNameAr("");
    setFormPhone("");
    setFormAddress("");
    setFormAddressAr("");
    setFormNotes("");
    setFormNotesAr("");
  };

  const openAddDialog = () => {
    resetForm();
    setIsEditing(false);
    setSelectedClient(null);
    setEditDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setIsEditing(true);
    setSelectedClient(client);
    setFormName(client.name);
    setFormNameAr(client.nameAr);
    setFormPhone(client.phone);
    setFormAddress(client.address);
    setFormAddressAr(client.addressAr);
    setFormNotes(client.notes);
    setFormNotesAr(client.notesAr);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() && !formNameAr.trim()) return;

    if (isEditing && selectedClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id
            ? {
                ...c,
                name: formName || c.name,
                nameAr: formNameAr || c.nameAr,
                phone: formPhone || c.phone,
                address: formAddress || c.address,
                addressAr: formAddressAr || c.addressAr,
                notes: formNotes,
                notesAr: formNotesAr,
              }
            : c
        )
      );
    } else {
      const newClient: Client = {
        id: Math.max(0, ...clients.map((c) => c.id)) + 1,
        name: formName || "New Client",
        nameAr: formNameAr || "عميل جديد",
        phone: formPhone || "+966 00 000 0000",
        phoneAr: formPhone || "+966 00 000 0000",
        address: formAddress || "",
        addressAr: formAddressAr || "",
        notes: formNotes,
        notesAr: formNotesAr,
        blocked: false,
      };
      setClients((prev) => [...prev, newClient]);
    }
    setEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedClient) return;
    setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
    setDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const handleToggleBlock = () => {
    if (!blockingClient) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === blockingClient.id ? { ...c, blocked: !c.blocked } : c
      )
    );
    setBlockDialogOpen(false);
    setBlockingClient(null);
  };

  const openBlockDialog = (client: Client) => {
    setBlockingClient(client);
    setBlockDialogOpen(true);
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
          {t(locale, "clients.title")}
        </h2>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            rtl && "font-arabic text-right"
          )}
        >
          {t(locale, "clients.subtitle")}
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
          onClick={openAddDialog}
          className={cn(
            "gap-2 shrink-0",
            rtl && "font-arabic flex-row-reverse"
          )}
        >
          <Plus className="w-4 h-4" />
          {t(locale, "clients.addClient")}
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="border-sage-200 dark:border-sage-800/40 bg-sage-50 dark:bg-sage-900/20 py-0">
        <CardContent className="p-4">
          <div className={cn("flex items-center gap-3", rtl && "flex-row-reverse")}>
            <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-sage-800/30 shrink-0">
              <Users className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            </div>
            <div className={cn("min-w-0", rtl && "text-right")}>
              <p
                className={cn(
                  "text-xs font-medium text-muted-foreground",
                  rtl && "font-arabic"
                )}
              >
                {t(locale, "clients.totalClients")}
              </p>
              <p className="text-2xl font-bold tabular-nums">{clients.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(rtl && "text-right font-arabic")}>
                    {t(locale, "clients.clientName")}
                  </TableHead>
                  <TableHead className={cn(rtl && "text-right font-arabic")}>
                    {t(locale, "clients.clientPhone")}
                  </TableHead>
                  <TableHead className={cn(rtl && "text-right font-arabic")}>
                    {t(locale, "clients.clientAddress")}
                  </TableHead>
                  <TableHead className={cn(rtl && "text-right font-arabic")}>
                    {t(locale, "clients.clientNotes")}
                  </TableHead>
                  <TableHead className={cn(rtl && "text-right font-arabic")}>
                    {t(locale, "actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className={cn(
                        "h-24 text-center text-muted-foreground",
                        rtl && "font-arabic"
                      )}
                    >
                      {t(locale, "noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell
                        className={cn(
                          "font-medium",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        <div className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
                          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {rtl ? client.nameAr : client.name}
                            {client.blocked && (
                              <Badge variant="destructive" className="text-[8px] px-1 h-3.5 leading-none shrink-0">
                                {rtl ? "محظور" : "Blocked"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums text-muted-foreground",
                          rtl && "text-right"
                        )}
                      >
                        {client.phone}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "max-w-[180px] truncate text-muted-foreground",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {rtl ? client.addressAr : client.address}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "max-w-[180px] truncate text-muted-foreground",
                          rtl && "text-right font-arabic"
                        )}
                      >
                        {rtl ? client.notesAr : client.notes}
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1", rtl && "flex-row-reverse")}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(client)}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">{t(locale, "edit")}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              client.blocked
                                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                : "text-muted-foreground hover:text-destructive"
                            )}
                            onClick={() => openBlockDialog(client)}
                          >
                            {client.blocked ? (
                              <ShieldBan className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {client.blocked
                                ? (rtl ? "إلغاء الحظر" : "Unblock")
                                : (rtl ? "حظر" : "Block")}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openDeleteDialog(client)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">{t(locale, "delete")}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-lg", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={rtl && "font-arabic text-right"}>
              {isEditing
                ? t(locale, "clients.editClient")
                : t(locale, "clients.addClient")}
            </DialogTitle>
            <DialogDescription className={rtl && "font-arabic text-right"}>
              {isEditing
                ? rtl
                  ? "تعديل بيانات العميل"
                  : "Edit client information"
                : rtl
                  ? "إضافة عميل جديد إلى الدليل"
                  : "Add a new client to the directory"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "clients.clientName")}
              </Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={rtl ? "اسم العميل بالإنجليزية" : "Client name in English"}
                className={rtl ? "font-arabic text-right" : ""}
              />
              <Input
                value={formNameAr}
                onChange={(e) => setFormNameAr(e.target.value)}
                placeholder="اسم العميل بالعربية"
                className="font-arabic text-right"
                dir="rtl"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "clients.clientPhone")}
              </Label>
              <div className="relative">
                <Phone
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
                    rtl ? "right-3" : "left-3"
                  )}
                />
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  className={rtl ? "pr-9 pl-3" : "pl-9 pr-3"}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "clients.clientAddress")}
              </Label>
              <Input
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder={rtl ? "العنوان بالإنجليزية" : "Address in English"}
                className={rtl ? "font-arabic text-right" : ""}
              />
              <Input
                value={formAddressAr}
                onChange={(e) => setFormAddressAr(e.target.value)}
                placeholder="العنوان بالعربية"
                className="font-arabic text-right"
                dir="rtl"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic text-right block")}>
                {t(locale, "clients.clientNotes")}
              </Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder={rtl ? "ملاحظات بالإنجليزية" : "Notes in English"}
                rows={3}
                className={rtl ? "font-arabic text-right" : ""}
              />
              <Textarea
                value={formNotesAr}
                onChange={(e) => setFormNotesAr(e.target.value)}
                placeholder="ملاحظات بالعربية"
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
              onClick={() => setEditDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "cancel")}
            </Button>
            <Button onClick={handleSave} className={rtl ? "font-arabic" : ""}>
              {t(locale, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader className={cn(rtl && "text-right items-end")}>
            <AlertDialogTitle className={rtl && "font-arabic text-right"}>
              {t(locale, "clients.deleteClient")}
            </AlertDialogTitle>
            <AlertDialogDescription className={rtl && "font-arabic text-right"}>
              {t(locale, "clients.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedClient && (
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                rtl && "flex-row-reverse"
              )}
            >
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 shrink-0">
                <User className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className={cn("min-w-0", rtl && "text-right")}>
                <p className={cn("font-medium", rtl && "font-arabic")}>
                  {rtl ? selectedClient.nameAr : selectedClient.name}
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {selectedClient.phone}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}>
            <AlertDialogCancel className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t(locale, "delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent dir={rtl ? "rtl" : "ltr"}>
          <AlertDialogHeader className={cn(rtl && "text-right items-end")}>
            <AlertDialogTitle className={cn(rtl && "font-arabic text-right")}>
              {blockingClient?.blocked
                ? (rtl ? "إلغاء حظر العميل" : "Unblock Client")
                : (rtl ? "حظر العميل" : "Block Client")}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(rtl && "font-arabic text-right")}>
              {blockingClient?.blocked
                ? (rtl
                    ? "هل أنت متأكد من إلغاء حظر هذا العميل؟ سيتمكن من التواصل مرة أخرى."
                    : "Are you sure you want to unblock this client? They will be able to communicate again.")
                : (rtl
                    ? "هل أنت متأكد من حظر هذا العميل؟ لن يتمكن من التواصل مع البوت."
                    : "Are you sure you want to block this client? They won't be able to communicate with the bot.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {blockingClient && (
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
                rtl && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                blockingClient.blocked
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : "bg-destructive/10"
              )}>
                {blockingClient.blocked ? (
                  <ShieldBan className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Ban className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div className={cn("min-w-0", rtl && "text-right")}>
                <p className={cn("font-medium", rtl && "font-arabic")}>
                  {rtl ? blockingClient.nameAr : blockingClient.name}
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {blockingClient.phone}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}>
            <AlertDialogCancel className={rtl ? "font-arabic" : ""}>
              {t(locale, "cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBlock}
              className={cn(
                !blockingClient?.blocked && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                blockingClient?.blocked && "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              {blockingClient?.blocked
                ? (rtl ? "إلغاء الحظر" : "Unblock")
                : (rtl ? "حظر" : "Block")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
