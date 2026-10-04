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
}

export function MessengerClient({
  currentActor,
  initialConversations,
  activePartner,
  initialMessages,
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
      "wa saja",
    ];
    return phonePattern.test(inputText.replace(/[\s-]/g, "")) || keywords.some((k) => lower.includes(k));
  }, [inputText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling pembaruan pesan setiap 5 detik jika ada partner aktif
  useEffect(() => {
    if (!activePartner) return;

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
    }, 5000);

    return () => clearInterval(interval);
  }, [activePartner]);

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
        alert(res.error || "Gagal mengirim pesan.");
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

        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        alert(res.error || "Gagal mengirim tawaran proyek.");
      }
    });
  }

  async function handleOfferResponse(messageId: string, status: "ACCEPTED" | "DECLINED") {
    if (!activePartner) return;

    startTransition(async () => {
      const res = await respondToOfferAction(messageId, status);
      if (res.success) {
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        alert(res.error || "Gagal merespons tawaran.");
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
      });

      if (res.success) {
        setDeliveryTitle("");
        setDeliveryUrl("");
        setDeliveryNotes("");

        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        alert(res.error || "Gagal mengirimkan berkas hasil proyek.");
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
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        alert(res.error || "Gagal merespons serah terima hasil proyek.");
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
        const refetch = await fetchMessagesAction(activePartner.id);
        if (refetch.success) setMessages(refetch.messages);
      } else {
        alert(res.error || "Gagal mengajukan mediasi.");
      }
    });
  }

  const cleanPhone = activePartner?.phone ? activePartner.phone.replace(/[^0-9]/g, "").replace(/^0/, "62") : null;
  const waLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${activePartner?.name}, saya sedang terhubung dengan Anda di Messenger RAMU.`)}`
    : null;

  return (
    <div className="bg-white border border-stone-200/90 shadow-xs rounded-none h-[calc(100vh-140px)] min-h-[580px] flex overflow-hidden">
      {/* ============================================================ */}
      {/* PANE KIRI: DAFTAR PERCAKAPAN (CONVERSATIONS LIST)             */}
      {/* ============================================================ */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-stone-200/80 flex flex-col shrink-0 bg-stone-50/40 ${activePartner ? "hidden md:flex" : "flex"}`}>
        {/* Header Kontak */}
        <div className="p-4 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
              Pesan &amp; Negosiasi
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
              Proteksi Escrow Aktif
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kreator atau pesan..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200/80 text-xs text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E] transition-all"
            />
          </div>
        </div>

        {/* List Obrolan */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = activePartner?.id === conv.partnerId;
              const initial = conv.partnerName.slice(0, 2).toUpperCase();

              return (
                <button
                  key={conv.partnerId}
                  onClick={() => router.push(`/messages?with=${conv.partnerId}`)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected ? "bg-white border-l-4 border-l-[#1E1B2E] shadow-2xs" : "hover:bg-white/80"
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.partnerAvatar ? (
                      <img
                        src={conv.partnerAvatar}
                        alt={conv.partnerName}
                        className="w-11 h-11 object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-[#1E1B2E] text-white flex items-center justify-center font-bold text-xs">
                        {initial}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-[#1E1B2E] truncate">{conv.partnerName}</h4>
                      <span className="text-[10px] text-stone-400 font-medium shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 truncate mb-1">
                      {conv.partnerSector}
                    </div>
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-bold text-[#1E1B2E]" : "text-stone-500"}`}>
                      {conv.lastMessageType === "OFFER" ? (
                        <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> [Tawaran Proyek Resmi]
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
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <p>Belum ada riwayat percakapan.</p>
              <p className="text-[11px] text-stone-400">
                Pilih profil di direktori lalu klik &quot;Kirim Pesan Resmi&quot; untuk memulai negosiasi.
              </p>
            </div>
          )}
        </div>

        {/* Tips Footer */}
        <div className="p-3 bg-stone-100/70 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Transaksi terlindungi Escrow 100% jika disepakati di sini.</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANE KANAN: RUANG OBROLAN AKTIF (ACTIVE CHAT THREAD)          */}
      {/* ============================================================ */}
      {activePartner ? (
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Header Partner & Tombol WhatsApp Bantuan */}
          <div className="px-5 py-3.5 border-b border-stone-200/90 flex items-center justify-between gap-4 bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push("/messages")}
                className="md:hidden p-1 text-stone-400 hover:text-stone-700"
              >
                &larr;
              </button>

              <div className="w-9 h-9 shrink-0 bg-[#1E1B2E] text-white flex items-center justify-center font-bold text-xs">
                {activePartner.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E1B2E] truncate">{activePartner.name}</h3>
                  <Link
                    href={`/directory/${activePartner.id}`}
                    target="_blank"
                    className="text-stone-400 hover:text-[#1E1B2E] transition-colors"
                    title="Lihat Profil Publik"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  {activePartner.sector} • {activePartner.location || "Indonesia"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1B2E] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Kirim Tawaran Proyek</span>
                <span className="sm:hidden">Tawaran</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:border-[#1E1B2E] bg-white text-stone-700 hover:text-[#1E1B2E] text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                title="Serahkan tautan berkas hasil kerja (master foto/video) untuk disetujui klien"
              >
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Serah Terima Hasil</span>
                <span className="sm:hidden">Hasil</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMediationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer"
                title="Pusat Bantuan & Mediasi Resmi RAMU bila terjadi kendala on-set atau sengketa"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Bantuan Mediasi</span>
              </button>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-emerald-600/30 hover:border-emerald-600 bg-emerald-50 text-emerald-800 text-[11px] font-bold transition-colors"
                  title="Gunakan WhatsApp hanya untuk koordinasi cepat di hari-H. Seluruh pembayaran wajib di RAMU."
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline">WA (Darurat)</span>
                </a>
              )}
            </div>
          </div>

          {/* BANNER KEAMANAN ESCROW ANTI-FRAUD */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Jaminan Escrow RAMU:</strong> Seluruh kesepakatan harga &amp; termin pembayaran wajib disahkan di sini agar terlindungi dari wanprestasi &amp; pembatalan sepihak.
              </span>
            </div>
            <Link
              href={`/directory/${activePartner.id}`}
              className="text-amber-800 hover:underline font-bold text-[10px] uppercase tracking-wider shrink-0"
            >
              Lihat Tarif Resmi &rarr;
            </Link>
          </div>

          {/* KONTEN PESAN (CHAT THREAD) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 bg-stone-100 flex items-center justify-center text-stone-400">
                  <Sparkles className="w-6 h-6 text-stone-300" />
                </div>
                <h4 className="text-sm font-bold text-[#1E1B2E]">Mulai Percakapan Resmi</h4>
                <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                  Sapa {activePartner.name}, diskusikan tanggal sesi, kirimkan moodboard, atau buat draf tawaran proyek langsung di sini.
                </p>
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-4 py-2 bg-white border border-stone-300 hover:border-[#1E1B2E] text-xs font-bold text-[#1E1B2E] shadow-2xs"
                >
                  Ajukan Tawaran Proyek Sekarang &rarr;
                </button>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_actor_id === currentActor.id;

                if (msg.message_type === "SYSTEM") {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-stone-100 border border-stone-200 text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        <Info className="w-3 h-3 text-stone-400" />
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
                      <div className="w-full max-w-md bg-white border border-stone-300 shadow-md p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-amber-700" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E1B2E]">
                              Tawaran Proyek Resmi (In-App Deal)
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                              isAcceptedOffer
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isDeclinedOffer
                                ? "bg-red-50 text-red-800 border-red-200"
                                : "bg-amber-50 text-amber-900 border-amber-200"
                            }`}
                          >
                            {isAcceptedOffer ? "Disetujui" : isDeclinedOffer ? "Ditolak" : "Menunggu Respon"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#1E1B2E]">{meta.title || "Tawaran Proyek Kolaborasi"}</h4>
                          <div className="mt-2 text-xl font-black text-[#1E1B2E]">{meta.budget || "Tarif Negosiasi"}</div>
                        </div>

                        <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 border border-stone-100">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span><strong>Jadwal:</strong> {meta.sessionDate || "Fleksibel"}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-stone-400 mt-0.5" />
                            <span><strong>Lingkup:</strong> {meta.outputDetails}</span>
                          </div>
                          {meta.notes && (
                            <div className="pt-1 text-[11px] text-stone-500 italic border-t border-stone-200/50 mt-1">
                              &ldquo;{meta.notes}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        {!isMe && isPendingOffer && (
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOfferResponse(msg.id, "ACCEPTED")}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Terima Tawaran Proyek
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOfferResponse(msg.id, "DECLINED")}
                              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Tolak
                            </button>
                          </div>
                        )}

                        {isAcceptedOffer && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Tawaran Resmi Disetujui Kedua Pihak!</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Langkah selanjutnya: Buat kontrak kolaborasi resmi dan setorkan deposit 50% ke Escrow RAMU untuk mengunci jadwal.
                            </p>
                            <Link
                              href="/collaborations"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-950 uppercase tracking-wider hover:underline"
                            >
                              <span>Buka Kontrak Kolaborasi</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}

                        <div className="text-[10px] text-stone-400 flex items-center justify-between">
                          <span>Dilindungi Standar Escrow RAMU</span>
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
                      <div className="w-full max-w-md bg-white border border-stone-300 shadow-md p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <PackageCheck className="w-4 h-4 text-emerald-700" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E1B2E]">
                              Serah Terima Hasil Proyek (Deliverables)
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                              isAcceptedDelivery
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isRevisionDelivery
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-900 border-amber-200"
                            }`}
                          >
                            {isAcceptedDelivery
                              ? "Disetujui & Selesai"
                              : isRevisionDelivery
                              ? "Minta Revisi"
                              : "Menunggu Review Klien"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-[#1E1B2E]">
                            {meta.title || "Hasil Karya & Berkas Master Proyek"}
                          </h4>
                          {meta.storageUrl && (
                            <a
                              href={meta.storageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#1E1B2E] text-xs font-bold transition-colors border border-stone-200 truncate max-w-full"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                              <span className="truncate">Akses Berkas Master (Drive / Cloud) &rarr;</span>
                            </a>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-stone-600 bg-stone-50 p-3 border border-stone-100">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block mb-0.5">
                            Rincian Deliverables &amp; Catatan
                          </span>
                          <p className="whitespace-pre-wrap">{meta.deliverableNotes}</p>
                        </div>

                        {/* Tombol Aksi Klien */}
                        {!isMe && isPendingDelivery && (
                          <div className="pt-2 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeliveryResponse(msg.id, "ACCEPTED")}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Terima &amp; Selesaikan Proyek (Lepas Escrow)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const revNotes = prompt("Masukkan catatan revisi yang diinginkan:");
                                if (revNotes !== null) {
                                  handleDeliveryResponse(msg.id, "REVISION_REQUESTED", revNotes);
                                }
                              }}
                              className="w-full py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                            >
                              Minta Penyesuaian / Revisi
                            </button>
                          </div>
                        )}

                        {isAcceptedDelivery && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Proyek Dinyatakan Selesai &amp; Dana Escrow Cair</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Hak tayang resmi aktif, berkas telah diterima dengan baik, dan dana termin telah diteruskan kepada mitra kreator.
                            </p>
                          </div>
                        )}

                        <div className="text-[10px] text-stone-400 flex items-center justify-between">
                          <span>Dilindungi Standar Escrow RAMU</span>
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
                      className={`max-w-[75%] p-3.5 text-xs leading-relaxed space-y-1 ${
                        isMe
                          ? "bg-[#1E1B2E] text-white"
                          : "bg-white border border-stone-200/90 text-stone-900 shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[9px] text-right ${
                          isMe ? "text-stone-300" : "text-stone-400"
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

          {/* PERINGATAN ANTI-BYPASS TRANSAKSI (SMART LEAKAGE WARNING) */}
          {hasLeakageWarning && (
            <div className="px-4 py-2 bg-amber-50/90 border-t border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Perhatian Keamanan:</strong> Demi keamanan dari wanprestasi &amp; penipuan, seluruh komitmen harga wajib disahkan di RAMU agar terlindungi garansi Escrow &amp; bantuan mediasi resmi bila terjadi sengketa.
              </span>
            </div>
          )}

          {/* COMPOSER INPUT BAR */}
          <form
            onSubmit={handleSendMessage}
            className="p-3.5 border-t border-stone-200/90 bg-white flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <button
              type="button"
              onClick={() => setIsOfferModalOpen(true)}
              className="p-2 text-stone-500 hover:text-[#1E1B2E] hover:bg-stone-100 transition-colors shrink-0"
              title="Kirim Tawaran Proyek Resmi"
            >
              <Briefcase className="w-4 h-4 text-amber-700" />
            </button>

            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
              title="Serahkan Berkas Hasil Proyek (Drive / Cloud Link)"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Tulis pesan atau brief untuk ${activePartner.name}...`}
              className="flex-1 py-2 px-3 bg-stone-50 border border-stone-200 text-xs text-[#1E1B2E] placeholder-stone-400 focus:outline-none focus:border-[#1E1B2E]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isPending}
              className="px-4 py-2 bg-[#1E1B2E] hover:bg-black disabled:bg-stone-200 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      ) : (
        /* JIKA TIDAK ADA OBROLAN YANG DIPILIH */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 text-center bg-stone-50/40 space-y-3">
          <div className="w-14 h-14 bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-xs">
            <MessageCircle className="w-6 h-6 text-stone-300" />
          </div>
          <h3 className="text-base font-bold text-[#1E1B2E]">Pusat Pesan &amp; Negosiasi RAMU</h3>
          <p className="text-xs text-stone-500 max-w-md leading-relaxed">
            Pilih salah satu kontak di sisi kiri untuk melanjutkan percakapan, atau kunjungi Direktori Kreator untuk memulai negosiasi dan tawaran proyek baru yang dilindungi Escrow.
          </p>
          <Link
            href="/directory"
            className="px-4 py-2 bg-[#1E1B2E] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Jelajahi Direktori Talenta &rarr;
          </Link>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL AJUKAN TAWARAN PROYEK RESMI (IN-APP DEAL OFFER)         */}
      {/* ============================================================ */}
      {isOfferModalOpen && activePartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Ajukan Tawaran Proyek Resmi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/70 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Tawaran ini akan dikirimkan sebagai kartu kesepakatan resmi kepada <strong>{activePartner.name}</strong>. Jika diterima, dana DP akan diamankan oleh Escrow RAMU.
              </span>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Judul Proyek / Kampanye *
                </label>
                <input
                  type="text"
                  required
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="Contoh: Photoshoot Lookbook Koleksi Musim Panas 2026"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                    Nilai Kompensasi / Anggaran (Rp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={offerBudget}
                    onChange={(e) => setOfferBudget(e.target.value)}
                    placeholder="Contoh: Rp 2.500.000"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                    Estimasi Tanggal Pemotretan
                  </label>
                  <input
                    type="date"
                    value={offerDate}
                    onChange={(e) => setOfferDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Rincian Deliverables &amp; Hak Tayang
                </label>
                <input
                  type="text"
                  value={offerOutput}
                  onChange={(e) => setOfferOutput(e.target.value)}
                  placeholder="Contoh: 15 Looks Katalog • Hak Tayang Digital & E-Commerce 1 Tahun"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Catatan Tambahan / Lokasi
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Contoh: Disediakan MUA on-set, lokasi di Studio Imaji Jakarta Selatan."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#1E1B2E] hover:bg-black text-white font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Serah Terima Hasil Proyek (Deliverables)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200/70 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Klien akan menerima notifikasi resmi untuk memeriksa berkas. Setelah klien mengonfirmasi kepuasan, dana Escrow akan otomatis dicairkan.
              </span>
            </div>

            <form onSubmit={handleSendDelivery} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Judul Berkas &amp; Luaran *
                </label>
                <input
                  type="text"
                  required
                  value={deliveryTitle}
                  onChange={(e) => setDeliveryTitle(e.target.value)}
                  placeholder="Contoh: Master 20 Foto Lookbook Resolusi Tinggi & 2 Video Reels 9:16"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Tautan Penyimpanan Cloud (Google Drive / Dropbox / WeTransfer) *
                </label>
                <input
                  type="url"
                  required
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Catatan Teknis / Penyerahan
                </label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Contoh: Seluruh foto telah melalui color grading & retouching kulit alami. Format JPG sRGB resolusi penuh siap cetak dan katalog digital."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-lg shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E1B2E]">
                  Pusat Bantuan &amp; Mediasi RAMU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediationModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Tim Kepatuhan RAMU mengedepankan prinsip musyawarah mufakat &amp; perlindungan adil untuk kedua belah pihak. Status pencairan dana akan diamankan selama peninjauan (SLA tanggapan &lt; 24 jam).
              </span>
            </div>

            <form onSubmit={handleSendMediation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Kategori Kendala *
                </label>
                <select
                  value={mediationCategory}
                  onChange={(e) => setMediationCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                >
                  <option value="Penyesuaian Jadwal Mendesak (Reschedule)">Penyesuaian Jadwal Mendesak (Reschedule / Force Majeure)</option>
                  <option value="Ketidakhadiran di Lokasi (No-Show)">Ketidakhadiran di Lokasi Sesi (No-Show)</option>
                  <option value="Kualitas Output Tidak Sesuai Brief">Kualitas / Output Tidak Sesuai Brief Kesepakatan</option>
                  <option value="Komunikasi Terputus (Ghosting > 24 Jam)">Komunikasi Terputus / Tanpa Kabar (Ghosting &gt; 24 Jam)</option>
                  <option value="Kendala Finansial / Penagihan">Kendala Finansial / Penagihan Dana Escrow</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
                  Kronologi &amp; Penjelasan Kendala *
                </label>
                <textarea
                  rows={4}
                  required
                  value={mediationChronology}
                  onChange={(e) => setMediationChronology(e.target.value)}
                  placeholder="Jelaskan secara jelas apa yang terjadi, tanggal kejadian, serta harapan solusi Anda (misal: minta reschedule, refund parsial, atau percepatan konfirmasi)..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-[#1E1B2E]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediationModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-600 font-bold uppercase tracking-wider text-[11px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
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
