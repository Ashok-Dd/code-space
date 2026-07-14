import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await login(identifier, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-gray-100 px-4">
      <form onSubmit={handleSubmit} className="text-center max-w-sm w-full">
        <Logo className="w-14 h-14 mx-auto mb-5" />
        <h1 className="text-xl font-black mb-1">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6">Welcome back to GrabCode</p>

        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Username or email"
          autoFocus
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !identifier || !password}
          className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-gray-500 text-sm mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
