import type { NotificationAlertOption } from "@/components/settings/NotificationsForm";

/**
 * Jenis email alert admin. Setiap opsi dipetakan ke event yang benar-benar ada
 * di panel admin (lihat src/app/admin/actions.ts & halaman admin terkait).
 */
export const ADMIN_NOTIFICATION_ALERTS: NotificationAlertOption[] = [
  {
    key: "notifyAdminVerification",
    label: "Permintaan Verifikasi Profil & Gear Baru",
    description: "Email saat kreator mengajukan verifikasi profil atau gear baru di Antrean Verifikasi Profil.",
  },
  {
    key: "notifyAdminDispute",
    label: "Sengketa Baru di Pusat Sengketa",
    description: "Email segera saat ada laporan sengketa booking/kolaborasi baru yang perlu ditengahi admin.",
  },
  {
    key: "notifyAdminCommerce",
    label: "Transaksi & Booking yang Perlu Moderasi",
    description: "Email saat ada transaksi atau booking yang tertahan, bermasalah, atau membutuhkan tinjauan admin.",
  },
  {
    key: "notifyAdminProjectModeration",
    label: "Proyek & Brief Baru Menunggu Moderasi",
    description: "Email saat brief proyek baru dipublikasikan, dilaporkan, atau melewati batas waktu dan perlu ditinjau.",
  },
];

export const ADMIN_NOTIFICATION_KEYS = ADMIN_NOTIFICATION_ALERTS.map((a) => a.key);
