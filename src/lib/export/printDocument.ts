/**
 * Helper client-side untuk pencetakan dokumen resmi (SPK, PKSK, Invoice, Call Sheet)
 * Menggunakan isolated iframe untuk memastikan dokumen dicetak full multi-halaman A4
 * tanpa terpotong batas screen, tanpa modal backdrop, dan tanpa elemen aplikasi web.
 */

export interface PrintElementOptions {
  title?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export function printElement(
  elementOrId: HTMLElement | string,
  options?: PrintElementOptions | string
): void {
  if (typeof window === "undefined") return;

  const title = typeof options === "string" ? options : options?.title || "Dokumen Resmi RAMU";
  const onBefore = typeof options === "object" ? options.onBeforePrint : undefined;
  const onAfter = typeof options === "object" ? options.onAfterPrint : undefined;

  const targetEl = typeof elementOrId === "string" 
    ? document.getElementById(elementOrId) 
    : elementOrId;

  if (!targetEl) {
    console.warn("Elemen yang akan dicetak tidak ditemukan, beralih ke window.print()");
    window.print();
    return;
  }

  onBefore?.();

  // Buat iframe terisolasi yang tidak mengganggu tampilan layar
  const iframe = document.createElement("iframe");
  iframe.setAttribute("style", "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;z-index:-999;");
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Ambil semua stylesheet dan tag style dari parent document
  const headStyles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((node) => node.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 15mm 12mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-image: none !important;
            color: #000000 !important;
            font-family: var(--font-jakarta), var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hilangkan batas overflow dan batasan tinggi pada dokumen */
          .isolated-print-canvas,
          .isolated-print-canvas > *,
          #spk-printable-area,
          #spk-collab-printable,
          #invoice-printable-area,
          #callsheet-printable-area {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          /* Hindari pemotongan sepihak di tengah pasal dan tanda tangan */
          .spk-article,
          .spk-signatures,
          .spk-audit-trail,
          .print-break-inside-avoid,
          table,
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          /* Sembunyikan tombol dan kontrol interaktif */
          button,
          .print\\:hidden,
          [role="button"] {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="isolated-print-canvas">
          ${targetEl.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  const cleanup = () => {
    onAfter?.();
    setTimeout(() => {
      try {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      } catch {}
    }, 1500);
  };

  const doPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Gagal mencetak melalui iframe:", e);
      window.print();
    } finally {
      cleanup();
    }
  };

  // Tunggu dokumen dan font selesai dimuat
  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready
      .then(() => setTimeout(doPrint, 250))
      .catch(() => setTimeout(doPrint, 350));
  } else {
    setTimeout(doPrint, 350);
  }
}
