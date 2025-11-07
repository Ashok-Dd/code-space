import { Download, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000';

function App() {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [fetchedCode, setFetchedCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Get ID from URL path
    const path = window.location.pathname;
    const idFromPath = path.substring(1); // Remove leading slash
    
    if (idFromPath) {
      setRouteId(idFromPath);
      fetchCodeByRoute(idFromPath);
    }
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
        showToast('Code saved successfully! 🎉', 'success');
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

  // If route has ID, show fetch view
  if (routeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-gray-100">
        {/* Animated Background Grid */}
        <div className="fixed inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid"></div>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`px-6 py-4 rounded-lg shadow-2xl backdrop-blur-lg border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'
            }`}>
              <p className="font-medium text-sm md:text-base">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    CodeSpace
                  </h1>
                  <p className="text-gray-400 text-xs md:text-sm mt-0.5">Viewing: {routeId}</p>
                </div>
              </div>
              <a 
                href="/"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                 Home
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 mx-auto text-cyan-500 mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400 text-lg">Loading code...</p>
              </div>
            </div>
          ) : notFound ? (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 p-10 md:p-16 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-200 mb-3">No Code Found</h2>
              <p className="text-gray-400 text-base md:text-lg mb-8">
                The route <span className="text-cyan-400 font-mono">/{routeId}</span> doesn't have any code stored.
              </p>
              <a 
                href="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
              >
                Go to Home
              </a>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 p-6 md:p-10">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg md:text-xl"><Download /></span>
                  </div>
                  <h2 className="text-xl md:text-3xl font-bold text-gray-100">Code for: {routeId}</h2>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fetchedCode);
                    showToast('Code copied to clipboard!', 'success');
                  }}
                  className="px-4 py-2 text-xs md:text-sm text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-2 transition-colors bg-gray-800/50 rounded-lg hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
              
              <pre className="w-full px-4 md:px-5 py-4 md:py-5 bg-black/60 border border-gray-700 rounded-xl font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-gray-200 whitespace-pre-wrap break-words shadow-inner">
{fetchedCode}
              </pre>
            </div>
          )}
        </div>

        <style>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
          
          .bg-grid {
            background-image: 
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }
          
          @keyframes grid-move {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, 50px);
            }
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.5);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 182, 212, 0.7);
          }
        `}</style>
      </div>
    );
  }

  // Default view: Save Code
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-gray-100">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid"></div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-lg shadow-2xl backdrop-blur-lg border ${
            toast.type === 'success' 
              ? 'bg-emerald-500/90 border-emerald-400 text-white' 
              : 'bg-red-500/90 border-red-400 text-white'
          }`}>
            <p className="font-medium text-sm md:text-base">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CodeSpace
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-0.5">Universal code snippet manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 p-6 md:p-10">
          <div className="flex items-center space-x-3 mb-6 md:mb-8">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg md:text-xl"><Save /></span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-100">Save Your Code</h2>
          </div>
          
          <div className="space-y-5 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Code Identifier
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g., auth-function, api-handler"
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm md:text-base font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Access your code at: <span className="text-cyan-400">localhost:5173/{id || 'your-id'}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Code Snippet
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste your code here...
function example() {
  return 'Hello, World!';
}"
                rows="14"
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-black/40 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none font-mono text-xs md:text-sm leading-relaxed transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">Ctrl</kbd> + 
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 ml-1">Enter</kbd> to save
              </p>
            </div>

            <button
              onClick={handleSaveCode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <p className='flex items-center justify-center gap-2'><Save />Save Code</p>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .bg-grid {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }
        
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        kbd {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.75rem;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
}

export default App;