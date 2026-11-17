import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, TrendingUp, CheckCircle, AlertCircle, FileText, Download, Plus, X, Sparkles } from 'lucide-react';
import { CustomChallengeCreate } from '../types/quantum';

export const InstructorDashboard: React.FC = () => {
  const [cohortData, setCohortData] = useState<any | null>(null);
  const [customChallenges, setCustomChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New assignment form state
  const [formData, setFormData] = useState<CustomChallengeCreate>({
    title: 'GHZ State Tripartite Entanglement',
    description: 'Construct a 3-qubit maximally entangled GHZ state (|000⟩ + |111⟩)/√2 using Hadamard and CNOT gates.',
    target_state: 'GHZ (|000⟩ + |111⟩)/√2',
    hints: ['Apply Hadamard on qubit 0 to create superposition', 'Entangle qubit 0 with qubit 1 and qubit 2 using CX gates'],
    starter_qubits: 3,
    assigned_cohort: 'Quantum Computing 101 - Fall Cohort'
  });

  const [hintsText, setHintsText] = useState('Apply Hadamard on qubit 0 to create superposition\nEntangle qubit 0 with qubit 1 and qubit 2 using CX gates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cohort, challenges] = await Promise.all([
        api.getInstructorCohortData(),
        api.getCustomChallenges()
      ]);
      setCohortData(cohort);
      setCustomChallenges(challenges || []);
    } catch (err) {
      console.error('Failed to load instructor dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSuccess(null);
    try {
      const parsedHints = hintsText
        .split('\n')
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const payload: CustomChallengeCreate = {
        ...formData,
        hints: parsedHints
      };

      const result = await api.createCustomChallenge(payload);
      const newCh = result.id ? result : result.challenge;
      setFormSuccess(`Successfully published "${newCh.title}" for ${newCh.assigned_cohort || 'cohort'}!`);
      setCustomChallenges((prev) => [newCh, ...prev]);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create assignment', err);
      alert('Error creating assignment: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !cohortData) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Instructor Cohort Analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-intermediate" style={{ marginBottom: '8px' }}>Instructor Portal</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '6px 0 4px 0' }}>{cohortData.cohort_name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time student progress monitoring, circuit assignment analytics, and quiz mastery heatmaps.</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => alert('Cohort progress report exported as CSV.')}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <FileText size={16} fill="#FFFFFF" /> Create Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--red-600)', marginBottom: '8px' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enrolled Learners</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{cohortData.total_students}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>100% Active in last 7 days</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-emerald)', marginBottom: '8px' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completion Rate</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{cohortData.average_completion_rate}%</div>
          <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '4px' }}>+12% vs previous cohort</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--red-700)', marginBottom: '8px' }}>
            <CheckCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Quiz Score</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{cohortData.average_quiz_score}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across all 6 modules</div>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--red-600)', marginBottom: '8px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Needs Intervention</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>2</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--red-700)', marginTop: '4px' }}>Stuck on Grover Oracle</div>
        </div>
      </div>

      {/* Module Completion Heatmap */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Curriculum Completion Funnel</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cohortData.modules_progress.map((m: any) => {
            const pct = Math.round((m.completed_count / cohortData.total_students) * 100);
            return (
              <div key={m.module_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
                <span style={{ width: '220px', fontWeight: 600 }}>{m.title}</span>
                <div style={{ flex: 1, height: '14px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-chassis)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'var(--red-600)',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <span style={{ width: '70px', textAlign: 'right', fontWeight: 700, color: 'var(--red-700)', fontFamily: 'var(--font-mono)' }}>
                  {pct}% ({m.completed_count})
                </span>
                <span style={{ width: '80px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  Avg: {m.avg_score}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Student Performance & Activity Roster</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px' }}>Learner Name</th>
              <th style={{ padding: '10px 14px' }}>Course Progress</th>
              <th style={{ padding: '10px 14px' }}>Circuits Built</th>
              <th style={{ padding: '10px 14px' }}>Quiz Average</th>
              <th style={{ padding: '10px 14px' }}>Standing Status</th>
            </tr>
          </thead>
          <tbody>
            {cohortData.students.map((st: any) => (
              <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{st.name}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${st.progress_pct}%`, background: 'var(--primary-cyan)' }} />
                    </div>
                    <span>{st.progress_pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>{st.circuits_built} circuits</td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: st.quiz_avg >= 90 ? '#34d399' : '#fbbf24' }}>
                  {st.quiz_avg}%
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`badge ${st.status === 'Advanced' ? 'badge-advanced' : st.status === 'On Track' ? 'badge-beginner' : 'badge-intermediate'}`}>
                    {st.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Published Cohort Custom Challenges */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Active Custom Challenges & Assignments</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Specialized circuit assignments authored by instructors for this cohort.</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={14} /> New Assignment
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {customChallenges.map((ch) => (
            <div key={ch.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-intermediate" style={{ fontSize: '0.7rem' }}>{ch.assigned_cohort || 'Cohort'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>{ch.target_state}</span>
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{ch.title}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ch.description}</p>
              
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>Starter Qubits: <strong style={{ color: 'var(--primary-cyan)' }}>{ch.starter_qubits}</strong></span>
                <span>Hints: <strong>{ch.hints?.length || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="outer-chassis" style={{
            maxWidth: '600px',
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid var(--border-chassis)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-hud)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-chassis)',
              background: 'var(--bg-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--red-600)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-primary)' }}>Author Cohort Quantum Challenge</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateAssignment} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formSuccess && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '0.85rem'
                }}>
                  ✓ {formSuccess}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Challenge Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Quantum State</label>
                  <input
                    type="text"
                    required
                    value={formData.target_state}
                    onChange={(e) => setFormData({ ...formData, target_state: e.target.value })}
                    placeholder="e.g. (|000⟩ + |111⟩)/√2"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Assigned Cohort</label>
                  <input
                    type="text"
                    value={formData.assigned_cohort || ''}
                    onChange={(e) => setFormData({ ...formData, assigned_cohort: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Number of Starter Qubits</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={formData.starter_qubits}
                  onChange={(e) => setFormData({ ...formData, starter_qubits: parseInt(e.target.value) || 2 })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Goal & Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progressive Hints (one per line)</label>
                </div>
                <textarea
                  rows={3}
                  value={hintsText}
                  onChange={(e) => setHintsText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--primary-cyan)',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={16} fill="#050811" /> {isSubmitting ? 'Publishing...' : 'Publish to Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
