import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Files, ShieldCheck } from "lucide-react";
import InfoModal from "./InfoModal";

export default function Layout() {
  const [info, setInfo] = useState(null); // "help" | "privacy" | null
  const { pathname } = useLocation();

  // Start at the top of the page whenever you open a different page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Folío home">
          <span className="logo-mark">
            <Files strokeWidth={1.7} />
          </span>
          <span>
            folío<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-active" : "nav-link")}>
            All tools
          </NavLink>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setInfo("help")}>
            Help
            <ArrowUpRight />
          </button>
        </nav>

        <span className="privacy-pill">
          <ShieldCheck size={15} />A little more peace of mind.
        </span>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="flex items-center gap-5">
          <span className="footer-brand">folío.</span>
          <span>A little less paperwork. A little more life.</span>
        </div>
        <div className="footer-right">
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setInfo("privacy")}>
            Privacy
          </button>
          <span>© {new Date().getFullYear()} Folío</span>
        </div>
      </footer>

      {info && <InfoModal type={info} onClose={() => setInfo(null)} />}
    </div>
  );
}
