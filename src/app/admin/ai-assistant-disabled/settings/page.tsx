'use client';

import { useMemo } from 'react';
import { 
  AdminPageWrapper,
  SettingSection,
  SettingToggle,
  SettingInput,
  StatusMessage,
  HelpCard,
  ActionButtonGroup,
  ToastProvider,
  useToast
} from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';
import { useBrowserFeatures } from '@/hooks/useBrowserFeatures';
import { createTestRunner } from '@/utils/testRunner';

interface AISettings {
  useOpenAI: boolean;
  autoVoiceOutput: boolean;
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  openAIKey: string;
}

const defaultSettings: AISettings = {
  useOpenAI: false,
  autoVoiceOutput: false,
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  openAIKey: '',
};

function AIAssistantSettingsContent() {
  const { addToast } = useToast();
  const { features, createFeatureTest, createAPITest } = useBrowserFeatures();
  
  const {
    settings,
    updateSetting,
    resetSettings,
    saveSettings,
    isSaving,
    error,
    success,
    clearMessages
  } = useSettings({
    defaultSettings,
    persistKey: 'ai-assistant-settings',
    onSave: async (settings) => {
      console.log('🤖 Saving AI assistant settings...');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ AI settings saved:', settings);
    }
  });

  // Create test runner with toast notifications
  const testRunner = useMemo(() => createTestRunner({
    showToast: addToast
  }), [addToast]);

  // Create feature tests
  const voiceInputTest = useMemo(() => 
    createFeatureTest('voiceInput'), [createFeatureTest]);
  
  const voiceOutputTest = useMemo(() => 
    createFeatureTest('voiceOutput'), [createFeatureTest]);

  // Create OpenAI API test
  const openAITest = useMemo(() => createAPITest(
    'OpenAI Connection',
    async () => {
      if (!settings.openAIKey) {
        addToast('warning', 'Please enter your OpenAI API key first.');
        return false;
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

        return response.ok;
      } catch {
        return false;
      }
    },
    'OpenAI connection successful!',
    'OpenAI connection failed. Please check your API key.'
  ), [settings.openAIKey, addToast, createAPITest]);

  // Header actions
  const headerActions = useMemo(() => [
    {
      label: 'Reset to Defaults',
      onClick: () => {
        if (confirm('Reset all settings to defaults?')) {
          resetSettings();
          addToast('info', 'Settings reset to defaults');
        }
      },
      variant: 'outline' as const
    },
    {
      label: isSaving ? 'Saving...' : 'Save Settings',
      onClick: saveSettings,
      variant: 'primary' as const,
      disabled: isSaving
    }
  ], [resetSettings, saveSettings, isSaving, addToast]);

  // Voice test buttons
  const voiceTestButtons = useMemo(() => [
    {
      label: 'Test Input',
      onClick: () => testRunner.run(voiceInputTest),
      variant: 'outline' as const,
      icon: '🎙️',
      disabled: !features.voiceInput
    },
    {
      label: 'Test Output',
      onClick: () => testRunner.run(voiceOutputTest),
      variant: 'outline' as const,
      icon: '🔊',
      disabled: !features.voiceOutput
    }
  ], [testRunner, voiceInputTest, voiceOutputTest, features]);

  // Help cards data
  const helpCards = useMemo(() => [
    {
      icon: '🎙️',
      title: 'Voice Input',
      description: `${features.voiceInput ? '✅ Supported' : '❌ Not supported'} - Works best in Chrome, Edge, and Safari. Speak clearly and avoid background noise for optimal recognition.`
    },
    {
      icon: '🔊',
      title: 'Voice Output',
      description: `${features.voiceOutput ? '✅ Supported' : '❌ Not supported'} - Works in all modern browsers. Perfect for hands-free operation while driving or multitasking.`
    },
    {
      icon: '🤖',
      title: 'Enhanced AI',
      description: 'Provides more sophisticated responses but requires an API key. The assistant works without it using local logic.'
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Your OpenAI API key is stored securely and never exposed to the client or browser console.'
    }
  ], [features]);

  return (
    <AdminPageWrapper
      title="AI Assistant Settings"
      subtitle="Configure your AI assistant preferences and capabilities"
      actions={headerActions}
      loading={false}
      error={error}
      errorTitle="Settings Error"
    >
      {/* Success Message */}
      {success && (
        <StatusMessage 
          type="success" 
          message={success} 
          onDismiss={clearMessages} 
        />
      )}

      {/* Voice Settings Section */}
      <SettingSection
        title="Voice Settings"
        description="Configure voice input and output capabilities"
        icon="🎤"
        actions={<ActionButtonGroup buttons={voiceTestButtons} />}
      >
        <SettingToggle
          id="voice-input"
          label="Voice Input"
          description="Allow speaking to the AI assistant using your microphone"
          checked={settings.voiceInputEnabled}
          onChange={(checked) => updateSetting('voiceInputEnabled', checked)}
          disabled={!features.voiceInput}
          icon="🎙️"
        />

        <SettingToggle
          id="voice-output"
          label="Voice Output"
          description="Hear AI responses spoken aloud through your speakers"
          checked={settings.voiceOutputEnabled}
          onChange={(checked) => updateSetting('voiceOutputEnabled', checked)}
          disabled={!features.voiceOutput}
          icon="🔊"
        />

        <SettingToggle
          id="auto-voice"
          label="Auto Voice Output"
          description="Automatically speak AI responses without clicking play"
          checked={settings.autoVoiceOutput}
          onChange={(checked) => updateSetting('autoVoiceOutput', checked)}
          disabled={!settings.voiceOutputEnabled || !features.voiceOutput}
          icon="🔄"
        />
      </SettingSection>

      {/* AI Enhancement Settings */}
      <SettingSection
        title="AI Enhancement"
        description="Advanced AI capabilities and integrations"
        icon="🤖"
        actions={
          settings.useOpenAI ? (
            <ActionButtonGroup 
              buttons={[{
                label: 'Test Connection',
                onClick: () => testRunner.run(openAITest),
                variant: 'outline' as const,
                icon: '🔗',
                disabled: !settings.openAIKey
              }]}
            />
          ) : undefined
        }
      >
        <SettingToggle
          id="use-openai"
          label="Enhanced AI (OpenAI)"
          description="Enable more sophisticated responses using OpenAI's language models"
          checked={settings.useOpenAI}
          onChange={(checked) => updateSetting('useOpenAI', checked)}
          icon="✨"
        />

        {settings.useOpenAI && (
          <SettingInput
            id="openai-key"
            label="OpenAI API Key"
            description="Your secret API key for accessing OpenAI services"
            type="password"
            value={settings.openAIKey}
            onChange={(value) => updateSetting('openAIKey', value)}
            placeholder="sk-..."
            icon="🔑"
            actions={
              <ActionButtonGroup 
                buttons={[{
                  label: 'Test',
                  onClick: () => testRunner.run(openAITest),
                  variant: 'outline' as const,
                  icon: '🧪',
                  disabled: !settings.openAIKey
                }]}
              />
            }
            helpText="Get your API key from"
            helpLink={{
              text: "OpenAI Platform",
              href: "https://platform.openai.com/api-keys"
            }}
          />
        )}
      </SettingSection>

      {/* Help & Compatibility */}
      <SettingSection
        title="Help & Compatibility"
        description="Browser support and troubleshooting information"
        icon="ℹ️"
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-md) 0'
        }}>
          {helpCards.map((card, index) => (
            <HelpCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </SettingSection>
    </AdminPageWrapper>
  );
}

export default function AIAssistantSettingsPage() {
  return (
    <ToastProvider>
      <AIAssistantSettingsContent />
    </ToastProvider>
  );
} 