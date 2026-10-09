/**
 * Utilitas pemformatan mata uang Rupiah standar untuk RAMU (EYD & Bank Indonesia).
 * Memastikan setiap input nilai uang otomatis berformat standar: Rp X.XXX.XXX
 * Mendukung konversi langsung kata cepat shorthand seperti:
 * - "2jt" / "2 jt" / "2 juta" -> "Rp 2.000.000"
 * - "2.5jt" / "2,5 jt" / "2.5 juta" / "2,5 juta" -> "Rp 2.500.000"
 * - "500rb" / "500 ribu" / "500k" -> "Rp 500.000"
 * - "10m" / "10 miliar" -> "Rp 10.000.000.000"
 * - "250rb / jam" -> "Rp 250.000 / jam"
 * - "Mulai 1.5jt" -> "Mulai Rp 1.500.000"
 */

export function formatCurrencyInput(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const rawStr = String(val).trim();
  if (!rawStr || rawStr === "Rp" || rawStr === "Rp." || rawStr === "Rp. " || rawStr === "Rp ") return "";

  // Cek apakah ada prefix "Mulai "
  const startsWithMulai = /^mulai\s+/i.test(rawStr);
  const prefix = startsWithMulai ? "Mulai " : "";
  const str = startsWithMulai ? rawStr.replace(/^mulai\s+/i, "").trim() : rawStr;

  // Cek apakah ada suffix unit (misal: " / jam", " / sesi", " / foto", " / hari")
  const suffixMatch = str.match(/\s*(\/\s*[\w\s.-]+)$/i);
  const suffix = suffixMatch ? suffixMatch[1] : "";
  const coreStr = suffixMatch ? str.slice(0, suffixMatch.index).trim() : str;

  // 1. Deteksi penulisan kata cepat shorthand (misal: "2jt", "2 jt", "2 juta", "2.5jt", "2,5 juta", "500rb", "500k")
  const shorthandMatch = coreStr.match(/^r?p?\.?\s*(\d+(?:[.,]\d+)?)\s*(jt|juta|m|miliar|b|rb|ribu|k)$/i);
  if (shorthandMatch) {
    const numPart = parseFloat(shorthandMatch[1].replace(",", "."));
    const unit = shorthandMatch[2].toLowerCase();
    let multiplier = 1;
    if (unit === "jt" || unit === "juta") multiplier = 1_000_000;
    else if (unit === "m" || unit === "miliar" || unit === "b") multiplier = 1_000_000_000;
    else if (unit === "rb" || unit === "ribu" || unit === "k") multiplier = 1_000;

    const total = Math.round(numPart * multiplier);
    const formattedNum = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${prefix}Rp ${formattedNum}${suffix}`;
  }

  // 2. Jika pengguna sedang aktif mengetik huruf singkatan (misal "2 j", "2 ju", "2 jut", "2.5 j"), biarkan sementara
  const isTypingShorthand = /^r?p?\.?\s*\d+(?:[.,]\d+)?\s*[a-zA-Z]{1,4}$/i.test(coreStr);
  if (isTypingShorthand) {
    return rawStr;
  }

  // 3. Jika pengguna baru saja mengetik tanda desimal "2." atau "2," untuk shorthand desimal, biarkan sementara
  if (/^r?p?\.?\s*\d{1,2}[.,]$/i.test(coreStr)) {
    return rawStr;
  }

  // 4. Jika pengguna sedang mengetik 1-2 digit desimal bukan nol (misal "2.5" atau "1,5"), biarkan sementara agar bisa ketik 'jt'
  if (/^r?p?\.?\s*\d{1,2}[.,][1-9]\d?$/i.test(coreStr)) {
    return rawStr;
  }

  // Jika string teks murni tanpa angka sama sekali (misal "Sesuai Brief", "Terbuka Negosiasi")
  if (!/\d/.test(coreStr)) {
    return rawStr;
  }

  // 5. Ekstraksi digit angka murni dari coreStr (Standar Penulisan Angka Uang Indonesia dengan pemisah ribuan titik)
  const digits = coreStr.replace(/\D/g, "");
  if (!digits) return rawStr;

  // Hilangkan angka nol di awal kecuali jika hanya "0"
  const cleanDigits = digits.replace(/^0+(?=\d)/, "");

  // Format dengan pemisah ribuan titik (.)
  const formatted = cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${prefix}Rp ${formatted}${suffix}`;
}

export function normalizeCurrencyOnBlur(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const rawStr = String(val).trim();
  if (!rawStr) return "";

  // Jika berakhir dengan titik atau koma (misal "Rp 3." atau "3,"), buang tanda baca terakhir
  const cleaned = rawStr.replace(/[.,]$/, "");

  // Jika input berupa desimal kecil tanpa satuan (misal "1.5" atau "2.5" atau "0.5")
  const smallDecimalMatch = cleaned.match(/^r?p?\.?\s*(\d+)[.,](\d{1,2})$/i);
  if (smallDecimalMatch) {
    const num = parseFloat(`${smallDecimalMatch[1]}.${smallDecimalMatch[2]}`);
    if (num < 100) {
      // Asumsi shorthand juta (misal 1.5 -> Rp 1.500.000, 2.5 -> Rp 2.500.000)
      const total = Math.round(num * 1_000_000);
      const formattedNum = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return "Rp " + formattedNum;
    }
  }

  return formatCurrencyInput(cleaned);
}

export function parseCurrencyToNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str) return 0;

  // Hilangkan prefix "Mulai " jika ada
  str = str.replace(/^mulai\s+/i, "").trim();

  // Hilangkan suffix "/ ..." jika ada
  str = str.replace(/\s*\/.*$/, "").trim();

  const shorthandMatch = str.match(/^r?p?\.?\s*(\d+(?:[.,]\d+)?)\s*(jt|juta|m|miliar|b|rb|ribu|k)$/i);
  if (shorthandMatch) {
    const numPart = parseFloat(shorthandMatch[1].replace(",", "."));
    const unit = shorthandMatch[2].toLowerCase();
    let multiplier = 1;
    if (unit === "jt" || unit === "juta") multiplier = 1_000_000;
    else if (unit === "m" || unit === "miliar" || unit === "b") multiplier = 1_000_000_000;
    else if (unit === "rb" || unit === "ribu" || unit === "k") multiplier = 1_000;
    return Math.round(numPart * multiplier);
  }

  // Jika angka desimal kecil tanpa satuan (misal 3.5 atau 1.5)
  const smallDecimalMatch = str.match(/^r?p?\.?\s*(\d+)[.,](\d{1,2})$/i);
  if (smallDecimalMatch) {
    const num = parseFloat(`${smallDecimalMatch[1]}.${smallDecimalMatch[2]}`);
    if (num < 100) {
      return Math.round(num * 1_000_000);
    }
  }

  const digits = str.replace(/\D/g, "");
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  const num = typeof amount === "number" ? amount : parseCurrencyToNumber(amount);
  const formattedNum = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "Rp " + formattedNum;
}
