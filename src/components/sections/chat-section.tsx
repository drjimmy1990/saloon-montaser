"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { t, isRTL } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Bot,
  User,
  Headphones,
  Send,
  Plus,
  Phone,
  Instagram,
  Facebook,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageSender = "user" | "bot" | "agent";
type ChannelType = "whatsapp" | "facebook" | "instagram";

interface ChatMessage {
  id: number;
  sender: MessageSender;
  text: string;
  textAr: string;
  time: string;
}

interface Conversation {
  id: number;
  clientName: string;
  clientNameAr: string;
  channel: ChannelType;
  lastMessage: string;
  lastMessageAr: string;
  lastTime: string;
  messages: ChatMessage[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  {
    id: 1,
    clientName: "Ahmed Al-Rashid",
    clientNameAr: "أحمد الراشد",
    channel: "whatsapp",
    lastMessage: "I need to reschedule my cleaning appointment",
    lastMessageAr: "أحتاج لتغيير موعد التنظيف",
    lastTime: "10:32 AM",
    messages: [
      {
        id: 1,
        sender: "user",
        text: "Hello, I booked a cleaning service for tomorrow",
        textAr: "مرحباً، حجزت خدمة تنظيف لبكرة",
        time: "10:15 AM",
      },
      {
        id: 2,
        sender: "bot",
        text: "Welcome Ahmed! I can see your booking #1001 for Home Deep Cleaning. How can I help you?",
        textAr: "أهلاً أحمد! أرى حجزك #1001 لتنظيف عميق للمنزل. كيف أقدر أساعدك؟",
        time: "10:15 AM",
      },
      {
        id: 3,
        sender: "user",
        text: "I need to reschedule my cleaning appointment",
        textAr: "أحتاج لتغيير موعد التنظيف",
        time: "10:32 AM",
      },
      {
        id: 4,
        sender: "bot",
        text: "I can help with that! What date would work better for you?",
        textAr: "أقدر أساعدك! أي تاريخ يناسبك أفضل؟",
        time: "10:32 AM",
      },
      {
        id: 5,
        sender: "agent",
        text: "Hi Ahmed, I'm a human agent stepping in. Let me check available slots for you.",
        textAr: "أهلاً أحمد، أنا موظف بشري متدخل. خلني أشيك الأوقات المتاحة لك.",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: 2,
    clientName: "Sara Mansour",
    clientNameAr: "سارة منصور",
    channel: "facebook",
    lastMessage: "What's included in the AC maintenance package?",
    lastMessageAr: "وش يشمل باقة صيانة المكيفات؟",
    lastTime: "9:45 AM",
    messages: [
      {
        id: 1,
        sender: "user",
        text: "Hi, I saw your AC maintenance offer",
        textAr: "أهلاً، شفت عرض صيانة المكيفات",
        time: "9:30 AM",
      },
      {
        id: 2,
        sender: "bot",
        text: "Hello Sara! Great choice. Our AC maintenance package includes filter cleaning, gas check, and full inspection. Would you like to book?",
        textAr: "أهلاً سارة! اختيار ممتاز. باقة صيانة المكيفات تشمل تنظيف الفلاتر، فحص الغاز، وفحص شامل. تبي تحجزي؟",
        time: "9:30 AM",
      },
      {
        id: 3,
        sender: "user",
        text: "What's included in the AC maintenance package?",
        textAr: "وش يشمل باقة صيانة المكيفات؟",
        time: "9:45 AM",
      },
    ],
  },
  {
    id: 3,
    clientName: "Khalid Bin Nasser",
    clientNameAr: "خالد بن ناصر",
    channel: "instagram",
    lastMessage: "Can I get a quote for plumbing repair?",
    lastMessageAr: "أقدر أحصل عرض سعر لإصلاح سباكة؟",
    lastTime: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "user",
        text: "I have a leaking kitchen sink",
        textAr: "عندي تسريب في حوض المطبخ",
        time: "3:20 PM",
      },
      {
        id: 2,
        sender: "bot",
        text: "Sorry to hear that, Khalid! A leaking sink can cause water damage. We have experienced plumbers available. Can you describe the leak?",
        textAr: "سمعت الخبر يا خالد! التسريب ممكن يسبب أضرار. عندنا سباكين خبراء متاحين. تقدر تصف التسريب؟",
        time: "3:20 PM",
      },
      {
        id: 3,
        sender: "user",
        text: "It's dripping from under the sink, I think the pipe connection is loose",
        textAr: "يقطر من تحت الحوض، أظن وصلة المواسير فكّت",
        time: "3:25 PM",
      },
      {
        id: 4,
        sender: "bot",
        text: "That sounds like a connection issue. Our technician can fix that quickly. I recommend booking an urgent visit.",
        textAr: "هذا يبدو كأنه مشكلة وصلة. فنيّنا يقدر يصلحها بسرعة. أنصح بحجز زيارة مستعجلة.",
        time: "3:25 PM",
      },
      {
        id: 5,
        sender: "user",
        text: "Can I get a quote for plumbing repair?",
        textAr: "أقدر أحصل عرض سعر لإصلاح سباكة؟",
        time: "3:30 PM",
      },
      {
        id: 6,
        sender: "bot",
        text: "Of course! Standard plumbing repair starts at SAR 150. I'll send you a detailed quote now.",
        textAr: "طبعاً! إصلاح السباكة يبدأ من 150 ريال. ببعث لك عرض سعر مفصل الحين.",
        time: "3:30 PM",
      },
    ],
  },
];

// ─── Config Maps ──────────────────────────────────────────────────────────────

const channelConfig: Record<
  ChannelType,
  {
    label: string;
    labelAr: string;
    icon: typeof MessageCircle;
    color: string;
    bgColor: string;
  }
> = {
  whatsapp: {
    label: "WhatsApp",
    labelAr: "واتساب",
    icon: Phone,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  facebook: {
    label: "Facebook",
    labelAr: "ماسنجر",
    icon: Facebook,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  instagram: {
    label: "Instagram",
    labelAr: "انستجرام",
    icon: Instagram,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
};

const senderConfig: Record<
  MessageSender,
  {
    label: string;
    labelAr: string;
    icon: typeof User;
    bubbleBg: string;
    bubbleText: string;
    labelColor: string;
  }
> = {
  user: {
    label: "User",
    labelAr: "المستخدم",
    icon: User,
    bubbleBg: "bg-sage-100 dark:bg-sage-900/30",
    bubbleText: "text-sage-900 dark:text-sage-100",
    labelColor: "text-sage-600 dark:text-sage-400",
  },
  bot: {
    label: "AI Bot",
    labelAr: "البوت الذكي",
    icon: Bot,
    bubbleBg: "bg-primary/10",
    bubbleText: "text-foreground",
    labelColor: "text-primary",
  },
  agent: {
    label: "Human Agent",
    labelAr: "العميل البشري",
    icon: Headphones,
    bubbleBg: "bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800/40",
    bubbleText: "text-terracotta-900 dark:text-terracotta-100",
    labelColor: "text-terracotta-600 dark:text-terracotta-400",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatSection() {
  const { locale } = useAppStore();
  const rtl = isRTL(locale);

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  // Auto-scroll to bottom when conversation changes or messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, activeConversation?.messages.length]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectConversation = (id: number) => {
    setActiveConvId(id);
    setMobileShowChat(true);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeConvId) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: "agent",
      text: messageInput,
      textAr: messageInput,
      time: new Date().toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageInput,
              lastMessageAr: messageInput,
              lastTime: newMessage.time,
            }
          : conv
      )
    );
    setMessageInput("");
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Math.max(0, ...conversations.map((c) => c.id)) + 1,
      clientName: "New Client",
      clientNameAr: "عميل جديد",
      channel: "whatsapp",
      lastMessage: rtl ? "محادثة جديدة" : "New conversation",
      lastMessageAr: "محادثة جديدة",
      lastTime: "Now",
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const renderChannelIcon = (channel: ChannelType) => {
    const config = channelConfig[channel];
    const Icon = config.icon;
    return <Icon className={cn("w-3.5 h-3.5", config.color)} />;
  };

  /**
   * Message alignment using margin-auto approach:
   * - User: ms-auto → aligns to the END of the row (right in LTR, left in RTL)
   * - Bot: me-auto → aligns to the START of the row (left in LTR, right in RTL)
   * - Agent: mx-auto → centered
   *
   * NO flex-row-reverse used for alignment.
   */
  const getMessageAlignment = (sender: MessageSender) => {
    switch (sender) {
      case "user":
        return "ms-auto";
      case "bot":
        return "me-auto";
      case "agent":
        return "mx-auto";
    }
  };

  /** Sender label alignment mirrors the bubble alignment */
  const getLabelAlignment = (sender: MessageSender) => {
    switch (sender) {
      case "user":
        return "ms-auto w-fit";
      case "bot":
        return "me-auto w-fit";
      case "agent":
        return "mx-auto w-fit";
    }
  };

  // ─── Conversation List Panel ──────────────────────────────────────────────

  const conversationListPanel = (
    <div className="flex flex-col h-full" dir={rtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("font-semibold text-sm", rtl && "font-arabic")}>
            {t(locale, "chat.conversations")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className={cn("gap-1.5 text-xs h-8", rtl && "font-arabic")}
          >
            <Plus className="w-3.5 h-3.5" />
            {t(locale, "chat.newConversation")}
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className={cn("p-6 text-center text-muted-foreground", rtl && "font-arabic")}>
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t(locale, "chat.noConversations")}</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const chConfig = channelConfig[conv.channel];
              const ChannelIcon = chConfig.icon;
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "w-full text-start p-3 rounded-lg transition-colors duration-150 hover:bg-muted/80",
                    isActive && "bg-muted",
                    rtl && "text-right"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn("p-2 rounded-full shrink-0", chConfig.bgColor)}>
                      <ChannelIcon className={cn("w-4 h-4", chConfig.color)} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-medium truncate", rtl && "font-arabic")}>
                          {rtl ? conv.clientNameAr : conv.clientName}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums" dir="ltr">
                          {conv.lastTime}
                        </span>
                      </div>
                      <p className={cn("text-xs text-muted-foreground truncate mt-0.5", rtl && "font-arabic")}>
                        {rtl ? conv.lastMessageAr : conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // ─── Chat Area Panel ─────────────────────────────────────────────────────

  const chatAreaPanel = activeConversation ? (
    <div className="flex flex-col h-full" dir={rtl ? "rtl" : "ltr"}>
      {/* Chat Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 shrink-0"
            onClick={handleBackToList}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={rtl ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </Button>
          <div className={cn("p-2 rounded-full", channelConfig[activeConversation.channel].bgColor)}>
            {renderChannelIcon(activeConversation.channel)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cn("font-semibold text-sm", rtl && "font-arabic")}>
              {rtl ? activeConversation.clientNameAr : activeConversation.clientName}
            </h3>
            <p className={cn("text-xs text-muted-foreground", rtl && "font-arabic")}>
              {rtl
                ? channelConfig[activeConversation.channel].labelAr
                : channelConfig[activeConversation.channel].label}
            </p>
          </div>
          <Badge variant="outline" className={cn("shrink-0 text-[10px]", rtl && "font-arabic")}>
            {activeConversation.messages.length} {rtl ? "رسالة" : "msgs"}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {activeConversation.messages.map((msg) => {
            const config = senderConfig[msg.sender];
            const Icon = config.icon;
            const isAgent = msg.sender === "agent";

            return (
              <div key={msg.id} className="flex flex-col">
                {/* Sender label — aligned with bubble */}
                <div className={cn("flex items-center gap-1.5 mb-1", getLabelAlignment(msg.sender))}>
                  <Icon className={cn("w-3 h-3", config.labelColor)} />
                  <span className={cn("text-[10px] font-medium", config.labelColor, rtl && "font-arabic")}>
                    {rtl ? config.labelAr : config.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums" dir="ltr">
                    {msg.time}
                  </span>
                </div>

                {/* Message bubble — aligned via margin-auto */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isAgent && "max-w-[90%]",
                    config.bubbleBg,
                    config.bubbleText,
                    getMessageAlignment(msg.sender)
                  )}
                  dir={rtl ? "rtl" : "ltr"}
                >
                  <p className={rtl ? "font-arabic" : ""}>
                    {rtl ? msg.textAr : msg.text}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={t(locale, "chat.typeMessage")}
            className={cn("flex-1", rtl && "font-arabic")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            dir={rtl ? "rtl" : "ltr"}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="shrink-0"
            disabled={!messageInput.trim()}
          >
            <Send className={cn("w-4 h-4", rtl && "rotate-180")} />
            <span className="sr-only">{t(locale, "chat.send")}</span>
          </Button>
        </div>
      </div>
    </div>
  ) : (
    /* Empty State */
    <div className="flex items-center justify-center h-full">
      <div className={cn("text-center text-muted-foreground", rtl && "font-arabic")} dir={rtl ? "rtl" : "ltr"}>
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{t(locale, "chat.selectConversation")}</p>
      </div>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="space-y-1">
        <h2 className={cn("text-2xl font-bold tracking-tight", rtl && "font-arabic")}>
          {t(locale, "chat.title")}
        </h2>
        <p className={cn("text-muted-foreground text-sm", rtl && "font-arabic")}>
          {t(locale, "chat.subtitle")}
        </p>
      </div>

      {/* Chat Layout */}
      <Card className="py-0 overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Conversation List — Hidden on mobile when chat is shown */}
            <div
              className={cn(
                "w-full md:w-80 lg:w-96 shrink-0 h-full",
                rtl ? "border-l border-r-0" : "border-r",
                mobileShowChat && "hidden md:block"
              )}
            >
              {conversationListPanel}
            </div>

            {/* Chat Area — Hidden on mobile when list is shown */}
            <div
              className={cn(
                "flex-1 min-w-0 h-full",
                !mobileShowChat && "hidden md:block"
              )}
            >
              {chatAreaPanel}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
