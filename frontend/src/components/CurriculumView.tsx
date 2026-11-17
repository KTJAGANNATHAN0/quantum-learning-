import React, { useState } from 'react';
import { ModuleContent, CircuitDefinition } from '../types/quantum';
import { api } from '../services/api';
import { sound } from '../services/audioEngine';
import confetti from 'canvas-confetti';
import { BookOpen, CheckCircle, ArrowRight, Play, Award, HelpCircle, Network, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface CurriculumViewProps {
  modules: ModuleContent[];
  onLoadPresetToStudio: (circuit: CircuitDefinition) => void;
  onOpenAdvantageMap?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  modules,
  onLoadPresetToStudio,
  onOpenAdvantageMap
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || 'mod-1');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [challengeResult, setChallengeResult] = useState<any | null>(null);
  const [evaluatingChallenge, setEvaluatingChallenge] = useState(false);

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];
  const tracks = ['All', 'Foundations', 'Query Algorithms', 'Advanced Algorithms', 'QML & Fault-Tolerance'];

  const filteredModules = selectedTrack === 'All'
    ? modules
    : modules.filter((m) => m.track?.toLowerCase() === selectedTrack.toLowerCase());

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    sound.playTick();
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleCheckQuiz = (qId: string) => {
    sound.playTick();
    setQuizSubmitted((prev) => ({ ...prev, [qId]: true }));
    const q = activeModule?.quiz.find((x) => x.id === qId);
    if (q && quizAnswers[qId] === q.correct_option_index) {
      sound.playSuccessChime();
    }
  };

  const handleRunChallenge = async () => {
    if (!activeModule?.challenge) return;
    sound.playSimulationSweep();
    setEvaluatingChallenge(true);
    setChallengeResult(null);

    try {
      const res = await api.submitChallenge(
        activeModule.challenge.id,
        activeModule.preset_circuit
      );
      setChallengeResult(res);
      if (res.passed) {
        sound.playSuccessChime();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      setChallengeResult({ passed: false, feedback: err.message });
    } finally {
      setEvaluatingChallenge(false);
    }
  };

  if (!activeModule) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
      {/* Sidebar: Track Filter & Module Dossiers */}
      <div className="outer-chassis" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--red-600)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Curriculum Archive
            </h3>
          </div>
          <span className="doc-stamp" style={{ fontSize: '0.64rem' }}>
            {modules.length} MODULES
          </span>
        </div>

        {onOpenAdvantageMap && (
          <button
            onClick={() => {
              sound.playTick();
              onOpenAdvantageMap();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--red-50)',
              border: '1px solid var(--red-border)',
              color: 'var(--red-700)',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'var(--font-hud)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Network size={14} /> Quantum Advantage Constellation
          </button>
        )}

        {/* Track Filter Pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {tracks.map((t) => (
            <button
              key={t}
              onClick={() => {
                sound.playTick();
                setSelectedTrack(t);
              }}
              style={{
                background: selectedTrack === t ? 'var(--red-600)' : '#FFFFFF',
                color: selectedTrack === t ? '#FFFFFF' : 'var(--ink-muted)',
                border: `1px solid ${selectedTrack === t ? 'var(--red-700)' : 'var(--border-chassis)'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable list of modules (Double-Bezel Inner Card) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '680px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredModules.map((m) => {
            const isSelected = m.id === selectedModuleId;
            const badgeClass =
              m.level === 'Beginner'
                ? 'badge-beginner'
                : m.level === 'Intermediate'
                ? 'badge-intermediate'
                : 'badge-advanced';

            return (
              <div
                key={m.id}
                onClick={() => {
                  sound.playTick();
                  setSelectedModuleId(m.id);
                  setChallengeResult(null);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--red-50)' : '#FFFFFF',
                  border: isSelected ? '1.5px solid var(--red-600)' : '1px solid var(--border-chassis)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 2px 8px rgba(220, 38, 38, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className={`badge ${badgeClass}`}>{m.level}</span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--red-700)', fontWeight: 700 }}>
                    {m.track}
                  </span>
                </div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: isSelected ? 'var(--red-800)' : 'var(--ink-primary)',
                  lineHeight: 1.3
                }}>
                  {m.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Module Header & Action (Double-Bezel Chassis) */}
        <div className="outer-chassis" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span className={`badge ${
                activeModule.level === 'Beginner' ? 'badge-beginner' : activeModule.level === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
              }`} style={{ marginBottom: '8px' }}>
                {activeModule.level} Track // {activeModule.track}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 8px 0', color: 'var(--ink-primary)' }}>
                {activeModule.title}
              </h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.92rem', maxWidth: '700px', lineHeight: 1.6 }}>
                {activeModule.summary}
              </p>
            </div>

            <button
              onClick={() => {
                sound.playTick();
                onLoadPresetToStudio(activeModule.preset_circuit);
              }}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <Play size={15} fill="#FFFFFF" /> Open Schematic in Studio
            </button>
          </div>
        </div>

        {/* Technical Theory Documentation Paper */}
        <div className="outer-chassis" style={{
          padding: '28px',
          lineHeight: 1.75,
          fontSize: '0.94rem',
          color: 'var(--ink-primary)',
          background: '#FFFFFF'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-chassis)'
          }}>
            <FileText size={18} color="var(--red-600)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
              MATHEMATICAL SPECIFICATION & THEORETICAL PROOFS
            </span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
            {activeModule.theory_markdown}
          </div>
        </div>

        {/* Check-Your-Understanding Quizzes */}
        {activeModule.quiz && activeModule.quiz.length > 0 && (
          <div className="outer-chassis" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-primary)' }}>
              <HelpCircle size={20} color="var(--red-600)" />
              Formative Verification Quizzes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {activeModule.quiz.map((q, idx) => {
                const userAns = quizAnswers[q.id];
                const isSubmitted = quizSubmitted[q.id];
                const isCorrect = userAns === q.correct_option_index;

                return (
                  <div key={q.id} className="inner-bezel" style={{ padding: '16px', background: '#FFFFFF', border: '1px solid var(--border-bezel)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px', color: 'var(--ink-primary)' }}>
                      {idx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userAns === optIdx;
                        let optBg = isChosen ? 'var(--red-50)' : '#FFFFFF';
                        let optBorder = isChosen ? '1.5px solid var(--red-600)' : '1px solid var(--border-chassis)';

                        if (isSubmitted) {
                          if (optIdx === q.correct_option_index) {
                            optBg = '#DCFCE7';
                            optBorder = '1.5px solid #15803D';
                          } else if (isChosen && !isCorrect) {
                            optBg = 'var(--red-100)';
                            optBorder = '1.5px solid var(--red-700)';
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => !isSubmitted && handleSelectAnswer(q.id, optIdx)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '6px',
                              background: optBg,
                              border: optBorder,
                              cursor: isSubmitted ? 'default' : 'pointer',
                              fontSize: '0.84rem',
                              fontFamily: 'var(--font-body)',
                              color: 'var(--ink-primary)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    {!isSubmitted ? (
                      <button
                        onClick={() => handleCheckQuiz(q.id)}
                        disabled={userAns === undefined}
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                      >
                        Verify Response
                      </button>
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: isCorrect ? '#DCFCE7' : 'var(--red-50)',
                        border: isCorrect ? '1px solid #86EFAC' : '1px solid var(--red-border)',
                        fontSize: '0.84rem'
                      }}>
                        <div style={{ fontWeight: 700, color: isCorrect ? '#15803D' : 'var(--red-700)', marginBottom: '4px' }}>
                          {isCorrect ? '✓ Verification Successful' : '✗ Verification Failed'}
                        </div>
                        <div style={{ color: 'var(--ink-secondary)' }}>{q.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hands-On Coding Challenge & Auto-Grader */}
        {activeModule.challenge && (
          <div className="outer-chassis" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink-primary)' }}>
                <Award size={20} color="var(--red-600)" />
                Algorithmic Lab Practicum: {activeModule.challenge.title}
              </h3>
              <span className="doc-stamp">
                AUTO-GRADED LAB
              </span>
            </div>

            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.5 }}>
              {activeModule.challenge.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--red-700)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                LAB GUIDANCE HINTS:
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.84rem', color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                {activeModule.challenge.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRunChallenge}
                disabled={evaluatingChallenge}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                {evaluatingChallenge ? 'Evaluating Unitary Matrix...' : 'Run Auto-Grader Verification'}
              </button>
              <button
                onClick={() => {
                  sound.playTick();
                  onLoadPresetToStudio(activeModule.challenge?.starter_circuit || activeModule.preset_circuit);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.84rem' }}
              >
                Load Challenge Canvas
              </button>
            </div>

            {challengeResult && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '8px',
                background: challengeResult.passed ? '#DCFCE7' : 'var(--red-50)',
                border: challengeResult.passed ? '1px solid #86EFAC' : '1px solid var(--red-border)',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 700, color: challengeResult.passed ? '#15803D' : 'var(--red-700)' }}>
                  {challengeResult.passed ? '✓ Practicum Criteria Met (Grade: 100/100)' : 'Criteria Not Met'}
                </div>
                <div style={{ color: 'var(--ink-primary)', marginTop: '4px' }}>
                  {challengeResult.feedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
