require('dotenv').config();
const mysql = require('mysql');
const nodemailer = require('nodemailer');

// Validate required environment variables
const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    // SESSION secret: allow either SESSION_SECRET or SECRET_SESSION
    'EMAIL_ENABLED'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`- ${varName}`);
    });
    process.exit(1);
}

// Test database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('Testing database connection...');
pool.query('SELECT 1', (err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Database connection successful');
});

// Test email configuration if enabled
if (process.env.EMAIL_ENABLED === 'true') {
    console.log('Testing email configuration...');
    
    // Test Gmail configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const gmailTransporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        gmailTransporter.verify((error) => {
            if (error) {
                console.error('Gmail configuration error:', error);
            } else {
                console.log('Gmail configuration is valid');
            }
        });
    }
    
    // Test Outlook configuration
    if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
        const outlookTransporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.OUTLOOK_USER,
                pass: process.env.OUTLOOK_PASS
            }
        });
        
        outlookTransporter.verify((error) => {
            if (error) {
                console.error('Outlook configuration error:', error);
            } else {
                console.log('Outlook configuration is valid');
            }
        });
    }
}

// Check Gemini AI configuration
if (process.env.GEMINI_AI_ENABLED === 'true') {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Warning: Gemini AI is enabled but API key is missing');
    } else {
        console.log('Gemini AI configuration present');
    }
}

// Check for deprecated or insecure settings
if (process.env.NODE_ENV !== 'production') {
    console.warn('Warning: Running in development mode');
}

// Session secret validation (accept either var)
const sessionSecret = process.env.SESSION_SECRET || process.env.SECRET_SESSION;
if (!sessionSecret) {
    console.warn('Warning: No session secret found. Set SESSION_SECRET or SECRET_SESSION.');
} else if (sessionSecret.length < 16) {
    console.warn('Warning: Session secret is short; recommend >= 32 characters.');
}

// Validate URLs
const urlFields = ['BACKGROUND_IMAGE_URL', 'NMIMS_LOGO_URL'];
urlFields.forEach(field => {
    if (process.env[field]) {
        try {
            new URL(process.env[field]);
        } catch (e) {
            console.error(`Invalid URL for ${field}: ${process.env[field]}`);
        }
    }
});

console.log('Environment validation completed');

// Clean up
pool.end();