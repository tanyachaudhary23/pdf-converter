import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import CardArt from "./CardArt";

export default function ToolCard({ tool }) {
  const Icon = tool.icon;

  return (
    <Link to={`/tool/${tool.id}`} className={`tool-card ${tool.card}`}>
      <div className="tool-icon">
        <Icon />
      </div>
      {tool.popular && (
        <span className="card-badge">
          <Sparkles size={10} />
          Popular pick
        </span>
      )}
      <h3>{tool.title}</h3>
      <p>{tool.description}</p>
      <CardArt kind={tool.art} />
      <span className={`btn btn-action tool-cta ${tool.popular ? "btn-ink" : "btn-tool"}`}>
        {tool.button}
        <ArrowUpRight />
      </span>
    </Link>
  );
}
