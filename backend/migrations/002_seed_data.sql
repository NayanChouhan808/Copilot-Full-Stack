-- Migration: Seed Data
-- Created: 2025-11-23
-- Description: Inserts default data for languages and demo user

-- ===========================================
-- SEED LANGUAGES
-- ===========================================
INSERT INTO languages (name, file_extension, syntax_highlighter) VALUES
    ('python', '.py', 'python'),
    ('javascript', '.js', 'javascript'),
    ('typescript', '.ts', 'typescript'),
    ('cpp', '.cpp', 'cpp'),
    ('java', '.java', 'java'),
    ('go', '.go', 'go'),
    ('rust', '.rs', 'rust')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- SEED DEMO USER
-- ===========================================
INSERT INTO users (email, username) VALUES
    ('demo@codecopilot.com', 'demo_user')
ON CONFLICT (email) DO NOTHING;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================
-- Uncomment to verify seed data
-- SELECT * FROM languages ORDER BY name;
-- SELECT * FROM users;
