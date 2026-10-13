import { useState } from "react";
import { TOOLS } from "./config/tools";
import { validateFiles } from "./utils/validate";
import DropZone from "./components/DropZone";
import FileList from "./components/FileList";

export default function App() {
  const [toolId, setToolId] = useState(TOOLS[0].id);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  const tool = TOOLS.find((t) => t.id === toolId);
  const canConvert = files.length >= tool.minFiles;

  function selectTool(id) {
    setToolId(id);
    setFiles([]);
    setErrors([]);
  }

  function handleFilesSelected(incoming) {
    const result = validateFiles(tool, files, incoming);
    setFiles(result.files);
    setErrors(result.errors);
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index));
    setErrors([]);
  }

  function handleConvert() {
    // Day 7: this is where we will call the backend
    console.log("Convert", tool.id, files);
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
              onClick={() => selectTool(t.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
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
              {errors.map((message, i) => (
                <p key={i}>{message}</p>
              ))}
            </div>
          )}

          <FileList files={files} onRemove={removeFile} />

          <button
            type="button"
            disabled={!canConvert}
            onClick={handleConvert}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}