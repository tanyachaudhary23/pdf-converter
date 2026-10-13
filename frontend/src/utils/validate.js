import { MAX_FILE_SIZE } from "../config/tools";

// Returns the new list of files plus a list of error messages.
export function validateFiles(tool, existing, incoming) {
  const errors = [];
  const accepted = [];

  for (const file of incoming) {
    if (!tool.mimeTypes.includes(file.type)) {
      errors.push(`${file.name}: unsupported file type.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: larger than 10 MB.`);
      continue;
    }
    accepted.push(file);
  }

  let combined = tool.multiple ? [...existing, ...accepted] : accepted.slice(0, 1);

  if (combined.length > tool.maxFiles) {
    errors.push(`You can add at most ${tool.maxFiles} files.`);
    combined = combined.slice(0, tool.maxFiles);
  }

  return { files: combined, errors };
}