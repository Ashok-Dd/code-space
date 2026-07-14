import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import toast from "react-hot-toast";
import { Minimize2 } from "lucide-react";
import TopBar from "../components/TopBar";
import PasswordGate from "../components/PasswordGate";
import { useCodeSocket } from "../hooks/useCodeSocket";
import { getLanguageExtensions } from "../languages";
import { generateRandomId } from "../utils/id";

function EditorPage({ roomId }) {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    code,
    language,
    status,
    viewers,
    ready,
    notFound,
    locked,
    isProtected,
    passwordError,
    updateCode,
    updateLanguage,
    unlock,
    setPassword,
  } = useCodeSocket(roomId);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  const handleNewRoom = useCallback(() => {
    navigate(`/${generateRandomId()}`);
  }, [navigate]);

  const extensions = useMemo(
    () => [EditorView.lineWrapping, ...getLanguageExtensions(language)],
    [language]
  );

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-gray-100 px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-black mb-2">Couldn't open this link</h1>
          <p className="text-gray-500 mb-6 text-sm">
            That id isn't valid. Start a fresh snippet instead.
          </p>
          <button
            onClick={handleNewRoom}
            className="px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            New Snippet
          </button>
        </div>
      </div>
    );
  }

  if (locked) {
    return <PasswordGate roomId={roomId} error={passwordError} onSubmit={unlock} />;
  }

  return (
    <div className={`flex flex-col bg-[#0a0e17] text-gray-100 ${isFullscreen ? "fixed inset-0 z-50" : "h-screen"}`}>
      {isFullscreen ? (
        <button
          onClick={() => setIsFullscreen(false)}
          title="Exit fullscreen (Esc)"
          aria-label="Exit fullscreen"
          className="absolute top-3 right-3 z-10 p-2 bg-[#161b22]/90 hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-gray-300 backdrop-blur-xl transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <TopBar
          roomId={roomId}
          language={language}
          onLanguageChange={updateLanguage}
          status={status}
          viewers={viewers}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((f) => !f)}
          onCopyLink={handleCopyLink}
          onNewRoom={handleNewRoom}
          isProtected={isProtected}
          onSetPassword={setPassword}
        />
      )}
      <div className="flex-1 min-h-0">
        {!ready ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm font-mono">
            Connecting…
          </div>
        ) : (
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={extensions}
            onChange={updateCode}
            autoFocus
            basicSetup={{ foldGutter: true, highlightActiveLine: true }}
            style={{ height: "100%", fontSize: "13px" }}
          />
        )}
      </div>
    </div>
  );
}

export default EditorPage;
