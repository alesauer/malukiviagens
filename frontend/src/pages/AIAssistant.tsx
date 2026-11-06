import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Lightbulb, Compass, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  suggested_actions?: any[];
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Olá! Sou o Assistente Inteligente do Travel Manager. Posso ajudar você e sua família a planejar roteiros diários, pesquisar restaurantes, organizar bagagens e responder dúvidas sobre as viagens cadastradas.',
      sources: ['Base de Conhecimento Travel Manager']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Sugira um roteiro de 3 dias para Gramado em família',
    'Recomende restaurantes familiares com boa avaliação',
    'O que não pode faltar na mala para viagem de praia?',
    'Dicas para organizar despesas de viagem em grupo'
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: promptText };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await api.chatAI(promptText);
      const botMsg: Message = {
        sender: 'assistant',
        text: data.reply,
        sources: data.sources,
        suggested_actions: data.suggested_actions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Desculpe, ocorreu um erro ao consultar o assistente de inteligência artificial. Tente novamente em instantes.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assistente de Viagens IA
          </h1>
          <p className="text-xs text-slate-500">
            Inteligência integrada para planejamento de roteiros, orçamentos e informações turísticas (RF26)
          </p>
        </div>
      </div>

      {/* Quick Prompts Chips */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Messages Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Fontes: {m.sources.join(' • ')}</span>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span>O assistente está analisando sua solicitação...</span>
            </div>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite uma dúvida, peça um roteiro ou busque informações..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
