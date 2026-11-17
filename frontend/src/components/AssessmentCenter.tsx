import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ExamQuestion, CertificateData, ModuleContent, CircuitDefinition, GateOperation } from '../types/quantum';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Clock, ShieldCheck, Play, Printer, AlertTriangle, FileCheck, Sparkles, Cpu, RotateCcw } from 'lucide-react';

interface AssessmentCenterProps {
  modules: ModuleContent[];
  onLoadChallengeToStudio: (circuit: CircuitDefinition) => void;
}

const DEFAULT_CHALLENGES = [
  {
    id: 'ch-1',
    title: 'Synthesize the |−⟩ Superposition State',
    description: 'Apply Pauli-X and Hadamard gates to prepare the state |−⟩ = (|0⟩ − |1⟩)/√2 with a π relative phase.',
    hints: ['Start from |0⟩, flip to |1⟩ with an X gate, then apply H.', 'The amplitude of |1⟩ must be negative.'],
    starter_circuit: {
      num_qubits: 1,
      gates: [
        { gate: 'X', targets: [0], controls: [], step: 0 },
        { gate: 'H', targets: [0], controls: [], step: 1 }
      ],
      name: 'Challenge: |−⟩ State',
      shots: 1024
    }
  },
  {
    id: 'ch-3',
    title: 'Entangle Two Qubits into |Ψ+⟩ Bell State',
    description: 'Construct the maximally entangled Bell state (|01⟩ + |10⟩)/√2. States |00⟩ and |11⟩ must have 0% measurement probability.',
    hints: ['Apply Pauli-X on qubit 1 to flip it to |1⟩.', 'Apply Hadamard on qubit 0, then a CNOT from qubit 0 to qubit 1.'],
    starter_circuit: {
      num_qubits: 2,
      gates: [
        { gate: 'X', targets: [1], controls: [], step: 0 },
        { gate: 'H', targets: [0], controls: [], step: 1 },
        { gate: 'CX', targets: [1], controls: [0], step: 2 }
      ],
      name: 'Challenge: |Ψ+⟩ Bell State',
      shots: 1024
    }
  },
  {
    id: 'ch-5',
    title: 'Bernstein-Vazirani Secret Bitstring Finder',
    description: 'Design the phase-kickback oracle to discover a hidden secret string s="10" in a single query.',
    hints: ['Place the ancilla qubit into |−⟩ using X and H gates.', 'Connect CNOT controls only where secret bits are 1.'],
    starter_circuit: {
      num_qubits: 3,
      gates: [
        { gate: 'X', targets: [2], controls: [], step: 0 },
        { gate: 'H', targets: [0], controls: [], step: 1 },
        { gate: 'H', targets: [1], controls: [], step: 1 },
        { gate: 'H', targets: [2], controls: [], step: 1 },
        { gate: 'CX', targets: [2], controls: [1], step: 2 },
        { gate: 'H', targets: [0], controls: [], step: 3 },
        { gate: 'H', targets: [1], controls: [], step: 3 }
      ],
      name: 'Challenge: Bernstein-Vazirani',
      shots: 1024
    }
  },
  {
    id: 'ch-11',
    title: 'VQE Parameterized Entangled Ansatz',
    description: 'Synthesize a variational ansatz with parameterized Ry/Rz rotations and entangling CNOT gates.',
    hints: ['Parameterized single-qubit rotations explore the Hilbert space.', 'CNOT gates generate necessary bipartite entanglement.'],
    starter_circuit: {
      num_qubits: 2,
      gates: [
        { gate: 'RY', targets: [0], controls: [], step: 0, params: [1.57] },
        { gate: 'RY', targets: [1], controls: [], step: 0, params: [0.78] },
        { gate: 'CX', targets: [1], controls: [0], step: 1 },
        { gate: 'RZ', targets: [0], controls: [], step: 2, params: [0.5] }
      ],
      name: 'Challenge: VQE Ansatz',
      shots: 1024
    }
  }
];

