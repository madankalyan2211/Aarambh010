#!/bin/bash

# Quick Deployment Script for Aarambh LMS
# Provides step-by-step deployment commands

echo "🚀 Aarambh LMS Quick Deployment Guide"
echo "====================================="

echo ""
echo "Follow these steps to deploy your application:"
echo ""

echo "1. Backend Deployment (Elastic Beanstalk):"
echo "------------------------------------------"
echo "   cd server"
echo "   eb init  # Initialize EB (follow prompts)"
echo "   eb create production  # Create environment"
echo "   eb setenv NODE_ENV=production PORT=8080  # Set environment variables"
echo "   eb deploy  # Deploy application"
echo "   eb open  # Open in browser"
echo ""

echo "2. Frontend Deployment (Amplify):"
echo "--------------------------------"
echo "   npm run build  # Build frontend"
echo "   amplify init  # Initialize Amplify (follow prompts)"
echo "   amplify add hosting  # Add hosting"
echo "   amplify publish  # Publish to Amplify"
echo ""

echo "3. Post-Deployment Configuration:"
echo "--------------------------------"
echo "   - Update API URLs in frontend to point to your EB backend"
echo "   - Configure environment variables in Amplify Console"
echo "   - Set up custom domains if needed"
echo ""

echo "Useful Commands:"
echo "---------------"
echo "   eb status     - Check environment status"
echo "   eb logs       - View application logs"
echo "   eb health     - Check environment health"
echo "   amplify status - Check Amplify status"
echo "   amplify console - Open Amplify Console"