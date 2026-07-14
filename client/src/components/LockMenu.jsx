import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, LockOpen, X } from "lucide-react";
import toast from "react-hot-toast";

function LockMenu({ isProtected, onSetPassword }) {
  const [open, setOpen] = useState(false);
  const [password, setPasswordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setPasswordInput("");
  };

  const handleSet = async (e) => {
    e.preventDefault();
    if (!password) return;
    setSaving(true);
    try {
      await onSetPassword(password);
      toast.success("Password set");
      close();
    } catch (err) {
      toast.error(err.message || "Couldn't set password");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await onSetPassword("");
      toast.success("Password removed");
      close();
    } catch (err) {
      toast.error(err.message || "Couldn't remove password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => (open ? close() : openMenu())}
        title={isProtected ? "Password protected" : "Add a password"}
        aria-label={isProtected ? "Manage password" : "Add a password"}
        className={`p-1.5 sm:p-2 border rounded-lg transition-all ${
          isProtected
            ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
            : "bg-[#161b22] border-gray-800 hover:border-purple-500/50 text-gray-300"
        }`}
      >
        {isProtected ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
      </button>

      {open && coords &&
        createPortal(
          // TopBar's backdrop-blur creates its own stacking context, which would
          // trap this popover behind the editor regardless of z-index — portal
          // straight to body to escape it. On mobile it's a centered modal
          // (easier to reach/read than a corner dropdown); from `sm` up it
          // switches to a small dropdown anchored under the lock button.
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/50 sm:block sm:bg-transparent sm:p-0"
            onClick={close}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs sm:w-64 sm:max-w-[calc(100vw-24px)] sm:fixed sm:z-1000 sm:top-(--lockmenu-top) sm:right-(--lockmenu-right) bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl p-4"
              style={{
                "--lockmenu-top": `${coords.top}px`,
                "--lockmenu-right": `${Math.max(coords.right, 12)}px`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  {isProtected ? "Change password" : "Add password"}
                </span>
                <button onClick={close} className="text-gray-600 hover:text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleSet} className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="New password"
                  autoFocus
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={saving || !password}
                  className="w-full px-3 py-2 bg-linear-to-r from-purple-500 to-indigo-600 rounded-lg font-semibold text-xs disabled:opacity-50"
                >
                  {isProtected ? "Update password" : "Set password"}
                </button>
              </form>
              {isProtected && (
                <button
                  onClick={handleRemove}
                  disabled={saving}
                  className="w-full mt-2 px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg font-semibold text-xs transition-all disabled:opacity-50"
                >
                  Remove protection
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default LockMenu;
