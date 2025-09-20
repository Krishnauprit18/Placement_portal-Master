const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql = require('mysql');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 
const path = require('path');
const app = express();
const https = require('https');

// Gemini AI Integration
const { GoogleGenerativeAI } = require('@google/generative-ai'); 


const moment = require('moment-timezone');
function getCurrentTimeinIST(){
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Test database connection endpoint
app.get('/test-db', (req, res) => {
    console.log('Testing database connection...');
    
    // Test basic connection
    pool.query('SELECT 1 as test', (err, result) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed',
                error: err.message 
            });
        }
        
    console.log('Basic database connection successful');
        
        // Test questions table
        pool.query('DESCRIBE questions', (err, result) => {
            if (err) {
                console.error('Questions table not found or accessible:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Questions table not accessible',
                    error: err.message,
                    suggestion: 'Run the database setup SQL script'
                });
            }
            
            console.log('Questions table structure:', result);
            
            // Check if concept_id column exists
            const hasConceptId = result.some(column => column.Field === 'concept_id');
            
            res.status(200).json({ 
                success: true, 
                message: 'Database connection successful',
                tables: {
                    questions: 'exists',
                    concept_id_column: hasConceptId ? 'exists' : 'missing'
                },
                columns: result.map(col => col.Field)
            });
        });
    });
});


const currentDateTime = getCurrentTimeinIST();


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));


// Question Paper Management System - DISABLED


// Student Document Submission System - DISABLED


const dotenv = require('dotenv');
dotenv.config();

// Initialize Gemini AI
let genAI = null;
let geminiModel = null;

if (process.env.GEMINI_AI_ENABLED === 'true' && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini AI initialized successfully');
    } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
        geminiModel = null;
    }
} else {
    console.log('Gemini AI disabled or API key not provided');
}

const encodeURL = bodyParser.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname, 'placementPortal')));

// Cloudinary configuration - DISABLED

const background_image_url = process.env.BACKGROUND_IMAGE_URL;
const nmims_logo_url = process.env.NMIMS_LOGO_URL;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/studentdashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'studentdashboard.html'));
});

app.get('/facultydashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'facultydashboard.html'));
});

app.get('/result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'result.html'));
});

app.get('/concept-management', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'concept-management.html'));
});

app.get('/upload-questions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload-questions.html'));
});

app.get('/assignment-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'assignment-dashboard.html'));
});

app.get('/mock-interviews', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mock-interviews.html'));
});

app.get('/placement-mock-tests', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placement-mock-tests.html'));
});

// Forgot password page route - DISABLED

app.get('/concept-relationships', (req, res) => {
    const sql = 'SELECT id, source_concept_id, target_concept_id, relationship_type FROM concept_relationships';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching concept relationships:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch concept relationships.' });
        }
        res.status(200).json({ success: true, relationships: results });
    });
});

// Ensure we always have a valid session secret
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SECRET_SESSION;
if (!SESSION_SECRET) {
    console.warn('No SESSION_SECRET/SECRET_SESSION set. Generating a temporary dev secret. Set SESSION_SECRET in your .env for production.');
}

app.use(session({
    secret: SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}));

app.use(cookieParser());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 60000
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/register.html', encodeURL, async (req, res) => {
    const { name, email, username, userType } = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], async function (err, result) {
        if (err) {
            console.error('Error querying data: ' + err.stack);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            return res.sendFile(path.join(__dirname, 'public', 'fail_reg.html'));
        }

        const sql = 'INSERT INTO users (name, email, username, userType) VALUES (?, ?, ?, ?)';
        pool.query(sql, [name, email, username, userType], function (err, result) {
            if (err) {
                console.error('Error inserting data: ' + err.stack);
                return res.status(500).send('Error during registration');
            }

            console.log(`User registered successfully: ${email}`);
            
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Registration Form</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body {
                            background-image: url('${background_image_url}');
                            background-size: cover;
                            background-position: center;
                        }
                        .success-message {
                            background: rgba(255, 255, 255, 0.9);
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 100px;
                            text-align: center;
                        }
                    </style>
                    <script>
                        setTimeout(function() {
                            window.location.href = '/login';
                        }, 3000);
                    </script>
                </head>
                <body>
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="success-message">
                                    <h3 class="text-success">Registration Successful!</h3>
                                    <p>You will be redirected to login page in 3 seconds...</p>
                                    <a href="/login" class="btn btn-primary">Login Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        });
    });
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/dashboard', encodeURL, (req, res) => {
    const { username, email, otp } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ? AND email = ? AND otp = ? AND otp_expiry > NOW()';
    pool.query(sql, [username, email, otp], (err, result) => {
        if (err) {
            console.error('Error querying data:', err);
            return res.status(500).sendFile(path.join(__dirname, 'public', 'fail_login.html'));
        }
        if (result.length > 0) {
            req.session.user = result[0];
            if (result[0].userType === 'student') {
                return res.redirect('/studentdashboard');
            } else if (result[0].userType === 'faculty') {
                return res.redirect('/facultydashboard');
            }
        } else {
            return res.sendFile(path.join(__dirname, 'public', 'fail_login.html'));
        }
    });
});

