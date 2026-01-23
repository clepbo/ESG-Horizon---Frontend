#!/bin/bash

# Deployment script for ESG Horizon Frontend
# This script should be run on the VPS server

set -e  # Exit on any error

echo "🚀 Starting ESG Horizon Frontend Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
# Default to staging, but allow override
ENV=${1:-staging}

if [ "$ENV" = "production" ]; then
    APP_DIR="/var/www/esghorizon/main"
    APP_NAME="esg-frontend-prod"
    PORT=3001
else
    APP_DIR="/var/www/esghorizon/staging"
    APP_NAME="esg-frontend-staging"
    PORT=3002
fi

BACKUP_DIR="/var/www/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🌍 Environment: $ENV"
echo "📁 Application directory: $APP_DIR"
echo "🔌 Port: $PORT"
echo "📦 Backup directory: $BACKUP_DIR"
echo "🕒 Timestamp: $TIMESTAMP"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root - this is not recommended for production"
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creating backup directory..."
    sudo mkdir -p "$BACKUP_DIR"
fi

# Backup current deployment if it exists
if [ -d "$APP_DIR" ]; then
    print_status "Creating backup of current deployment..."
    sudo cp -r "$APP_DIR" "$BACKUP_DIR/backup_$TIMESTAMP"
fi

# Stop PM2 process
# Stop PM2 process
print_status "Stopping PM2 process ($APP_NAME)..."
pm2 stop $APP_NAME || print_warning "PM2 process not running or already stopped"

# Remove old deployment
if [ -d "$APP_DIR" ]; then
    print_status "Removing old deployment..."
    sudo rm -rf "$APP_DIR"
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

# Copy built application (this assumes you're running this from the project directory)
print_status "Copying application files..."
cp -r . "$APP_DIR/"

# Navigate to application directory
cd "$APP_DIR"

# Install dependencies (production only)
print_status "Installing production dependencies..."
npm ci --only=production

# Build the application
print_status "Building Next.js application..."
npm run build

# Verify build output
if [ ! -d ".next/standalone" ]; then
    print_error "Build failed - .next/standalone directory not found"
    exit 1
fi

if [ ! -d ".next/static" ]; then
    print_error "Build failed - .next/static directory not found"
    exit 1
fi

# MOVE STANDALONE CONTENT TO ROOT
# This matches the CI/CD pipeline behavior and ecosystem.config.js expectation
print_status "Moving standalone files to root..."
if [ -d ".next/standalone" ]; then
    cp -r .next/standalone/. .
    # Note: We don't need to manually move static/public because they are already 
    # in the root from the build process.
    rm -rf .next/standalone
else
    print_error "Standalone directory not found!"
    exit 1
fi

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR/.next"

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    mkdir -p logs
fi

# Start PM2 process
# Start PM2 process
print_status "Starting PM2 process ($APP_NAME on port $PORT)..."
PORT=$PORT NODE_ENV=production pm2 start server.js --name $APP_NAME --instances 1 --exec-mode fork

# Wait a moment for the app to start
sleep 5

# Check if the process is running
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    print_status "✅ Deployment successful!"
    print_status "Application is running on port $PORT"
    print_status "Make sure nginx is configured to proxy requests to localhost:$PORT"
    pm2 status
else
    print_error "❌ Deployment failed - PM2 process not running"
    pm2 logs $APP_NAME --lines 20
    exit 1
fi

# Clean up old backups (keep last 5)
print_status "Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf

print_status "🎉 Deployment completed successfully!"
print_status "Your application should be available at https://staging.esghorizon.africa"