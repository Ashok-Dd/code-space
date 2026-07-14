import { useState } from "react";
import { Lock } from "lucide-react";

function PasswordGate({ roomId, error, onSubmit }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    onSubmit(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-gray-100 px-4">
      <form onSubmit={handleSubmit} className="text-center max-w-sm w-full">
        <div className="w-14 h-14 mx-auto mb-5 bg-[#161b22] border border-gray-800 rounded-2xl flex items-center justify-center">
          <Lock className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-xl font-black mb-1">Password protected</h1>
        <p className="text-gray-500 text-sm mb-6 font-mono">/{roomId}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoFocus
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={!password}
          className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}

export default PasswordGate;