export const AssessmentCenter: React.FC<AssessmentCenterProps> = ({
  modules,
  onLoadChallengeToStudio
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'exam' | 'certificate'>('challenges');

  // Filter out any modules where challenge is null or undefined
  const extractedChallenges = (modules || [])
    .filter((m) => Boolean(m && m.challenge))
    .map((m) => ({
      id: m.challenge!.id,
      title: m.challenge!.title,
      description: m.challenge!.description,
      hints: m.challenge!.hints || [],
      starter_circuit: m.challenge!.starter_circuit || m.preset_circuit
    }));

  const allChallenges = extractedChallenges.length > 0 ? extractedChallenges : DEFAULT_CHALLENGES;

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(allChallenges[0]?.id || 'ch-1');
  const activeChallenge = allChallenges.find((c) => c.id === selectedChallengeId) || allChallenges[0];

  // Embedded challenge circuit state
  const [currentCircuit, setCurrentCircuit] = useState<CircuitDefinition>(activeChallenge.starter_circuit);
  const [evaluating, setEvaluating] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any | null>(null);

  // Update circuit when challenge changes
  useEffect(() => {
    if (activeChallenge) {
      setCurrentCircuit(activeChallenge.starter_circuit);
      setChallengeResult(null);
    }
  }, [selectedChallengeId]);

  // Exam State
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const [studentName, setStudentName] = useState('Alex Vance');
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);

  // Active Certificate
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  useEffect(() => {
    api.getCertificationExam().then((q) => setExamQuestions(q)).catch(console.error);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, timeLeft]);

  const handleRunChallenge = async () => {
    if (!activeChallenge) return;
    setEvaluating(true);
    setChallengeResult(null);

    try {
      const res = await api.submitChallenge(activeChallenge.id, currentCircuit);
      setChallengeResult(res);
      if (res.passed) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setChallengeResult({ passed: false, feedback: err.message || 'Evaluation error' });
    } finally {
      setEvaluating(false);
    }
  };

  const handleStartExam = () => {
    if (!studentName.trim()) {
      alert('Please enter your full name for the certification credential.');
      return;
    }
    setExamStarted(true);
    setTimeLeft(900);
    setExamAnswers({});
    setExamSubmitted(false);
  };

  const handleSubmitExam = async () => {
    setExamSubmitted(true);
    try {
      const res = await api.submitCertificationExam(studentName, examAnswers);
      setExamResult(res);
      if (res.passed && res.certificate) {
        setCertificate(res.certificate);
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Quick gate insertion helper for challenge workbench
  const addGateToChallenge = (gate: string, qubit: number) => {
    const nextStep = currentCircuit.gates.length;
    const newGate: GateOperation = {
      gate,
      targets: [qubit],
      controls: gate === 'CX' ? [qubit === 0 ? 1 : 0] : [],
      params: ['RY', 'RZ', 'RX'].includes(gate) ? [Math.PI / 2] : [],
      step: nextStep
    };
    setCurrentCircuit({
      ...currentCircuit,
      gates: [...currentCircuit.gates, newGate]
    });
  };

  const clearChallengeCircuit = () => {
    setCurrentCircuit({
      ...currentCircuit,
      gates: []
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner & Navigation Tabs */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-advanced" style={{ marginBottom: '8px' }}>Assessment Center</span>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '6px 0 4px 0' }}>
              Quantum Mastery & Credentialing
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Validate your quantum circuit engineering competency through interactive coding challenges and earn verifiable digital credentials.
            </p>
          </div>

          {/* Navigation Pill Buttons */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setActiveTab('challenges')}
              className={activeTab === 'challenges' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Award size={16} /> Challenge Lab ({allChallenges.length})
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={activeTab === 'exam' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <FileCheck size={16} /> Timed Certification Exam
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={activeTab === 'certificate' ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderColor: certificate ? '#fbbf24' : 'var(--border-glass)',
                color: certificate ? '#fbbf24' : 'var(--text-muted)'
              }}
            >
              <ShieldCheck size={16} /> {certificate ? 'Verified Certificate' : 'Certificate Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CODING CHALLENGE ARENA */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Challenge Selector List */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-cyan)' }}>
              <Award size={18} />
              Challenge Directory
            </h3>

            {allChallenges.map((ch, idx) => {
              const isSelected = ch.id === selectedChallengeId;
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    setSelectedChallengeId(ch.id);
                    setChallengeResult(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid var(--primary-cyan)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-violet)', fontWeight: 600, marginBottom: '2px' }}>
                    Challenge #{idx + 1}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#00f0ff' : 'var(--text-main)' }}>
                    {ch.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Challenge Details & Interactive Workbench */}
          {activeChallenge && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="badge badge-intermediate" style={{ marginBottom: '6px' }}>Interactive Coding Challenge</span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0' }}>
                    {activeChallenge.title}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.5 }}>
                    {activeChallenge.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onLoadChallengeToStudio(currentCircuit)}
                    className="btn-secondary"
                    title="Transfer this circuit into full Studio"
                  >
                    <Play size={14} /> Open in Main Studio
                  </button>
                  <button
                    onClick={handleRunChallenge}
                    disabled={evaluating}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)' }}
                  >
                    <Sparkles size={14} fill="#050811" /> {evaluating ? 'Auto-Grading...' : 'Verify & Grade'}
                  </button>
                </div>
              </div>

              {/* Challenge Circuit Workbench */}
              <div style={{
                background: 'rgba(5, 8, 16, 0.7)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Cpu size={16} color="var(--primary-cyan)" />
                    Circuit Register ({currentCircuit.num_qubits} Qubits • {currentCircuit.gates.length} Gates)
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={clearChallengeCircuit} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <RotateCcw size={12} /> Reset Wires
                    </button>
                    <button onClick={() => setCurrentCircuit(activeChallenge.starter_circuit)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      Reload Starter
                    </button>
                  </div>
                </div>

                {/* Quick Gate Palette */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '4px' }}>Quick Insert:</span>
                  {['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'RY', 'RZ'].map((g) => (
                    <button
                      key={g}
                      onClick={() => addGateToChallenge(g, 0)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    >
                      +{g} (q0)
                    </button>
                  ))}
                  {currentCircuit.num_qubits > 1 && (
                    <button
                      onClick={() => addGateToChallenge('CX', 1)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-amber)' }}
                    >
                      +CX (0→1)
                    </button>
                  )}
                </div>

                {/* Wire Visualizer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  {Array.from({ length: currentCircuit.num_qubits }).map((_, qIdx) => {
                    const qubitGates = currentCircuit.gates.filter((g) => g.targets.includes(qIdx) || (g.controls || []).includes(qIdx));
                    return (
                      <div key={qIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '45px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-cyan)', fontWeight: 700 }}>
                          |q{qIdx}⟩
                        </span>
                        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.15)', position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
                          {qubitGates.map((gate, gIdx) => {
                            const isControl = (gate.controls || []).includes(qIdx);
                            return (
                              <div
                                key={gIdx}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: isControl ? '#eab308' : 'rgba(0, 240, 255, 0.25)',
                                  border: '1px solid rgba(0, 240, 255, 0.5)',
                                  color: '#fff',
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  zIndex: 2
                                }}
                              >
                                {isControl ? '●' : gate.gate}
                              </div>
                            );
                          })}
                          {qubitGates.length === 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Identity (wire idle)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hints Box */}
              <div style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-amber)', marginBottom: '8px' }}>
                  Pedagogical Hints & Constraints:
                </div>
                <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
                  {activeChallenge.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              {/* Evaluation Output */}
              {challengeResult && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: challengeResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: challengeResult.passed ? '1px solid #10b981' : '1px solid #ef4444'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: challengeResult.passed ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {challengeResult.passed ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {challengeResult.passed ? `Challenge Passed (Score: ${challengeResult.score}/100)` : 'Verification Incomplete'}
                  </div>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '6px' }}>
                    {challengeResult.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CERTIFICATION EXAM */}
      {activeTab === 'exam' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          {!examStarted ? (
            <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                display: 'inline-flex',
                padding: '22px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                marginBottom: '20px',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)'
              }}>
                <ShieldCheck size={56} color="var(--primary-cyan)" />
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
                Quantum Computing Certification Exam
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Demonstrate comprehensive theoretical and practical mastery across quantum superposition, entanglement, Deutsch-Jozsa, Bernstein-Vazirani, Grover search, QFT, and VQE.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Questions</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>10 Curated Problems</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Time Limit</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>15:00 Minutes</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Passing Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-emerald)' }}>80% or Higher</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Candidate Full Name (will be inscribed on your verified Certificate):
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Dr. Alex Vance, Quantum Engineer"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(5, 8, 16, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleStartExam}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
              >
                Begin Timed Examination
              </button>
            </div>
          ) : !examSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Exam Sticky Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'rgba(10, 15, 30, 0.8)',
                borderRadius: '10px',
                border: '1px solid var(--border-glass)'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Candidate:</span>{' '}
                  <strong>{studentName}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 180 ? '#f43f5e' : 'var(--primary-cyan)', fontWeight: 700, fontSize: '1.1rem' }}>
                  <Clock size={18} /> {formatTimer(timeLeft)}
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress:</span>{' '}
                  <strong>{Object.keys(examAnswers).length} / {examQuestions.length} Answered</strong>
                </div>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {examQuestions.map((q, idx) => (
                  <div key={q.id} style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-beginner" style={{ fontSize: '0.7rem' }}>{q.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Question {idx + 1} of {examQuestions.length}</span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '14px' }}>
                      {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = examAnswers[q.id] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              border: isSelected ? '1px solid var(--primary-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
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

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  onClick={handleSubmitExam}
                  className="btn-primary"
                  style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  Submit Final Examination
                </button>
              </div>
            </div>
          ) : (
            /* Post-Exam Score View */
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                display: 'inline-flex',
                padding: '20px',
                borderRadius: '50%',
                background: examResult?.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: examResult?.passed ? '#34d399' : '#f87171',
                marginBottom: '16px'
              }}>
                {examResult?.passed ? <CheckCircle2 size={54} /> : <AlertTriangle size={54} />}
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                {examResult?.passed ? 'Certification Awarded!' : 'Examination Incomplete'}
              </h2>

              <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: examResult?.passed ? '#34d399' : '#f87171' }}>
                Final Score: {examResult?.score_percentage}% ({examResult?.score}/{examResult?.total})
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '14px 0 24px 0' }}>
                {examResult?.feedback}
              </p>

              {examResult?.passed && examResult?.certificate ? (
                <button
                  onClick={() => setActiveTab('certificate')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                >
                  <ShieldCheck size={18} /> View & Print Official Certificate
                </button>
              ) : (
                <button
                  onClick={() => {
                    setExamStarted(false);
                    setExamSubmitted(false);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  Retake Examination
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFIABLE DIGITAL CERTIFICATE */}
      {activeTab === 'certificate' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* Certificate Card Frame */}
          {/* Certificate Card Frame (Prestigious Swiss Red & White Academic Credential) */}
          <div
            id="certificate-print-area"
            className="outer-chassis"
            style={{
              maxWidth: '850px',
              width: '100%',
              background: '#FFFFFF',
              border: '4px double var(--red-700)',
              borderRadius: '12px',
              padding: '48px 40px',
              boxShadow: 'var(--shadow-hud)',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Official Academic Seal Header */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--red-50)',
                border: '1.5px solid var(--red-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--red-700)'
              }}>
                <Award size={24} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--red-800)', fontFamily: 'var(--font-mono)' }}>
                QUANTUM LAB INSTITUTE OF COMPUTING & ACCREDITATION
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-hud)', letterSpacing: '-0.01em', color: 'var(--ink-primary)', margin: '8px 0 6px 0' }}>
              Certificate of Quantum Mastery & Verification
            </h1>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>
              {certificate ? 'OFFICIAL VERIFIABLE PROFESSIONAL CREDENTIAL // LEVEL-IV ACCREDITED' : 'OFFICIAL RESEARCH CREDENTIAL PREVIEW'}
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              This certifies that
            </p>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--red-700)', margin: '8px 0 12px 0', textDecoration: 'underline 2px var(--red-border)', fontFamily: 'var(--font-hud)' }}>
              {certificate?.student_name || studentName || 'Candidate Name'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-secondary)', maxWidth: '640px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
              has successfully passed the comprehensive assessment with a verified score of{' '}
              <strong style={{ color: '#15803D' }}>{certificate?.score_percentage || 100}%</strong>, demonstrating theoretical rigor and applied proficiency in quantum circuit synthesis, unitary gate decomposition, and statevector engineering.
            </p>

            {/* Footer Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-chassis)', paddingTop: '20px', fontSize: '0.8rem', textAlign: 'center' }}>
              <div>
                <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>ISSUED DATE:</span>
                <div style={{ fontWeight: 700, color: 'var(--ink-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {certificate?.issued_date || new Date().toISOString().split('T')[0]}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>VERIFICATION ID:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red-700)', marginTop: '2px' }}>
                  {certificate?.certificate_id || 'QLAB-CERT-PREVIEW'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>INTEGRITY HASH:</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--ink-secondary)', marginTop: '2px', fontWeight: 600 }}>
                  {certificate?.verification_hash || 'SHA256-AUTHENTICATED'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => window.print()} className="btn-primary">
              <Printer size={16} fill="#FFFFFF" /> Print / Export Official PDF
            </button>
            {!certificate && (
              <button onClick={() => setActiveTab('exam')} className="btn-primary" style={{ background: 'var(--red-700)' }}>
                <FileCheck size={16} /> Take Exam to Unlock Official Credential
              </button>
            )}
            <button onClick={() => setActiveTab('challenges')} className="btn-secondary">
              Back to Challenges
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
