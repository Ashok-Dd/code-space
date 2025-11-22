import React, { useState, useEffect } from "react";
import {
  Save,
  Copy,
  Home,
  Code2,
  Terminal,
  Zap,
  Lock,
  Sparkles,
  RefreshCw
} from "lucide-react";

const API_URL = 'https://code-space-3fzo.onrender.com';

// HomePage Component
function HomePage() {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const generateRandomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 3) + 6; // Random length between 6-8
    let randomId = '';
    
    for (let i = 0; i < length; i++) {
      randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setId(randomId);
    showToast('Random ID generated!', 'success');
  };

  const checkIdAvailability = async (idToCheck) => {
    try {
      const response = await fetch(`${API_URL}/check/${idToCheck}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      return false;
    }
  };

  const handleSaveCode = async () => {
    if (!id.trim() || !code.trim()) {
      showToast('Please fill in both ID and Code fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const exists = await checkIdAvailability(id);
      
      if (exists) {
        showToast('ID already exists! Use a different ID or update existing code.', 'error');
        setLoading(false);
        return;
      }

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
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">Secure Code Repository</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-[#161b22]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-100">Save Your Code</h2>
              <p className="text-gray-500 text-xs md:text-sm">Save securely, access globally</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {/* ID Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3 h-3" />Code Identifier
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={id} 
                  onChange={(e) => setId(e.target.value)} 
                  placeholder="Enter unique identifier → my-awesome-code" 
                  className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-[#0d1117] border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm md:text-base font-mono" 
                />
                <button
                  onClick={generateRandomId}
                  className="px-4 py-3 bg-[#0d1117] border border-gray-800 hover:border-purple-500/50 rounded-xl transition-all flex items-center gap-2 text-purple-400 hover:text-purple-300"
                  title="Generate Random ID"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-semibold">Random</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                <span className="opacity-60">Access URL:</span> <span className="text-purple-400">/{id || 'your-identifier'}</span>
              </p>
            </div>

            {/* Code Editor */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-3 h-3" />Code Snippet
              </label>
              
              <div className="bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono ml-3">untitled.txt</span>
                  </div>
                  <Terminal className="w-4 h-4 text-gray-600" />
                </div>

                <div className="flex">
                  <div className="bg-[#0d1117] px-4 py-4 text-gray-600 select-none border-r border-gray-800">
                    <pre className="font-mono text-xs leading-6 text-right">
                      {getLineNumbers(code || '\n\n\n\n\n\n\n\n\n\n\n\n').map(num => (<div key={num}>{num}</div>))}
                    </pre>
                  </div>
                  <textarea 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="// Paste your code here
// Examples: functions, snippets, configurations, scripts
// Your code will be securely stored and accessible via URL

function example() {
  console.log('Start coding...');
}" 
                    rows="12" 
                    className="flex-1 px-4 py-4 bg-transparent text-gray-200 placeholder-gray-600 outline-none font-mono text-xs md:text-sm leading-6 resize-none" 
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span>If ID exists, you can edit the code by visiting <span className="text-purple-400">/{id || 'your-identifier'}</span></span>
              </p>
            </div>

            {/* Deploy Button */}
            <div className="flex justify-end">
              <button 
                onClick={handleSaveCode} 
                disabled={loading} 
                className="w-full sm:w-auto px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin"><RefreshCw className="w-5 h-5" /></div>
                    Deploying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />Deploy Code
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default HomePage;