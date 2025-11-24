"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { usePromptHistory } from "@/contexts/PromptHistoryContext";
import type { Language } from "@/types";

export default function CodeGeneratorClient() {
  const { prompts, addPrompt, toggleFavorite, deletePrompt } = usePromptHistory();
  
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [fontSize, setFontSize] = useState(14);

  const languages: Language[] = ["python", "javascript", "typescript", "cpp", "java", "go", "rust"];
  
  const languageEmojis: Record<Language, string> = {
    javascript: "🟨",
    python: "🐍",
    typescript: "💙",
    cpp: "⚙️",
    java: "☕",
    go: "🚀",
    rust: "🦀"
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    
    const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    try {
      console.log(" Generating code for:", { prompt: prompt.substring(0, 50), language });
      
      // Use Next.js API route (same domain, no CORS issues)
      const response = await fetchWithTimeout(`/api/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ prompt, language }),
      }, 15000); // 15 second timeout (optimized backend)

      console.log("✅ Response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response:", text.substring(0, 200));
        throw new Error("Backend returned HTML instead of JSON. The server might be starting up (Render free tier can take 30-60 seconds to wake up). Please try again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || `HTTP error! status: ${response.status}`;
        const errorType = errorData.type;
        
        // Handle non-code prompt validation error
        if (errorType === "non_code_prompt") {
          setLoading(false);
          setGeneratedCode(
            `// Invalid Prompt\n\n` +
            `// This tool is for CODE GENERATION ONLY.\n` +
            `// Your prompt: "${prompt}"\n\n` +
            `// Please provide a coding-related request, such as:\n` +
            `//   - "Write a function to reverse a string"\n` +
            `//   - "Create a sorting algorithm in ${language}"\n` +
            `//   - "Implement a binary search tree"\n` +
            `//   - "Build a REST API endpoint"\n` +
            `//   - "Solve the two-sum problem"\n` +
            `//   - "Create a calculator class"\n\n` +
            `// Try again with a code-related request!`
          );
          return; // Don't throw error, just show message
        }
        
        // Provide helpful error messages for other errors
        if (errorMsg.includes("API authentication failed") || errorMsg.includes("API key")) {
          throw new Error("Gemini API Key is missing or invalid on the backend.\n\nPlease add GEMINI_API_KEY environment variable in Render:\n1. Go to Render Dashboard\n2. Select your service\n3. Go to Environment tab\n4. Add GEMINI_API_KEY variable\n5. Save and redeploy");
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("API Response received:", data.success ? "Success" : "Error");
      
      const code = data.data?.code || data.code || "// No code generated";
      setGeneratedCode(code);
      
      // Save to history
      addPrompt({ prompt, language, code, isFavorite: false });
    } catch (error) {
      console.error("Error generating code:", error);
      
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timeout (30s). Backend might be waking up on Render free tier. Please try again in a minute.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Cannot connect to backend. Possible causes:\n// 1. Backend is waking up (Render free tier sleeps after inactivity)\n// 2. CORS is blocking the request\n// 3. Backend URL is incorrect\n// \n// Please wait 30-60 seconds and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setGeneratedCode(`// Error: ${errorMessage}\n\n// Check console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPromptFromHistory = (historyPrompt: string, historyLanguage: string, historyCode: string) => {
    setPrompt(historyPrompt);
    setLanguage(historyLanguage as Language);
    setGeneratedCode(historyCode);
  };

  // Filter prompts
  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === "all" || p.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particle w-96 h-96 bg-violet-400 absolute top-20 -left-48 animate-backgroundFloat" style={{ animationDelay: '0s' }}></div>
        <div className="floating-particle w-80 h-80 bg-purple-400 absolute bottom-20 -right-40 animate-backgroundFloat" style={{ animationDelay: '5s' }}></div>
        <div className="floating-particle w-72 h-72 bg-fuchsia-400 absolute top-1/2 left-1/2 animate-backgroundFloat" style={{ animationDelay: '10s' }}></div>
      </div>
      {/* Header Component */}
      <header className="relative z-50 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 animate-fadeInUp">
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden glow-effect hover-scale shadow-2xl">
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-10 animate-gradientShift"></div>
          
          {/* Floating Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-full opacity-20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="glass w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg glow-effect animate-pulse-slow">
                <span className="text-2xl sm:text-3xl lg:text-4xl animate-float">✨</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
                  AI Code Copilot
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1 flex items-center font-medium">
                  <span className="hidden sm:inline">✨ Generate beautiful code with AI instantly</span>
                  <span className="sm:hidden">✨ AI Code Generator</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="relative z-10 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* History Panel - Left Sidebar (5 cols on desktop) */}
        {showHistory && (
          <aside className="lg:col-span-5 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 glow-effect shadow-2xl h-full max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="glass p-2 sm:p-2.5 rounded-lg badge-glow">
                    <span className="text-lg sm:text-xl gradient-text">🕐</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold gradient-text">History</h2>
                    <span className="text-xs text-gray-500 font-medium">{filteredPrompts.length} items</span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-violet-500">🔍</span>
                <input
                  type="text"
                  placeholder="🔍 Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 glass rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 border-2 border-transparent hover:border-violet-300 transition-all font-medium"
                />
              </div>

              {/* Language Filter */}
              <div className="relative mb-4">
                <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-sm sm:text-base">⚙️</span>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 glass rounded-xl text-sm sm:text-base text-gray-900 border-2 border-transparent hover:border-purple-300 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {languageEmojis[lang]} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* History Cards */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {filteredPrompts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse-slow">📝</div>
                    <p className="text-sm sm:text-base text-gray-500 text-center">
                      {searchQuery || filterLanguage !== "all" ? "No matches found" : "No history yet"}
                    </p>
                  </div>
                ) : (
                  filteredPrompts.map((p, index) => (
                    <div
                      key={p.id}
                      className="glass rounded-xl p-3 sm:p-4 cursor-pointer card-hover-lift group relative overflow-hidden"
                      onClick={() => loadPromptFromHistory(p.prompt, p.language, p.code)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Hover Gradient Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-2 sm:px-3 py-1 text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg uppercase tracking-wide shadow-md">
                            {languageEmojis[p.language as Language]} {p.language}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            className="text-xl sm:text-2xl hover:scale-125 transition-transform"
                            title={p.isFavorite ? "Remove favorite" : "Add favorite"}
                          >
                            {p.isFavorite ? "⭐" : "☆"}
                          </button>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 line-clamp-2 mb-2 font-medium">{p.prompt}</p>
                        <p className="text-xs text-gray-500 hidden sm:flex items-center">
                          <span className="mr-1">🕐</span>
                          {new Date(p.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area (7 cols on desktop) */}
        <main className={`${showHistory ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 sm:space-y-6`}>
          {/* Prompt Input Component */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 glow-effect shadow-2xl">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="glass p-2 sm:p-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  <span className="text-lg sm:text-xl">🚀</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold gradient-text">Create Your Code</h2>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Language Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Programming Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full px-4 py-3 glass rounded-xl text-base text-gray-900 font-medium cursor-pointer border-2 border-transparent hover:border-violet-300 transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667eea'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5rem'
                    }}
                  >
                    {languages.map((lang) => (
                      <option 
                        key={lang} 
                        value={lang}
                      >
                        {languageEmojis[lang]} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Textarea */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code Description
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a React component for a todo list with add, delete, and mark complete features..."
                    className="w-full px-4 py-3 glass rounded-xl resize-none text-gray-900 placeholder-gray-400 border-2 border-transparent hover:border-violet-300 transition-all"
                    style={{ height: window.innerWidth < 1024 ? '180px' : '220px' }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 glass rounded-lg text-xs text-gray-500 badge-glow">
                    {prompt.length} chars
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="relative w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden btn-hover-glow group"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-base sm:text-lg">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      <span className="text-xl sm:text-2xl">✨</span>
                      <span className="text-base sm:text-lg">Generate Code</span>
                      <span className="text-xl sm:text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Code Output Component */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="glass rounded-xl sm:rounded-2xl overflow-hidden glow-effect shadow-2xl">
              {!generatedCode && !loading ? (
                /* Empty State */
                <div className="p-8 sm:p-12 lg:p-16 flex items-center justify-center min-h-[400px]">
                  <div className="text-center animate-scaleIn">
                    <div className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6 animate-float">📄</div>
                    <h3 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">Ready to Generate</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      ✨ Your code will appear here
                    </p>
                  </div>
                </div>
              ) : loading ? (
                /* Loading State */
                <div className="p-8 sm:p-12 lg:p-16 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-violet-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                      <div className="absolute inset-4 border-4 border-transparent border-t-fuchsia-600 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-lg sm:text-xl font-bold gradient-text mb-2">
                      Generating your code...
                    </p>
                    <p className="text-sm text-gray-500">
                      Please wait a moment
                    </p>
                  </div>
                </div>
              ) : (
                /* Code Display - macOS Style Window */
                <div>
                  {/* Window Header */}
                  <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Traffic Lights */}
                      <div className="traffic-lights hidden sm:flex">
                        <div className="traffic-light-dot traffic-light-red"></div>
                        <div className="traffic-light-dot traffic-light-yellow"></div>
                        <div className="traffic-light-dot traffic-light-green"></div>
                      </div>
                      {/* Language Badge */}
                      <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg uppercase tracking-wide shadow-md">
                        {languageEmojis[language]} {language}
                      </span>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                      {/* Font Size Controls */}
                      <div className="hidden sm:flex items-center space-x-1 glass rounded-lg px-2 py-1">
                        <button
                          onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                          className="px-2 py-1 text-xs font-bold hover:bg-gray-200 rounded transition-colors"
                        >
                          A-
                        </button>
                        <span className="text-xs font-semibold text-gray-600 px-2">{fontSize}px</span>
                        <button
                          onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                          className="px-2 py-1 text-xs font-bold hover:bg-gray-200 rounded transition-colors"
                        >
                          A+
                        </button>
                      </div>
                      
                      {/* Copy Button */}
                      <button
                        onClick={handleCopy}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center text-sm"
                      >
                        {copied ? (
                          <>
                            <span className="mr-1 sm:mr-2">✓</span>
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <span className="mr-1 sm:mr-2">📋</span>
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Code Content */}
                  <div className="overflow-x-auto">
                    <SyntaxHighlighter
                      language={language}
                      style={vs}
                      customStyle={{
                        margin: 0,
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.6,
                        padding: window.innerWidth < 640 ? "1rem" : "1.5rem",
                        borderRadius: 0,
                      }}
                      showLineNumbers
                      wrapLines
                    >
                      {generatedCode}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
