"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  FileText,
  User,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Calendar,
  X,
  Plus,
  PackageCheck,
  LifeBuoy,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import {
  DirectMessageItem,
  ConversationSummary,
} from "@/application/messageService";
import {
  sendDirectMessageAction,
  sendProjectOfferAction,
  respondToOfferAction,
  fetchMessagesAction,
  sendProjectDeliveryAction,
  respondToDeliveryAction,
  reportMediationIssueAction,
} from "@/app/messages/actions";
import { ActorAvatar } from "@/components/ui/ActorAvatar";
import { toast } from "@/components/ui/Toast";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { createClient } from "@/lib/supabase/client";

export interface SuggestedPartnerItem {
  id: string;
  name: string;
  sector: string;
  avatarUrl: string | null;
  contextLabel: string;
}

interface MessengerClientProps {
  currentActor: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
  };
  initialConversations: ConversationSummary[];
  activePartner: {
    id: string;
    name: string;
    sector: string;
    actorType: string;
    location: string | null;
    avatarUrl: string | null;
    phone: string | null;
  } | null;
  initialMessages: DirectMessageItem[];
  suggestedPartners?: SuggestedPartnerItem[];
}

export function MessengerClient({
  currentActor,
  initialConversations,
  activePartner,
  initialMessages,
  suggestedPartners = [],
}: MessengerClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState<DirectMessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form tawaran proyek cepat
  const [offerTitle, setOfferTitle] = useState("");
  const [offerBudget, setOfferBudget] = useState("");
  const [offerDate, setOfferDate] = useState("");
  const [offerOutput, setOfferOutput] = useState("");
  const [offerNotes, setOfferNotes] = useState("");

  // Form serah terima hasil proyek
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryStage, setDeliveryStage] = useState<"WATERMARKED_PREVIEW" | "FINAL_MASTER">("WATERMARKED_PREVIEW");
  const [isWatermarkVerified, setIsWatermarkVerified] = useState(false);
  const [deliveryTitle, setDeliveryTitle] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Form bantuan mediasi sengketa
  const [isMediationModalOpen, setIsMediationModalOpen] = useState(false);
  const [mediationCategory, setMediationCategory] = useState("Penyesuaian Jadwal Mendesak (Reschedule)");
  const [mediationChronology, setMediationChronology] = useState("");

  // Deteksi upaya transaksi di luar platform (Smart Leakage Warning)
  const hasLeakageWarning = React.useMemo(() => {
    if (!inputText.trim()) return false;
    const lower = inputText.toLowerCase();
    const phonePattern = /(?:08|\+628)[0-9]{8,12}/;
    const keywords = [
      "rekening",
      "bca",
      "mandiri",
      "bri",
      "bni",
      "transfer manual",
      "transfer langsung",
      "chat wa",
      "nomor wa",
      "no wa",
      "nomor hp",
      "no hp",
      "wa saja",
      "wa aja",
      "wa.me",
      "whatsapp",
    ];
    return phonePattern.test(inputText.replace(/[\s-]/g, "")) || keywords.some((k) => lower.includes(k));
  }, [inputText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Supabase Realtime Subscription + Resilient Fallback Polling
  useEffect(() => {
    if (!activePartner) return;

    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat_${currentActor.id}_${activePartner.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
          },
          async (payload: any) => {
            const newMsg = payload?.new;
            if (
              newMsg &&
              ((newMsg.sender_actor_id === activePartner.id && newMsg.recipient_actor_id === currentActor.id) ||
                (newMsg.sender_actor_id === currentActor.id && newMsg.recipient_actor_id === activePartner.id))
            ) {
              const res = await fetchMessagesAction(activePartner.id);
              if (res.success && res.messages) {
                setMessages(res.messages);
              }
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Realtime messenger channel error:", e);
    }

    // Resilient Fallback Polling (6 detik)
    const interval = setInterval(async () => {
      const res = await fetchMessagesAction(activePartner.id);
      if (res.success && res.messages) {
        setMessages((prev) => {
          if (res.messages.length !== prev.length) {
            return res.messages;
          }
          return prev;
        });
      }
    }, 6000);

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
      clearInterval(interval);
    };
  }, [activePartner, currentActor.id]);

  const filteredConversations = conversations.filter(
    (c) =>
      c.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partnerSector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;

    const textToSend = inputText.trim();
    setInputText("");

    // Optimistic update
    const tempMessage: DirectMessageItem = {
      id: `temp-${Date.now()}`,
      sender_actor_id: currentActor.id,
      recipient_actor_id: activePartner.id,
      content: textToSend,
      message_type: "TEXT",
      metadata: {},
      is_read: false,
      created_at: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    startTransition(async () => {
      const res = await sendDirectMessageAction(activePartner.id, textToSend);
      if (!res.success) {
        toast.error(res.error || "Gagal mengirim pesan.");
      }
    });
  }

  async function handleSendOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!activePartner || !offerTitle.trim() || !offerBudget.trim()) return;

    setIsOfferModalOpen(false);

    startTransition(async () => {
      const res = await sendProjectOfferAction({
        recipientId: activePartner.id,
        title: offerTitle,
        budget: offerBudget,
        sessionDate: offerDate || "Sesuai Kesepakatan",
        outputDetails: offerOutput || "Katalog Standar & Hak Tayang Digital",
        notes: offerNotes,
      });

      if (res.success) {
        setOfferTitle("");
        setOfferBudget("");
        setOfferDate("");
        setOfferOutput("");
        setOfferNotes("");

        toast.success("Tawaran proyek berhasil dikirim!");
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        toast.error(res.error || "Gagal mengirim tawaran proyek.");
      }
    });
  }

  async function handleOfferResponse(messageId: string, status: "ACCEPTED" | "DECLINED") {
    if (!activePartner) return;

    startTransition(async () => {
      const res = await respondToOfferAction(messageId, status);
      if (res.success) {
        toast.success(status === "ACCEPTED" ? "Tawaran proyek diterima!" : "Tawaran proyek ditolak.");
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        toast.error(res.error || "Gagal merespons tawaran.");
      }
    });
  }

  async function handleSendDelivery(e: React.FormEvent) {
    e.preventDefault();
    if (!activePartner || !deliveryTitle.trim() || !deliveryUrl.trim()) return;

    setIsDeliveryModalOpen(false);

    startTransition(async () => {
      const res = await sendProjectDeliveryAction({
        recipientId: activePartner.id,
        title: deliveryTitle,
        storageUrl: deliveryUrl,
        deliverableNotes: deliveryNotes,
        deliveryStage,
      });

      if (res.success) {
        setDeliveryTitle("");
        setDeliveryUrl("");
        setDeliveryNotes("");
        setIsWatermarkVerified(false);

        toast.success("Berkas hasil proyek berhasil dikirim!");
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        toast.error(res.error || "Gagal mengirimkan berkas hasil proyek.");
      }
    });
  }

  async function handleDeliveryResponse(
    messageId: string,
    status: "ACCEPTED" | "REVISION_REQUESTED",
    notes?: string
  ) {
    if (!activePartner) return;

    startTransition(async () => {
      const res = await respondToDeliveryAction(messageId, status, notes);
      if (res.success) {
        toast.success(status === "ACCEPTED" ? "Hasil proyek disetujui!" : "Permintaan revisi telah dikirim.");
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        toast.error(res.error || "Gagal merespons serah terima hasil proyek.");
      }
    });
  }

  async function handleSendMediation(e: React.FormEvent) {
    e.preventDefault();
    if (!activePartner || !mediationChronology.trim()) return;

    setIsMediationModalOpen(false);

    startTransition(async () => {
      const res = await reportMediationIssueAction({
        partnerId: activePartner.id,
        category: mediationCategory,
        chronology: mediationChronology,
      });

      if (res.success) {
        setMediationChronology("");
        toast.success("Laporan mediasi berhasil diajukan.");
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        toast.error(res.error || "Gagal mengajukan mediasi.");
      }
    });
  }

  const cleanPhone = activePartner?.phone ? activePartner.phone.replace(/[^0-9]/g, "").replace(/^0/, "62") : null;
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${activePartner?.name}, saya sedang terhubung dengan Anda di Messenger RAMU.`)}`
    : null;

  return (
    <div className="glass-card border border-white/80 shadow-xl rounded-[22px] h-[calc(100vh-210px)] min-h-[600px] flex overflow-hidden">
      {/* ============================================================ */}
      {/* PANE KIRI: DAFTAR PERCAKAPAN (CONVERSATIONS LIST)             */}
      {/* ============================================================ */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col shrink-0 bg-slate-50/60 ${
          activePartner ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header Kontak */}
        <div className="p-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Percakapan ({filteredConversations.length})
            </h2>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 border border-slate-200/80 inline-flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Resmi
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari partner atau pesan..."
              className="w-full pl-9 pr-3.5 py-2 bg-white/90 border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* List Obrolan */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 no-scrollbar">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = activePartner?.id === conv.partnerId;

              return (
                <button
                  key={conv.partnerId}
                  onClick={() => router.push(`/messages?with=${conv.partnerId}`)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-white border border-[#4CC9FE]/50 shadow-xs text-slate-900 ring-2 ring-[#4CC9FE]/15"
                      : "hover:bg-white/80 text-slate-700 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <ActorAvatar
                      name={conv.partnerName}
                      avatarUrl={conv.partnerAvatar}
                      className="w-10 h-10 rounded-xl"
                      textClassName="text-xs"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#4CC9FE] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-2xs animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{conv.partnerName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 truncate mb-1">
                      {conv.partnerSector}
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-semibold text-slate-900" : "text-slate-500 font-normal"}`}>
                      {conv.lastMessageType === "OFFER" ? (
                        <span className="text-slate-800 font-medium inline-flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-[#0284c7]" /> [Tawaran Proyek Resmi]
                        </span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-700">Belum ada riwayat percakapan.</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                {suggestedPartners.length > 0
                  ? "Pilih salah satu rekan proyek Anda di bawah ini untuk memulai obrolan:"
                  : "Pilih profil di direktori lalu klik \"Kirim Pesan Resmi\" untuk memulai negosiasi."}
              </p>
            </div>
          )}

          {/* Quick-Connect: Rekan Kolaborasi & Pesanan Aktif */}
          {suggestedPartners.length > 0 && (
            <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 rounded-2xl mt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Rekan Kolaborasi &amp; Pesanan ({suggestedPartners.length})
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Mulai Diskusi</span>
              </div>
              <div className="space-y-1.5">
                {suggestedPartners.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => router.push(`/messages?with=${sp.id}`)}
                    className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200/70 hover:border-[#4CC9FE]/40 flex items-center justify-between gap-2.5 transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ActorAvatar
                        name={sp.name}
                        avatarUrl={sp.avatarUrl}
                        className="w-7 h-7 rounded-lg shrink-0"
                        textClassName="text-[10px]"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-[#0284c7] truncate">
                          {sp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-normal">
                          {sp.contextLabel}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 group-hover:bg-[#4CC9FE]/15 group-hover:text-[#0284c7] px-2.5 py-0.5 rounded-full shrink-0 transition-colors">
                      Chat
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips Footer */}
        <div className="p-3 bg-white/80 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Seluruh kesepakatan kolaborasi resmi terverifikasi di RAMU.</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANE KANAN: RUANG OBROLAN AKTIF (ACTIVE CHAT THREAD)          */}
      {/* ============================================================ */}
      {activePartner ? (
        <div className="flex-1 flex flex-col min-w-0 bg-white/95">
          {/* Header Partner & Tombol Action */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push("/messages")}
                className="md:hidden p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                &larr;
              </button>

              <ActorAvatar
                name={activePartner.name}
                avatarUrl={activePartner.avatarUrl}
                className="w-10 h-10 rounded-xl shrink-0 shadow-2xs"
                textClassName="text-xs"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 whitespace-nowrap">{activePartner.name}</h3>
                  <Link
                    href={`/directory/${activePartner.id}`}
                    target="_blank"
                    className="text-slate-400 hover:text-[#0284c7] p-1 rounded-full hover:bg-slate-100 transition-colors"
                    title="Lihat Profil Publik"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-xs text-slate-500 font-normal">
                  {activePartner.sector} • {activePartner.location || "Indonesia"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="btn-primary-pill inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer shadow-md shadow-[#4CC9FE]/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim Tawaran Proyek</span>
                <span className="sm:hidden">Tawaran</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Serahkan tautan berkas hasil kerja (master foto/video) untuk disetujui klien"
              >
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Serah Terima Hasil</span>
                <span className="sm:hidden">Hasil</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMediationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                title="Pusat Bantuan & Mediasi Resmi RAMU bila terjadi kendala on-set atau sengketa"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Bantuan Mediasi</span>
              </button>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all shadow-2xs"
                  title="Gunakan WhatsApp hanya untuk koordinasi teknis di hari-H. Dokumentasi kesepakatan dan SPK tetap disahkan di RAMU."
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline">WA (Darurat)</span>
                </a>
              )}
            </div>
          </div>

          {/* BANNER KEAMANAN KOLABORASI */}
          <div className="bg-sky-50/80 border-b border-sky-100 px-4 py-2 text-xs text-slate-700 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Jaminan Kolaborasi RAMU:</strong> Seluruh kesepakatan jadwal, lingkup, &amp; komitmen proyek disahkan di sini agar terdokumentasi resmi &amp; mengikat kedua pihak.
              </span>
            </div>
            <Link
              href={`/directory/${activePartner.id}`}
              className="text-[#0284c7] hover:underline font-semibold text-xs inline-flex items-center gap-1 shrink-0"
            >
              <span>Tarif Resmi</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* KONTEN PESAN (CHAT THREAD) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-[#0284c7]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Mulai Percakapan Resmi</h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-normal">
                  Sapa {activePartner.name}, diskusikan tanggal sesi, kirimkan moodboard, atau buat draf tawaran proyek langsung di sini.
                </p>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold cursor-pointer shadow-md shadow-[#4CC9FE]/20"
                >
                  <span>Ajukan Tawaran Proyek Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_actor_id === currentActor.id;

                if (msg.message_type === "SYSTEM") {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-[11px] font-medium text-slate-600">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>{msg.content}</span>
                      </div>
                    </div>
                  );
                }

                if (msg.message_type === "OFFER") {
                  const meta = msg.metadata || {};
                  const isPendingOffer = meta.offerStatus === "PENDING";
                  const isAcceptedOffer = meta.offerStatus === "ACCEPTED";
                  const isDeclinedOffer = meta.offerStatus === "DECLINED";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} my-3`}
                    >
                      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[22px] shadow-sm p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#0284c7]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Tawaran Proyek Resmi
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              isAcceptedOffer
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : isDeclinedOffer
                                ? "bg-rose-50 text-rose-700 border-rose-200/80"
                                : "bg-slate-100 text-slate-700 border-slate-200/80"
                            }`}
                          >
                            {isAcceptedOffer ? "Disetujui" : isDeclinedOffer ? "Ditolak" : "Menunggu Respon"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{meta.title || "Tawaran Proyek Kolaborasi"}</h4>
                          <div className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">{meta.budget || "Tarif Negosiasi"}</div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span><strong>Jadwal:</strong> {meta.sessionDate || "Fleksibel"}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span><strong>Lingkup:</strong> {meta.outputDetails}</span>
                          </div>
                          {meta.notes && (
                            <div className="pt-2 text-[11px] text-slate-500 italic border-t border-slate-200/60 mt-1">
                              &ldquo;{meta.notes}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        {!isMe && isPendingOffer && (
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOfferResponse(msg.id, "ACCEPTED")}
                              className="btn-primary-pill flex-1 py-2 px-4 text-xs font-semibold cursor-pointer text-center shadow-md shadow-[#4CC9FE]/20"
                            >
                              Terima Tawaran Proyek
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse(msg.id, "DECLINED")}
                              className="py-2 px-4 rounded-full border border-slate-200/80 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        )}

                        {isAcceptedOffer && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Tawaran Resmi Disetujui Kedua Pihak!</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                              {meta.collaborationId
                                ? "Ruang kolaborasi dan SPK resmi telah dibuat otomatis. Lanjutkan koordinasi tugas dan jadwal di ruang kerja proyek."
                                : "Lanjutkan koordinasi tugas dan jadwal bersama mitra di ruang kolaborasi."}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5">
                              <Link
                                href={meta.collaborationId ? `/collaborations/${meta.collaborationId}` : "/collaborations"}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-950 uppercase tracking-wider hover:underline"
                              >
                                <span>Buka Ruang Kolaborasi</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                              {meta.bookingId && (
                                <Link
                                  href={`/dashboard/bookings/${meta.bookingId}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 uppercase tracking-wider hover:underline"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Lihat SPK</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Standar Kolaborasi RAMU
                          </span>
                          <span>{new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (msg.message_type === "DELIVERY") {
                  const meta = msg.metadata || {};
                  const isPendingDelivery = meta.deliveryStatus === "PENDING_APPROVAL";
                  const isAcceptedDelivery = meta.deliveryStatus === "ACCEPTED";
                  const isRevisionDelivery = meta.deliveryStatus === "REVISION_REQUESTED";

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} my-3`}
                    >
                      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[22px] shadow-sm p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <PackageCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Serah Terima Hasil Proyek
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              isAcceptedDelivery
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                : isRevisionDelivery
                                ? "bg-rose-50 text-rose-700 border-rose-200/80"
                                : "bg-slate-100 text-slate-700 border-slate-200/80"
                            }`}
                          >
                            {isAcceptedDelivery
                              ? "Disetujui & Selesai"
                              : isRevisionDelivery
                              ? "Minta Revisi"
                              : "Menunggu Review"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {meta.title || "Hasil Karya & Berkas Master Proyek"}
                          </h4>

                          {/* Distinctive Stage Badge: Watermark Preview vs Final Clean Master */}
                          {meta.deliveryStage === "FINAL_MASTER" ? (
                            <div className="mt-2 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-800">
                                  Berkas Master Resolusi Penuh (Final Deliverable — Lunas)
                                </span>
                                <p className="text-[10px] text-emerald-800 leading-tight font-normal">
                                  Berkas bersih resolusi penuh tanpa tanda-air diserahkan setelah pembayaran selesai.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                                  Pratinjau Bertanda-Air (Tahap I: Watermark Protection)
                                </span>
                                <p className="text-[10px] text-amber-800 leading-tight font-normal">
                                  Draf bertanda-air untuk review &amp; seleksi. Klien wajib menyelesaikan pelunasan sebelum file master resolusi tinggi diserahkan.
                                </p>
                              </div>
                            </div>
                          )}

                          {meta.storageUrl && (
                            <a
                              href={meta.storageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors border border-slate-200/80 truncate max-w-full"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">
                                {meta.deliveryStage === "FINAL_MASTER"
                                  ? "Akses Berkas Master Resolusi Penuh &rarr;"
                                  : "Buka Draf Pratinjau Watermark &rarr;"}
                              </span>
                            </a>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                          <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 block">
                            Rincian Deliverables &amp; Catatan
                          </span>
                          <p className="whitespace-pre-wrap">{meta.deliverableNotes}</p>
                        </div>

                        {meta.collaborationId && (
                          <Link
                            href={`/collaborations/${meta.collaborationId}`}
                            className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-[11px] text-slate-600 transition-colors"
                          >
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                Tertaut ke: <strong className="text-slate-800">{meta.collaborationTitle || "Ruang Kolaborasi"}</strong>
                              </span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </Link>
                        )}

                        {/* Tombol Aksi Klien */}
                        {!isMe && isPendingDelivery && (
                          <div className="pt-1 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeliveryResponse(msg.id, "ACCEPTED")}
                              className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer text-center flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Terima &amp; Selesaikan Proyek (Konfirmasi Berkas)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const revNotes = prompt("Masukkan catatan revisi yang diinginkan:");
                                if (revNotes !== null) {
                                  handleDeliveryResponse(msg.id, "REVISION_REQUESTED", revNotes);
                                }
                              }}
                              className="w-full py-2 rounded-full border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer text-center"
                            >
                              Minta Penyesuaian / Revisi
                            </button>
                          </div>
                        )}

                        {isAcceptedDelivery && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Proyek Dinyatakan Selesai &amp; Berkas Terverifikasi</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed font-normal">
                              Berkas telah diterima, seluruh tugas dituntaskan, dan luaran tercatat di ruang kolaborasi.
                            </p>
                            {meta.collaborationId && (
                              <Link
                                href={`/collaborations/${meta.collaborationId}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-950 uppercase tracking-wider hover:underline"
                              >
                                <span>Lihat Rekap Proyek</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        )}

                        {isRevisionDelivery && meta.clientFeedback && (
                          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-800">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Catatan Revisi</span>
                            </div>
                            <p className="text-[11px] text-rose-800 leading-relaxed whitespace-pre-wrap">{meta.clientFeedback}</p>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Standar Kolaborasi RAMU
                          </span>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-xs leading-relaxed space-y-1 ${
                        isMe
                          ? "bg-[#4CC9FE] text-white rounded-2xl rounded-tr-xs shadow-md shadow-[#4CC9FE]/15"
                          : "bg-white border border-slate-200/90 text-slate-900 rounded-2xl rounded-tl-xs shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[9px] text-right font-medium ${
                          isMe ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* TIPS KEAMANAN TRANSAKSI RAMU */}
          {hasLeakageWarning && (
            <div className="px-4 py-2.5 bg-emerald-50/80 border-t border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 animate-fade-in shadow-xs">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-emerald-950">Tips Transaksi Aman &amp; Terlindungi</span>
                  <p className="text-[11px] text-emerald-900 leading-relaxed font-normal">
                    Pembayaran transfer langsung antar rekening resmi diakui sah. Pastikan proyek Anda tercatat dalam tawaran/SPK resmi RAMU agar jadwal, hak cipta, dan termin pembayaran Anda tetap terlindungi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="btn-primary-pill px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Buat SPK Resmi
              </button>
            </div>
          )}

          {/* COMPOSER INPUT BAR */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(true)}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Kirim Tawaran Proyek Resmi"
            >
              <Briefcase className="w-4 h-4 text-slate-600" />
            </button>

            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="p-2 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
              title="Serahkan Berkas Hasil Proyek (Drive / Cloud Link)"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Tulis pesan atau brief untuk ${activePartner.name}...`}
              className="flex-1 py-2 px-4 bg-slate-50/80 border border-slate-200/80 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all shadow-2xs font-normal"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isPending}
              className="btn-primary-pill px-4.5 py-2 text-xs font-semibold shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#4CC9FE]/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      ) : (
        /* JIKA TIDAK ADA OBROLAN YANG DIPILIH */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 text-center bg-slate-50/40 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 shadow-2xs">
            <MessageCircle className="w-6 h-6 text-[#0284c7]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Pusat Pesan &amp; Negosiasi RAMU</h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed font-normal">
            Pilih salah satu kontak di sisi kiri untuk melanjutkan percakapan, atau kunjungi Direktori Kreator untuk memulai negosiasi dan tawaran proyek baru.
          </p>
          <Link
            href="/directory"
            className="btn-primary-pill px-4.5 py-2 text-xs font-semibold shadow-md shadow-[#4CC9FE]/20 inline-flex items-center gap-1.5"
          >
            <span>Jelajahi Direktori Talenta</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL AJUKAN TAWARAN PROYEK RESMI (IN-APP DEAL OFFER)         */}
      {/* ============================================================ */}
      {isOfferModalOpen && activePartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 w-full max-w-lg rounded-[22px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#4CC9FE]/10 flex items-center justify-center text-[#4CC9FE]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ajukan Tawaran Proyek Resmi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#4CC9FE] shrink-0 mt-0.5" />
              <span>
                Tawaran ini akan dikirimkan sebagai kartu kesepakatan resmi kepada <strong className="text-slate-900">{activePartner.name}</strong>. Jika diterima, proyek otomatis terdaftar dalam ruang kolaborasi kedua belah pihak.
              </span>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Judul Proyek / Kampanye *
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Contoh: Photoshoot Lookbook Koleksi Musim Panas 2026"
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                    Nilai Kompensasi / Anggaran (Rp) *
                  </label>
                  <CurrencyInput
                    required
                    value={offerBudget}
                    onChange={(val) => setOfferBudget(val)}
                    placeholder="Rp 2.500.000"
                    className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                    Estimasi Tanggal Pemotretan
                  </label>
                  <input
                    type="date"
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Rincian Deliverables &amp; Hak Tayang
                </label>
                <input
                  type="text"
                  value={offerOutput}
                  onChange={(e) => setOfferOutput(e.target.value)}
                  placeholder="Contoh: 15 Looks Katalog • Hak Tayang Digital & E-Commerce 1 Tahun"
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Catatan Tambahan / Lokasi
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Contoh: Disediakan MUA on-set, lokasi di Studio Imaji Jakarta Selatan."
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200/80 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary-pill !text-xs !py-2 !px-5 shadow-md shadow-[#4CC9FE]/20 cursor-pointer active:scale-[0.98]"
                >
                  Kirim Tawaran Resmi &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL SERAH TERIMA HASIL PROYEK (DELIVERABLES HANDOVER)      */}
      {/* ============================================================ */}
      {isDeliveryModalOpen && activePartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 w-full max-w-lg rounded-[22px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Serah Terima Hasil Proyek (Deliverables)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Klien akan menerima notifikasi resmi untuk memeriksa berkas. Setelah klien mengonfirmasi, status serah terima tuntas dan hak tayang resmi aktif.
              </span>
            </div>

            <form onSubmit={handleSendDelivery} className="space-y-4 text-xs">
              {/* Delivery Stage Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Tahapan Penyerahan Hasil Kerja *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryStage("WATERMARKED_PREVIEW")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryStage === "WATERMARKED_PREVIEW"
                        ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500"
                        : "border-slate-200/80 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Tahap I: Pratinjau Watermark
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      Draf bertanda-air untuk review &amp; persetujuan klien sebelum pelunasan.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryStage("FINAL_MASTER")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryStage === "FINAL_MASTER"
                        ? "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600"
                        : "border-slate-200/80 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Tahap II: Master Resolusi Penuh
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      Berkas bersih tanpa watermark setelah pembayaran 100% lunas.
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Judul Berkas &amp; Luaran *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryTitle}
                  onChange={(e) => setDeliveryTitle(e.target.value)}
                  placeholder="Contoh: Master 20 Foto Lookbook Resolusi Tinggi & 2 Video Reels 9:16"
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Tautan Penyimpanan Cloud (Google Drive / Dropbox / WeTransfer) *
                </label>
                <input
                  type="url"
                  required
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Catatan Teknis / Penyerahan
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Contoh: Seluruh foto telah melalui color grading & retouching alami."
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={isWatermarkVerified}
                  onChange={(e) => setIsWatermarkVerified(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  Saya memverifikasi bahwa berkas yang diserahkan telah disesuaikan dengan tahapan pembayaran (menggunakan watermark untuk draf preview, atau berkas bersih setelah pelunasan) sesuai amanat SPK.
                </span>
              </label>

              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Garansi Retensi Penyimpanan Berkas 90 Hari</span>
                </div>
                <p className="leading-relaxed">
                  Sesuai Pasal SPK RAMU, kreator menjamin penyimpanan file master selama minimal 90 hari kalender. Klien dihimbau segera mengunduh dan mencadangkan file ke penyimpanan lokal.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200/80 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
                >
                  Serahkan Hasil Kerja &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PUSAT BANTUAN & MEDIASI RAMU (DISPUTE & MEDIATION)     */}
      {/* ============================================================ */}
      {isMediationModalOpen && activePartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 w-full max-w-lg rounded-[22px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pusat Bantuan &amp; Mediasi RAMU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediationModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Tim Kepatuhan RAMU mengedepankan prinsip musyawarah mufakat &amp; perlindungan adil untuk kedua belah pihak (SLA tanggapan &lt; 24 jam).
              </span>
            </div>

            <form onSubmit={handleSendMediation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Kategori Kendala *
                </label>
                <select
                  value={mediationCategory}
                  onChange={(e) => setMediationCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                >
                  <option value="Penyesuaian Jadwal Mendesak (Reschedule)">Penyesuaian Jadwal Mendesak (Reschedule / Force Majeure)</option>
                  <option value="Ketidakhadiran di Lokasi (No-Show)">Ketidakhadiran di Lokasi Sesi (No-Show)</option>
                  <option value="Kualitas Output Tidak Sesuai Brief">Kualitas / Output Tidak Sesuai Brief Kesepakatan</option>
                  <option value="Komunikasi Terputus (Ghosting > 24 Jam)">Komunikasi Terputus / Tanpa Kabar (Ghosting &gt; 24 Jam)</option>
                  <option value="Kendala Finansial / Penagihan">Kendala Kompensasi / Pembagian Hasil Proyek</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Kronologi &amp; Penjelasan Kendala *
                </label>
                <textarea
                  rows={4}
                  required
                  value={mediationChronology}
                  onChange={(e) => setMediationChronology(e.target.value)}
                  placeholder="Jelaskan secara jelas apa yang terjadi, tanggal kejadian, serta harapan solusi Anda (misal: minta reschedule, refund parsial, atau percepatan konfirmasi)..."
                  className="w-full p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4CC9FE] focus:ring-2 focus:ring-[#4CC9FE]/20 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediationModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200/80 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-all shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Kirim Laporan Mediasi &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
