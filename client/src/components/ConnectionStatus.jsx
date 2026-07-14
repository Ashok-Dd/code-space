const STATUS_CONFIG = {
  connecting: { label: "Connecting…", dot: "bg-yellow-400 animate-pulse" },
  live: { label: "Live", dot: "bg-emerald-400" },
  saving: { label: "Saving…", dot: "bg-yellow-400 animate-pulse" },
  saved: { label: "Saved", dot: "bg-emerald-400" },
  offline: { label: "Offline", dot: "bg-red-500" },
};

function ConnectionStatus({ status, viewers }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.connecting;

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 pl-2 sm:pl-3 ml-1 border-l border-gray-800 text-xs text-gray-500 shrink-0">
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        <span className="hidden sm:inline">{config.label}</span>
      </span>
      {viewers > 1 && (
        <span className="hidden md:flex items-center gap-1">
          <span className="font-semibold text-gray-400">{viewers}</span> viewing
        </span>
      )}
    </div>
  );
}

export default ConnectionStatus;
