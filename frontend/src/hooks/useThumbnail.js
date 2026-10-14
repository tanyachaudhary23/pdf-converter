import { useEffect, useState } from "react";
import { makeThumbnail } from "../utils/thumbnails";

// Returns a small preview of the file, or null while it loads or if it
// cannot be previewed (the tile then shows a plain file icon).
export function useThumbnail(file) {
  const [thumb, setThumb] = useState({ file: null, src: null });

  useEffect(() => {
    let cancelled = false;

    makeThumbnail(file)
      .then((src) => {
        if (!cancelled) setThumb({ file, src });
      })
      .catch(() => {
        // keep the placeholder icon if the file cannot be previewed
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return thumb.file === file ? thumb.src : null;
}
