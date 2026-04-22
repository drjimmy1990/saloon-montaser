"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Camera,
  Plus,
  Trash2,
  Key,
  Variable,
  ImageIcon,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChannelType = "whatsapp" | "facebook" | "instagram";

interface Credential {
  key: string;
  value: string;
}

interface Variable {
  name: string;
  value: string;
}

interface ImageSet {
  name: string;
  urls: string[];
}

interface Channel {
  id: string;
  name: string;
  nameAr: string;
  type: ChannelType;
  active: boolean;
  credentials: Credential[];
  variables: Variable[];
  imageSets: ImageSet[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialChannels: Channel[] = [
  {
    id: "ch-1",
    name: "WhatsApp Business",
    nameAr: "واتساب بزنس",
    type: "whatsapp",
    active: true,
    credentials: [
      { key: "API_KEY", value: "wh_sk_8f3k2m9x..." },
      { key: "PHONE_ID", value: "+966551234567" },
      { key: "WEBHOOK_TOKEN", value: "wbh_tk_4d7n..." },
    ],
    variables: [
      { name: "response_delay", value: "3" },
      { name: "greeting_message", value: "مرحباً بك! كيف يمكنني مساعدتك؟" },
      { name: "language", value: "ar" },
    ],
    imageSets: [
      {
        name: "services_catalog",
        urls: [
          "https://example.com/img/cleaning.jpg",
          "https://example.com/img/plumbing.jpg",
        ],
      },
      {
        name: "promotions",
        urls: ["https://example.com/img/ramadan_offer.jpg"],
      },
    ],
  },
  {
    id: "ch-2",
    name: "Facebook Messenger",
    nameAr: "ماسنجر فيسبوك",
    type: "facebook",
    active: true,
    credentials: [
      { key: "PAGE_TOKEN", value: "EAABsbCS1iHgB..." },
      { key: "APP_SECRET", value: "a1b2c3d4e5f6..." },
    ],
    variables: [
      { name: "response_delay", value: "2" },
      { name: "quick_replies", value: "true" },
    ],
    imageSets: [
      {
        name: "portfolio",
        urls: [
          "https://example.com/img/project1.jpg",
          "https://example.com/img/project2.jpg",
          "https://example.com/img/project3.jpg",
        ],
      },
    ],
  },
  {
    id: "ch-3",
    name: "Instagram Direct",
    nameAr: "انستجرام دايركت",
    type: "instagram",
    active: false,
    credentials: [
      { key: "ACCESS_TOKEN", value: "IGQVJYZAh..." },
    ],
    variables: [
      { name: "response_delay", value: "5" },
      { name: "auto_reply", value: "false" },
    ],
    imageSets: [
      {
        name: "stories",
        urls: ["https://example.com/img/story1.jpg"],
      },
    ],
  },
];

// ─── Channel Config ───────────────────────────────────────────────────────────

const channelTypeConfig: Record<
  ChannelType,
  {
    label: string;
    labelAr: string;
    icon: typeof MessageCircle;
    bgColor: string;
    textColor: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  whatsapp: {
    label: "WhatsApp",
    labelAr: "واتساب",
    icon: MessageCircle,
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
    iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
  },
  facebook: {
    label: "Facebook",
    labelAr: "ماسنجر",
    icon: MessageCircle,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    iconBg: "bg-blue-100 dark:bg-blue-800/30",
  },
  instagram: {
    label: "Instagram",
    labelAr: "انستجرام",
    icon: Camera,
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-700 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800/40",
    iconBg: "bg-pink-100 dark:bg-pink-800/30",
  },
};

// ─── Helper: empty channel form ──────────────────────────────────────────────

function createEmptyChannelForm(): Omit<Channel, "id"> {
  return {
    name: "",
    nameAr: "",
    type: "whatsapp",
    active: true,
    credentials: [{ key: "", value: "" }],
    variables: [{ name: "", value: "" }],
    imageSets: [{ name: "", urls: [""] }],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChannelsSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState<Omit<Channel, "id">>(createEmptyChannelForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─── Dialog Handlers ─────────────────────────────────────────────────────

  const openAddDialog = () => {
    setEditingChannel(null);
    setFormData(createEmptyChannelForm());
    setDialogOpen(true);
  };

  const openEditDialog = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      nameAr: channel.nameAr,
      type: channel.type,
      active: channel.active,
      credentials: channel.credentials.map((c) => ({ ...c })),
      variables: channel.variables.map((v) => ({ ...v })),
      imageSets: channel.imageSets.map((s) => ({ ...s, urls: [...s.urls] })),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    // Filter out empty credentials/variables/imageSets
    const cleanedCredentials = formData.credentials.filter((c) => c.key.trim());
    const cleanedVariables = formData.variables.filter((v) => v.name.trim());
    const cleanedImageSets = formData.imageSets
      .map((s) => ({ ...s, urls: s.urls.filter((u) => u.trim()) }))
      .filter((s) => s.name.trim());

    if (editingChannel) {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === editingChannel.id
            ? {
                ...ch,
                name: formData.name,
                nameAr: formData.nameAr,
                type: formData.type,
                active: formData.active,
                credentials: cleanedCredentials,
                variables: cleanedVariables,
                imageSets: cleanedImageSets,
              }
            : ch
        )
      );
    } else {
      const newChannel: Channel = {
        id: `ch-${Date.now()}`,
        name: formData.name,
        nameAr: formData.nameAr,
        type: formData.type,
        active: formData.active,
        credentials: cleanedCredentials,
        variables: cleanedVariables,
        imageSets: cleanedImageSets,
      };
      setChannels((prev) => [...prev, newChannel]);
    }
    setDialogOpen(false);
    setEditingChannel(null);
  };

  const handleDelete = (id: string) => {
    setChannels((prev) => prev.filter((ch) => ch.id !== id));
    setDeleteConfirmId(null);
  };

  const toggleChannelActive = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, active: !ch.active } : ch))
    );
  };

  // ─── Form Helpers ────────────────────────────────────────────────────────

  const updateCredential = (index: number, field: "key" | "value", val: string) => {
    setFormData((prev) => {
      const creds = [...prev.credentials];
      creds[index] = { ...creds[index], [field]: val };
      return { ...prev, credentials: creds };
    });
  };

  const addCredential = () => {
    setFormData((prev) => ({
      ...prev,
      credentials: [...prev.credentials, { key: "", value: "" }],
    }));
  };

  const removeCredential = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }));
  };

  const updateVariable = (index: number, field: "name" | "value", val: string) => {
    setFormData((prev) => {
      const vars = [...prev.variables];
      vars[index] = { ...vars[index], [field]: val };
      return { ...prev, variables: vars };
    });
  };

  const addVariable = () => {
    setFormData((prev) => ({
      ...prev,
      variables: [...prev.variables, { name: "", value: "" }],
    }));
  };

  const removeVariable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const updateImageSet = (
    setIndex: number,
    field: "name",
    val: string
  ) => {
    setFormData((prev) => {
      const sets = [...prev.imageSets];
      sets[setIndex] = { ...sets[setIndex], [field]: val };
      return { ...prev, imageSets: sets };
    });
  };

  const updateImageSetUrl = (
    setIndex: number,
    urlIndex: number,
    val: string
  ) => {
    setFormData((prev) => {
      const sets = [...prev.imageSets];
      const urls = [...sets[setIndex].urls];
      urls[urlIndex] = val;
      sets[setIndex] = { ...sets[setIndex], urls };
      return { ...prev, imageSets: sets };
    });
  };

  const addImageSetUrl = (setIndex: number) => {
    setFormData((prev) => {
      const sets = [...prev.imageSets];
      sets[setIndex] = {
        ...sets[setIndex],
        urls: [...sets[setIndex].urls, ""],
      };
      return { ...prev, imageSets: sets };
    });
  };

  const removeImageSetUrl = (setIndex: number, urlIndex: number) => {
    setFormData((prev) => {
      const sets = [...prev.imageSets];
      sets[setIndex] = {
        ...sets[setIndex],
        urls: sets[setIndex].urls.filter((_, i) => i !== urlIndex),
      };
      return { ...prev, imageSets: sets };
    });
  };

  const addImageSet = () => {
    setFormData((prev) => ({
      ...prev,
      imageSets: [...prev.imageSets, { name: "", urls: [""] }],
    }));
  };

  const removeImageSet = (setIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      imageSets: prev.imageSets.filter((_, i) => i !== setIndex),
    }));
  };

  // ─── Inline Edit Helpers for Cards ───────────────────────────────────────

  const updateChannelCredential = (
    channelId: string,
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const creds = [...ch.credentials];
        creds[index] = { ...creds[index], [field]: val };
        return { ...ch, credentials: creds };
      })
    );
  };

  const addChannelCredential = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        return { ...ch, credentials: [...ch.credentials, { key: "", value: "" }] };
      })
    );
  };

  const removeChannelCredential = (channelId: string, index: number) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        return {
          ...ch,
          credentials: ch.credentials.filter((_, i) => i !== index),
        };
      })
    );
  };

  const updateChannelVariable = (
    channelId: string,
    index: number,
    field: "name" | "value",
    val: string
  ) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const vars = [...ch.variables];
        vars[index] = { ...vars[index], [field]: val };
        return { ...ch, variables: vars };
      })
    );
  };

  const addChannelVariable = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        return { ...ch, variables: [...ch.variables, { name: "", value: "" }] };
      })
    );
  };

  const removeChannelVariable = (channelId: string, index: number) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        return {
          ...ch,
          variables: ch.variables.filter((_, i) => i !== index),
        };
      })
    );
  };

  const addChannelImageSetUrl = (channelId: string, setIndex: number) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const sets = [...ch.imageSets];
        sets[setIndex] = {
          ...sets[setIndex],
          urls: [...sets[setIndex].urls, ""],
        };
        return { ...ch, imageSets: sets };
      })
    );
  };

  const removeChannelImageSetUrl = (
    channelId: string,
    setIndex: number,
    urlIndex: number
  ) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const sets = [...ch.imageSets];
        sets[setIndex] = {
          ...sets[setIndex],
          urls: sets[setIndex].urls.filter((_, i) => i !== urlIndex),
        };
        return { ...ch, imageSets: sets };
      })
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
          rtl && "sm:flex-row-reverse"
        )}
      >
        <div className="space-y-1">
          <h2
            className={cn(
              "text-2xl font-bold tracking-tight",
              rtl && "font-arabic text-right"
            )}
          >
            {t(locale, "channels.title")}
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-sm",
              rtl && "font-arabic text-right"
            )}
          >
            {t(locale, "channels.subtitle")}
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className={cn(
            "gap-2 shrink-0 bg-sage-600 hover:bg-sage-700 text-white",
            rtl && "font-arabic"
          )}
        >
          <Plus className="w-4 h-4" />
          {t(locale, "channels.addChannel")}
        </Button>
      </div>

      {/* Channel Cards */}
      <div className="grid gap-4 md:gap-6">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            locale={locale}
            rtl={rtl}
            onToggleActive={toggleChannelActive}
            onEdit={openEditDialog}
            onDelete={handleDelete}
            deleteConfirmId={deleteConfirmId}
            setDeleteConfirmId={setDeleteConfirmId}
            onUpdateCredential={updateChannelCredential}
            onAddCredential={addChannelCredential}
            onRemoveCredential={removeChannelCredential}
            onUpdateVariable={updateChannelVariable}
            onAddVariable={addChannelVariable}
            onRemoveVariable={removeChannelVariable}
            onAddImageSetUrl={addChannelImageSetUrl}
            onRemoveImageSetUrl={removeChannelImageSetUrl}
          />
        ))}
      </div>

      {/* Add/Edit Channel Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={cn("sm:max-w-2xl max-h-[90vh] overflow-y-auto", rtl && "font-arabic")}
          dir={rtl ? "rtl" : "ltr"}
        >
          <DialogHeader className={cn(rtl && "text-right items-end")}>
            <DialogTitle className={rtl && "font-arabic text-right"}>
              {editingChannel
                ? t(locale, "channels.editChannel")
                : t(locale, "channels.addChannel")}
            </DialogTitle>
            <DialogDescription className={rtl && "font-arabic text-right"}>
              {editingChannel
                ? rtl
                  ? "تعديل إعدادات القناة"
                  : "Modify channel settings"
                : rtl
                  ? "إضافة قناة تواصل جديدة"
                  : "Add a new communication channel"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Channel Name */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic")}>
                {t(locale, "channels.channelName")}
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={
                  rtl ? "أدخل اسم القناة" : "Enter channel name"
                }
                className={cn(rtl && "font-arabic text-right")}
              />
            </div>

            {/* Channel Type */}
            <div className="space-y-2">
              <Label className={cn(rtl && "font-arabic")}>
                {t(locale, "channels.channelType")}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: val as ChannelType,
                  }))
                }
              >
                <SelectTrigger className={cn("w-full", rtl && "font-arabic")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <Separator />

            {/* Credentials Section */}
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <Key className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 shrink-0" />
                <Label className={cn("text-sm font-semibold", rtl && "font-arabic")}>
                  {t(locale, "channels.credentials")}
                </Label>
              </div>
              <div className="space-y-2">
                {formData.credentials.map((cred, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    <Input
                      value={cred.key}
                      onChange={(e) => updateCredential(idx, "key", e.target.value)}
                      placeholder={t(locale, "channels.credentialKey")}
                      className={cn("flex-1", rtl && "font-arabic text-right")}
                    />
                    <Input
                      value={cred.value}
                      onChange={(e) => updateCredential(idx, "value", e.target.value)}
                      placeholder={t(locale, "channels.credentialValue")}
                      className={cn("flex-1", rtl && "font-arabic text-right")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeCredential(idx)}
                      disabled={formData.credentials.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCredential}
                className={cn("gap-1", rtl && "font-arabic")}
              >
                <Plus className="w-3 h-3" />
                {t(locale, "channels.addCredential")}
              </Button>
            </div>

            <Separator />

            {/* Variables Section */}
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <Variable className="w-4 h-4 text-sage-600 dark:text-sage-400 shrink-0" />
                <Label className={cn("text-sm font-semibold", rtl && "font-arabic")}>
                  {t(locale, "channels.variables")}
                </Label>
              </div>
              <div className="space-y-2">
                {formData.variables.map((v, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    <Input
                      value={v.name}
                      onChange={(e) => updateVariable(idx, "name", e.target.value)}
                      placeholder={t(locale, "channels.variableName")}
                      className={cn("flex-1", rtl && "font-arabic text-right")}
                    />
                    <Input
                      value={v.value}
                      onChange={(e) => updateVariable(idx, "value", e.target.value)}
                      placeholder={t(locale, "channels.variableValue")}
                      className={cn("flex-1", rtl && "font-arabic text-right")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariable(idx)}
                      disabled={formData.variables.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addVariable}
                className={cn("gap-1", rtl && "font-arabic")}
              >
                <Plus className="w-3 h-3" />
                {t(locale, "channels.addVariable")}
              </Button>
            </div>

            <Separator />

            {/* Image Sets Section */}
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <ImageIcon className="w-4 h-4 text-sand-600 dark:text-sand-400 shrink-0" />
                <Label className={cn("text-sm font-semibold", rtl && "font-arabic")}>
                  {t(locale, "channels.imageSets")}
                </Label>
              </div>
              <div className="space-y-4">
                {formData.imageSets.map((imgSet, setIdx) => (
                  <div
                    key={setIdx}
                    className="p-3 rounded-lg border bg-muted/30 space-y-2"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        rtl && "flex-row-reverse"
                      )}
                    >
                      <Input
                        value={imgSet.name}
                        onChange={(e) =>
                          updateImageSet(setIdx, "name", e.target.value)
                        }
                        placeholder={t(locale, "channels.imageSetName")}
                        className={cn("flex-1", rtl && "font-arabic text-right")}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeImageSet(setIdx)}
                        disabled={formData.imageSets.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {imgSet.urls.map((url, urlIdx) => (
                      <div
                        key={urlIdx}
                        className={cn(
                          "flex items-center gap-2 pl-4",
                          rtl && "flex-row-reverse pr-4 pl-0"
                        )}
                      >
                        <Input
                          value={url}
                          onChange={(e) =>
                            updateImageSetUrl(setIdx, urlIdx, e.target.value)
                          }
                          placeholder={t(locale, "channels.imageUrl")}
                          className={cn("flex-1", rtl && "font-arabic text-right")}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeImageSetUrl(setIdx, urlIdx)}
                          disabled={imgSet.urls.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addImageSetUrl(setIdx)}
                      className={cn("gap-1 ml-4", rtl && "font-arabic ml-0 mr-4")}
                    >
                      <Plus className="w-3 h-3" />
                      {t(locale, "channels.addImage")}
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addImageSet}
                className={cn("gap-1", rtl && "font-arabic")}
              >
                <Plus className="w-3 h-3" />
                {t(locale, "channels.addImageSet")}
              </Button>
            </div>
          </div>

          <DialogFooter
            className={cn(rtl && "flex-row-reverse sm:flex-row-reverse")}
          >
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className={rtl ? "font-arabic" : ""}
            >
              {t(locale, "cancel")}
            </Button>
            <Button
              onClick={handleSave}
              className={cn(
                "bg-sage-600 hover:bg-sage-700 text-white",
                rtl && "font-arabic"
              )}
            >
              {t(locale, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ChannelCard Sub-Component ────────────────────────────────────────────────

interface ChannelCardProps {
  channel: Channel;
  locale: "ar" | "en";
  rtl: boolean;
  onToggleActive: (id: string) => void;
  onEdit: (channel: Channel) => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  onUpdateCredential: (channelId: string, index: number, field: "key" | "value", val: string) => void;
  onAddCredential: (channelId: string) => void;
  onRemoveCredential: (channelId: string, index: number) => void;
  onUpdateVariable: (channelId: string, index: number, field: "name" | "value", val: string) => void;
  onAddVariable: (channelId: string) => void;
  onRemoveVariable: (channelId: string, index: number) => void;
  onAddImageSetUrl: (channelId: string, setIndex: number) => void;
  onRemoveImageSetUrl: (channelId: string, setIndex: number, urlIndex: number) => void;
}

function ChannelCard({
  channel,
  locale,
  rtl,
  onToggleActive,
  onEdit,
  onDelete,
  deleteConfirmId,
  setDeleteConfirmId,
  onUpdateCredential,
  onAddCredential,
  onRemoveCredential,
  onUpdateVariable,
  onAddVariable,
  onRemoveVariable,
  onAddImageSetUrl,
  onRemoveImageSetUrl,
}: ChannelCardProps) {
  const config = channelTypeConfig[channel.type];
  const Icon = config.icon;
  const isConfirmingDelete = deleteConfirmId === channel.id;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow duration-200 hover:shadow-md",
        !channel.active && "opacity-75"
      )}
    >
      {/* Card Header */}
      <CardHeader className="pb-0">
        <div
          className={cn(
            "flex items-start justify-between gap-4",
            rtl && "flex-row-reverse"
          )}
        >
          <div className={cn("flex items-center gap-3", rtl && "flex-row-reverse")}>
            <div
              className={cn(
                "p-2.5 rounded-xl shrink-0",
                config.iconBg
              )}
            >
              <Icon className={cn("w-5 h-5", config.textColor)} />
            </div>
            <div className={cn("min-w-0", rtl && "text-right")}>
              <CardTitle
                className={cn("text-base", rtl && "font-arabic")}
              >
                {rtl ? channel.nameAr : channel.name}
              </CardTitle>
              <div
                className={cn(
                  "flex items-center gap-2 mt-1",
                  rtl && "flex-row-reverse justify-end"
                )}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-medium border",
                    config.bgColor,
                    config.textColor,
                    config.borderColor
                  )}
                >
                  {rtl ? config.labelAr : config.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-medium border gap-1",
                    channel.active
                      ? "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400 border-sage-200 dark:border-sage-800/40"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {channel.active ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {channel.active
                    ? t(locale, "active")
                    : t(locale, "inactive")}
                </Badge>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 shrink-0",
              rtl && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2",
                rtl && "flex-row-reverse"
              )}
            >
              <Label
                htmlFor={`switch-${channel.id}`}
                className={cn(
                  "text-xs text-muted-foreground cursor-pointer",
                  rtl && "font-arabic"
                )}
              >
                {t(locale, "channels.toggleActive")}
              </Label>
              <Switch
                id={`switch-${channel.id}`}
                checked={channel.active}
                onCheckedChange={() => onToggleActive(channel.id)}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Expandable Sections */}
        <Accordion type="multiple" className="w-full mt-2">
          {/* Credentials */}
          <AccordionItem value="credentials">
            <AccordionTrigger
              className={cn(
                "text-sm font-medium hover:no-underline",
                rtl && "font-arabic text-right flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <Key className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                {t(locale, "channels.credentials")}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {channel.credentials.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {channel.credentials.map((cred, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    <Input
                      value={cred.key}
                      onChange={(e) =>
                        onUpdateCredential(channel.id, idx, "key", e.target.value)
                      }
                      className={cn(
                        "flex-1 font-mono text-xs h-8",
                        rtl && "text-right"
                      )}
                      readOnly
                    />
                    <span className="text-muted-foreground text-xs">=</span>
                    <Input
                      value={cred.value}
                      onChange={(e) =>
                        onUpdateCredential(channel.id, idx, "value", e.target.value)
                      }
                      className={cn(
                        "flex-1 font-mono text-xs h-8",
                        rtl && "text-right"
                      )}
                      readOnly
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveCredential(channel.id, idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddCredential(channel.id)}
                  className={cn("gap-1 text-xs h-7", rtl && "font-arabic")}
                >
                  <Plus className="w-3 h-3" />
                  {t(locale, "channels.addCredential")}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Variables */}
          <AccordionItem value="variables">
            <AccordionTrigger
              className={cn(
                "text-sm font-medium hover:no-underline",
                rtl && "font-arabic text-right flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <Variable className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                {t(locale, "channels.variables")}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {channel.variables.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {channel.variables.map((v, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2",
                      rtl && "flex-row-reverse"
                    )}
                  >
                    <Input
                      value={v.name}
                      onChange={(e) =>
                        onUpdateVariable(channel.id, idx, "name", e.target.value)
                      }
                      className={cn(
                        "flex-1 font-mono text-xs h-8",
                        rtl && "text-right"
                      )}
                      readOnly
                    />
                    <span className="text-muted-foreground text-xs">=</span>
                    <Input
                      value={v.value}
                      onChange={(e) =>
                        onUpdateVariable(channel.id, idx, "value", e.target.value)
                      }
                      className={cn(
                        "flex-1 font-mono text-xs h-8",
                        rtl && "text-right"
                      )}
                      readOnly
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveVariable(channel.id, idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddVariable(channel.id)}
                  className={cn("gap-1 text-xs h-7", rtl && "font-arabic")}
                >
                  <Plus className="w-3 h-3" />
                  {t(locale, "channels.addVariable")}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Image Sets */}
          <AccordionItem value="imageSets">
            <AccordionTrigger
              className={cn(
                "text-sm font-medium hover:no-underline",
                rtl && "font-arabic text-right flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  rtl && "flex-row-reverse"
                )}
              >
                <ImageIcon className="w-4 h-4 text-sand-600 dark:text-sand-400" />
                {t(locale, "channels.imageSets")}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {channel.imageSets.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {channel.imageSets.map((imgSet, setIdx) => (
                  <Collapsible key={setIdx}>
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        rtl && "flex-row-reverse"
                      )}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "gap-1 p-0 h-auto font-medium text-sm hover:bg-transparent",
                            rtl && "font-arabic"
                          )}
                        >
                          <ChevronDown className="w-3 h-3 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                          {imgSet.name || t(locale, "channels.imageSetName")}
                        </Button>
                      </CollapsibleTrigger>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {imgSet.urls.length} {rtl ? "صور" : "images"}
                      </Badge>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-2 space-y-1.5 pl-4">
                        {imgSet.urls.map((url, urlIdx) => (
                          <div
                            key={urlIdx}
                            className={cn(
                              "flex items-center gap-2",
                              rtl && "flex-row-reverse"
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0",
                                config.iconBg
                              )}
                            >
                              <ImageIcon
                                className={cn("w-4 h-4", config.textColor)}
                              />
                            </div>
                            <Input
                              value={url}
                              readOnly
                              className={cn(
                                "flex-1 font-mono text-xs h-8",
                                rtl && "text-right"
                              )}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() =>
                                onRemoveImageSetUrl(channel.id, setIdx, urlIdx)
                              }
                              disabled={imgSet.urls.length <= 1}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddImageSetUrl(channel.id, setIdx)}
                          className={cn("gap-1 text-xs h-7", rtl && "font-arabic")}
                        >
                          <Plus className="w-3 h-3" />
                          {t(locale, "channels.addImage")}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-3" />

        {/* Card Actions */}
        <div
          className={cn(
            "flex items-center gap-2",
            rtl ? "justify-start" : "justify-end"
          )}
        >
          {isConfirmingDelete ? (
            <div
              className={cn(
                "flex items-center gap-2",
                rtl && "flex-row-reverse"
              )}
            >
              <span
                className={cn(
                  "text-xs text-destructive font-medium",
                  rtl && "font-arabic"
                )}
              >
                {t(locale, "channels.deleteConfirm")}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(channel.id)}
                className={cn("h-7 text-xs", rtl && "font-arabic")}
              >
                {t(locale, "delete")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className={cn("h-7 text-xs", rtl && "font-arabic")}
              >
                {t(locale, "cancel")}
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(channel)}
                className={cn("gap-1 h-7 text-xs", rtl && "font-arabic")}
              >
                {t(locale, "edit")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(channel.id)}
                className={cn(
                  "gap-1 h-7 text-xs text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5",
                  rtl && "font-arabic"
                )}
              >
                {t(locale, "channels.deleteChannel")}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
