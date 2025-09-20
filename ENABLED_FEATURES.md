# Enabled Features Documentation

## Overview
This document summarizes the functionalities that have been enabled in the Placement Portal project.

## Enabled Functionalities

### 1. Knowledge Graph Recommendation System
**Status**: ENABLED
- **Core Algorithm**: `getRecommendationsForQuestion()` function enabled
- **API Endpoint**: `/recommend-prerequisites/:questionId` - Get recommended questions for failed concepts
- **Database Integration**: Full integration with concepts and concept_relationships tables
- **Smart Learning**: Analyzes failed questions and suggests prerequisite concept practice

### 2. Student Results Analytics
**Status**: ENABLED
- **Database Logging**: All test results now saved to `student_results` table
- **Tracking**: Records student email, question type, score, percentage, and timestamp
- **Analytics Ready**: Data structure supports future analytics dashboard

### 3. Concept Management System
**Status**: ENABLED
- **Add Concepts**: `/concepts` POST - Create new learning concepts
- **Get Concepts**: `/concepts` GET - Retrieve all concepts
- **Add Relationships**: `/concept-relationships` POST - Define concept dependencies
- **Get Relationships**: `/concept-relationships` GET - View concept relationships
- **Management Page**: `/concept-management` - Admin interface for concept management

### 4. Additional Page Routes
**Status**: ENABLED
- **Assignment Dashboard**: `/assignment-dashboard` - Student assignment portal
- **Mock Interviews**: `/mock-interviews` - Interview preparation page
- **Placement Mock Tests**: `/placement-mock-tests` - Test practice portal

## Disabled Functionalities

### 1. Question Paper Management System
**Status**: DISABLED
- File upload/download functionality removed
- Cloudinary integration removed
- All related endpoints disabled

### 2. Student Document Submission System
**Status**: DISABLED
- Document upload functionality removed
- File tracking system removed
- All submission endpoints disabled

### 3. Password Reset System
**Status**: DISABLED
- Token-based password reset removed
- Email integration for reset removed
- All password reset endpoints disabled

### 4. File Upload Systems
**Status**: DISABLED
- Cloudinary integration completely removed
- Multer file upload middleware removed
- All file storage functionality disabled

## Technical Configuration

### Database Requirements
The system now requires these database tables:
```sql
-- Core tables (should exist)
- users (with otp, otp_expiry columns)
- questions (with id AUTO_INCREMENT PRIMARY KEY and concept_id)
- news

-- Required for full functionality
- concepts
- concept_relationships  
- student_results
```

### Active Dependencies
- **mysql/mysql2**: Database connectivity
- **express**: Web framework
- **nodemailer**: Email services (for OTP only)
- **bcryptjs**: Password hashing
- **dotenv**: Environment configuration
- **express-session**: Session management
- **cookie-parser**: Cookie handling
- **moment-timezone**: Time zone handling

### Removed Dependencies
- **cloudinary**: File storage service
- **multer**: File upload middleware
- **multer-storage-cloudinary**: Cloudinary multer integration

## Configuration Required

### Environment Variables Needed
```env
# Email Configuration (for OTP only)
EMAIL_ENABLED=true/false
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
OUTLOOK_USER=your_outlook_email
OUTLOOK_PASS=your_outlook_password

# Database Configuration
DB_HOST=your_host
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# Session Secret
SECRET_SESSION=your_secret_key

# UI Assets (optional)
BACKGROUND_IMAGE_URL=your_background_image
NMIMS_LOGO_URL=your_logo_url
```

### Database Setup
Run the provided SQL scripts:
1. `database_setup.sql` - Creates core tables and sample data
2. `fix_database.sql` - Ensures proper table structure with required columns

## Core Features Available

1. **Learning Management**: Question upload, progress tracking, intelligent recommendations
2. **Concept Management**: Full concept hierarchy and relationship management
3. **User Authentication**: Login/logout with OTP verification
4. **Analytics**: Comprehensive test result tracking
5. **News System**: Faculty can upload news and notifications
6. **Responsive Design**: All core pages have proper backend routes

## System Status
- Server starts successfully on port 3000
- All dependencies properly configured
- No file upload dependencies or security risks
- Clean codebase focused on core learning functionality
- Ready for production deployment

## Important Notes
- File upload functionality completely removed for security
- Password reset system disabled - use admin panel for password management
- System focuses on core learning and assessment functionality
- All user interactions logged for analytics
- Email system only used for OTP verification during login