// Import icons
import { Copy, Home, Code2, Terminal, Zap, Lock, Edit3, Check, X, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_URL = 'https://code-space-3fzo.onrender.com';

// CodeViewPage Component
function CodeViewPage({ routeId }) {
  const [fetchedCode, setFetchedCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCodeByRoute(routeId);
  }, [routeId]);

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

  const handleUpdateCode = async () => {
    if (!editedCode.trim()) {
      showToast('Code cannot be empty', 'error');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: routeId, code: editedCode })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Code updated successfully!', 'success');
        setFetchedCode(editedCode);
        setIsEditing(false);
      } else {
        showToast(data.message || 'Failed to update code', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = () => {
    setEditedCode(fetchedCode);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedCode('');
  };

  const getLineNumbers = (text) => {
    const lines = text.split('\n');
    return lines.map((_, index) => index + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 transition-colors duration-300">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50 text-white' : 'bg-red-500/90 border-red-400/50 text-white'}`}>
            <p className="font-semibold text-sm md:text-base flex items-center gap-2">
              {toast.type === 'success' ? <Zap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative border-b border-gray-800/50 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Terminal className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">CodeSpace</h1>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-mono">/{routeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="px-4 py-2 bg-[#161b22] hover:bg-[#1c2128] border border-gray-800 hover:border-purple-500/50 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#161b22] rounded-2xl mb-4 border border-gray-800">
                <div className="animate-spin"><RefreshCw className="w-8 h-8 text-purple-500" /></div>
              </div>
              <p className="text-gray-500 text-lg font-mono">Fetching code...</p>
            </div>
          </div>
        ) : notFound ? (
          <div className="bg-[#161b22]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-10 md:p-16 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0d1117] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-800">
              <Code2 className="w-10 h-10 md:w-12 md:h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-100 mb-3">404: Code Not Found</h2>
            <p className="text-gray-500 text-base md:text-lg mb-8">
              The route <span className="text-purple-400 font-mono font-bold">/{routeId}</span> doesn't exist.
            </p>
            <a href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
              <Home className="w-5 h-5" />Return Home
            </a>
          </div>
        ) : (
          <div className="bg-[#161b22]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-100">{routeId}</h2>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button onClick={startEditing} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all bg-[#0d1117] border border-gray-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 rounded-xl">
                      <Edit3 className="w-4 h-4" /><span className="hidden sm:inline">Edit</span>
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(fetchedCode); showToast('Copied to clipboard!', 'success'); }} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all bg-[#0d1117] border border-gray-800 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 rounded-xl">
                      <Copy className="w-4 h-4" /><span className="hidden sm:inline">Copy</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleUpdateCode} disabled={updating} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl disabled:opacity-50 shadow-purple-500/20 hover:shadow-purple-500/40">
                      <Check className="w-4 h-4" /><span className="hidden sm:inline">{updating ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button onClick={cancelEditing} disabled={updating} className="px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all bg-[#0d1117] border border-gray-800 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl disabled:opacity-50">
                      <X className="w-4 h-4" /><span className="hidden sm:inline">Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono ml-3">{routeId}.txt</span>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing && <span className="text-xs text-yellow-400 font-semibold flex items-center gap-1"><Edit3 className="w-3 h-3" />Editing</span>}
                  <Terminal className="w-4 h-4 text-gray-600" />
                </div>
              </div>

              <div className="flex overflow-x-auto">
                <div className="bg-[#0d1117] px-4 py-4 text-gray-600 select-none border-r border-gray-800">
                  <pre className="font-mono text-xs leading-6 text-right">
                    {getLineNumbers(isEditing ? editedCode : fetchedCode).map(num => (<div key={num}>{num}</div>))}
                  </pre>
                </div>
                {isEditing ? (
                  <textarea value={editedCode} onChange={(e) => setEditedCode(e.target.value)} className="flex-1 px-4 py-4 bg-transparent text-gray-200 placeholder-gray-600 outline-none font-mono text-xs md:text-sm leading-6 resize-none min-h-[400px]" style={{ minHeight: '400px' }} />
                ) : (
                  <pre className="flex-1 px-4 py-4 font-mono text-xs md:text-sm leading-6 text-gray-200 whitespace-pre overflow-x-auto">{fetchedCode}</pre>
                )}
              </div>
            </div>
            {isEditing && <p className="text-xs text-gray-500 mt-3 flex items-center gap-2"><Zap className="w-3 h-3" /><span>Make your changes and click Save to update the code</span></p>}
          </div>
        )}
      </div>

      
    </div>
  );
}

export default CodeViewPage;