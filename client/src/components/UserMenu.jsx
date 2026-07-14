import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth";

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const buttonRef = useRef(null);

  if (!user) return null;

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  const goToDashboard = () => {
    close();
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    close();
    await logout();
    navigate("/");
  };

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => (open ? close() : openMenu())}
        title={user.username}
        aria-label="Account menu"
        className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white"
      >
        {initial}
      </button>

      {open && coords &&
        createPortal(
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/50 sm:block sm:bg-transparent sm:p-0"
            onClick={close}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs sm:w-56 sm:max-w-[calc(100vw-24px)] sm:fixed sm:z-1000 sm:top-(--menu-top) sm:right-(--menu-right) bg-[#161b22] border border-gray-800 rounded-xl shadow-2xl p-2"
              style={{
                "--menu-top": `${coords.top}px`,
                "--menu-right": `${Math.max(coords.right, 12)}px`,
              }}
            >
              <div className="px-3 py-2 border-b border-gray-800 mb-1">
                <p className="text-sm font-bold text-gray-200 truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={goToDashboard}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1c2128] transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default UserMenu;
