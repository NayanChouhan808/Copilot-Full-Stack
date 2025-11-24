-- Migration: Initial Schema Creation
-- Created: 2025-11-23
-- Description: Creates users, languages, and generations tables with proper constraints and indexes

-- ===========================================
-- 1. USERS TABLE
-- ===========================================
-- Stores user information (allows for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups (used in JOINs)
CREATE INDEX idx_users_email ON users(email);

-- ===========================================
-- 2. LANGUAGES TABLE
-- ===========================================
-- Normalized table for supported programming languages
-- Prevents typos and ensures data consistency
CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,          -- e.g., 'Python', 'JavaScript'
    file_extension VARCHAR(10) NOT NULL,        -- e.g., '.py', '.js'
    syntax_highlighter VARCHAR(50),             -- e.g., 'python', 'javascript'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster language name lookups
CREATE INDEX idx_languages_name ON languages(name);

-- ===========================================
-- 3. GENERATIONS TABLE
-- ===========================================
-- Stores all code generation history
CREATE TABLE IF NOT EXISTS generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    prompt TEXT NOT NULL,
    generated_code TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_prompt_length CHECK (LENGTH(prompt) > 0 AND LENGTH(prompt) <= 5000),
    CONSTRAINT chk_code_length CHECK (LENGTH(generated_code) > 0)
);

-- Composite index for pagination queries (most recent first)
-- This dramatically improves performance for GET /api/history
CREATE INDEX idx_generations_created_at_desc ON generations(created_at DESC);

-- Index for filtering by user (for future user-specific history)
CREATE INDEX idx_generations_user_id ON generations(user_id);

-- Index for filtering by language
CREATE INDEX idx_generations_language_id ON generations(language_id);

-- Composite index for user + timestamp (optimal for paginated user history)
CREATE INDEX idx_generations_user_created ON generations(user_id, created_at DESC);

-- ===========================================
-- COMMENTS & DOCUMENTATION
-- ===========================================
COMMENT ON TABLE users IS 'Stores user accounts for future authentication and personalized history';
COMMENT ON TABLE languages IS 'Normalized language reference table to ensure consistency and extensibility';
COMMENT ON TABLE generations IS 'Core table storing all code generation requests and results';

COMMENT ON COLUMN generations.user_id IS 'Foreign key to users table (nullable for anonymous generations)';
COMMENT ON COLUMN generations.language_id IS 'Foreign key to languages table (required, prevents deletion of active languages)';
COMMENT ON COLUMN generations.prompt IS 'User''s natural language request (max 5000 chars)';
COMMENT ON COLUMN generations.generated_code IS 'AI-generated code output';

-- ===========================================
-- TRIGGERS
-- ===========================================
-- Auto-update updated_at timestamp for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
