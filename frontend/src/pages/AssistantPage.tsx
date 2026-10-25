import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Bot,
  User,
  Globe,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { api } from '../services/api';
import { Conversation, Message, Language } from '../types';

export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, speak, stopSpeaking, isSpeaking, startVoiceInput, isListening } = useAccessibility();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // When active conversation changes, load messages
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      } else if (convs.length === 0) {
        // Create initial default conversation
        startNewConversation();
      }
    } catch (err: any) {
      console.warn('Could not load conversations:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const conv = await api.getConversation(convId);
      setMessages(conv.messages || []);
    } catch (err: any) {
      console.warn('Could not load messages:', err);
    }
  };

  const startNewConversation = async () => {
    try {
      const newConv = await api.createConversation('New Exploration');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err: any) {
      setErrorNotice('Failed to start a new chat. Please check connection.');
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        } else {
          startNewConversation();
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (!activeConvId) {
      await startNewConversation();
    }

    const convId = activeConvId!;
    setInputText('');
    setErrorNotice(null);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: convId,
      role: 'user',
      content: text,
      language,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const resMsg = await api.sendMessage(convId, text, language);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, resMsg]);

      // If text-to-speech enabled, read aloud
      speak(resMsg.content);
    } catch (err: any) {
      setErrorNotice('AI Assistant is momentarily unreachable. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVoiceInput = () => {
    const ok = startVoiceInput(
      (transcript) => {
        setInputText(transcript);
        handleSend(transcript);
      },
      (err) => {
        setErrorNotice(err);
      }
    );
    if (!ok) {
      setErrorNotice('Voice recognition is not available in this browser. Please type your query.');
    }
  };

  return (
    <DashboardLayout
      title="Multilingual AI Assistant"
      subtitle="Guiding you across education, career planning, and accessibility in English, Telugu, and Hindi."
    >
      <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-4">
        {/* Conversations Sidebar */}
        <div className="w-full lg:w-72 glass-panel p-4 rounded-3xl border-primary-border/40 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <button
              onClick={startNewConversation}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-electric-purple to-indigo-600 text-white font-bold text-xs shadow-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-primary-card/50 border border-primary-border/30 text-xs">
              <span className="text-content-muted flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-electric-cyan" />
                Response Language:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-primary-bg text-white border border-primary-border/50 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Conversation list */}
            <div className="space-y-1.5 max-h-[48vh] overflow-y-auto pr-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    activeConvId === c.id
                      ? 'bg-electric-purple/20 border border-electric-purple text-white font-semibold'
                      : 'text-content-secondary hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="truncate flex-1 mr-2">{c.title || 'Conversation'}</span>
                  <button
                    onClick={(e) => deleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-content-muted hover:text-status-error transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-electric-cyan/5 border border-electric-cyan/20 text-[11px] text-content-secondary">
            <span className="font-bold text-electric-cyan flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" />
              Inclusion Safeguard
            </span>
            ELEYSORA provides responsible educational and opportunity support. You can ask in your native language anytime!
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 glass-panel rounded-3xl border-primary-border/40 flex flex-col overflow-hidden">
          {/* Messages scroll pane */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-purple to-electric-cyan p-0.5 shadow-glow">
                  <div className="w-full h-full bg-primary-bg rounded-[14px] flex items-center justify-center">
                    <Bot className="w-8 h-8 text-electric-cyan" />
                  </div>
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-white">How can ELEYSORA assist you today?</h3>
                  <p className="text-xs text-content-secondary">
                    Ask questions regarding scholarships, career roadmaps, college applications, or difficult concepts in English, Telugu, or Hindi.
                  </p>
                </div>
                {/* Starter Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full text-left">
                  {[
                    'I want to become an AI engineer without paid courses.',
                    'నైపుణ్యాల రోడ్‌మ్యాప్ ఎలా ప్రారంభించాలి?',
                    'सरकारी छात्रवृत्ति और इंटर्नशिप के लिए क्या आवश्यक है?',
                    'Explain Machine Learning in simple words with an analogy.',
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSend(promptText)}
                      className="p-3 rounded-xl glass-panel border-primary-border/40 text-xs text-content-secondary hover:text-white hover:border-electric-cyan/50 text-left transition-all"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                        isUser
                          ? 'bg-electric-purple'
                          : 'bg-gradient-to-tr from-indigo-600 to-electric-cyan'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 max-w-[85%]">
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-electric-purple text-white rounded-tr-none'
                            : 'glass-panel border-primary-border/40 text-content-primary rounded-tl-none shadow-card'
                        }`}
                      >
                        {m.content}
                      </div>

                      {/* Message Actions */}
                      {!isUser && (
                        <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-content-muted">
                          <button
                            onClick={() => copyToClipboard(m.content, m.id)}
                            className="hover:text-white flex items-center gap-1 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3 h-3 text-status-success" />
                                <span className="text-status-success">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => speak(m.content)}
                            className="hover:text-white flex items-center gap-1 transition-colors"
                            title="Read aloud"
                          >
                            <Volume2 className="w-3 h-3 text-electric-cyan" />
                            <span>Listen</span>
                          </button>
                          <span className="opacity-50 text-[10px]">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* AI typing state */}
            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-electric-cyan flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl glass-panel border-primary-border/40 text-xs text-electric-cyan flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-electric-cyan animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-electric-cyan animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-electric-cyan animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>ELEYSORA AI is analyzing your query...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <div className="mx-4 mb-2 p-3 rounded-xl bg-status-error/10 border border-status-error/30 text-status-error text-xs flex items-center justify-between">
              <span>{errorNotice}</span>
              <button onClick={() => setErrorNotice(null)} className="font-bold underline text-xs">
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 glass-panel border-t border-primary-border/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-3 rounded-2xl border transition-all shrink-0 ${
                  isListening
                    ? 'bg-status-error text-white animate-pulse'
                    : 'glass-panel text-content-secondary hover:text-white hover:border-electric-cyan'
                }`}
                title={isListening ? 'Listening...' : 'Voice input (Speak now)'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'Telugu'
                    ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                    : language === 'Hindi'
                    ? 'अपना प्रश्न यहाँ लिखें...'
                    : 'Ask ELEYSORA anything regarding your education, career, or opportunities...'
                }
                className="flex-1 bg-primary-bg/80 border border-primary-border/50 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white placeholder-content-muted focus:outline-none focus:border-electric-cyan"
              />

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-cyan text-white shadow-glow disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
