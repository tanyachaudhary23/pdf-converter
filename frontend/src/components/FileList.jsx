import { formatSize } from "../utils/format";

export default function FileList({ files, onRemove }) {
  if (files.length === 0) return null;

  return (
    <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {files.map((file, index) => (
        <li
          key={`${file.name}-${file.size}-${index}`}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}