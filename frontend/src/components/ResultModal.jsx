import { useState } from "react";
import { Check, FileText } from "lucide-react";
import Modal from "./Modal";
import { formatSize } from "../utils/format";

export default function ResultModal({ result, onDownload, onClose }) {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    onDownload();
    setDownloaded(true);
  }

  return (
    <Modal titleId="result-title" onClose={onClose}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint text-foreground">
        <Check size={24} strokeWidth={2.5} />
      </div>

      <h2 id="result-title" className="mt-4 text-center font-display text-2xl font-medium">
        {downloaded ? "File downloaded" : "Conversion complete"}
      </h2>

      <p className="mt-1 text-center text-sm text-muted-foreground">
        {downloaded
          ? "Your browser has saved the file. Check your downloads to find it."
          : "Your file is ready. Would you like to download it?"}
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
        <FileText size={24} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{result.filename}</p>
          <p className="text-xs text-muted-foreground">{formatSize(result.blob.size)}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {downloaded ? (
          <>
            <button type="button" onClick={handleDownload} className="btn btn-quiet btn-lg flex-1 ring-1 ring-border">
              Download again
            </button>
            <button type="button" autoFocus onClick={onClose} className="btn btn-ink btn-lg flex-1">
              Done
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onClose} className="btn btn-quiet btn-lg flex-1 ring-1 ring-border">
              No thanks
            </button>
            <button type="button" autoFocus onClick={handleDownload} className="btn btn-ink btn-lg flex-1">
              Download
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
