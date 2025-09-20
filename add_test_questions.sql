-- Add test questions to the existing questions table (without id column)
-- Run this in your MySQL database: student_db

USE student_db;

-- Clear existing questions first (optional)
-- DELETE FROM questions;

-- Add sample questions for testing
INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) VALUES
('What is 2 + 2?', '3', '4', '5', '6', 2, 'CS_00', NULL),
('What is the capital of France?', 'London', 'Paris', 'Berlin', 'Madrid', 2, 'CS_00', NULL),
('Which programming language is known for recursion?', 'HTML', 'Python', 'CSS', 'SQL', 2, 'CS_01', NULL);

-- Check if questions were inserted
SELECT * FROM questions;