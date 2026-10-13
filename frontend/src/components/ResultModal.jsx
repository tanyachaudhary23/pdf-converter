import { useEffect, useState } from "react";
import { formatSize } from "../utils/format";

export default function ResultModal({ result, onDownload, onClose }) {
  const [downloaded, setDownloaded] = useState(false);

  // Close the pop-up when Escape is pressed
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleDownload() {
    onDownload();
    setDownloaded(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 id="result-title" className="mt-4 text-center text-xl font-semibold text-slate-900">
          {downloaded ? "File downloaded" : "Conversion complete"}
        </h2>

        <p className="mt-1 text-center text-sm text-slate-500">
          {downloaded
            ? "Your browser has saved the file. Check your downloads to find it."
            : "Your file is ready. Would you like to download it?"}
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 shrink-0 text-slate-400"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
          </svg>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{result.filename}</p>
            <p className="text-xs text-slate-500">{formatSize(result.blob.size)}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {downloaded ? (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-xl px-4 py-2.5 font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                Download again
              </button>
              <button
                type="button"
                autoFocus
                onClick={onClose}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl px-4 py-2.5 font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                No thanks
              </button>
              <button
                type="button"
                autoFocus
                onClick={handleDownload}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Download
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}