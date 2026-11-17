import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { sound } from '../services/audioEngine';
import { DiagnosticResult } from '../types/quantum';
import { Sparkles, CheckCircle2, X, ShieldCheck, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: string) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onSelectTrack
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDiagnosticQuiz().then((q) => setQuestions(q)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptionSelect = (qId: string, optIdx: number) => {
    sound.playTick();
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    sound.playSimulationSweep();
    setLoading(true);
    try {
      const res = await api.submitDiagnostic(answers);
      setResult(res);
      sound.playSuccessChime();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="outer-chassis" style={{
        maxWidth: '620px',
        width: '100%',
        padding: '28px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-hud)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--red-600)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink-primary)' }}>
              Diagnostic Competency Evaluation
            </h2>
            <span className="doc-stamp">
              EVAL // PRE-FLIGHT
            </span>
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

        {!result ? (
          <div>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Answer these baseline quantum mechanics & linear algebra questions to calibrate your personalized curriculum track.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {questions.map((q, idx) => (
                <div key={q.id} className="inner-bezel" style={{ padding: '16px', background: '#FFFFFF', border: '1px solid var(--border-bezel)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px', color: 'var(--ink-primary)' }}>
                    {idx + 1}. {q.question}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(q.id, optIdx)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--red-50)' : '#FFFFFF',
                            border: isSelected ? '1.5px solid var(--red-600)' : '1px solid var(--border-chassis)',
                            color: isSelected ? 'var(--red-800)' : 'var(--ink-primary)',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={onClose} className="btn-secondary">Dismiss</button>
              <button
                onClick={handleSubmit}
                disabled={loading || Object.keys(answers).length < questions.length}
                className="btn-primary"
              >
                {loading ? 'Evaluating Competency...' : 'Submit Diagnostic'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '50%',
              background: 'var(--red-50)',
              color: 'var(--red-600)',
              border: '1px solid var(--red-border)',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink-primary)' }}>Diagnostic Assessment Complete</h3>
            <div style={{ fontSize: '1.05rem', marginTop: '8px', color: 'var(--ink-muted)' }}>
              Recommended Track: <strong style={{ color: 'var(--red-700)' }}>{result.recommended_level} Track</strong>
            </div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', marginTop: '4px' }}>
              CALIBRATED SCORE: {result.score} / {result.total} PROVED CORRECT
            </div>

            <div className="inner-bezel" style={{ margin: '20px 0', padding: '16px', textAlign: 'left', background: '#FFFFFF', border: '1px solid var(--border-bezel)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--red-700)', marginBottom: '6px' }}>
                DEMONSTRATED COMPETENCIES:
              </div>
              <ul style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', paddingLeft: '18px', lineHeight: 1.6 }}>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                sound.playTick();
                onSelectTrack(result.recommended_level);
                onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              Confirm & Calibrate to {result.recommended_level} Path
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
