#!/bin/bash

# Setup cron job for daily analysis
# This script will add a cron job to run the daily analysis every morning at 8 AM

echo "🔧 Setting up daily analysis cron job..."

# Get the current directory
PROJECT_DIR=$(pwd)
SCRIPT_PATH="$PROJECT_DIR/scripts/daily-analysis.js"

# Make the analysis script executable
chmod +x "$SCRIPT_PATH"

# Create the cron job entry (runs daily at 8 AM)
CRON_JOB="0 8 * * * cd $PROJECT_DIR && node $SCRIPT_PATH >> $PROJECT_DIR/logs/daily-analysis.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "daily-analysis.js"; then
    echo "⚠️  Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "daily-analysis.js" | crontab -
fi

# Add the new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "✅ Cron job set up successfully!"
echo "📅 The analysis will run daily at 8:00 AM"
echo "📊 Reports will be saved to: $PROJECT_DIR/reports/"
echo "📝 Logs will be saved to: $PROJECT_DIR/logs/daily-analysis.log"

# Test the script
echo "🧪 Testing the analysis script..."
node "$SCRIPT_PATH"

echo "🎉 Setup complete! The daily analysis will start tomorrow at 8 AM." 