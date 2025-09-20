# Knowledge Graph Recommendation System - Setup Instructions

## Overview
This placement portal now includes a complete **Knowledge Graph for Prerequisite-Based Question Recommendation** system that automatically suggests prerequisite questions when students struggle with advanced topics.

## Setup Requirements

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher) 
- A code editor (VS Code recommended)

## 📋 Step-by-Step Setup

### 1. Install Dependencies
```bash
cd /home/krishna/Downloads/placementPortal-master
npm install
```

### 2. Database Setup

#### A. Create MySQL Database
```sql
CREATE DATABASE placement_portal;
USE placement_portal;
```

#### B. Create Required Tables
Run the provided SQL setup script:
```bash
mysql -u your_username -p placement_portal < database_setup.sql
```

Or manually execute the SQL commands in `database_setup.sql`

#### C. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=placement_portal

# Session Security
SECRET_SESSION=your_secret_key_here

# Email Configuration (Optional - set EMAIL_ENABLED=false to disable)
EMAIL_ENABLED=false
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
OUTLOOK_USER=your_outlook@nmims.in
OUTLOOK_PASS=your_outlook_password

# Cloudinary Configuration (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Image URLs (Optional)
BACKGROUND_IMAGE_URL=https://your-background-image.jpg
NMIMS_LOGO_URL=https://your-logo.png
```

### 3. Initialize Sample Data

#### A. Add Sample Users
```sql
-- Faculty user
INSERT INTO users (name, email, username, userType) VALUES 
('Test Faculty', 'faculty@test.com', 'faculty', 'faculty');

-- Student user  
INSERT INTO users (name, email, username, userType) VALUES
('Test Student', 'student@test.com', 'student', 'student');
```

#### B. Add Sample Questions with Concepts
```sql
-- Sample questions for Dynamic Programming (Advanced topic)
INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) VALUES
('What is the time complexity of the optimal solution for the 0/1 Knapsack problem using dynamic programming?', 'O(n)', 'O(n²)', 'O(n*W)', 'O(2ⁿ)', 3, 'CS_08_DP', 2),
('Which technique is used in dynamic programming to avoid redundant calculations?', 'Recursion', 'Memoization', 'Iteration', 'Backtracking', 2, 'CS_08_DP', 2);

-- Sample questions for Recursion (Prerequisite topic)  
INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) VALUES
('What is the base case in a recursive function?', 'The first call', 'The condition to stop recursion', 'The return statement', 'The parameter', 2, 'CS_07_REC', 1),
('What happens if a recursive function lacks a proper base case?', 'Compilation error', 'Stack overflow', 'Infinite loop', 'Memory leak', 2, 'CS_07_REC', 1);

-- Sample questions for Functions (More basic prerequisite)
INSERT INTO questions (question, option1, option2, option3, option4, correctAnswer, question_type, concept_id) VALUES
('What is a function parameter?', 'Return value', 'Input to function', 'Function name', 'Function body', 2, 'CS_05_FUNC', 6),
('Which keyword is used to return a value from a function?', 'give', 'return', 'send', 'output', 2, 'CS_05_FUNC', 6);
```

## Running the Application

### 1. Start the Server
```bash
npm start
```
The server will run on `http://localhost:3000`

### 2. Access the Application

#### For Students:
1. Go to `http://localhost:3000`
2. Register/Login as a student
3. Take a test by clicking "View Questions" 
4. Submit answers and see recommendations!

#### For Faculty: 
1. Login as faculty
2. Go to Faculty Dashboard
3. Add questions and link them to concepts
4. Manage concepts and relationships at `/concept-management`

## Testing the Knowledge Graph System

### Test Scenario 1: Perfect Implementation Test
1. **Student takes Dynamic Programming test**
2. **Gets questions wrong** → System detects failed questions  
3. **Automatic recommendation** → Shows Recursion questions (prerequisite)
4. **UI displays** → Prerequisite questions with answers

### Test Scenario 2: Multi-Level Dependencies
1. Student fails Graph Traversal questions
2. System recommends Tree Data Structure questions  
3. If student also struggles with trees, system can recommend Recursion
4. Creates a learning path: Graph → Tree → Recursion → Functions

## 🏗️ System Architecture 

### Backend Components:
- **Knowledge Graph Storage**: MySQL tables (`concepts`, `concept_relationships`)
- **Recommendation Engine**: `/recommend-prerequisites/:questionId` endpoint
- **Graph Traversal**: SQL queries following `DEPENDS_ON` relationships
- **Result Processing**: Enhanced `/submitAnswers` endpoint

### Frontend Components:
- **Test Interface**: Enhanced `result.html` with batch submission
- **Recommendation Display**: Dynamic UI showing prerequisite questions
- **Management Interface**: `concept-management.html` for graph setup

## Knowledge Graph Management

### Adding Concepts:
1. Go to `http://localhost:3000/concept-management`
2. Add new CS concepts (e.g., "Sorting Algorithms", "Binary Search")
3. Add descriptions for each concept

### Creating Relationships:
1. Select source concept (e.g., "Merge Sort")  
2. Select target concept (e.g., "Recursion")
3. Creates: "Merge Sort DEPENDS_ON Recursion"

### Linking Questions to Concepts:
1. When faculty adds questions, select associated concept
2. Each question gets linked to exactly one concept
3. Enables prerequisite recommendations

## Advanced Configuration

### Database Optimization:
```sql
-- Add indexes for better performance
CREATE INDEX idx_concept_relationships_source ON concept_relationships(source_concept_id);
CREATE INDEX idx_questions_concept ON questions(concept_id);  
CREATE INDEX idx_questions_type ON questions(question_type);
```

### Analytics Setup:
Uncomment the student results saving code in `server.js` line 438-443 to enable test result analytics.

## Key Features Implemented

- **Complete Knowledge Graph**: Concepts and relationships management  
- **Automatic Recommendations**: Failed questions trigger prerequisite suggestions  
- **Smart UI**: Enhanced test interface with batch submission  
- **Graph Traversal**: Multi-level dependency resolution  
- **Faculty Tools**: Complete concept and relationship management  
- **Student Experience**: Seamless recommendation display  

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**: Check `.env` file and MySQL service
2. **No Recommendations**: Ensure concepts are linked and relationships exist  
3. **Questions Not Loading**: Check question_type parameter and database data
4. **OTP Issues**: Set `EMAIL_ENABLED=false` in `.env` for development

### Debug Mode:
Check server console logs for detailed error information and recommendation processing.

## Success Metrics

The system is working correctly when:
- Students see prerequisite questions after failing advanced topics
- Recommendations are relevant and helpful  
- Faculty can manage knowledge graph easily
- System handles multi-level dependencies
- No duplicate recommendations appear

---

## Congratulations! 
Your Knowledge Graph Recommendation System is now fully implemented and ready for use. Students will get personalized learning paths based on their performance!