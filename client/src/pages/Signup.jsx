import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Logo from "../components/Logo";
import { useAuth } from "../context/useAuth";

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    setSubmitting(true);
    setError("");
    try {
      await signup(username, email, password);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign up");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-gray-100 px-4">
      <form onSubmit={handleSubmit} className="text-center max-w-sm w-full">
        <Logo className="w-14 h-14 mx-auto mb-5" />
        <h1 className="text-xl font-black mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your snippets never expire, and you get a dashboard to find them again.
        </p>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoFocus
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm mb-3"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !username || !email || !password}
          className="w-full px-6 py-3 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>

        <p className="text-gray-500 text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