app.get('/dashboard', (req, res) => {
    // Use the user stored in the session during login
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Session not found. Please login first.' });
    }

    // Return minimal user info; full row is available if needed
    const user = req.session.user;
    return res.status(200).json({ success: true, user });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
    console.log('Raw request body received:', req.body);
    console.log('Request headers:', req.headers['content-type']);
    
    const { question, option1, option2, option3, option4, correctAnswer, question_type, facultyName, concept_id } = req.body;

    console.log('Question Upload Request:', {
        question: question?.substring(0, 50) + '...',
        question_type,
        concept_id,
        correctAnswer
    });

    try {
        await saveQuestionToDatabase(question, option1, option2, option3, option4, correctAnswer, question_type, concept_id);
    console.log('Question saved successfully to database');

        const numberOfQuestions = 1; 

        const currentDateTime = getCurrentTimeinIST();

        pool.query('SELECT email FROM users WHERE userType = "student"', async (err, results) => {
            if (err) {
                console.error('Error fetching student emails:', err);
                res.status(500).send('Error fetching student emails.');
                return;
            }

            for (const result of results) {
                const studentEmail = result.email;

                const subject = 'New Questions Uploaded';
                const text = `No. of Questions - ${numberOfQuestions} Question/Questions has uploaded for ${question_type} at ${currentDateTime}.`;
                const html = `<p>No. of Questions - ${numberOfQuestions} has uploaded for ${question_type} at ${currentDateTime}.</p>`;

                try {
                    await sendNotificationEmail(studentEmail, subject, text, html);
                } catch (error) {
                    console.error(`Error sending email to ${studentEmail}:`, error);
                }
            }

            res.status(200).json({ success: true, message: 'Questions uploaded and notifications sent successfully!' });
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        res.status(500).json({ success: false, message: 'An error occurred while uploading questions.' });
    }
});

function saveQuestionToDatabase(question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) {
    return new Promise((resolve, reject) => {
        // Handle null/undefined concept_id
        const conceptIdToSave = concept_id === '' || concept_id === 'undefined' ? null : concept_id;
        
        console.log('💾 Saving question with concept validation. concept_id:', conceptIdToSave);
        
    // NEW: Validate concept_id exists in concepts table if provided
        if (conceptIdToSave) {
            console.log('Validating concept_id exists in database...');
            pool.query('SELECT id, name FROM concepts WHERE id = ?', [conceptIdToSave], (err, conceptRows) => {
                if (err) {
                    console.error('Error validating concept:', err);
                    return reject(new Error('Failed to validate concept'));
                }
                
                if (conceptRows.length === 0) {
                    console.error(`Invalid concept_id: ${conceptIdToSave}. Concept does not exist.`);
                    return reject(new Error(`Invalid concept_id: ${conceptIdToSave}. Please create the concept first or select an existing one.`));
                }
                
                const conceptName = conceptRows[0].name;
                console.log(`Concept validation passed: "${conceptName}" (ID: ${conceptIdToSave})`);
                
                // Save the question after validation
                saveQuestionWithValidatedConcept();
            });
        } else {
            console.log('No concept_id provided, saving question without concept linking');
            saveQuestionWithValidatedConcept();
        }
        
        function saveQuestionWithValidatedConcept() {
            const sql = `INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            pool.query(sql, [question, option1, option2, option3, option4, correctAnswer, question_type, conceptIdToSave], (err, result) => {
                if (err) {
                    console.error('Error saving question to database:', err);
                    console.error('SQL:', sql);
                    console.error('Values:', [question?.substring(0,30), option1?.substring(0,20), option2?.substring(0,20), option3?.substring(0,20), option4?.substring(0,20), correctAnswer, question_type, conceptIdToSave]);
                    reject(err);
                } else {
                    console.log(`Question saved successfully! ID: ${result.insertId}, Concept: ${conceptIdToSave || 'None'}`);
                    resolve(result);
                }
            });
        }
    });
}

async function sendNotificationEmail(userEmail, subject, text, html) {
    // Check if email is enabled
    if (process.env.EMAIL_ENABLED === 'false') {
        console.log('Email disabled. Skipping email send to:', userEmail);
        return { success: false, message: 'Email service disabled' };
    }

    let transporter;
    let fromEmail;

    try {
        if (userEmail.endsWith('@nmims.in')) {
            transporter = nodemailer.createTransport({
                service: 'Outlook',
                auth: {
                    user: process.env.OUTLOOK_USER,
                    pass: process.env.OUTLOOK_PASS,
                },
                timeout: 10000
            });
            fromEmail = process.env.OUTLOOK_USER;
        } else if (userEmail.endsWith('@gmail.com')) {
            transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                timeout: 10000
            });
            fromEmail = process.env.EMAIL_USER;
        } else {
            throw new Error('Unsupported email domain');
        }

        const mailOptions = {
            from: fromEmail,
            to: userEmail,
            subject: subject,
            text: text,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send email', error: error.message };
    }
}


app.get('/questions/:question_type', (req, res) => {
    const questionType = req.params.question_type;
    const sql = `SELECT question, option1, option2, option3, option4, correctAnswer FROM questions WHERE question_type = ?`;
    pool.query(sql, [questionType], (err, results) => {
        if (err) {
            console.error('Error fetching questions: ' + err.stack);
            res.status(500).send({ error: 'Failed to fetch questions' });
            return;
        }
        res.send(results);
    });
});

app.post('/submitAnswers', async (req, res) => {
    const answers = req.body.answers; 
    const questionType = req.body.questionType; 
    const studentEmail = req.session.user ? req.session.user.email : null;

    console.log('Processing answer submission:', {
        questionType,
        answersCount: answers ? answers.length : 0,
        studentEmail
    });

    try {
        // Get questions with IDs and correct answers for the question type
        const sql = `SELECT id, correctAnswer, concept_id FROM questions WHERE question_type = ? ORDER BY id`;
        pool.query(sql, [questionType], async (err, results) => {
            if (err) {
                console.error('Error fetching questions with IDs:', err);
                res.status(500).send({ error: 'Failed to fetch questions' });
                return;
            }
            
            console.log(`Found ${results.length} questions for type ${questionType}`);
            
            const evaluationResults = [];
            const failedQuestionIds = [];
            
            // Evaluate each answer
            results.forEach((question, index) => {
                const userAnswer = parseInt(answers[index]);
                const correctAnswer = parseInt(question.correctAnswer);
                const isCorrect = userAnswer === correctAnswer;
                
                evaluationResults.push({ 
                    questionIndex: index,
                    questionId: question.id,
                    isCorrect, 
                    correctAnswer: correctAnswer,
                    conceptId: question.concept_id
                });

                // Track failed questions for recommendations
                if (!isCorrect) {
                    failedQuestionIds.push(question.id);
                }
            });

            console.log(`Evaluation complete. Failed questions: ${failedQuestionIds.length}`);

            // Get AI-Enhanced recommendations for failed questions
            let allRecommendationData = [];
            let aiInsights = [];
            
            if (failedQuestionIds.length > 0) {
                console.log('Generating AI-Enhanced recommendations for failed questions...');
                
                try {
                    // Get recommendations for each failed question
                    for (const questionId of failedQuestionIds) {
                        console.log(`Getting AI recommendations for question ID: ${questionId}`);
                        const recommendationResult = await getRecommendationsForQuestion(questionId);
                        
                        if (recommendationResult.questions.length > 0) {
                            allRecommendationData = allRecommendationData.concat(recommendationResult.questions);
                        }
                        
                        if (recommendationResult.aiInsights) {
                            aiInsights.push({
                                questionId,
                                failedConcept: recommendationResult.failedConcept,
                                insights: recommendationResult.aiInsights
                            });
                        }
                    }
                    
                    console.log(`Generated ${allRecommendationData.length} questions and ${aiInsights.length} AI insights`);
                } catch (error) {
                    console.error('Error generating recommendations:', error);
                    // Continue without recommendations rather than failing
                }
            }

            // Remove duplicate recommendations
            const uniqueRecommendations = allRecommendationData.filter((recommendation, index, self) => 
                index === self.findIndex(r => r.id === recommendation.id)
            );

            console.log(`Final unique recommendations: ${uniqueRecommendations.length}`);

            // Save test results for analytics
            if (studentEmail) {
                const score = evaluationResults.filter(r => r.isCorrect).length;
                const totalQuestions = evaluationResults.length;
                const percentage = ((score / totalQuestions) * 100).toFixed(2);
                
                const insertResultSql = 'INSERT INTO student_results (student_email, question_type, score, total_questions, percentage, failed_question_ids, test_date) VALUES (?, ?, ?, ?, ?, ?, NOW())';
                const failedIds = JSON.stringify(failedQuestionIds);
                
                pool.query(insertResultSql, [studentEmail, questionType, score, totalQuestions, percentage, failedIds], (err) => {
                    if (err) {
                        console.error('Error saving test results:', err);
                    } else {
                        console.log(`Saved test results: ${score}/${totalQuestions} (${percentage}%)`);
                    }
                });
            }

            // Send response with evaluation and AI-Enhanced recommendations
            res.send({ 
                success: true,
                evaluationResults,
                recommendations: uniqueRecommendations,
                aiInsights: aiInsights, // New: AI-powered learning insights
                summary: {
                    totalQuestions: evaluationResults.length,
                    correctAnswers: evaluationResults.filter(r => r.isCorrect).length,
                    score: ((evaluationResults.filter(r => r.isCorrect).length / evaluationResults.length) * 100).toFixed(2) + '%',
                    recommendationsCount: uniqueRecommendations.length,
                    aiInsightsCount: aiInsights.length
                }
            });
        });
    } catch (error) {
    console.error('Critical error in submitAnswers:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// AI-Enhanced Knowledge Graph Recommendation Engine
// Uses Gemini AI to provide intelligent learning insights along with prerequisite questions
async function getRecommendationsForQuestion(questionId) {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Get the failed question and its concept
            const questionResult = await queryDatabase('SELECT q.id, q.question, q.concept_id, c.name as concept_name, c.description as concept_description FROM questions q LEFT JOIN concepts c ON q.concept_id = c.id WHERE q.id = ?', [questionId]);
            
            if (questionResult.length === 0 || !questionResult[0].concept_id) {
                return resolve({ questions: [], aiInsights: null });
            }

            const failedQuestion = questionResult[0];
            const failedConceptId = failedQuestion.concept_id;
            const failedConceptName = failedQuestion.concept_name;

            // Step 2: Find prerequisite concepts from Knowledge Graph
            const prerequisiteResult = await queryDatabase('SELECT target_concept_id FROM concept_relationships WHERE source_concept_id = ? AND relationship_type = ?', [failedConceptId, 'DEPENDS_ON']);
            
            if (prerequisiteResult.length === 0) {
                // No prerequisites found, but still try to get AI insights
                const aiInsights = await getAILearningInsights(failedQuestion.question, failedConceptName, []);
                return resolve({ questions: [], aiInsights });
            }

            const prerequisiteConceptIds = prerequisiteResult.map(row => row.target_concept_id);

            // Step 3: Get prerequisite questions with concept details
            const recommendedQuestions = await queryDatabase(
                `SELECT 
                    q.id, q.question, q.option1, q.option2, q.option3, q.option4, q.correctAnswer, q.question_type, q.concept_id,
                    c.name as concept_name, c.description as concept_description
                 FROM questions q 
                 JOIN concepts c ON q.concept_id = c.id 
                 WHERE q.concept_id IN (?)
                 ORDER BY c.name, q.id`,
                [prerequisiteConceptIds]
            );

            // Step 4: Get AI-powered learning insights
            const prerequisiteNames = [...new Set(recommendedQuestions.map(q => q.concept_name))];
            const aiInsights = await getAILearningInsights(failedQuestion.question, failedConceptName, prerequisiteNames);

            resolve({ 
                questions: recommendedQuestions, 
                aiInsights,
                failedConcept: {
                    name: failedConceptName,
                    description: failedQuestion.concept_description
                }
            });
        } catch (error) {
            console.error('Error in enhanced recommendation engine:', error);
            reject(error);
        }
    });
}

// Helper function to promisify database queries
function queryDatabase(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Gemini AI function to generate personalized learning insights
async function getAILearningInsights(failedQuestion, failedConcept, prerequisiteConcepts) {
    if (!geminiModel) {
        return null; // AI not available
    }

    try {
        const prompt = `
You are an expert computer science tutor helping students learn programming concepts through a Knowledge Graph approach.

FAILED QUESTION: "${failedQuestion}"
FAILED CONCEPT: "${failedConcept}"
PREREQUISITE CONCEPTS TO LEARN: ${prerequisiteConcepts.length > 0 ? prerequisiteConcepts.join(', ') : 'None identified'}

Please provide a personalized learning response (max 150 words) that:
1. Explains WHY the student struggled with this concept
2. Shows how the prerequisites connect to the failed concept
3. Gives specific study tips or analogies to understand the concept better
4. Motivates the student with encouragement

Keep the tone friendly, encouraging, and educational. Use simple language that a student can understand.
`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
    console.error('Gemini AI error:', error);
        return null;
    }
}

function evaluateAnswers(answers, correctAnswers) {
    const results = [];
    answers.forEach((answer, index) => {
        const isCorrect = answer === correctAnswers[index];
        results.push({ questionIndex: index, isCorrect, correctAnswer: correctAnswers[index] });
    });
    return results;
}

app.post('/uploadNews', (req, res) => {
    const { title, description } = req.body; 

    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const sql = 'INSERT INTO news (title, description) VALUES (?, ?)';
    const values = [title, description || null]; 
    pool.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error uploading news:', err);
            return res.status(500).json({ success: false, message: 'Failed to upload news' });
        }
        
        // Image upload functionality removed

        pool.query('SELECT email FROM users WHERE userType = "Student"', async(err, results) => {
            if(err){
                console.log('Error fetching students emails:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch students emails'
                }); 
            }

            for(const result of results){
                const studentEmail = result.email;
                const subject = title + '-' + currentDateTime;
                const text = `${title} ${currentDateTime}\n\n${description}`;
                const html = `<p>${title} ${currentDateTime}</p><p>${description}</p>`;

                try{
                    await sendNotificationEmail(studentEmail, subject, text, html);
                }
                catch(error){
                    console.error(`Error sending email to {studentEmail}:`, error);
                }
            }

            res.json({success: true, message: 'News uploaded and notifications sent successfully!!'});
        });
    });
});

app.get('/latestNews', (req, res) => {
    pool.query('SELECT * FROM news ORDER BY created_at DESC LIMIT 5', (error, results) => {
        if (error) {
            console.error('Error fetching latest news:', error);
            res.json({ success: false, message: 'Failed to fetch latest news' });
        } else {
            res.json({ success: true, news: results });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.error('Error destroying session:', err);
        }
        res.redirect('/login'); 
    });
});

app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = generateOtp();
    const otpExpiry = new Date(new Date().getTime() + 10 * 60000);

    const sql = `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`;
    pool.query(sql, [otp, otpExpiry, email], async (err, result) => {
        if (err) {
            console.error('Error updating OTP:', err);
            return res.status(500).json({ success: false, message: 'Error sending OTP.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (process.env.EMAIL_ENABLED === 'false') {
            console.log(`Mock OTP for ${email}: ${otp}`);
            return res.json({
                success: true, 
                message: 'OTP generated successfully (email disabled).',
                mockOtp: otp
            });
        }

        try {
            const emailResult = await sendNotificationEmail(
                email,
                'Your OTP for Login',
                `Your OTP is: ${otp}. It is valid for 10 minutes.`, 
                `<h2>Login OTP</h2><p>Your OTP is: <strong>${otp}</strong></p><p>It is valid for 10 minutes.</p>`
            );

            if (emailResult.success) {
                return res.json({ success: true, message: 'OTP sent successfully.' });
            } else {
                return res.status(500).json({ success: false, message: emailResult.message });
            }
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return res.status(500).json({ success: false, message: 'Error sending OTP email.' });
        }
    });
});

// Forgot Password endpoint - DISABLED

// Reset Password Token endpoint - DISABLED

// Reset Password endpoint - DISABLED


// Concept Management Endpoints
app.post('/concepts', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Concept name is required.' });
    }
    const sql = 'INSERT INTO concepts (name, description) VALUES (?, ?)';
    pool.query(sql, [name, description], (err, result) => {
        if (err) {
            console.error('Error adding concept:', err);
            return res.status(500).json({ success: false, message: 'Failed to add concept.' });
        }
        res.status(201).json({ success: true, message: 'Concept added successfully.', conceptId: result.insertId });
    });
});

app.get('/concepts', (req, res) => {
    const sql = 'SELECT id, name, description FROM concepts';
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching concepts:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch concepts.' });
        }
        res.status(200).json({ success: true, concepts: results });
    });
});

app.post('/concept-relationships', (req, res) => {
    const { source_concept_id, target_concept_id, relationship_type = 'DEPENDS_ON' } = req.body;
    if (!source_concept_id || !target_concept_id) {
        return res.status(400).json({ success: false, message: 'Source and target concept IDs are required.' });
    }
    const sql = 'INSERT INTO concept_relationships (source_concept_id, target_concept_id, relationship_type) VALUES (?, ?, ?)';
    pool.query(sql, [source_concept_id, target_concept_id, relationship_type], (err, result) => {
        if (err) {
            console.error('Error adding concept relationship:', err);
            return res.status(500).json({ success: false, message: 'Failed to add concept relationship.' });
        }
        res.status(201).json({ success: true, message: 'Concept relationship added successfully.', relationshipId: result.insertId });
    });
});

// Recommendation Algorithm Endpoint
// NOTE: Currently disabled because questions table doesn't have 'id' column
app.get('/recommend-prerequisites/:questionId', async (req, res) => {
    const { questionId } = req.params;

    try {
        pool.query('SELECT concept_id FROM questions WHERE id = ?', [questionId], (err, questionRows) => {
            if (err) {
                console.error('Error getting question concept:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (questionRows.length === 0 || !questionRows[0].concept_id) {
                return res.status(404).json({ success: false, message: 'Question not found or has no associated concept.' });
            }

            const failedConceptId = questionRows[0].concept_id;

            pool.query(
                'SELECT target_concept_id FROM concept_relationships WHERE source_concept_id = ? AND relationship_type = ?',
                [failedConceptId, 'DEPENDS_ON'],
                (err, prerequisiteRows) => {
                    if (err) {
                        console.error('Error getting prerequisites:', err);
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }

                    if (prerequisiteRows.length === 0) {
                        return res.status(200).json({ success: true, message: 'No direct prerequisites found for this concept.', recommendedQuestions: [] });
                    }

                    const prerequisiteConceptIds = prerequisiteRows.map(row => row.target_concept_id);

                    pool.query(
                        'SELECT id, question, option1, option2, option3, option4, correctAnswer, question_type FROM questions WHERE concept_id IN (?)',
                        [prerequisiteConceptIds],
                        (err, recommendedQuestions) => {
                            if (err) {
                                console.error('Error getting recommended questions:', err);
                                return res.status(500).json({ success: false, message: 'Database error' });
                            }

                            res.status(200).json({ success: true, recommendedQuestions });
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error recommending prerequisites:', error);
        res.status(500).json({ success: false, message: 'Failed to recommend prerequisites.' });
    }
});




// Upload Question Paper endpoint - DISABLED

// Get Question Papers endpoint - DISABLED



// Upload Student Document endpoint - DISABLED


// Student Submissions endpoints - DISABLED


// Remove All Papers endpoint - DISABLED

// Remove Submission endpoint - DISABLED


function keepServerAlive() {
    setInterval(() => {
        https.get('https://placementportal-ktlv.onrender.com/ping', (res) => { 
            res.on('data', (chunk) => {
                console.log(`Ping response: ${chunk}`);
            });
            res.on('end', () => {
                console.log('Server is alive');
            });
        }).on('error', (err) => {
            console.error('Error pinging the server:', err.message);
        });
    }, 300000); 
}

function keepDatabaseAlive() {
    setInterval(() => {
        pool.query('SELECT 1', (err, result) => {
            if (err) {
                console.error('Error keeping DB connection alive:', err);
            } else {
                console.log('DB connection alive');
            }
        });
    }, 300000); 
}

app.listen(3000, () => {
    console.log('Server running on port 3000');
    keepServerAlive(); 
    keepDatabaseAlive(); 
});
