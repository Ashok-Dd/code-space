import { Download, Save, Moon, Sun, Copy, Home, Code2, Terminal, Zap, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = 'https://code-space-3fzo.onrender.com';

function App() {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [fetchedCode, setFetchedCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const path = window.location.pathname;
    const idFromPath = path.substring(1);
    
    if (idFromPath) {
      setRouteId(idFromPath);
      fetchCodeByRoute(idFromPath);
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const fetchCodeByRoute = async (routeIdParam) => {
    setLoading(true);
    setNotFound(false);
    setFetchedCode('');
    
    try {
      const response = await fetch(`${API_URL}/${routeIdParam}`);

      if (response.ok) {
        const codeText = await response.text();
        setFetchedCode(codeText);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleSaveCode = async () => {
    if (!id.trim() || !code.trim()) {
      showToast('Please fill in both ID and Code fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, code })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Code saved successfully!', 'success');
        setCode('');
        setId('');
      } else {
        showToast(data.message || 'Failed to save code', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const getLineNumbers = (text) => {
    const lines = text.split('\n');
    return lines.map((_, index) => index + 1);
  };

  const isDark = theme === 'dark';

  // Theme classes
  const bgMain = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-slate-900/80' : 'bg-white';
  const bgInput = isDark ? 'bg-slate-950/50' : 'bg-gray-100';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-slate-700' : 'border-gray-200';
  const accentColor = isDark ? 'from-cyan-500 to-blue-600' : 'from-cyan-600 to-blue-700';

  if (routeId) {
    return (
      <div className={`min-h-screen ${bgMain} ${textMain} transition-colors duration-300`}>
        {/* Matrix Rain Effect */}
        {isDark && <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="matrix-rain"></div>
        </div>}

        {/* Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000`}></div>
        </div>

        {/* Toast */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'
            }`}>
              <p className="font-semibold text-sm md:text-base flex items-center gap-2">
                {toast.type === 'success' ? <Zap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {toast.message}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`relative ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-white/80'} border-b backdrop-blur-xl`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center shadow-lg ${isDark ? 'shadow-cyan-500/30' : 'shadow-cyan-600/20'}`}>
                  <Terminal className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl md:text-3xl font-black bg-gradient-to-r ${accentColor} bg-clip-text text-transparent tracking-tight`}>
                    CodeSpace
                  </h1>
                  <p className={`${textSecondary} text-xs md:text-sm mt-0.5 font-mono`}>/{routeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className={`p-2 md:p-2.5 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-all`}
                >
                  {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>
                <a 
                  href="/"
                  className={`px-4 py-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg text-sm font-semibold transition-all flex items-center gap-2`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${isDark ? 'bg-slate-800' : 'bg-gray-200'} rounded-2xl mb-4`}>
                  <div className="animate-spin">
                    <Terminal className="w-8 h-8 text-cyan-500" />
                  </div>
                </div>
                <p className={`${textSecondary} text-lg font-mono`}>Fetching code...</p>
              </div>
            </div>
          ) : notFound ? (
            <div className={`${bgCard} backdrop-blur-xl rounded-2xl shadow-2xl border ${borderColor} p-10 md:p-16 text-center`}>
              <div className={`w-20 h-20 md:w-24 md:h-24 ${isDark ? 'bg-slate-800' : 'bg-gray-200'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <Code2 className={`w-10 h-10 md:w-12 md:h-12 ${textSecondary}`} />
              </div>
              <h2 className={`text-2xl md:text-3xl font-black ${textMain} mb-3`}>404: Code Not Found</h2>
              <p className={`${textSecondary} text-base md:text-lg mb-8`}>
                The route <span className="text-cyan-500 font-mono font-bold">/{routeId}</span> doesn't exist in the matrix.
              </p>
              <a 
                href="/"
                className={`inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${accentColor} text-white rounded-xl font-bold hover:shadow-lg transition-all`}
              >
                <Home className="w-5 h-5" />
                Return Home
              </a>
            </div>
          ) : (
            <div className={`${bgCard} backdrop-blur-xl rounded-2xl shadow-2xl border ${borderColor} p-6 md:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center`}>
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-xl md:text-2xl font-black ${textMain}`}>{routeId}</h2>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fetchedCode);
                    showToast('Copied to clipboard!', 'success');
                  }}
                  className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400' : 'bg-gray-200 hover:bg-gray-300 text-cyan-600'} rounded-xl`}
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
              </div>
              
              <div className={`relative ${isDark ? 'bg-black/40 border-slate-700' : 'bg-gray-900 border-gray-700'} border rounded-xl overflow-hidden`}>
                {/* Editor Header */}
                <div className={`flex items-center justify-between px-4 py-2 ${isDark ? 'bg-slate-800/50' : 'bg-gray-800/90'} border-b ${isDark ? 'border-slate-700' : 'border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-3">code.txt</span>
                  </div>
                  <Terminal className="w-4 h-4 text-gray-500" />
                </div>

                {/* Code Display with Line Numbers */}
                <div className="flex overflow-x-auto">
                  <div className={`${isDark ? 'bg-slate-900/50' : 'bg-gray-800/50'} px-4 py-4 text-gray-500 select-none border-r ${isDark ? 'border-slate-700' : 'border-gray-700'}`}>
                    <pre className="font-mono text-xs leading-6 text-right">
                      {getLineNumbers(fetchedCode).map(num => (
                        <div key={num}>{num}</div>
                      ))}
                    </pre>
                  </div>
                  <pre className="flex-1 px-4 py-4 font-mono text-xs md:text-sm leading-6 text-gray-200 whitespace-pre overflow-x-auto">
{fetchedCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          
          .matrix-rain {
            background: linear-gradient(transparent 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%);
            background-size: 100% 200%;
            animation: rain 3s linear infinite;
          }
          
          @keyframes rain {
            0% { background-position: 0% 0%; }
            100% { background-position: 0% 200%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} transition-colors duration-300`}>
      {/* Matrix Rain Effect */}
      {isDark && <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="matrix-rain"></div>
      </div>}

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? 'bg-blue-500' : 'bg-blue-400'} rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000`}></div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-500/90 border-emerald-400 text-white' 
              : 'bg-red-500/90 border-red-400 text-white'
          }`}>
            <p className="font-semibold text-sm md:text-base flex items-center gap-2">
              {toast.type === 'success' ? <Zap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`relative ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-white/80'} border-b backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center shadow-lg ${isDark ? 'shadow-cyan-500/30' : 'shadow-cyan-600/20'} animate-pulse`}>
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl md:text-3xl font-black bg-gradient-to-r ${accentColor} bg-clip-text text-transparent tracking-tight`}>
                  CodeSpace
                </h1>
                <p className={`${textSecondary} text-xs md:text-sm mt-0.5`}>Secure Code Repository</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 md:p-2.5 ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-all`}
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className={`${bgCard} backdrop-blur-xl rounded-2xl shadow-2xl border ${borderColor} p-6 md:p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${accentColor} rounded-xl flex items-center justify-center`}>
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl md:text-2xl font-black ${textMain}`}>Deploy Your Code</h2>
              <p className={`${textSecondary} text-xs md:text-sm`}>Save securely, access globally</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className={`block text-xs font-bold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                <Terminal className="w-3 h-3" />
                Code Identifier
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter unique identifier → my-awesome-function"
                className={`w-full px-4 md:px-5 py-3 md:py-4 ${bgInput} border ${borderColor} rounded-xl ${textMain} placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm md:text-base font-mono`}
              />
              <p className={`text-xs ${textSecondary} mt-2 font-mono`}>
                <span className="opacity-60">Access URL:</span> <span className="text-cyan-500">/{id || 'your-identifier'}</span>
              </p>
            </div>

            <div>
              <label className={`block text-xs font-bold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                <Code2 className="w-3 h-3" />
                Code Snippet
              </label>
              
              {/* Code Editor */}
              <div className={`${isDark ? 'bg-black/40 border-slate-700' : 'bg-gray-900 border-gray-700'} border rounded-xl overflow-hidden`}>
                {/* Editor Header */}
                <div className={`flex items-center justify-between px-4 py-2 ${isDark ? 'bg-slate-800/50' : 'bg-gray-800/90'} border-b ${isDark ? 'border-slate-700' : 'border-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono ml-3">untitled.txt</span>
                  </div>
                  <Terminal className="w-4 h-4 text-gray-500" />
                </div>

                {/* Editor Body with Line Numbers */}
                <div className="flex">
                  <div className={`${isDark ? 'bg-slate-900/50' : 'bg-gray-800/50'} px-4 py-4 text-gray-500 select-none border-r ${isDark ? 'border-slate-700' : 'border-gray-700'}`}>
                    <pre className="font-mono text-xs leading-6 text-right">
                      {getLineNumbers(code || '\n\n\n\n\n\n\n\n\n\n\n\n').map(num => (
                        <div key={num}>{num}</div>
                      ))}
                    </pre>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Start typing your code here...
const hackerMode = true;

function deployCode() {
  return 'Ready to ship! 🚀';
}"
                    rows="12"
                    className={`flex-1 px-4 py-4 bg-transparent text-gray-200 placeholder-gray-600 outline-none font-mono text-xs md:text-sm leading-6 resize-none`}
                  />
                </div>
              </div>
              
              <p className={`text-xs ${textSecondary} mt-2 flex items-center gap-2`}>
                <Zap className="w-3 h-3" />
                <span>Pro tip: Use Ctrl + Enter for quick save</span>
              </p>
            </div>

            <button
              onClick={handleSaveCode}
              disabled={loading}
              className={`w-full bg-gradient-to-r ${accentColor} text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'shadow-cyan-500/20 hover:shadow-cyan-500/40' : 'shadow-cyan-600/20 hover:shadow-cyan-600/40'} hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin">
                    <Terminal className="w-5 h-5" />
                  </div>
                  Deploying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Deploy Code
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        .matrix-rain {
          background: linear-gradient(transparent 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%);
          background-size: 100% 200%;
          animation: rain 3s linear infinite;
        }
        
        @keyframes rain {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.7); }
      `}</style>
    </div>
  );
}

export default App;