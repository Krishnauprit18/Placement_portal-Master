#!/bin/bash

# Quick Test Script for Knowledge Graph Recommendation System
echo "Knowledge Graph Recommendation System - Quick Test"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed  
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ".env file not found. Creating a sample one..."
    echo "DB_HOST=localhost" > .env
    echo "DB_USER=root" >> .env
    echo "DB_PASSWORD=" >> .env  
    echo "DB_NAME=placement_portal" >> .env
    echo "SECRET_SESSION=your_secret_key_here" >> .env
    echo "EMAIL_ENABLED=false" >> .env
    echo ""
    echo "Please edit the .env file with your database credentials before continuing."
    echo "   Then run this script again."
    exit 1
fi

# Run the test script
echo "Running recommendation system test..."
node test_recommendation_system.js

echo ""
echo "If the test passed, you can now start the server with:"
echo "   npm start"
echo ""
echo "📖 For detailed setup instructions, see SETUP_INSTRUCTIONS.md"