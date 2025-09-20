-- Sample Database Setup for Knowledge Graph Recommendation System
-- Run these commands in your MySQL database

-- Create concepts table if not exists
CREATE TABLE IF NOT EXISTS concepts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create concept_relationships table if not exists  
CREATE TABLE IF NOT EXISTS concept_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_concept_id INT NOT NULL,
    target_concept_id INT NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'DEPENDS_ON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_concept_id) REFERENCES concepts(id) ON DELETE CASCADE,
    FOREIGN KEY (target_concept_id) REFERENCES concepts(id) ON DELETE CASCADE
);

-- Create questions table if not exists (with concept_id column)
-- Note: If your questions table already exists without concept_id, run:
-- ALTER TABLE questions ADD COLUMN concept_id INT, ADD FOREIGN KEY (concept_id) REFERENCES concepts(id);

-- Sample data for concepts
INSERT IGNORE INTO concepts (id, name, description) VALUES
(1, 'Recursion', 'A programming technique where a function calls itself'),
(2, 'Dynamic Programming', 'An algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems'),
(3, 'Graph Traversal', 'Techniques for visiting all nodes in a graph such as DFS and BFS'),
(4, 'Tree Data Structure', 'A hierarchical data structure consisting of nodes connected by edges'),
(5, 'Arrays and Loops', 'Basic programming constructs for storing data and iteration'),
(6, 'Functions and Procedures', 'Modular programming concepts for code organization');

-- Sample relationships (prerequisite dependencies)
INSERT IGNORE INTO concept_relationships (source_concept_id, target_concept_id, relationship_type) VALUES
(2, 1, 'DEPENDS_ON'),  -- Dynamic Programming depends on Recursion
(3, 4, 'DEPENDS_ON'),  -- Graph Traversal depends on Tree Data Structure  
(4, 1, 'DEPENDS_ON'),  -- Tree Data Structure depends on Recursion
(1, 6, 'DEPENDS_ON'),  -- Recursion depends on Functions
(6, 5, 'DEPENDS_ON');  -- Functions depend on Arrays and Loops

-- Sample questions for testing
-- NOTE: Update existing questions to link them to concepts
-- UPDATE questions SET concept_id = 2 WHERE question_type = 'CS_08' AND question LIKE '%dynamic%'; 
-- UPDATE questions SET concept_id = 1 WHERE question_type = 'CS_07' AND question LIKE '%recurs%';

-- Optional: Create student results table for analytics
CREATE TABLE IF NOT EXISTS student_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_email VARCHAR(255) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    failed_question_ids JSON,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_email (student_email),
    INDEX idx_question_type (question_type),
    INDEX idx_test_date (test_date)
);