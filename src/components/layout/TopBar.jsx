import { LokaLogo } from "../common/LokaLogo.jsx";
import { MenuIcon, SunIcon, MoonIcon } from "../common/Icon.jsx";

// The fixed header: mobile nav toggle, brand wordmark, and light/dark switch.
export function TopBar({ theme, setTheme, onToggleNav }) {
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
