const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function convertFiles(tool, files, ranges) {
  const formData = new FormData();
  files.forEach((file) => formData.append(tool.fieldName, file));

  if (tool.needsRanges) {
    // Pasted text often has a typographic dash (1–3); the backend expects "-"
    const cleaned = ranges.trim().replace(/[‐-―−]/g, "-");
    formData.append("ranges", cleaned);
  }

  let response;
  try {
    // Do NOT set a Content-Type header here. The browser adds it
    // (with the boundary that separates the parts).
    response = await fetch(`${API_BASE}/api/convert/${tool.id}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return { blob: await response.blob(), filename: tool.outputName };
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    if (data && data.error) {
      return data.error;
    }
  } catch {
    // the body was not JSON, fall through
  }
  return `Request failed (status ${response.status}).`;
}
