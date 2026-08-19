import { LokaLogo } from "../common/LokaLogo.jsx";
import { MenuIcon, SunIcon, MoonIcon } from "../common/Icon.jsx";
import { SearchTrigger } from "./SearchOverlay.jsx";

// The fixed header: mobile nav toggle, brand wordmark, search, and the
// light/dark switch. Three columns, so search sits centred between the two
// clusters instead of floating over the page.
//
// The wordmark is the app's home button — the convention every reader already
// has — so it leaves whichever hub is open and returns to the landing. The
// sidebar's own "All hubs" row does the same thing; this is the one people reach
// for without looking.
export function TopBar({ theme, setTheme, onToggleNav, onOpenSearch, onHome, showNav }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* The landing has no sidebar, so there's nothing for this to open. */}
        {showNav && (
          <button className="hamburger" onClick={onToggleNav} aria-label="Toggle navigation">
            <MenuIcon />
          </button>
        )}
        <button className="brand" onClick={onHome} aria-label="Loka Design System — all hubs">
          <LokaLogo height={18} color="var(--ink)" />
        </button>
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
