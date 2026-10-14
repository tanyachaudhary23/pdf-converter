// Gives every File object a stable id, so React keeps the right thumbnail
// with the right file when files are removed or reordered.
const ids = new WeakMap();
let nextId = 1;

export function fileKey(file) {
  if (!ids.has(file)) {
    ids.set(file, nextId++);
  }
  return ids.get(file);
}
