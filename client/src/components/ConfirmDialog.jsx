import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

// Centered modal on every screen size — unlike LockMenu/UserMenu this isn't
// anchored to a trigger button, so there's no desktop "dropdown" variant.
function ConfirmDialog({ title, description, confirmLabel = "Delete", onConfirm, onCancel, busy }) {
  return createPortal(
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl p-6 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-base font-bold text-gray-100 mb-1.5">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 px-4 py-2.5 bg-[#0d1117] hover:bg-[#1c2128] border border-gray-800 rounded-xl text-sm font-semibold text-gray-300 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 px-4 py-2.5 bg-red-500/90 hover:bg-red-500 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
