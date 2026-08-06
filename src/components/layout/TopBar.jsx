import { LokaLogo } from "../common/LokaLogo.jsx";
import { MenuIcon, SunIcon, MoonIcon } from "../common/Icon.jsx";
import { SearchTrigger } from "./SearchOverlay.jsx";

// The fixed header: mobile nav toggle, brand wordmark, search, and the
// light/dark switch. Three columns, so search sits centred between the two
// clusters instead of floating over the page.
export function TopBar({ theme, setTheme, onToggleNav, onOpenSearch }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onToggleNav} aria-label="Toggle navigation">
          <MenuIcon />
        </button>
        <div className="brand">
          <LokaLogo height={18} color="var(--ink)" />
        </div>
      </div>

      <SearchTrigger onOpen={onOpenSearch} />

      <div className="topbar-right">
        <div className="theme-toggle">
          <button
            className="theme-toggle-btn"
            data-active={theme === "light"}
            onClick={() => setTheme("light")}
            aria-label="Light mode"
          >
            <SunIcon />
          </button>
          <button
            className="theme-toggle-btn"
            data-active={theme === "dark"}
            onClick={() => setTheme("dark")}
            aria-label="Dark mode"
          >
            <MoonIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
