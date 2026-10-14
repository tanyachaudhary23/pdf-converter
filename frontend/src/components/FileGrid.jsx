import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { useThumbnail } from "../hooks/useThumbnail";
import { fileKey } from "../utils/fileKey";
import { formatSize } from "../utils/format";

function FileTile({ file, index, total, canReorder, onRemove, onMove }) {
  const src = useThumbnail(file);

  return (
    <li className="file-tile">
      <div className="file-thumb">
        {src ? <img src={src} alt={`Preview of ${file.name}`} /> : <FileText size={34} />}

        {canReorder && <span className="file-order">{index + 1}</span>}

        <button
          type="button"
          className="file-round file-remove"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <X />
        </button>

        {canReorder && (
          <>
            <button
              type="button"
              className="file-round file-move-left"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label={`Move ${file.name} earlier`}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="file-round file-move-right"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              aria-label={`Move ${file.name} later`}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <div className="file-meta">
        <p title={file.name}>{file.name}</p>
        <small>{formatSize(file.size)}</small>
      </div>
    </li>
  );
}

// Small previews of the uploaded files. For tools that take several files,
// the arrows change the order (the order of the result follows it).
export default function FileGrid({ files, multiple, onRemove, onMove }) {
  if (files.length === 0) return null;

  return (
    <ul className="file-grid" aria-label="Selected files">
      {files.map((file, index) => (
        <FileTile
          key={fileKey(file)}
          file={file}
          index={index}
          total={files.length}
          canReorder={multiple && files.length > 1}
          onRemove={() => onRemove(index)}
          onMove={(offset) => onMove(index, offset)}
        />
      ))}
    </ul>
  );
}
