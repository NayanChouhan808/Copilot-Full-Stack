"use client";

import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PromptHistoryProvider } from "@/contexts/PromptHistoryContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PromptHistoryProvider>
          <main className="min-h-screen">{children}</main>
        </PromptHistoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
