import Modal from "./Modal";

const CONTENT = {
  help: {
    title: "A little help with your PDFs.",
    text: [
      "Choose a tool, then drop or select your files. Images to PDF accepts JPG and PNG images. The other tools accept PDFs.",
      "Merging needs at least two PDFs, and the little arrows on each file set the order. To split, type page ranges like 1-3, 5, 8. Each range becomes its own PDF inside a ZIP.",
    ],
  },
  privacy: {
    title: "Your files, your business.",
    text: [
      "Files you add are sent to the converter only to create your result. They are processed in memory and are not saved, and the page clears your selection when a conversion finishes.",
      "The small previews you see are drawn in your browser.",
    ],
  },
};

export default function InfoModal({ type, onClose }) {
  const content = CONTENT[type];

  return (
    <Modal titleId="info-title" onClose={onClose}>
      <h2 id="info-title" className="font-display text-2xl font-medium">
        {content.title}
      </h2>
      {content.text.map((paragraph) => (
        <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
      <button type="button" autoFocus onClick={onClose} className="btn btn-ink btn-lg mt-6">
        Got it
      </button>
    </Modal>
  );
}
