"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Prompt } from "@/types";

interface PromptHistoryContextType {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, "id" | "timestamp">) => void;
  toggleFavorite: (id: string) => void;
  deletePrompt: (id: string) => void;
  clearHistory: () => void;
  getPromptById: (id: string) => Prompt | undefined;
}

const PromptHistoryContext = createContext<PromptHistoryContextType | undefined>(undefined);

export function PromptHistoryProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const savedPrompts = localStorage.getItem("promptHistory");
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  useEffect(() => {
    if (prompts.length > 0) {
      localStorage.setItem("promptHistory", JSON.stringify(prompts));
    }
  }, [prompts]);

  const addPrompt = (prompt: Omit<Prompt, "id" | "timestamp">) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const deletePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearHistory = () => {
    setPrompts([]);
    localStorage.removeItem("promptHistory");
  };

  const getPromptById = (id: string) => {
    return prompts.find((p) => p.id === id);
  };

  return (
    <PromptHistoryContext.Provider
      value={{
        prompts,
        addPrompt,
        toggleFavorite,
        deletePrompt,
        clearHistory,
        getPromptById,
      }}
    >
      {children}
    </PromptHistoryContext.Provider>
  );
}

export function usePromptHistory() {
  const context = useContext(PromptHistoryContext);
  if (context === undefined) {
    throw new Error("usePromptHistory must be used within a PromptHistoryProvider");
  }
  return context;
}
