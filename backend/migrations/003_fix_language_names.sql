-- Migration: Fix Language Names to Match Frontend
-- Created: 2025-11-23
-- Description: Updates language names to lowercase to match frontend conventions

-- Update language names to lowercase
UPDATE languages SET name = 'python' WHERE LOWER(name) = 'python';
UPDATE languages SET name = 'javascript' WHERE LOWER(name) = 'javascript';
UPDATE languages SET name = 'typescript' WHERE LOWER(name) = 'typescript';
UPDATE languages SET name = 'cpp' WHERE LOWER(name) = 'c++';
UPDATE languages SET name = 'java' WHERE LOWER(name) = 'java';
UPDATE languages SET name = 'go' WHERE LOWER(name) = 'go';
UPDATE languages SET name = 'rust' WHERE LOWER(name) = 'rust';

-- Verify the changes
SELECT * FROM languages ORDER BY name;
