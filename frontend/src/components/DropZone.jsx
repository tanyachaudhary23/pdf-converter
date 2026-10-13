import { useRef, useState } from "react";

export default function DropZone({ accept, multiple, hint, onFilesSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDragOver(e) {
    e.preventDefault(); // required, otherwise the browser will not allow a drop
    setDragging(true);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    onFilesSelected(Array.from(e.dataTransfer.files));
  }

  function handleInputChange(e) {
    onFilesSelected(Array.from(e.target.files));
    e.target.value = ""; // lets you pick the same file again later
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current.click()}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        dragging
          ? "border-blue-500 bg-blue-50"
          : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
      />
      <p className="text-base font-medium text-slate-800">
        Drag and drop {multiple ? "files" : "a file"} here
      </p>
      <p className="mt-1 text-sm text-slate-500">or click to browse</p>
      <p className="mt-3 text-xs text-slate-400">{hint}</p>
    </div>
  );
}