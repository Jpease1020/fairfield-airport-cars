#!/bin/bash

# Script to start ngrok tunnel for mobile testing
# This creates a public HTTPS URL that tunnels to localhost:3000

echo "🚇 Starting ngrok tunnel to localhost:3000..."
echo ""
echo "📱 After ngrok starts, you'll get a public URL like: https://xxxx-xx-xx-xx-xx.ngrok-free.app"
echo "🔗 Copy that URL and add it to Google Cloud Console → APIs & Services → Credentials"
echo "   → Your API Key → Application restrictions → HTTP referrers"
echo ""
echo "⚠️  Make sure your dev server is running on port 3000 first!"
echo "   Run: npm run dev"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

# Start ngrok tunnel
ngrok http 3000

