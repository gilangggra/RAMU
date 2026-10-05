/**
 * Helper client-side untuk ekspor dokumen HTML ke PDF resolusi tinggi (A4)
 * menggunakan library html2pdf.js secara dinamis.
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

  const opt = {
    margin: options?.margin ?? [10, 10, 10, 10],
    filename: options?.filename ?? `SPK-RAMU-${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: options?.scale ?? 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  await html2pdf().set(opt).from(element).save();
}
