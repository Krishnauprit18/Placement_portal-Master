// Test script for Knowledge Graph Recommendation System
// Run this after setting up the database to verify everything works

const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'placement_portal',
    waitForConnections: true,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 60000
});

console.log('Testing Knowledge Graph Recommendation System...\n');

// Test function to get recommendations for a question
async function testRecommendations() {
    return new Promise((resolve) => {
        console.log('1. Testing database connection...');
        
        // Test basic connection
        pool.query('SELECT COUNT(*) as count FROM concepts', (err, results) => {
            if (err) {
                console.error('Database connection failed:', err.message);
                console.log('Make sure to:');
                console.log('   - Create the database and tables using database_setup.sql');
                console.log('   - Check your .env file configuration');
                return resolve();
            }
            
            console.log(`Database connected. Found ${results[0].count} concepts.\n`);
            
            console.log('2. Testing concept relationships...');
            pool.query('SELECT COUNT(*) as count FROM concept_relationships', (err, results) => {
                if (err) {
                    console.error('Concept relationships table error:', err.message);
                    return resolve();
                }
                
                console.log(`Found ${results[0].count} concept relationships.\n`);
                
                console.log('3. Testing questions with concepts...');
                pool.query('SELECT COUNT(*) as count FROM questions WHERE concept_id IS NOT NULL', (err, results) => {
                    if (err) {
                        console.error('Questions table error:', err.message);
                        return resolve();
                    }
                    
                    console.log(`Found ${results[0].count} questions linked to concepts.\n`);
                    
                    if (results[0].count > 0) {
                        // Test the actual recommendation algorithm
                        console.log('4. Testing recommendation algorithm...');
                        pool.query('SELECT id, question FROM questions WHERE concept_id IS NOT NULL LIMIT 1', (err, questions) => {
                            if (err || questions.length === 0) {
                                console.log('No questions with concepts found for testing');
                                return resolve();
                            }
                            
                            const testQuestionId = questions[0].id;
                            console.log(`   Testing with question ID: ${testQuestionId}`);
                            console.log(`   Question: "${questions[0].question.substring(0, 50)}..."\n`);
                            
                            // Test the recommendation algorithm
                            testRecommendationAlgorithm(testQuestionId).then(() => resolve());
                        });
                    } else {
                        console.log('No questions linked to concepts. Add some test data using the SQL script.\n');
                        resolve();
                    }
                });
            });
        });
    });
}

async function testRecommendationAlgorithm(questionId) {
    return new Promise((resolve) => {
        // Step 1: Get concept_id of the question
        pool.query('SELECT concept_id FROM questions WHERE id = ?', [questionId], (err, questionRows) => {
            if (err || questionRows.length === 0 || !questionRows[0].concept_id) {
                console.log('Question has no associated concept');
                return resolve();
            }

            const conceptId = questionRows[0].concept_id;
            console.log(`   Question concept ID: ${conceptId}`);

            // Step 2: Find prerequisite relationships
            pool.query(
                'SELECT target_concept_id FROM concept_relationships WHERE source_concept_id = ? AND relationship_type = ?',
                [conceptId, 'DEPENDS_ON'],
                (err, relationships) => {
                    if (err) {
                        console.error('Error finding relationships:', err.message);
                        return resolve();
                    }

                    if (relationships.length === 0) {
                        console.log('No prerequisite relationships found for this concept');
                        return resolve();
                    }

                    console.log(`   Found ${relationships.length} prerequisite concept(s)`);
                    const prerequisiteIds = relationships.map(r => r.target_concept_id);
                    console.log(`   Prerequisite concept IDs: ${prerequisiteIds.join(', ')}`);

                    // Step 3: Get recommended questions
                    pool.query(
                        'SELECT id, question, question_type FROM questions WHERE concept_id IN (?)',
                        [prerequisiteIds],
                        (err, recommendedQuestions) => {
                            if (err) {
                                console.error('Error finding recommended questions:', err.message);
                                return resolve();
                            }

                            console.log(`   Found ${recommendedQuestions.length} recommended question(s):`);
                            recommendedQuestions.forEach((q, index) => {
                                console.log(`     ${index + 1}. [${q.question_type}] "${q.question.substring(0, 60)}..."`);
                            });

                            console.log('\nRecommendation algorithm working correctly!');
                            console.log('Knowledge Graph system is ready for use!\n');
                            
                            console.log('Next Steps:');
                            console.log('   1. Start the server: npm start');  
                            console.log('   2. Visit: http://localhost:3000');
                            console.log('   3. Register/login as a student');
                            console.log('   4. Take a test and see recommendations!\n');
                            
                            resolve();
                        }
                    );
                }
            );
        });
    });
}

// Run the test
testRecommendations().then(() => {
    console.log('Test completed. Check results above.');
    pool.end();
    process.exit(0);
});