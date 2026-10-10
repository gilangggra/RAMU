/**
 * Helper client-side untuk ekspor dokumen HTML ke PDF resolusi tinggi (A4)
 * menggunakan library html2pdf.js secara dinamis.
 * Menjamin seluruh halaman dokumen diekspor penuh tanpa terpotong screen scroll.
 */

export interface ExportPdfOptions {
  filename?: string;
  margin?: number | [number, number] | [number, number, number, number];
  scale?: number;
}

export async function exportElementToPdf(
  element: HTMLElement,
  options?: ExportPdfOptions
): Promise<void> {
  if (typeof window === "undefined" || !element) {
    throw new Error("Target elemen tidak ditemukan untuk diekspor ke PDF.");
  }

  // Import dinamis html2pdf.js hanya di browser
  const html2pdfModule = (await import("html2pdf.js")) as any;
  const html2pdf = html2pdfModule.default || html2pdfModule;

  // Siapkan container off-screen dengan lebar standar A4 agar tidak terpotong oleh overflow scroll modal
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px"; // 210mm pada standar 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.padding = "0";
  container.style.margin = "0";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.overflow = "visible";
  clone.style.maxHeight = "none";
  clone.style.height = "auto";
  clone.style.width = "100%";
  clone.style.maxWidth = "100%";
  clone.style.boxShadow = "none";
  clone.style.border = "none";

  // Hapus semua batasan overflow atau scrollbar pada elemen turunan di hasil clone
  clone.querySelectorAll("*").forEach((node) => {
    const el = node as HTMLElement;
    if (el.style) {
      if (el.style.overflow || el.style.overflowY) {
        el.style.overflow = "visible";
        el.style.overflowY = "visible";
      }
      if (el.style.maxHeight && el.style.maxHeight !== "none") {
        el.style.maxHeight = "none";
      }
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const opt = {
      margin: options?.margin ?? [10, 10, 12, 10],
      filename: options?.filename ?? `DOKUMEN-RAMU-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: options?.scale ?? 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        windowWidth: 794,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(container).save();
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}
