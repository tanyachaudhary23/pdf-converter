import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { TOOLS } from "../config/tools";
import { validateFiles } from "../utils/validate";
import { convertFiles } from "../api/converter";
import { downloadBlob } from "../utils/download";
import DropZone from "../components/DropZone";
import FileGrid from "../components/FileGrid";
import ResultModal from "../components/ResultModal";

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) return <Navigate to="/" replace />;

  // "key" gives every tool a completely fresh state when you switch tools
  return <ToolWorkspace key={tool.id} tool={tool} />;
}

function ToolWorkspace({ tool }) {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [ranges, setRanges] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null); // { blob, filename } after success

  const Icon = tool.icon;
  const loading = status === "loading";
  const canConvert =
    !loading && files.length >= tool.minFiles && (!tool.needsRanges || ranges.trim() !== "");

  useEffect(() => {
    const previous = document.title;
    document.title = `${tool.title} · Folío`;
    return () => {
      document.title = previous;
    };
  }, [tool.title]);

  function clearMessage() {
    setStatus("idle");
    setMessage("");
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

  function moveFile(index, offset) {
    if (loading) return;
    const target = index + offset;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  }

  async function handleConvert() {
    setStatus("loading");
    setMessage("");
    try {
      const { blob, filename } = await convertFiles(tool, files, ranges);

      // Success: clear the page and let the user decide about the download
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

  return (
    <div className="mx-auto max-w-[640px] pb-14 pt-6">
      <Link to="/" className="btn btn-quiet btn-sm -ml-3">
        <ArrowLeft />
        All tools
      </Link>

      <div className="mt-5 flex items-start gap-4">
        <span className={`page-chip ${tool.card}`}>
          <Icon />
        </span>
        <div>
          <h1 className="font-display text-4xl font-medium leading-tight">{tool.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-paper p-5 sm:p-7">
        <DropZone tool={tool} disabled={loading} onFilesSelected={handleFilesSelected} />

        {errors.length > 0 && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {errors.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        )}

        <FileGrid files={files} multiple={tool.multiple} onRemove={removeFile} onMove={moveFile} />

        {tool.needsRanges && (
          <div className="mt-5">
            <label htmlFor="ranges" className="block text-sm font-medium">
              {tool.rangesLabel}
            </label>
            <input
              id="ranges"
              type="text"
              value={ranges}
              disabled={loading}
              onChange={(e) => setRanges(e.target.value)}
              placeholder={tool.rangesPlaceholder}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
            />
            <p className="workspace-note mt-1">
              Each range becomes its own PDF inside the ZIP.
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!canConvert}
          onClick={handleConvert}
          className="btn btn-ink btn-lg mt-6"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
          )}
          {loading ? "Working on it..." : tool.button}
          {!loading && <ArrowRight />}
        </button>

        {status === "error" && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {message}
          </div>
        )}

        <p className="workspace-note mt-4 flex items-center justify-center gap-2">
          <LockKeyhole size={12} />
          Your files are used only for this conversion and are not kept.
        </p>
      </div>

      {result && (
        <ResultModal
          result={result}
          onDownload={() => downloadBlob(result.blob, result.filename)}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
