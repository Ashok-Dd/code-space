import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateRandomId } from "../utils/id";

// Landing on "/" immediately drops you into a fresh, ready-to-type room —
// there is no separate "create" step.
function NewRoomRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/${generateRandomId()}`, { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-gray-500 text-sm font-mono">
      Preparing your snippet…
    </div>
  );
}

export default NewRoomRedirect;
