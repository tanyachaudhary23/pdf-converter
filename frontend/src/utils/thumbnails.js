import { fileKind } from "./fileKind";

const THUMB_WIDTH = 240;
let pdfjsPromise;

// pdf.js is large, so it is only downloaded the first time a PDF is added.
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import("pdfjs-dist/legacy/build/pdf.mjs"),
      import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function whiteCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff"; // PDF pages and PNGs can be transparent
  context.fillRect(0, 0, canvas.width, canvas.height);
  return { canvas, context };
}

async function imageThumbnail(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, THUMB_WIDTH / bitmap.width);
    const { canvas, context } = whiteCanvas(bitmap.width * scale, bitmap.height * scale);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    bitmap.close();
  }
}

async function pdfThumbnail(file) {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });

  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: THUMB_WIDTH / base.width });
    const { canvas, context } = whiteCanvas(viewport.width, viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    // frees the memory used by the PDF (done through the loading task)
    Promise.resolve(task.destroy()).catch(() => {});
  }
}

// Returns a small preview picture (a data URL) of the file's front.
export async function makeThumbnail(file) {
  const kind = fileKind(file);
  if (kind === "image") return imageThumbnail(file);
  if (kind === "pdf") return pdfThumbnail(file);
  return null;
}
