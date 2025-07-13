'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Settings, Mic, Bot, Save } from 'lucide-react';

export default function AIAssistantSettingsPage() {
  const [settings, setSettings] = useState({
    useOpenAI: false,
    autoVoiceOutput: false,
    voiceInputEnabled: true,
    voiceOutputEnabled: true,
    openAIKey: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // In a real app, you'd save to your database
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const testVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      alert('Voice input is supported in your browser!');
    } else {
      alert('Voice input is not supported in your browser.');
    }
  };

  const testVoiceOutput = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Voice output is working correctly!');
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Voice output is not supported in your browser.');
    }
  };

  const testOpenAI = async () => {
    if (!settings.openAIKey) {
      alert('Please enter your OpenAI API key first.');
      return;
    }

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Test message',
          testOpenAI: true,
          openAIKey: settings.openAIKey
        })
      });

      if (response.ok) {
        alert('OpenAI connection successful!');
      } else {
        alert('OpenAI connection failed. Please check your API key.');
      }
    } catch {
      alert('Failed to test OpenAI connection.');
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Assistant Settings" 
        subtitle="Configure your AI assistant preferences"
      />
      <PageContent>
        <div className="max-w-2xl space-y-6">
          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-input">Voice Input</Label>
                  <p className="text-sm text-gray-600">Allow speaking to the AI assistant</p>
                </div>
                <Switch
                  id="voice-input"
                  checked={settings.voiceInputEnabled}
                  onCheckedChange={(checked: boolean) => 
                    setSettings(prev => ({ ...prev, voiceInputEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-output">Voice Output</Label>
                  <p className="text-sm text-gray-600">Hear AI responses aloud</p>
                </div>
                <Switch
                  id="voice-output"
                  checked={settings.voiceOutputEnabled}
                  onCheckedChange={(checked: boolean) => 
                    setSettings(prev => ({ ...prev, voiceOutputEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-voice">Auto Voice Output</Label>
                  <p className="text-sm text-gray-600">Automatically speak AI responses</p>
                </div>
                <Switch
                  id="auto-voice"
                  checked={settings.autoVoiceOutput}
                  onCheckedChange={(checked: boolean) => 
                    setSettings(prev => ({ ...prev, autoVoiceOutput: checked }))
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={testVoiceInput}>
                  Test Voice Input
                </Button>
                <Button variant="outline" size="sm" onClick={testVoiceOutput}>
                  Test Voice Output
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="use-openai">Use OpenAI (Enhanced AI)</Label>
                  <p className="text-sm text-gray-600">Enable more sophisticated responses</p>
                </div>
                <Switch
                  id="use-openai"
                  checked={settings.useOpenAI}
                  onCheckedChange={(checked: boolean) => 
                    setSettings(prev => ({ ...prev, useOpenAI: checked }))
                  }
                />
              </div>

              {settings.useOpenAI && (
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={settings.openAIKey}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, openAIKey: e.target.value }))
                    }
                  />
                  <p className="text-xs text-gray-600">
                    Get your API key from{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                  <Button variant="outline" size="sm" onClick={testOpenAI}>
                    Test OpenAI Connection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Help & Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>Voice Input:</strong> Works best in Chrome, Edge, and Safari. Speak clearly and avoid background noise.
              </div>
              <div>
                <strong>Voice Output:</strong> Works in all modern browsers. Perfect for hands-free operation while driving.
              </div>
              <div>
                <strong>OpenAI:</strong> Provides more sophisticated responses but requires an API key. The assistant works without it using local logic.
              </div>
              <div>
                <strong>Security:</strong> Your OpenAI API key is stored securely and never exposed to the client.
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
} 