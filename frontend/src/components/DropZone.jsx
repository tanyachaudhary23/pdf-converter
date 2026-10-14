import { useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";

export default function DropZone({ tool, disabled, onFilesSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    if (!disabled) inputRef.current.click();
  }

  function handleDragOver(e) {
    e.preventDefault(); // required, otherwise the browser will not allow a drop
    if (!disabled) setDragging(true);
  }

  function handleDrop(e) {
    e.preventDefault(); // stops the browser from opening the dropped file
    setDragging(false);
    if (!disabled) onFilesSelected(Array.from(e.dataTransfer.files));
  }

  function handleInputChange(e) {
    onFilesSelected(Array.from(e.target.files));
    e.target.value = ""; // lets you pick the same file again later
  }

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""} ${disabled ? "disabled" : ""}`}
      onClick={openPicker}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Select files"
        accept={tool.accept}
        multiple={tool.multiple}
        className="hidden"
        onChange={handleInputChange}
      />
      <Upload size={30} />
      <p>{tool.dropText}</p>
      <button type="button" className="btn btn-ink btn-action" disabled={disabled}>
        <Plus />
        {tool.chooseText}
      </button>
      <div className="workspace-note mt-3">{tool.hint}</div>
    </div>
  );
}
