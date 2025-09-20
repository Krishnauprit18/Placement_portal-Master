// Debug script to check concepts in database
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

console.log('Debugging Concept Dropdown Issue...\n');

// Check if concepts table exists and has data
pool.query('SHOW TABLES LIKE "concepts"', (err, results) => {
    if (err) {
    console.error('Database connection error:', err.message);
    console.log('\nFix: Check your .env file and database connection');
        return pool.end();
    }
    
    if (results.length === 0) {
    console.log('Concepts table does not exist!');
    console.log('\nFix: Run the database setup:');
        console.log('   mysql -u your_username -p your_database < database_setup.sql');
        return pool.end();
    }
    
    console.log('Concepts table exists');
    
    // Check if there are any concepts
    pool.query('SELECT * FROM concepts', (err, concepts) => {
        if (err) {
            console.error('Error querying concepts:', err.message);
            return pool.end();
        }
        
        if (concepts.length === 0) {
            console.log('No concepts found in database!');
            console.log('\nFix: Add concepts using one of these methods:');
            console.log('   1. Go to http://localhost:3000/concept-management');
            console.log('   2. Run the database_setup.sql file');
            console.log('   3. Add concepts manually:');
            console.log('      INSERT INTO concepts (name, description) VALUES ("Dynamic Programming", "Advanced algorithmic technique");');
            console.log('      INSERT INTO concepts (name, description) VALUES ("Recursion", "Function calling itself");');
            console.log('      INSERT INTO concepts (name, description) VALUES ("Functions and Procedures", "Basic programming constructs");');
        } else {
            console.log(`Found ${concepts.length} concepts:`);
            concepts.forEach((concept, index) => {
                console.log(`   ${index + 1}. [ID: ${concept.id}] ${concept.name}`);
                if (concept.description) {
                    console.log(`      Description: ${concept.description}`);
                }
            });
        }
        
        // Test the API endpoint
    console.log('\nTesting /concepts API endpoint...');
        const http = require('http');
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/concepts',
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log(`API Response: ${JSON.stringify(response, null, 2)}`);
                    
                    if (response.success && response.concepts && response.concepts.length > 0) {
                        console.log('\nConcepts API is working correctly!');
                        console.log('The dropdown should now show the concepts.');
                    } else {
                        console.log('\nAPI returned no concepts');
                    }
                } catch (parseError) {
                    console.log('API returned invalid JSON:', data);
                }
                pool.end();
            });
        });
        
        req.on('error', (err) => {
            console.log('Cannot connect to server. Make sure server is running: npm start');
            console.log('   Error:', err.message);
            pool.end();
        });
        
        req.end();
    });
});