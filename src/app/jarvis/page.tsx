'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JarvisDownloadPage() {
  const [showDownload, setShowDownload] = useState(false);
  const [password, setPassword] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gregg2024') {
      setShowDownload(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  if (!showDownload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🔐 Secure Access</h1>
            <p className="text-gray-600">Enter password to access Jarvis AI Assistant</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Access Jarvis
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Fairfield Airport Cars
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 Jarvis AI Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personal AI assistant for work automation, project analysis, and productivity enhancement.
          </p>
        </div>

        {/* Access Options */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Access Jarvis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-6 mb-4">
                <div className="text-4xl mb-2">🌐</div>
                <h3 className="text-lg font-semibold mb-2">Web Version</h3>
                <p className="text-gray-600 mb-4">Use Jarvis directly in your browser</p>
                <Link
                  href="/jarvis-web"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Launch Jarvis Web
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 mb-4">
                <div className="text-4xl mb-2">🍎</div>
                <h3 className="text-lg font-semibold mb-2">Desktop App</h3>
                <p className="text-gray-600 mb-4">Native macOS desktop app</p>
                <a
                  href="/api/download/jarvis-mac"
                  className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                >
                  Download for Mac
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            Web version recommended • No installation required • Works on any device
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Work Analysis</h3>
            <p className="text-gray-600 text-sm">
              Understand your projects, track progress, and identify automation opportunities
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">
              Natural language conversations with your AI assistant
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-semibold mb-2">Integrations</h3>
            <p className="text-gray-600 text-sm">
              Connect with Jira, Slack, Google Workspace, and more
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold mb-2">Smart Reports</h3>
            <p className="text-gray-600 text-sm">
              Generate insights and reports automatically
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Choose Your Option</h3>
                <p className="text-gray-600">Use the web version (recommended) or download the desktop app</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Access Jarvis</h3>
                <p className="text-gray-600">
                  Click "Launch Jarvis Web" to use it in your browser, or download the desktop app
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Start Chatting</h3>
                <p className="text-gray-600">Begin asking Jarvis questions and get AI-powered assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Explore Features</h3>
                <p className="text-gray-600">Discover work analysis, integrations, and smart reporting capabilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Fairfield Airport Cars
          </Link>
        </div>
      </div>
    </div>
  );
} 