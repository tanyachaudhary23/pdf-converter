import { useState } from "react";
import { TOOLS } from "./config/tools";
import { validateFiles } from "./utils/validate";
import { convertFiles } from "./api/converter";
import { downloadBlob } from "./utils/download";
import DropZone from "./components/DropZone";
import FileList from "./components/FileList";
import ResultModal from "./components/ResultModal";

export default function App() {
  const [toolId, setToolId] = useState(TOOLS[0].id);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [ranges, setRanges] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null); // { blob, filename } after a successful conversion

  const tool = TOOLS.find((t) => t.id === toolId);
  const loading = status === "loading";
  const canConvert =
    !loading &&
    files.length >= tool.minFiles &&
    (!tool.needsRanges || ranges.trim() !== "");

  function clearMessage() {
    setStatus("idle");
    setMessage("");
  }

  function selectTool(id) {
    if (loading) return;
    setToolId(id);
    setFiles([]);
    setErrors([]);
    setRanges("");
    clearMessage();
  }

  function handleFilesSelected(incoming) {
    if (loading) return;
    const validated = validateFiles(tool, files, incoming);
    setFiles(validated.files);
    setErrors(validated.errors);
    clearMessage();
  }

  function removeFile(index) {
    if (loading) return;
    setFiles(files.filter((_, i) => i !== index));
    setErrors([]);
    clearMessage();
  }

  async function handleConvert() {
    setStatus("loading");
    setMessage("");
    try {
      const { blob, filename } = await convertFiles(tool, files, ranges);

      // Success: clear the screen and let the user decide about the download
      setFiles([]);
      setRanges("");
      setErrors([]);
      setStatus("idle");
      setResult({ blob, filename });
    } catch (err) {
      // Failure: keep the files so the user can fix the problem and retry
      setStatus("error");
      setMessage(err.message);
    }
  }

  function handleDownload() {
    downloadBlob(result.blob, result.filename);
  }

  function closeResult() {
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">PDF Converter</h1>
        <p className="mt-1 text-slate-500">Convert, merge and split PDFs in your browser.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={loading}
              onClick={() => selectTool(t.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                t.id === toolId
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <DropZone
            accept={tool.accept}
            multiple={tool.multiple}
            hint={tool.hint}
            onFilesSelected={handleFilesSelected}
          />

          {errors.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          )}

          <FileList files={files} onRemove={removeFile} />

          {tool.needsRanges && (
            <div className="mt-4">
              <label htmlFor="ranges" className="block text-sm font-medium text-slate-700">
                Page ranges
              </label>
              <input
                id="ranges"
                type="text"
                value={ranges}
                disabled={loading}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-3,5"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                Each range becomes its own PDF inside the ZIP.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!canConvert}
            onClick={handleConvert}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Converting..." : "Convert"}
          </button>

          {status === "error" && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </div>
          )}
        </div>
      </div>

      {result && (
        <ResultModal result={result} onDownload={handleDownload} onClose={closeResult} />
      )}
    </div>
  );
}