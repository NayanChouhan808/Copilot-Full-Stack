"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck, FiDownload, FiMaximize2 } from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { copyToClipboard, downloadCode } from "@/lib/utils";

interface CodeOutputProps {
  code: string;
  language: string;
  fontSize?: number;
}

export default function CodeOutput({ code, language, fontSize = 14 }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    downloadCode(code, language);
  };

  const languageMap: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    typescript: "typescript",
    cpp: "cpp",
    java: "java",
    go: "go",
    rust: "rust",
  };

  return (
    <div
      className={`
        ${isFullscreen ? "fixed inset-0 z-50 p-4" : "relative"}
        bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-md text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
            {language}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {code.split("\n").length} lines
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <FiCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Download code"
          >
            <FiDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <FiMaximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Code */}
      <div className={`overflow-auto ${isFullscreen ? "h-[calc(100vh-8rem)]" : "max-h-[600px]"}`}>
        <SyntaxHighlighter
          language={languageMap[language] || "javascript"}
          style={theme === "dark" ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: `${fontSize}px`,
            background: "transparent",
          }}
          showLineNumbers
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
