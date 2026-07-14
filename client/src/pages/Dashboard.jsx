import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Lock, Plus, LogOut, Eye, Copy, Trash2, FileCode2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/useAuth";
import { mySnippetsRequest, deleteSnippetRequest } from "../authApi";
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

function StatCard({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="bg-[#161b22]/80 border border-gray-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-gray-500 mb-2">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-black bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}

function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const stats = useMemo(
    () => ({
      total: snippets.length,
      views: snippets.reduce((sum, s) => sum + s.views, 0),
      protected: snippets.filter((s) => s.isProtected).length,
    }),
    [snippets]
  );

  const handleNewSnippet = () => navigate(`/${generateRandomId()}`);

  const handleLogout = async () => {
    // No explicit navigate here — the guard effect above redirects to
    // /login as soon as `user` clears, and having two navigations racing
    // against each other (this one vs. the guard effect) was non-deterministic.
    await logout();
  };

  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/${id}`);
    toast.success("Link copied");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSnippetRequest(deleteTarget);
      setSnippets((prev) => prev.filter((s) => s.id !== deleteTarget));
      toast.success("Snippet deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Couldn't delete snippet");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0a0e17]" />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[110px]" />
      <div className="pointer-events-none absolute top-1/4 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[110px]" />

      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-800/60 backdrop-blur-xl bg-[#0a0e17]/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo className="w-8 h-8 shrink-0" />
          <span className="font-black text-sm tracking-tight whitespace-nowrap">GrabCode</span>
          <span className="hidden sm:inline text-gray-700 mx-1">/</span>
          <span className="hidden sm:inline text-sm text-gray-500">Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleNewSnippet}
            className="px-3 sm:px-4 py-2 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Snippet</span>
          </button>
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-800">
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm text-gray-400 truncate max-w-[120px]">{user.username}</span>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="p-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-red-500/40 rounded-lg text-gray-300 hover:text-red-400 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard icon={FileCode2} label="Snippets" value={stats.total} />
          <StatCard icon={Eye} label="Total Views" value={stats.views} />
          <StatCard icon={ShieldCheck} label="Protected" value={stats.protected} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your snippets…"
              className="w-full pl-10 pr-3 py-2.5 bg-[#161b22] border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500/60 focus:border-transparent outline-none transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#161b22] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-purple-500/60 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 bg-[#161b22]/60 border border-gray-800/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center">
              <FileCode2 className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-gray-500 text-sm mb-5">
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
          <div className="space-y-3">
            {visible.map((snippet, index) => (
              <div
                key={snippet.id}
                className="group relative bg-[#161b22] border border-gray-800 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
              >
                <Link to={`/${snippet.id}`} className="block">
                  <div className="flex items-center gap-2 min-w-0 pr-16 sm:pr-20 mb-3">
                    <span className="font-mono text-sm font-semibold text-purple-400 truncate">{snippet.id}</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-full">
                      {getLanguageLabel(snippet.language)}
                    </span>
                    {snippet.isProtected && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <pre className="text-xs text-gray-400 font-mono bg-[#0d1117] border border-gray-800/60 rounded-xl p-3 overflow-hidden whitespace-pre-wrap line-clamp-2 leading-relaxed mb-3">
                    {snippet.preview || "// empty"}
                  </pre>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {snippet.views} views
                    </span>
                    <span>·</span>
                    <span>{formatRelativeTime(snippet.updatedAt)}</span>
                  </div>
                </Link>

                {/* Always visible on touch devices (no hover state); revealed on
                    hover for pointer/mouse users on larger screens. */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyLink(snippet.id)}
                    title="Copy link"
                    aria-label="Copy link"
                    className="p-1.5 bg-[#0d1117] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/40 rounded-lg text-gray-500 hover:text-gray-200 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(snippet.id)}
                    title="Delete"
                    aria-label="Delete"
                    className="p-1.5 bg-[#0d1117] hover:bg-red-500/10 border border-gray-800 hover:border-red-500/40 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this snippet?"
          description={`"${deleteTarget}" will be permanently deleted. This can't be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}

export default Dashboard;
