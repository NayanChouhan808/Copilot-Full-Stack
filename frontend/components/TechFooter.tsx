"use client";

import React from "react";

export default function TechFooter() {
  return (
    <footer className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="px-4 py-3 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          React 18
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          Next.js
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          TypeScript
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          TailwindCSS
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          Express.js
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          PostgreSQL
        </span>
        <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-medium text-white">
          Gemini API
        </span>
        <span className="inline-flex items-center gap-1 bg-white/30 rounded-full px-3 sm:px-4 py-1.5 backdrop-blur text-xs sm:text-sm font-semibold text-white border border-white/30">
          AutomationEdge Assignment
        </span>
      </div>
    </footer>
  );
}
