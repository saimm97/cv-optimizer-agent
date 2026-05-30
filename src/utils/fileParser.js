import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

async function extractPdf(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let lastY = null;
    let line = "";

    for (const item of content.items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        text += line.trim() + "\n";
        line = "";
      }
      line += item.str + " ";
      lastY = y;
    }
    text += line.trim() + "\n\n";
  }

  return text.trim();
}

async function extractDocx(arrayBuffer) {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function parseFile(file) {
  const buf = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) return extractPdf(buf);
  if (name.endsWith(".docx")) return extractDocx(buf);
  if (name.endsWith(".doc")) {
    throw new Error("Legacy .doc not supported. Please save as .docx or PDF.");
  }
  if (name.endsWith(".txt")) return new TextDecoder().decode(buf);

  throw new Error("Unsupported file type. Use PDF, DOCX, or TXT.");
}

export const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt";
export const MIN_TEXT_LENGTH = 50;
