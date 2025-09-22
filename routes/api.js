// API Middleware for request validation
const express = require('express');
const router = express.Router();

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
}

// Role-based authorization middleware
function requireRole(role) {
    return (req, res, next) => {
        if (!req.session?.user?.userType === role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        next();
    };
}

// Request body validation middleware
function validateRequest(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        next();
    };
}

// API Rate Limiting
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.use(apiLimiter);

// API Routes with validation
// Login endpoint
router.post('/login', validateRequest(loginSchema), async (req, res) => {
    try {
        // Login logic here
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// User registration endpoint
router.post('/register', validateRequest(registerSchema), async (req, res) => {
    try {
        // Registration logic here
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Upload questions endpoint
router.post('/upload-questions', 
    requireAuth,
    requireRole('faculty'),
    validateRequest(questionSchema),
    async (req, res) => {
        try {
            // Question upload logic here
        } catch (error) {
            console.error('Question upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Submit answers endpoint
router.post('/submit-answers',
    requireAuth,
    requireRole('student'),
    validateRequest(answerSchema),
    async (req, res) => {
        try {
            // Answer submission logic here
        } catch (error) {
            console.error('Answer submission error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

// Get latest news endpoint
router.get('/latest-news', async (req, res) => {
    try {
        // News fetching logic here
    } catch (error) {
        console.error('News fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;