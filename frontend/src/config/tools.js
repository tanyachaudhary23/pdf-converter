export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, same as the backend

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const PDF_TYPES = ["application/pdf"];

// "id" must match the backend URL ending: /api/convert/<id>
export const TOOLS = [
  {
    id: "images-to-pdf",
    label: "Images to PDF",
    hint: "JPG or PNG, up to 10 files",
    accept: ".jpg,.jpeg,.png",
    mimeTypes: IMAGE_TYPES,
    multiple: true,
    minFiles: 1,
    maxFiles: 10,
    fieldName: "files",
    outputName: "converted.pdf",
  },
  {
    id: "pdf-to-images",
    label: "PDF to Images",
    hint: "One PDF, up to 50 pages",
    accept: ".pdf",
    mimeTypes: PDF_TYPES,
    multiple: false,
    minFiles: 1,
    maxFiles: 1,
    fieldName: "file",
    outputName: "pages.zip",
  },
  {
    id: "merge-pdfs",
    label: "Merge PDFs",
    hint: "2 to 10 PDFs",
    accept: ".pdf",
    mimeTypes: PDF_TYPES,
    multiple: true,
    minFiles: 2,
    maxFiles: 10,
    fieldName: "files",
    outputName: "merged.pdf",
  },
  {
    id: "split-pdf",
    label: "Split PDF",
    hint: "One PDF, up to 50 pages",
    accept: ".pdf",
    mimeTypes: PDF_TYPES,
    multiple: false,
    minFiles: 1,
    maxFiles: 1,
    fieldName: "file",
    outputName: "split.zip",
    needsRanges: true,
  },
];