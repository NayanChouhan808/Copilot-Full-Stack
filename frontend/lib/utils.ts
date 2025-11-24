import { Prompt } from "@/types";

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadCode(code: string, language: string) {
  const extensions: Record<string, string> = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    cpp: "cpp",
    java: "java",
    go: "go",
    rust: "rs",
  };
  
  const ext = extensions[language] || "txt";
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `code.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getLanguageStats(prompts: Prompt[]): Record<string, number> {
  return prompts.reduce((acc, prompt) => {
    acc[prompt.language] = (acc[prompt.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePrompt(prompt: string): string | null {
  if (!prompt.trim()) {
    return "Prompt cannot be empty";
  }
  if (prompt.length < 10) {
    return "Prompt must be at least 10 characters long";
  }
  if (prompt.length > 1000) {
    return "Prompt must not exceed 1000 characters";
  }
  return null;
}
