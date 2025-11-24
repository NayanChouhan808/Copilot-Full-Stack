"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import 'swagger-ui-react/swagger-ui.css';
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

// Client-only Swagger UI React component (avoids direct dist imports)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Suppress console warnings from swagger-ui-react library
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Suppress specific React strict mode warnings from Swagger UI
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('UNSAFE_componentWillReceiveProps') ||
       args[0].includes('ExamplesSelect'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export default function APIDocsPage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [docsEnabled, setDocsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const enabled = process.env.NEXT_PUBLIC_ENABLE_DOCS === "true" || process.env.NODE_ENV === "development";
    setDocsEnabled(enabled);
  }, []);

  useEffect(() => {
    // Apply dark mode styles to Swagger UI
    if (theme === 'dark' && mounted) {
      const style = document.createElement('style');
      style.id = 'swagger-dark-mode';
      style.textContent = `
        .swagger-ui {
          filter: invert(88%) hue-rotate(180deg);
        }
        .swagger-ui .microlight {
          filter: invert(100%) hue-rotate(180deg);
        }
        .swagger-ui img {
          filter: invert(100%) hue-rotate(180deg);
        }
        .swagger-ui .renderedMarkdown img {
          filter: invert(100%) hue-rotate(180deg);
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('swagger-dark-mode');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    } else {
      const existingStyle = document.getElementById('swagger-dark-mode');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [theme, mounted]);

  // No manual initialization needed; component handles rendering.

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl font-bold">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (!docsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow p-8 text-center">
          <div className="text-8xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-gray-600 mb-4">Documentation is disabled. Enable with <code>NEXT_PUBLIC_ENABLE_DOCS=true</code></p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded">← Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-2xl sm:text-3xl">📚</div>
            <div className="space-y-1">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight">API Documentation</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Interactive OpenAPI reference & live testing</p>
            </div>
          </div>
          <div className="flex sm:ml-auto gap-3 items-center">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
              title="Toggle dark/light mode"
            >
              {theme === "light" ? 
                <FiMoon className="w-5 h-5 text-purple-600" /> : 
                <FiSun className="w-5 h-5 text-yellow-400" />
              }
            </button>
            <Link href="/" className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">← Back</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 py-4 sm:py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-black/5 dark:ring-white/10 flex flex-col h-[calc(100vh-190px)] sm:h-[calc(100vh-170px)] overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <SwaggerUI url="/openapi.json" docExpansion="none" defaultModelsExpandDepth={-1} layout="BaseLayout" displayRequestDuration deepLinking />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-3 text-xs text-gray-500 dark:text-gray-400 select-none">
        <span className="hidden sm:inline">Swagger UI • </span>Generated from <code className="font-mono">/openapi.json</code>
      </footer>
    </div>
  );
}
