import { MAX_FILE_SIZE } from "../config/tools";
import { fileKind } from "./fileKind";

// Returns the new list of files plus a list of error messages.
export function validateFiles(tool, existing, incoming) {
  const errors = [];
  const accepted = [];

  for (const file of incoming) {
    if (fileKind(file) !== tool.kind) {
      errors.push(
        tool.kind === "image"
          ? `${file.name}: please choose a JPG or PNG image.`
          : `${file.name}: please choose a PDF file.`
      );
      continue;
    }
    if (file.size === 0) {
      errors.push(`${file.name}: the file is empty.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: larger than 10 MB.`);
      continue;
    }
    accepted.push(file);
  }

  let combined;

  if (tool.multiple) {
    combined = [...existing];
    for (const file of accepted) {
      const duplicate = combined.some(
        (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );
      if (duplicate) {
        errors.push(`${file.name}: already added.`);
      } else {
        combined.push(file);
      }
    }
  } else if (accepted.length > 0) {
    if (accepted.length > 1) {
      errors.push(`This tool takes one file at a time. Using ${accepted[0].name}.`);
    }
    combined = [accepted[0]];
  } else {
    combined = existing; // nothing valid was added, keep what is already there
  }

  if (combined.length > tool.maxFiles) {
    errors.push(`You can add at most ${tool.maxFiles} files.`);
    combined = combined.slice(0, tool.maxFiles);
  }

  return { files: combined, errors };
}
