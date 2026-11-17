import React, { useState } from 'react';
import { CircuitDefinition, GateOperation } from '../types/quantum';
import { Play, RotateCcw, Plus, Trash2, Cpu, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/audioEngine';

interface CircuitBuilderProps {
  circuit: CircuitDefinition;
  onChange: (circuit: CircuitDefinition) => void;
  onSimulate: () => void;
  isLoading?: boolean;
}

const PALETTE_GATES = [
  { name: 'H', label: 'H', desc: 'Hadamard (Uniform Superposition)', type: 'Single' },
  { name: 'X', label: 'X', desc: 'Pauli-X (Bit-Flip / NOT)', type: 'Single' },
  { name: 'Y', label: 'Y', desc: 'Pauli-Y (Bit & Phase Flip)', type: 'Single' },
  { name: 'Z', label: 'Z', desc: 'Pauli-Z (Phase Flip π)', type: 'Single' },
  { name: 'S', label: 'S', desc: 'Phase S (π/2 Phase Rotation)', type: 'Phase' },
  { name: 'T', label: 'T', desc: 'Phase T (π/4 Phase Rotation)', type: 'Phase' },
  { name: 'RX', label: 'Rx', desc: 'Parameterized Rotation X(θ)', type: 'Param' },
  { name: 'RY', label: 'Ry', desc: 'Parameterized Rotation Y(θ)', type: 'Param' },
  { name: 'RZ', label: 'Rz', desc: 'Parameterized Rotation Z(θ)', type: 'Param' },
  { name: 'CX', label: 'CX', desc: 'Controlled-NOT (Entangling)', type: 'Entangle' },
  { name: 'CZ', label: 'CZ', desc: 'Controlled-Z (Phase Entangle)', type: 'Entangle' },
  { name: 'SWAP', label: 'SW', desc: 'SWAP Qubits', type: 'Entangle' },
  { name: 'CCX', label: 'CCX', desc: 'Toffoli 3-Qubit Gate', type: 'Entangle' }
];

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  circuit,
  onChange,
  onSimulate,
  isLoading = false
}) => {
  const [selectedGate, setSelectedGate] = useState<string>('H');
  const [controlQubit, setControlQubit] = useState<number>(0);
  const maxSteps = 8;

  const handleGateSelect = (gateName: string) => {
    sound.playTick();
    setSelectedGate(gateName);
  };

  const handleCellClick = (targetQubit: number, step: number) => {
    sound.playGateSnap();

    // Check if gate already exists at this step & target
    const existingIndex = circuit.gates.findIndex(
      (g) => g.targets.includes(targetQubit) && g.step === step
    );

    let newGates = [...circuit.gates];

    if (existingIndex >= 0) {
      // Toggle off
      newGates.splice(existingIndex, 1);
    } else {
      // Add new gate
      const isMultiQubit = ['CX', 'CNOT', 'CZ'].includes(selectedGate);
      const isSwap = selectedGate === 'SWAP';
      const isToffoli = ['CCX', 'TOFFOLI'].includes(selectedGate);

      let controls: number[] = [];
      let targets = [targetQubit];

      if (isMultiQubit) {
        controls = [controlQubit === targetQubit ? (targetQubit === 0 ? 1 : 0) : controlQubit];
      } else if (isSwap) {
        const other = targetQubit === 0 ? 1 : 0;
        targets = [targetQubit, other];
      } else if (isToffoli) {
        controls = [0, 1];
        if (targetQubit === 0 || targetQubit === 1) {
          targets = [2];
        }
      }

      const newGateOp: GateOperation = {
        gate: selectedGate,
        targets,
        controls,
        params: ['RX', 'RY', 'RZ'].includes(selectedGate) ? [Math.PI / 2] : [],
        step
      };
      newGates.push(newGateOp);
    }

    onChange({
      ...circuit,
      gates: newGates
    });
  };

  const handleClear = () => {
    sound.playTick();
    onChange({
      ...circuit,
      gates: []
    });
  };

  const handlePreset = (presetName: string) => {
    sound.playTick();
    if (presetName === 'bell') {
      onChange({
        num_qubits: 2,
        gates: [
          { gate: 'H', targets: [0], controls: [], step: 0 },
          { gate: 'CX', targets: [1], controls: [0], step: 1 }
        ],
        name: 'Bell State |Φ+⟩',
        shots: 1024
      });
    } else if (presetName === 'superposition') {
      onChange({
        num_qubits: 2,
        gates: [
          { gate: 'H', targets: [0], controls: [], step: 0 },
          { gate: 'H', targets: [1], controls: [], step: 0 }
        ],
        name: '2-Qubit Uniform Superposition',
        shots: 1024
      });
    } else if (presetName === 'grover') {
      onChange({
        num_qubits: 2,
        gates: [
          { gate: 'H', targets: [0], controls: [], step: 0 },
          { gate: 'H', targets: [1], controls: [], step: 0 },
          { gate: 'CZ', targets: [1], controls: [0], step: 1 },
          { gate: 'H', targets: [0], controls: [], step: 2 },
          { gate: 'H', targets: [1], controls: [], step: 2 },
          { gate: 'X', targets: [0], controls: [], step: 3 },
          { gate: 'X', targets: [1], controls: [], step: 3 },
          { gate: 'CZ', targets: [1], controls: [0], step: 4 },
          { gate: 'X', targets: [0], controls: [], step: 5 },
          { gate: 'X', targets: [1], controls: [], step: 5 },
          { gate: 'H', targets: [0], controls: [], step: 6 },
          { gate: 'H', targets: [1], controls: [], step: 6 }
        ],
        name: "Grover's 2-Qubit Search",
        shots: 1024
      });
    } else if (presetName === 'deutsch') {
      onChange({
        num_qubits: 2,
        gates: [
          { gate: 'X', targets: [1], controls: [], step: 0 },
          { gate: 'H', targets: [0], controls: [], step: 1 },
          { gate: 'H', targets: [1], controls: [], step: 1 },
          { gate: 'CX', targets: [1], controls: [0], step: 2 },
          { gate: 'H', targets: [0], controls: [], step: 3 }
        ],
        name: 'Deutsch Algorithm',
        shots: 1024
      });
    }
  };

  const handleQubitCountChange = (n: number) => {
    sound.playTick();
    const filteredGates = circuit.gates.filter((g) => {
      const allQubits = [...g.targets, ...(g.controls || [])];
      return allQubits.every((q) => q < n);
    });
    onChange({
      ...circuit,
      num_qubits: n,
      gates: filteredGates
    });
  };

  return (
    <div className="outer-chassis" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Simulation Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-primary)' }}>
                Quantum Circuit Schematic Canvas
              </h2>
              <span className="doc-stamp">
                SCHEMATIC // QL-ENG-01
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)' }}>
              Interactive unitary operator sequencer & quantum register pipeline
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={handleClear} className="btn-secondary" title="Clear all circuit operators">
            <RotateCcw size={15} /> Clear Rails
          </button>
          <button
            onClick={() => {
              sound.playSimulationSweep();
              onSimulate();
            }}
            disabled={isLoading}
            className="btn-primary"
          >
            <Play size={15} fill="#FFFFFF" />
            {isLoading ? 'Executing Aer Simulation...' : 'Simulate Circuit'}
          </button>
        </div>
      </div>

      {/* Preset Specifications Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        padding: '8px 12px',
        background: 'var(--bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--border-chassis)'
      }}>
        <span style={{
          color: 'var(--ink-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 600
        }}>
          <Sparkles size={13} color="var(--red-600)" />
          PRESETS:
        </span>
        <button onClick={() => handlePreset('bell')} className="btn-secondary" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
          Bell State |Φ+⟩
        </button>
        <button onClick={() => handlePreset('superposition')} className="btn-secondary" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
          Uniform Superposition
        </button>
        <button onClick={() => handlePreset('grover')} className="btn-secondary" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
          Grover Search
        </button>
        <button onClick={() => handlePreset('deutsch')} className="btn-secondary" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
          Deutsch Algorithm
        </button>

        {/* Qubit Register Width Selector */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
            REGISTERS:
          </span>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => handleQubitCountChange(n)}
              style={{
                background: circuit.num_qubits === n ? 'var(--red-600)' : '#FFFFFF',
                color: circuit.num_qubits === n ? '#FFFFFF' : 'var(--ink-secondary)',
                border: `1px solid ${circuit.num_qubits === n ? 'var(--red-700)' : 'var(--border-chassis)'}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              q[{n}]
            </button>
          ))}
        </div>
      </div>

      {/* Operator Palette (Hardware Stamp Aesthetic) */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: '10px 14px',
        background: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid var(--border-chassis)',
        boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.03)'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--ink-dim)',
          marginRight: '6px',
          letterSpacing: '0.04em'
        }}>
          GATES:
        </span>
        {PALETTE_GATES.map((g) => {
          const isSelected = selectedGate === g.name;
          return (
            <button
              key={g.name}
              onClick={() => handleGateSelect(g.name)}
              title={g.desc}
              style={{
                minWidth: '38px',
                height: '38px',
                padding: '0 8px',
                borderRadius: '6px',
                border: isSelected ? '1.5px solid var(--red-600)' : '1px solid var(--border-chassis)',
                background: isSelected ? 'var(--red-50)' : '#FFFFFF',
                color: isSelected ? 'var(--red-700)' : 'var(--ink-primary)',
                fontWeight: 700,
                fontSize: '0.86rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 2px 8px rgba(220, 38, 38, 0.2)' : '0 1px 2px rgba(15, 23, 42, 0.04)'
              }}
            >
              {g.label}
            </button>
          );
        })}

        {/* Control Qubit Selector for Entangling Gates */}
        {['CX', 'CZ'].includes(selectedGate) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            padding: '4px 8px',
            background: 'var(--red-50)',
            borderRadius: '6px',
            border: '1px solid var(--red-border)'
          }}>
            <span style={{ color: 'var(--red-700)', fontWeight: 600 }}>CONTROL:</span>
            {Array.from({ length: circuit.num_qubits }).map((_, q) => (
              <button
                key={q}
                onClick={() => {
                  sound.playTick();
                  setControlQubit(q);
                }}
                style={{
                  background: controlQubit === q ? 'var(--red-600)' : '#FFFFFF',
                  color: controlQubit === q ? '#FFFFFF' : 'var(--red-700)',
                  border: '1px solid var(--red-border)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                q{q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Double-Bezel Circuit Schematic Canvas (Precision Wires & Rails) */}
      <div className="inner-bezel" style={{
        overflowX: 'auto',
        padding: '20px 24px',
        background: '#FFFFFF',
        border: '1px solid var(--border-bezel)',
        boxShadow: 'inset 0 1px 3px rgba(15, 23, 42, 0.03)'
      }}>
        {/* Step Time Headers */}
        <div style={{
          display: 'flex',
          marginLeft: '70px',
          gap: '16px',
          marginBottom: '10px',
          minWidth: '550px'
        }}>
          {Array.from({ length: maxSteps }).map((_, step) => (
            <div
              key={step}
              style={{
                width: '46px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.66rem',
                color: 'var(--ink-dim)',
                letterSpacing: '0.04em'
              }}
            >
              t<sub>{step}</sub>
            </div>
          ))}
        </div>

        {/* Quantum Wire Rails */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: '550px' }}>
          {Array.from({ length: circuit.num_qubits }).map((_, q) => (
            <div key={q} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              {/* Qubit Register Label */}
              <div style={{
                width: '65px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--ink-secondary)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ color: 'var(--red-600)' }}>|</span>q<sub>{q}</sub>⟩
              </div>

              {/* Conductor Wire Rail Line */}
              <div style={{
                position: 'absolute',
                left: '65px',
                right: '0',
                height: '2px',
                background: 'var(--border-bezel)',
                zIndex: 1
              }} />

              {/* Step Operator Slots */}
              <div style={{ display: 'flex', gap: '16px', zIndex: 2, flex: 1, paddingLeft: '5px' }}>
                {Array.from({ length: maxSteps }).map((_, step) => {
                  const gate = circuit.gates.find(
                    (g) => g.step === step && (g.targets.includes(q) || (g.controls && g.controls.includes(q)))
                  );

                  const isTarget = gate && gate.targets.includes(q);
                  const isControl = gate && gate.controls && gate.controls.includes(q);

                  return (
                    <div
                      key={step}
                      onClick={() => handleCellClick(q, step)}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '7px',
                        border: gate
                          ? (isTarget ? '1.5px solid var(--red-600)' : '1.5px solid var(--ink-secondary)')
                          : '1px dashed var(--border-chassis)',
                        background: isTarget
                          ? '#FFFFFF'
                          : isControl
                          ? 'var(--bg-subtle)'
                          : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: gate ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                        position: 'relative'
                      }}
                      title={gate ? `${gate.gate} on q[${q}] (Click to toggle/remove)` : `Click to place ${selectedGate}`}
                    >
                      {isTarget && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          color: 'var(--red-700)'
                        }}>
                          {gate?.gate}
                        </span>
                      )}

                      {isControl && (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'var(--ink-primary)',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 0 0 1px var(--ink-primary)'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
