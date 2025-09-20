-- Fix Questions Table - Add Missing ID Column and Ensure Proper Structure
-- This script will fix the critical database issue that prevents the recommendation system from working

-- First, check if the questions table exists and its current structure
DESCRIBE questions;

-- Add the missing id column as the primary key
-- Note: This will add the id column at the beginning of the table
ALTER TABLE questions 
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;

-- Ensure concept_id column exists and has proper foreign key constraint
-- Add concept_id column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN concept_id INT AFTER question_type,
ADD FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL;

-- Update the table structure to ensure all required columns exist
ALTER TABLE questions 
MODIFY COLUMN question TEXT NOT NULL,
MODIFY COLUMN option1 VARCHAR(500) NOT NULL,
MODIFY COLUMN option2 VARCHAR(500) NOT NULL,
MODIFY COLUMN option3 VARCHAR(500) NOT NULL,
MODIFY COLUMN option4 VARCHAR(500) NOT NULL,
MODIFY COLUMN correctAnswer INT NOT NULL,
MODIFY COLUMN question_type VARCHAR(50) NOT NULL;

-- Create indexes for better performance
CREATE INDEX idx_question_type ON questions(question_type);
CREATE INDEX idx_concept_id ON questions(concept_id);

-- Show the updated table structure
DESCRIBE questions;

-- Test that the table works correctly
SELECT COUNT(*) as total_questions FROM questions;
SELECT COUNT(*) as questions_with_concepts FROM questions WHERE concept_id IS NOT NULL;

-- Sample verification query
SELECT 
    q.id,
    q.question_type,
    q.concept_id,
    c.name as concept_name
FROM questions q
LEFT JOIN concepts c ON q.concept_id = c.id
LIMIT 5;

SHOW CREATE TABLE questions;