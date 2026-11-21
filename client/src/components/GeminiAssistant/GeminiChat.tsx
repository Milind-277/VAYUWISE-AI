import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { AqiReading, FamilyProfileConsent, DailyFamilyActionPlan } from '../../types';
import { ActionPlanModal } from './ActionPlanModal';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Info 
} from 'lucide-react';

interface Props {
  aqiData: AqiReading;
  consent: FamilyProfileConsent;
  onOpenConsentModal: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  isAiGenerated?: boolean;
  modelUsed?: string;
}

export const GeminiChat: React.FC<Props> = ({
  aqiData,
  consent,
  onOpenConsentModal
}) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! I am **VAYUWISE AI**, your family's clean-air companion. I am grounded in real-time air quality metrics for **${aqiData.city}** (AQI: ${aqiData.aqi}, ${aqiData.category}). How can I assist your family today with daily routines, indoor filtration, or commute safety?`,
      isAiGenerated: true,
      modelUsed: 'VayuWise Companion'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Action plan modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [actionPlan, setActionPlan] = useState<DailyFamilyActionPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(updatedMessages);
    setSending(true);

    try {
      const historyPayload = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await ApiService.chatWithGemini(
        userText,
        historyPayload,
        aqiData,
        consent,
        language
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: res.response,
          isAiGenerated: res.isAiGenerated,
          modelUsed: res.modelUsed
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'I apologize, but I encountered a communication error with the backend intelligence service. Please check your network connection or backend server status.',
          isAiGenerated: false
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleGeneratePlan = async () => {
    setPlanModalOpen(true);
    setGeneratingPlan(true);
    try {
      const plan = await ApiService.generateActionPlan(aqiData, consent, language);
      setActionPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-transparent border border-purple-200 dark:border-purple-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white uppercase tracking-wider">
                Module 6
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Official Google @google/genai SDK
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Gemini AI Clean-Air Assistant
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              Context-aware, grounded AI assistant answering questions about smog mitigation, mask certifications, and diurnal routine safety.
            </p>
          </div>

          <button
            data-testid="generate-plan-btn"
            onClick={handleGeneratePlan}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Family Action Plan</span>
          </button>
        </div>

        {/* Consent Info Bar */}
        <div className="mt-4 pt-4 border-t border-purple-200/60 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <ShieldCheck className={`w-4 h-4 ${consent.consentGranted ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>
              {consent.consentGranted 
                ? 'Profile Consent Active: Optional family vulnerability flags included in context.' 
                : 'Privacy Shield Active: No direct identifiers are transmitted. Optional sensitive family profile flags are shared with Gemini only after explicit consent.'}
            </span>
          </div>

          <button
            onClick={onOpenConsentModal}
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline self-start sm:self-auto"
          >
            Manage Consent & Profile
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col h-[520px] overflow-hidden shadow-sm">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' 
                    : 'bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-sm'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm font-medium leading-relaxed ${
                  isUser 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80'
                }`}>
                  <div className="whitespace-pre-line">
                    {msg.content}
                  </div>

                  {!isUser && msg.modelUsed && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Engine: {msg.modelUsed}</span>
                      <span className="text-emerald-500">Grounded Context</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <Bot className="w-4 h-4 animate-spin text-brand-500" />
              <span>Gemini is generating verified response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50">
          {[
            'Is it safe for children to play outside this evening?',
            'What CADR purifier do I need for my bedroom?',
            'Why are ozone air cleaners dangerous?',
            'When is the cleanest time for home ventilation?'
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => setInputMessage(prompt)}
              className="text-[11px] font-medium px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-500 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            data-testid="chat-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.askGemini}
            disabled={sending}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            data-testid="chat-submit-btn"
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>{t.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

      {/* Action Plan Modal */}
      <ActionPlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        plan={actionPlan}
        loading={generatingPlan}
      />

    </div>
  );
};
