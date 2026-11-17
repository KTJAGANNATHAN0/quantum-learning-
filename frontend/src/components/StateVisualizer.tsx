import React from 'react';
import { SimulationResult } from '../types/quantum';
import { BarChart2, Activity, Clock, Layers, ShieldCheck, Binary } from 'lucide-react';

interface StateVisualizerProps {
  result: SimulationResult | null;
}

export const StateVisualizer: React.FC<StateVisualizerProps> = ({ result }) => {
  if (!result || !result.success) {
    return (
      <div className="outer-chassis" style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          {result?.error_message || 'Awaiting quantum simulation execution... Please trigger "Simulate Circuit".'}
        </p>
      </div>
    );
  }

  const sortedStates = Object.entries(result.probabilities || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Precision Hardware Telemetry Row (Double-Bezel) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div className="outer-chassis" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--red-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--red-700)'
          }}>
            <Activity size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
              Qubits
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)' }}>
              {result.num_qubits}
            </div>
          </div>
        </div>

        <div className="outer-chassis" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-secondary)'
          }}>
            <Layers size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
              Depth
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)' }}>
              {result.circuit_depth}
            </div>
          </div>
        </div>

        <div className="outer-chassis" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--red-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--red-700)'
          }}>
            <Binary size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
              Gates
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)' }}>
              {result.gate_count}
            </div>
          </div>
        </div>

        <div className="outer-chassis" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink-secondary)'
          }}>
            <Clock size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
              Latency
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink-primary)' }}>
              {result.execution_time_ms} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Measurement Probability Distribution */}
      <div className="outer-chassis" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="var(--red-600)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
              Measurement Outcome Probabilities
            </h3>
          </div>
          <span className="doc-stamp">
            AER SIMULATOR // {Object.values(result.counts).reduce((a, b) => a + b, 0) || 1024} SHOTS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedStates.map(([state, prob]) => {
            const count = result.counts[state] || 0;
            const pct = (prob * 100).toFixed(1);
            return (
              <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{
                  width: '50px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--red-700)',
                  fontSize: '0.85rem'
                }}>
                  |{state}⟩
                </span>
                <div style={{
                  flex: 1,
                  height: '24px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-chassis)'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(prob * 100, 1)}%`,
                      background: 'var(--red-600)',
                      borderRadius: '5px',
                      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '8px',
                    top: '3px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--ink-primary)'
                  }}>
                    {pct}% ({count} shots)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statevector Complex Amplitudes */}
      <div className="outer-chassis" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
            Dirac Statevector Amplitudes (|ψ⟩)
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-dim)' }}>
            REPRESENTATION: CARTESIAN + POLAR
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '8px'
        }}>
          {result.statevector.map((amp) => (
            <div
              key={amp.state}
              className="inner-bezel"
              style={{
                background: '#FFFFFF',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '0.75rem',
                border: '1px solid var(--border-bezel)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--red-700)', fontFamily: 'var(--font-mono)' }}>
                <span>|{amp.state}⟩</span>
                <span>{(amp.probability * 100).toFixed(1)}%</span>
              </div>
              <div style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px', fontSize: '0.7rem' }}>
                Re: {amp.real.toFixed(3)}
              </div>
              <div style={{ color: 'var(--ink-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                Im: {amp.imag.toFixed(3)}
              </div>
              <div style={{ color: 'var(--red-600)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginTop: '2px', fontWeight: 600 }}>
                ∠ {(amp.phase * 180 / Math.PI).toFixed(0)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
