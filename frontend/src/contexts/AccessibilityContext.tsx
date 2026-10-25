import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, AccessibilityPreferences } from '../types';
import { api } from '../services/api';

interface AccessibilityContextType {
  language: Language;
  fontScale: number;
  highContrast: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  simplifiedMode: boolean;
  setLanguage: (lang: Language) => void;
  setFontScale: (scale: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setTextToSpeech: (enabled: boolean) => void;
  setSimplifiedMode: (enabled: boolean) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  startVoiceInput: (onTranscript: (text: string) => void, onError?: (err: string) => void) => boolean;
  isListening: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('eleysora_lang') as Language) || 'English'
  );
  const [fontScale, setFontScaleState] = useState<number>(
    parseFloat(localStorage.getItem('eleysora_font_scale') || '1.0')
  );
  const [highContrast, setHighContrastState] = useState<boolean>(
    localStorage.getItem('eleysora_high_contrast') === 'true'
  );
  const [reducedMotion, setReducedMotionState] = useState<boolean>(
    localStorage.getItem('eleysora_reduced_motion') === 'true'
  );
  const [textToSpeech, setTextToSpeechState] = useState<boolean>(
    localStorage.getItem('eleysora_tts') === 'true'
  );
  const [simplifiedMode, setSimplifiedModeState] = useState<boolean>(
    localStorage.getItem('eleysora_simplified_mode') === 'true'
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Apply visual accessibility attributes to document root
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());

    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }

    if (simplifiedMode) {
      document.body.classList.add('simplified-mode');
    } else {
      document.body.classList.remove('simplified-mode');
    }
  }, [fontScale, highContrast, reducedMotion, simplifiedMode]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('eleysora_lang', lang);
  };

  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
    localStorage.setItem('eleysora_font_scale', scale.toString());
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('eleysora_high_contrast', enabled.toString());
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    localStorage.setItem('eleysora_reduced_motion', enabled.toString());
  };

  const setTextToSpeech = (enabled: boolean) => {
    setTextToSpeechState(enabled);
    localStorage.setItem('eleysora_tts', enabled.toString());
  };

  const setSimplifiedMode = (enabled: boolean) => {
    setSimplifiedModeState(enabled);
    localStorage.setItem('eleysora_simplified_mode', enabled.toString());
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    if (language === 'Hindi') utterance.lang = 'hi-IN';
    else if (language === 'Telugu') utterance.lang = 'te-IN';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = (
    onTranscript: (text: string) => void,
    onError?: (err: string) => void
  ): boolean => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech Recognition is not supported in this browser. Please type your message.');
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      if (language === 'Hindi') recognition.lang = 'hi-IN';
      else if (language === 'Telugu') recognition.lang = 'te-IN';
      else recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (onError) onError(event.error || 'Speech recognition failed');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      return true;
    } catch (err: any) {
      setIsListening(false);
      if (onError) onError(err.message || 'Microphone access failed');
      return false;
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        fontScale,
        highContrast,
        reducedMotion,
        textToSpeech,
        simplifiedMode,
        setLanguage,
        setFontScale,
        setHighContrast,
        setReducedMotion,
        setTextToSpeech,
        setSimplifiedMode,
        speak,
        stopSpeaking,
        isSpeaking,
        startVoiceInput,
        isListening,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
