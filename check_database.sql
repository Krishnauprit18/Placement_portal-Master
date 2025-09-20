-- Quick database check and fix script
-- Run this in your MySQL database

-- Check if questions table exists and its structure
DESCRIBE questions;

-- If concept_id column doesn't exist, add it:
ALTER TABLE questions ADD COLUMN IF NOT EXISTS concept_id INT;

-- Add foreign key constraint if it doesn't exist
-- ALTER TABLE questions ADD CONSTRAINT fk_questions_concept 
-- FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL;

-- Check table structure after changes
DESCRIBE questions;

-- Test insert to verify everything works
-- INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) 
-- VALUES ('Test Question?', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 1, 'CS_TEST', NULL);

-- Check if insert worked
-- SELECT * FROM questions WHERE question_type = 'CS_TEST';