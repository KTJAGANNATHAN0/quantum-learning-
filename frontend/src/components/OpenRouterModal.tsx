import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audioEngine';
import { Sparkles, CheckCircle2, AlertCircle, X, Key, ExternalLink, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (modelName: string) => void;
}

export const FREE_MODELS = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B (Free)',
    provider: 'Meta',
    desc: 'Recommended: State-of-the-art open weights with deep physics and mathematical reasoning.',
    speed: 'High',
    cost: '$0.00 / Free'
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    desc: 'Deep reasoning model specialized in formal proofs, step-by-step logic, and math.',
    speed: 'Medium',
    cost: '$0.00 / Free'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash (Free)',
    provider: 'Google',
    desc: 'Ultra-fast low latency model with multimodal context understanding.',
    speed: 'Ultra Fast',
    cost: '$0.00 / Free'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B (Free)',
    provider: 'Alibaba',
    desc: 'Strong algorithmic coding and circuit translation capabilities.',
    speed: 'High',
    cost: '$0.00 / Free'
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 24B (Free)',
    provider: 'Mistral',
    desc: 'Efficient European model with high instruction precision.',
    speed: 'Very Fast',
    cost: '$0.00 / Free'
  }
];

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0].id);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; reply?: string; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('openrouter_api_key') || '';
      const savedModel = localStorage.getItem('openrouter_model') || FREE_MODELS[0].id;
      setApiKey(savedKey);
      setSelectedModel(savedModel);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    sound.playSimulationSweep();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testOpenRouterConnection(apiKey, selectedModel);
      setTestResult(res);
      if (res.success) {
        sound.playSuccessChime();
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    sound.playTick();
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('openrouter_api_key', apiKey.trim());
        localStorage.setItem('openrouter_model', selectedModel);
        sound.playSuccessChime();
      } else {
        localStorage.removeItem('openrouter_api_key');
      }
    }
    const modelObj = FREE_MODELS.find((m) => m.id === selectedModel);
    if (onSaved) {
      onSaved(modelObj ? modelObj.name : selectedModel);
    }
    onClose();
  };

  const handleDisconnect = () => {
    sound.playTick();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openrouter_api_key');
    }
    setApiKey('');
    setTestResult(null);
    if (onSaved) {
      onSaved('');
    }
  };

  const isConnected = !!apiKey.trim();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="outer-chassis" style={{
        maxWidth: '640px',
        width: '100%',
        padding: '28px',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-hud)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--red-50)',
              border: '1px solid var(--red-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red-700)'
            }}>
              <Key size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
                  Connect Live Free AI Tutor
                </h2>
                <span className="doc-stamp">
                  OPENROUTER // $0 COST
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)' }}>
                Powered by OpenRouter Community Free-Tier LLM Architecture
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTick();
              onClose();
            }}
            style={{ background: 'none', border: 'none', color: 'var(--ink-dim)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="inner-bezel" style={{
          background: 'var(--red-50)',
          border: '1px solid var(--red-border)',
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--red-800)', fontSize: '0.84rem' }}>
            <Sparkles size={14} color="var(--red-600)" />
            How to use 100% Free AI with Zero Credit Card:
          </div>
          <ol style={{
            fontSize: '0.82rem',
            color: 'var(--ink-secondary)',
            paddingLeft: '20px',
            lineHeight: 1.55,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <li>
              Go to OpenRouter's Key Portal (free signup):{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--red-700)', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                openrouter.ai/keys <ExternalLink size={12} />
              </a>
            </li>
            <li>Click <strong>"Create Key"</strong> and copy your key (e.g. <code>sk-or-v1-...</code>).</li>
            <li>Paste it below. Choose any free model tagged <strong>(Free)</strong> to run at <strong>$0 cost forever</strong>.</li>
          </ol>
        </div>

        {/* Model Selection */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            1. Select Free Model
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {FREE_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    sound.playTick();
                    setSelectedModel(m.id);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--red-50)' : '#FFFFFF',
                    border: isSelected ? '1.5px solid var(--red-600)' : '1px solid var(--border-chassis)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: isSelected ? 'var(--red-800)' : 'var(--ink-primary)' }}>
                        {m.name}
                      </span>
                      <span className="doc-stamp" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                        {m.cost}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--ink-dim)', marginTop: '2px' }}>
                      {m.desc}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--red-700)' : 'var(--ink-subtle)', fontWeight: 600 }}>
                    {m.speed}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            2. OpenRouter API Key
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your key here: sk-or-v1-..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-chassis)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                color: 'var(--ink-primary)',
                background: '#FFFFFF',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)'
              }}
            />
            <button
              onClick={handleTestConnection}
              disabled={testing || !apiKey.trim()}
              className="btn-secondary"
              style={{ padding: '0 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              {testing ? <RefreshCw size={14} className="pulse-animation" /> : <ShieldCheck size={14} />}
              {testing ? 'Testing...' : 'Test Ping'}
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--ink-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Stored locally in your browser session. Never sent to third parties.
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: testResult.success ? '#DCFCE7' : 'var(--red-50)',
            border: `1px solid ${testResult.success ? '#86EFAC' : 'var(--red-border)'}`,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            {testResult.success ? (
              <CheckCircle2 size={16} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} color="var(--red-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: testResult.success ? '#15803D' : 'var(--red-700)' }}>
                {testResult.success ? 'Connection Verified & Model Ready!' : 'Connection Check Failed'}
              </div>
              <div style={{ color: 'var(--ink-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                {testResult.reply || testResult.error}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="btn-secondary"
              style={{ color: 'var(--red-700)', borderColor: 'var(--red-border)', fontSize: '0.78rem' }}
            >
              Disconnect Key
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                sound.playTick();
                onClose();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              Save & Activate AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
