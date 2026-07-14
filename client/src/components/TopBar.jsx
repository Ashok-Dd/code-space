import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, Maximize2, Minimize2, Plus } from "lucide-react";
import LanguageSelect from "./LanguageSelect";
import ConnectionStatus from "./ConnectionStatus";
import LockMenu from "./LockMenu";
import UserMenu from "./UserMenu";
import Logo from "./Logo";
import { useAuth } from "../context/useAuth";

function TopBar({
  roomId,
  language,
  onLanguageChange,
  status,
  viewers,
  isFullscreen,
  onToggleFullscreen,
  onCopyLink,
  onNewRoom,
  isProtected,
  onSetPassword,
}) {
  const [copied, setCopied] = useState(false);
  const { user, loading } = useAuth();

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-gray-800/70 bg-[#0d1117]/90 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
        <div className="flex items-baseline whitespace-nowrap">
          <span className="font-medium text-sm text-gray-100 tracking-tight">GrabCode</span>
          <span className="hidden sm:inline text-gray-600 mx-2">/</span>
          <span className="hidden sm:inline font-mono text-xs text-purple-400 truncate">{roomId}</span>
        </div>
        <ConnectionStatus status={status} viewers={viewers} />
      </div>

      {/* The logo/brand on the left never shrinks; if the toolbar doesn't fit
          a very narrow screen, it scrolls horizontally within itself instead
          of squeezing the brand or breaking the page layout. */}
      <div className="flex items-center gap-1 sm:gap-2 shrink overflow-x-auto no-scrollbar max-w-[58vw] sm:max-w-none justify-end">
        <LanguageSelect value={language} onChange={onLanguageChange} />
        <div className="shrink-0">
          <LockMenu isProtected={isProtected} onSetPassword={onSetPassword} />
        </div>
        <button
          onClick={handleCopy}
          title="Copy share link"
          aria-label="Copy share link"
          className="shrink-0 p-1.5 sm:px-3 sm:py-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-gray-300"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
        </button>
        <button
          onClick={onNewRoom}
          title="New snippet"
          aria-label="New snippet"
          className="shrink-0 p-1.5 sm:px-3 sm:py-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-gray-300"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="shrink-0 p-1.5 sm:p-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-gray-300 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        {!loading && (
          user ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-xs font-semibold text-gray-300 transition-all whitespace-nowrap"
            >
              Sign in
            </Link>
          )
        )}
      </div>
    </header>
  );
}

export default TopBar;
