#!/bin/bash

echo "🔔 Push Notifications Setup Script"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Creating it..."
    touch .env.local
fi

echo "📋 Please add these environment variables to your .env.local file:"
echo ""
echo "# Firebase Cloud Messaging"
echo "NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here"
echo ""
echo "# Firebase Admin (for server-side messaging)"
echo "FIREBASE_PROJECT_ID=fairfield-airport-car-service"
echo "FIREBASE_PRIVATE_KEY=your_private_key_here"
echo "FIREBASE_CLIENT_EMAIL=your_client_email_here"
echo ""

echo "🔧 Instructions:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/fairfield-airport-car-service"
echo "2. Project Settings → Cloud Messaging → Generate Web Push certificate"
echo "3. Copy the VAPID key to NEXT_PUBLIC_FIREBASE_VAPID_KEY"
echo "4. Project Settings → Service Accounts → Generate new private key"
echo "5. Extract values from the downloaded JSON file"
echo ""

echo "✅ After adding the environment variables, run:"
echo "npm run dev"
echo ""

echo "🧪 To test push notifications:"
echo "1. Add NotificationManager component to any page"
echo "2. Click 'Enable Notifications'"
echo "3. Click 'Send Test Notification'"
echo ""

echo "📚 For detailed setup instructions, see: docs/PUSH_NOTIFICATIONS_SETUP.md" 