import { useMemo } from 'react';

export interface BrowserFeatures {
  voiceInput: boolean;
  voiceOutput: boolean;
  webgl: boolean;
  webrtc: boolean;
  clipboard: boolean;
  notifications: boolean;
}

export interface FeatureTest {
  name: string;
  test: () => boolean | Promise<boolean>;
  successMessage: string;
  errorMessage: string;
  action?: () => void | Promise<void>;
}

export function useBrowserFeatures() {
  const features = useMemo<BrowserFeatures>(() => ({
    voiceInput: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    voiceOutput: 'speechSynthesis' in window,
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    webrtc: 'RTCPeerConnection' in window,
    clipboard: 'navigator' in window && 'clipboard' in navigator,
    notifications: 'Notification' in window
  }), []);

  const createFeatureTest = (
    feature: keyof BrowserFeatures,
    action?: () => void | Promise<void>
  ): FeatureTest => {
    const testConfigs = {
      voiceInput: {
        name: 'Voice Input',
        successMessage: 'Voice input is supported in your browser!',
        errorMessage: 'Voice input is not supported in your browser.',
        action: action
      },
      voiceOutput: {
        name: 'Voice Output',
        successMessage: 'Voice output is working correctly!',
        errorMessage: 'Voice output is not supported in your browser.',
        action: action || (() => {
          const utterance = new SpeechSynthesisUtterance('Voice output is working correctly!');
          window.speechSynthesis.speak(utterance);
        })
      },
      webgl: {
        name: 'WebGL',
        successMessage: 'WebGL is supported in your browser!',
        errorMessage: 'WebGL is not supported in your browser.',
        action: action
      },
      webrtc: {
        name: 'WebRTC',
        successMessage: 'WebRTC is supported in your browser!',
        errorMessage: 'WebRTC is not supported in your browser.',
        action: action
      },
      clipboard: {
        name: 'Clipboard',
        successMessage: 'Clipboard access is supported!',
        errorMessage: 'Clipboard access is not supported.',
        action: action
      },
      notifications: {
        name: 'Notifications',
        successMessage: 'Notifications are supported!',
        errorMessage: 'Notifications are not supported.',
        action: action
      }
    };

    const config = testConfigs[feature];
    
    return {
      name: config.name,
      test: () => features[feature],
      successMessage: config.successMessage,
      errorMessage: config.errorMessage,
      action: config.action
    };
  };

  const createAPITest = (
    name: string,
    testFunction: () => Promise<boolean>,
    successMessage: string,
    errorMessage: string,
    action?: () => void | Promise<void>
  ): FeatureTest => ({
    name,
    test: testFunction,
    successMessage,
    errorMessage,
    action
  });

  return {
    features,
    createFeatureTest,
    createAPITest,
    isSupported: (feature: keyof BrowserFeatures) => features[feature]
  };
} 