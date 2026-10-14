import { useEffect } from "react";
import { Heart, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { TOOLS } from "../config/tools";
import ToolCard from "../components/ToolCard";

export default function HomePage() {
  useEffect(() => {
    document.title = "Folío — PDF tools, minus the fuss";
  }, []);

  return (
    <>
      <section className="intro">
        <div className="eyebrow">
          <Sparkles />
          Small tools. Big possibilities.
        </div>
        <h1>
          PDFs, <span className="headline-accent">minus the fuss.</span>
        </h1>
        <p>
          Convert, combine, and make it yours.
          <br />
          Your everyday PDF toolkit, all in one happy place.
        </p>
      </section>

      <section aria-labelledby="tools-title">
        <div className="tools-heading">
          <h2 id="tools-title">What would you like to do?</h2>
          <span>4 tools. Zero fuss.</span>
        </div>
        <div className="tool-grid">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <div className="trust-strip">
        <span>
          <ShieldCheck />
          Privacy comes first
        </span>
        <span>
          <Zap />
          Less waiting, more doing
        </span>
        <span>
          <Heart />
          Made for your everyday
        </span>
      </div>
    </>
  );
}
