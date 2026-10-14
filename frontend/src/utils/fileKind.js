// Decides what kind of file this is: "image", "pdf" or "other".
// The browser's file.type can be empty on some computers, so the
// file extension is used as a backup. The backend does the real check.
export function fileKind(file) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();

  if (type === "image/jpeg" || type === "image/png" || /\.(jpe?g|png)$/.test(name)) {
    return "image";
  }
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  return "other";
}
