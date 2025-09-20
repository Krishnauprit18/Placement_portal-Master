-- Fix database table structure for questions
-- Run this in your MySQL database

-- First, check if the table has an id column
DESCRIBE questions;

-- Drop the existing table if it has issues (BACKUP your data first if important!)
-- DROP TABLE IF EXISTS questions;

-- Create the questions table with proper structure
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255) NOT NULL,
    option4 VARCHAR(255) NOT NULL,
    correctAnswer INT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    concept_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_question_type (question_type),
    INDEX idx_concept_id (concept_id)
);

-- If concepts table doesn't exist, create it
CREATE TABLE IF NOT EXISTS concepts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint if it doesn't exist
-- ALTER TABLE questions 
-- ADD CONSTRAINT fk_questions_concept 
-- FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL;

-- Check final structure
DESCRIBE questions;

-- Test insert to make sure it works
INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) 
VALUES ('Test Question: What is 2+2?', 'Option A: 3', 'Option B: 4', 'Option C: 5', 'Option D: 6', 2, 'CS_TEST', NULL);

-- Check if the test worked
SELECT * FROM questions WHERE question_type = 'CS_TEST' ORDER BY id DESC LIMIT 1;