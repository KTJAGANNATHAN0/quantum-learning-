import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AmbientCanvas } from './components/AmbientCanvas';
import { CircuitBuilder } from './components/CircuitBuilder';
import { BlochSphere3D } from './components/BlochSphere3D';
import { StateVisualizer } from './components/StateVisualizer';
import { CodeEditorView } from './components/CodeEditorView';
import { AITutorPanel } from './components/AITutorPanel';
import { CurriculumView } from './components/CurriculumView';
import { AssessmentCenter } from './components/AssessmentCenter';
import { QuantumAdvantageMap } from './components/QuantumAdvantageMap';
import { InstructorDashboard } from './components/InstructorDashboard';
import { DiagnosticModal } from './components/DiagnosticModal';
import { api } from './services/api';
import { sound } from './services/audioEngine';
import { CircuitDefinition, SimulationResult, ModuleContent } from './types/quantum';
import { Code2, LayoutGrid, FileText, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [userTrack, setUserTrack] = useState<string>('Beginner');

  // Circuit & Simulation State
  const [circuit, setCircuit] = useState<CircuitDefinition>({
    num_qubits: 2,
    gates: [
      { gate: 'H', targets: [0], controls: [], step: 0 },
      { gate: 'CX', targets: [1], controls: [0], step: 1 }
    ],
    name: 'Bell State |Φ+⟩',
    shots: 1024
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  // Modules State
  const [modules, setModules] = useState<ModuleContent[]>([]);

  // Initial simulation and modules fetch
  useEffect(() => {
    handleSimulate(circuit);
    api.getModules()
      .then((mods) => setModules(mods))
      .catch((err) => console.error('Failed to load curriculum modules', err));
  }, []);

  const handleSimulate = async (circuitToRun = circuit) => {
    setIsLoading(true);
    sound.playSimulationSweep();
    try {
      const res = await api.simulateCircuit(circuitToRun);
      setSimulationResult(res);
      sound.playTelemetryBeep(1400);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunRawCode = async (code: string) => {
    setIsLoading(true);
    sound.playSimulationSweep();
    try {
      const res = await api.runRawCode(code, circuit.shots);
      setSimulationResult(res);
      sound.playTelemetryBeep(1400);
    } catch (err: any) {
      console.error('Raw execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPresetToStudio = (preset: CircuitDefinition) => {
    sound.playTick();
    setCircuit(preset);
    handleSimulate(preset);
    setActiveTab('studio');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background Ambient Mathematical Canvas */}
      <AmbientCanvas />

      {/* Top Floating Island HUD Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        backendName={simulationResult?.backend || 'Qiskit Aer 0.17.2'}
      />

      {/* Main Archival Document Shell */}
      <main style={{
        flex: 1,
        padding: '20px 24px 48px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Archival Dossier Identification Bar (Serious Documenting Look) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          border: '1px solid var(--border-chassis)',
          borderRadius: '10px',
          padding: '8px 16px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-chassis)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="doc-stamp">
              DOC // REF-QL-2026-X
            </span>
            <span style={{ color: 'var(--ink-secondary)', fontWeight: 600 }}>
              QUANTUM SYSTEM SPECIFICATION & VERIFICATION DOSSIER
            </span>
            <span style={{ color: 'var(--ink-subtle)' }}>•</span>
            <span style={{ color: 'var(--ink-dim)' }}>
              CLASSIFICATION: PUBLIC SCIENTIFIC ACCESS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--ink-dim)' }}>
              STATE VECTOR SPACE: <strong style={{ color: 'var(--red-700)' }}>ℂ<sup>{Math.pow(2, circuit.num_qubits)}</sup></strong>
            </span>
            <span style={{ color: 'var(--ink-subtle)' }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--ink-secondary)' }}>
              <ShieldCheck size={14} color="var(--red-600)" />
              STATION: LAB-ONLINE
            </span>
          </div>
        </div>

        {/* VIEW 1: CIRCUIT STUDIO */}
        {activeTab === 'studio' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px', alignItems: 'start' }}>
            {/* Left Column: Circuit Editor + Mode Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  background: 'var(--bg-subtle)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-chassis)'
                }}>
                  <button
                    onClick={() => {
                      sound.playTick();
                      setViewMode('visual');
                    }}
                    style={{
                      background: viewMode === 'visual' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'visual' ? 'var(--red-700)' : 'var(--ink-muted)',
                      border: viewMode === 'visual' ? '1px solid var(--border-chassis)' : '1px solid transparent',
                      boxShadow: viewMode === 'visual' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-hud)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <LayoutGrid size={14} color={viewMode === 'visual' ? 'var(--red-600)' : 'currentColor'} />
                    Visual Schematic
                  </button>

                  <button
                    onClick={() => {
                      sound.playTick();
                      setViewMode('code');
                    }}
                    style={{
                      background: viewMode === 'code' ? '#FFFFFF' : 'transparent',
                      color: viewMode === 'code' ? 'var(--red-700)' : 'var(--ink-muted)',
                      border: viewMode === 'code' ? '1px solid var(--border-chassis)' : '1px solid transparent',
                      boxShadow: viewMode === 'code' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-hud)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <Code2 size={14} color={viewMode === 'code' ? 'var(--red-600)' : 'currentColor'} />
                    Qiskit Code Mode
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ink-dim)'
                }}>
                  <span>SPECIMEN:</span>
                  <span style={{
                    padding: '2px 8px',
                    background: 'var(--red-50)',
                    color: 'var(--red-700)',
                    border: '1px solid var(--red-border)',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {circuit.name}
                  </span>
                </div>
              </div>

              {viewMode === 'visual' ? (
                <CircuitBuilder
                  circuit={circuit}
                  onChange={(newCirc) => {
                    setCircuit(newCirc);
                    handleSimulate(newCirc);
                  }}
                  onSimulate={() => handleSimulate(circuit)}
                  isLoading={isLoading}
                />
              ) : (
                <CodeEditorView
                  qiskitCode={simulationResult?.qiskit_code || ''}
                  onRunRawCode={handleRunRawCode}
                  isLoading={isLoading}
                />
              )}

              {/* AI Tutor Chat & Diagnostic Panel embedded under Studio */}
              <AITutorPanel circuit={circuit} simulationResult={simulationResult} />
            </div>

            {/* Right Column: 3D Bloch Sphere & State Vector Visualizer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <BlochSphere3D
                blochVectors={simulationResult?.bloch_vectors || []}
                selectedQubit={selectedQubit}
                onSelectQubit={setSelectedQubit}
              />

              <StateVisualizer result={simulationResult} />
            </div>
          </div>
        )}

        {/* VIEW 2: CURRICULUM & LABS */}
        {activeTab === 'curriculum' && (
          <CurriculumView
            modules={modules}
            onLoadPresetToStudio={handleLoadPresetToStudio}
            onOpenAdvantageMap={() => setActiveTab('advantage-map')}
          />
        )}

        {/* VIEW 3: QUANTUM ADVANTAGE CONSTELLATION MAP */}
        {activeTab === 'advantage-map' && (
          <QuantumAdvantageMap
            onLoadCircuitToStudio={handleLoadPresetToStudio}
          />
        )}

        {/* VIEW 4: ASSESSMENT & CERTIFICATION CENTER */}
        {activeTab === 'assessment' && (
          <AssessmentCenter
            modules={modules}
            onLoadChallengeToStudio={handleLoadPresetToStudio}
          />
        )}

        {/* VIEW 5: DEDICATED AI TUTOR WORKSPACE */}
        {activeTab === 'ai-tutor' && (
          <div style={{ maxWidth: '960px', margin: '0 auto', height: '82vh' }}>
            <AITutorPanel circuit={circuit} simulationResult={simulationResult} />
          </div>
        )}

        {/* VIEW 6: INSTRUCTOR DASHBOARD */}
        {activeTab === 'instructor' && (
          <InstructorDashboard />
        )}
      </main>

      {/* Diagnostic Skill Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onSelectTrack={(track) => setUserTrack(track)}
      />
    </div>
  );
}

export default App;
