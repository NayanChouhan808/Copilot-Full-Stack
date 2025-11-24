export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Prompt {
  id: string;
  prompt: string;
  language: string;
  code: string;
  timestamp: number;
  isFavorite: boolean;
}

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
}

export interface CodeGenerationResponse {
  code: string;
  language: string;
}

export type Language = "python" | "javascript" | "typescript" | "cpp" | "java" | "go" | "rust";

export interface DashboardStats {
  totalPrompts: number;
  favoriteCount: number;
  languageBreakdown: Record<string, number>;
  recentActivity: Prompt[];
}
