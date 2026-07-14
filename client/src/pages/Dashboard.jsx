import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Lock, Plus, LogOut, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/useAuth";
import { mySnippetsRequest } from "../authApi";
import { generateRandomId } from "../utils/id";
import { getLanguageLabel } from "../languages";
import { formatRelativeTime } from "../utils/time";

const SORT_OPTIONS = [
  { id: "updated", label: "Last edited" },
  { id: "views", label: "Most viewed" },
  { id: "alpha", label: "Alphabetical" },
];

function sortSnippets(snippets, sortBy) {
  const sorted = [...snippets];
  if (sortBy === "views") sorted.sort((a, b) => b.views - a.views);
  else if (sortBy === "alpha") sorted.sort((a, b) => a.id.localeCompare(b.id));
  else sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return sorted;
}

function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    mySnippetsRequest()
      .then(setSnippets)
      .catch(() => toast.error("Couldn't load your snippets"))
      .finally(() => setLoading(false));
  }, [authLoading, user, navigate]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? snippets.filter(
          (s) => s.id.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q)
        )
      : snippets;
    return sortSnippets(filtered, sortBy);
  }, [snippets, query, sortBy]);

  const handleNewSnippet = () => navigate(`/${generateRandomId()}`);
  const handleLogout = async () => {
    // No explicit navigate here — the guard effect above redirects to
    // /login as soon as `user` clears, and having two navigations racing
    // against each other (this one vs. the guard effect) was non-deterministic.
    await logout();
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0a0e17]" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-800/70">
        <div className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <span className="font-black text-sm tracking-tight">GrabCode</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-sm text-gray-400">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewSnippet}
            className="px-3 py-2 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Snippet
          </button>
          <span className="hidden sm:inline text-sm text-gray-400 ml-2">{user?.username}</span>
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="p-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-red-500/40 rounded-lg text-gray-300 hover:text-red-400 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your snippets…"
              className="w-full pl-9 pr-3 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#161b22] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 text-sm font-mono py-16">Loading…</p>
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-4">
              {snippets.length === 0 ? "No snippets yet." : "Nothing matches your search."}
            </p>
            {snippets.length === 0 && (
              <button
                onClick={handleNewSnippet}
                className="px-5 py-2.5 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Create your first snippet
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((snippet) => (
              <Link
                key={snippet.id}
                to={`/${snippet.id}`}
                className="block bg-[#161b22] border border-gray-800 hover:border-purple-500/40 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm text-purple-400 truncate">{snippet.id}</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded">
                      {getLanguageLabel(snippet.language)}
                    </span>
                    {snippet.isProtected && <Lock className="w-3 h-3 text-gray-500 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {snippet.views}
                    </span>
                    <span>{formatRelativeTime(snippet.updatedAt)}</span>
                  </div>
                </div>
                <pre className="text-xs text-gray-400 font-mono overflow-hidden text-ellipsis whitespace-pre-wrap line-clamp-2">
                  {snippet.preview || "// empty"}
                </pre>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
