import React, { useState, useEffect } from 'react';
import { Atom, BookOpen, Cpu, Bot, Users, Sparkles, Award, Network, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { sound } from '../services/audioEngine';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDiagnostic: () => void;
  backendName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDiagnostic,
  backendName = 'Qiskit Aer 0.17.2'
}) => {
  const [clock, setClock] = useState<string>('');
  const [audioActive, setAudioActive] = useState<boolean>(sound.isEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tabId: string) => {
    sound.playTick();
    setActiveTab(tabId);
  };

  const handleToggleAudio = () => {
    const nextState = sound.toggleAudio();
    setAudioActive(nextState);
  };

  const tabs = [
    { id: 'studio', label: 'Circuit Studio', icon: <Cpu size={15} /> },
    { id: 'curriculum', label: 'Curriculum & Labs', icon: <BookOpen size={15} /> },
    { id: 'advantage-map', label: 'Advantage Map', icon: <Network size={15} /> },
    { id: 'assessment', label: 'Assessment & Certs', icon: <Award size={15} /> },
    { id: 'ai-tutor', label: 'AI Tutor & Debugger', icon: <Bot size={15} /> },
    { id: 'instructor', label: 'Instructor Portal', icon: <Users size={15} /> }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: '12px',
      zIndex: 999,
      padding: '0 20px',
      width: '100%',
      maxWidth: '1580px',
      margin: '0 auto'
    }}>
      {/* Detached Floating Island HUD Chassis */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-chassis)',
        boxShadow: 'var(--shadow-hud)',
        borderRadius: '16px',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand & Technical Classification Stamp */}
        <div
          onClick={() => handleTabClick('studio')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--red-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
            border: '1px solid var(--red-700)'
          }}>
            <Atom size={22} strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: 'var(--ink-primary)'
              }}>
                QUANTUM<span style={{ color: 'var(--red-600)' }}>LAB</span>
              </span>
              <span className="doc-stamp" style={{ fontSize: '0.62rem', padding: '2px 5px' }}>
                ARCHIVE // QL-26
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              color: 'var(--ink-dim)',
              letterSpacing: '0.04em',
              display: 'block'
            }}>
              RESEARCH SPECIFICATION & SIMULATION
            </span>
          </div>
        </div>

        {/* Floating Navigation Pill Cluster (Double-Bezel) */}
        <nav style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-chassis)'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--red-700)' : 'var(--ink-muted)',
                  border: isActive ? '1px solid var(--border-chassis)' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <span style={{ color: isActive ? 'var(--red-600)' : 'var(--ink-dim)' }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Telemetry Cluster & Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Audio Engine Haptic Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            title={audioActive ? 'Acoustic feedback enabled' : 'Acoustic feedback muted'}
            style={{
              background: audioActive ? 'var(--red-50)' : 'var(--bg-subtle)',
              border: `1px solid ${audioActive ? 'var(--red-border)' : 'var(--border-chassis)'}`,
              color: audioActive ? 'var(--red-700)' : 'var(--ink-dim)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.18s'
            }}
          >
            {audioActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Diagnostic Button */}
          <button
            onClick={() => {
              sound.playTick();
              onOpenDiagnostic();
            }}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
          >
            <Sparkles size={13} color="var(--red-600)" />
            Diagnostic
          </button>

          {/* Engine Status & Live Clock Ledger */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px',
            background: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-chassis)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem'
          }}>
            <div className="live-beacon" />
            <span style={{ fontWeight: 600, color: 'var(--ink-secondary)' }}>
              {backendName}
            </span>
            <span style={{ color: 'var(--ink-subtle)' }}>|</span>
            <span style={{ color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}>
              {clock}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
