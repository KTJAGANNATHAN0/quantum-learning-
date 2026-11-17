import React, { useState, useEffect } from 'react';
import { CircuitDefinition, SimulationResult, AITutorResponse } from '../types/quantum';
import { api } from '../services/api';
import { sound } from '../services/audioEngine';
import { OpenRouterModal, FREE_MODELS } from './OpenRouterModal';
import { Bot, Send, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, Lightbulb, FileSearch, Key } from 'lucide-react';

interface AITutorPanelProps {
  circuit: CircuitDefinition;
  simulationResult: SimulationResult | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ circuit, simulationResult }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "RESEARCH DOSSIER: Circuit-Aware AI Quantum Research Assistant online. I am actively inspecting your register state, unitary operators, and Bloch coordinates. Select a diagnostic action, connect OpenRouter for live free models, or query specific mathematical properties below."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AITutorResponse['analysis'] | null>(null);

  // OpenRouter Modal & Key State
  const [isOpenRouterOpen, setIsOpenRouterOpen] = useState(false);
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [openRouterModel, setOpenRouterModel] = useState<string>(FREE_MODELS[0].id);
  const [modelDisplayName, setModelDisplayName] = useState<string>('Llama 3.3 70B');

  const refreshOpenRouterState = () => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('openrouter_api_key') || '';
      const mod = localStorage.getItem('openrouter_model') || FREE_MODELS[0].id;
      setOpenRouterKey(key);
      setOpenRouterModel(mod);
      const mObj = FREE_MODELS.find((m) => m.id === mod);
      setModelDisplayName(mObj ? mObj.name.replace(' (Free)', '') : 'Free Model');
    }
  };

  useEffect(() => {
    refreshOpenRouterState();
  }, []);

  const handleAction = async (action: string, promptText: string) => {
    sound.playTick();
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: promptText }]);

    try {
      const resp = await api.askAITutor(
        promptText,
        circuit,
        simulationResult || undefined,
        action,
        openRouterKey || undefined,
        openRouterModel
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: resp.reply }]);
      sound.playSuccessChime();
      if (resp.analysis) {
        setAnalysis(resp.analysis);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `DIAGNOSTIC NOTICE: Error connecting to AI Tutor service: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    handleAction('chat', msg);
  };

  return (
    <div className="outer-chassis" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--red-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                AI Quantum Tutor & Debugger
              </h3>
              <span className="doc-stamp">
                SYSTEM // AGENT-v2
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)' }}>
              Circuit-Aware Analytical & Diagnostic Engine
            </div>
          </div>
        </div>

        {/* Interactive OpenRouter AI Connect Trigger (formerly static CONTEXT LINKED badge) */}
        {openRouterKey ? (
          <button
            onClick={() => {
              sound.playTick();
              setIsOpenRouterOpen(true);
            }}
            className="doc-stamp"
            style={{
              cursor: 'pointer',
              padding: '4px 10px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--red-50)',
              color: 'var(--red-800)',
              borderColor: 'var(--red-border)'
            }}
            title="OpenRouter Live Free AI Connected. Click to configure models or key."
          >
            <span className="live-beacon" style={{ width: '7px', height: '7px' }} />
            AI ONLINE ({modelDisplayName})
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playTick();
              setIsOpenRouterOpen(true);
            }}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              color: 'var(--red-700)',
              background: 'var(--red-50)',
              borderColor: 'var(--red-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Click to connect OpenRouter for free live AI responses"
          >
            <Sparkles size={12} color="var(--red-600)" />
            CONNECT FREE AI (OPENROUTER)
          </button>
        )}
      </div>

      {/* Quick Action Diagnostic Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <button
          onClick={() => handleAction('explain_state', 'Explain the current state, superposition, and Bloch sphere vector.')}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '5px 12px' }}
        >
          <Lightbulb size={13} color="var(--red-600)" /> Explain State
        </button>

        <button
          onClick={() => handleAction('diagnose_error', 'Diagnose my circuit for bugs, disconnected qubits, or errors.')}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '5px 12px' }}
        >
          <AlertTriangle size={13} color="var(--red-600)" /> Diagnose Errors
        </button>

        <button
          onClick={() => handleAction('optimize', 'Suggest depth reduction, gate cancellations, or equivalent transforms.')}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '5px 12px' }}
        >
          <CheckCircle2 size={13} color="var(--red-600)" /> Optimize Circuit
        </button>

        <button
          onClick={() => handleAction('hint', 'Provide a pedagogical hint for algorithmic progression.')}
          disabled={loading}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '5px 12px' }}
        >
          <HelpCircle size={13} color="var(--red-600)" /> Algorithmic Hint
        </button>
      </div>

      {/* Messages Stream (Double-Bezel Inner Card) */}
      <div className="inner-bezel" style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px',
        marginBottom: '14px',
        minHeight: '260px',
        maxHeight: '420px',
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-bezel)'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%',
              background: msg.role === 'user' ? 'var(--red-50)' : '#FFFFFF',
              border: msg.role === 'user' ? '1px solid var(--red-border)' : '1px solid var(--border-chassis)',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.84rem',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              color: 'var(--ink-primary)'
            }}
          >
            <div style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: msg.role === 'user' ? 'var(--red-700)' : 'var(--ink-dim)',
              marginBottom: '4px',
              textTransform: 'uppercase'
            }}>
              {msg.role === 'user' ? 'Researcher Prompt' : 'AI Analysis Dossier'}
            </div>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: '#FFFFFF',
            border: '1px solid var(--red-border)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--red-700)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className="live-beacon" />
            Computing tensor state & evaluating circuit context...
          </div>
        )}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query algorithm state (e.g. 'Why is entanglement measure non-zero?', 'Derive Grover oracle step')..."
          style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid var(--border-chassis)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: 'var(--ink-primary)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '0 18px' }}
        >
          <Send size={15} fill="#FFFFFF" />
        </button>
      </form>

      {/* OpenRouter Free AI Connection Modal */}
      <OpenRouterModal
        isOpen={isOpenRouterOpen}
        onClose={() => setIsOpenRouterOpen(false)}
        onSaved={refreshOpenRouterState}
      />
    </div>
  );
};
