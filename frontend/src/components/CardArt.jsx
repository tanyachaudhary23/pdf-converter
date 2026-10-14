import { ArrowRight, Scissors } from "lucide-react";
import landscape from "../assets/landscape.jpg";

function Paper({ label = "PDF", className = "", page }) {
  return (
    <div className={`paper-sheet ${className}`}>
      <span>{label}</span>
      <div className="paper-lines">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      {page && <small className="sheet-label">{page}</small>}
    </div>
  );
}

// The little paper illustrations on the home page cards
export default function CardArt({ kind }) {
  return (
    <div className="card-art" aria-hidden="true">
      {kind === "convert" && (
        <>
          <Paper className="art-pdf" />
          <div className="art-photo">
            <img src={landscape} width={768} height={512} loading="lazy" alt="" />
          </div>
          <span className="art-arrow">
            <ArrowRight />
          </span>
        </>
      )}
      {kind === "merge" && (
        <>
          <Paper page="01" />
          <Paper page="02" />
          <Paper page="03" />
        </>
      )}
      {kind === "split" && (
        <>
          <Paper page="01" />
          <Paper page="02" />
          <div className="split-line" />
          <Scissors className="split-scissors" />
        </>
      )}
    </div>
  );
}
