import React, { useState } from 'react';
import {
  TrendingUp,
  Dna,
  Zap,
  Truck,
  Shield,
  Radio,
  Bot,
  Atom,
  Play,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { CircuitDefinition } from '../types/quantum';

interface QuantumAdvantageMapProps {
  onLoadCircuitToStudio: (circuit: CircuitDefinition) => void;
}

interface IndustryNode {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  connectedOrbitIds: string[];
  description: string;
  algorithms: string[];
  circuitPreset: CircuitDefinition;
}

interface OrbitNode {
  id: string;
  name: string;
  subroutine: string;
  angle: number; // in radians for orbital positioning
  connectedOutcomeIds: string[];
  complexity: string;
  description: string;
}

interface OutcomeNode {
  id: string;
  name: string;
  speedup: string;
  description: string;
}

const INDUSTRIES: IndustryNode[] = [
  {
    id: 'ind-fin',
    name: 'Capital Markets',
    category: 'Finance & Trading',
    icon: <TrendingUp size={18} />,
    connectedOrbitIds: ['orb-vqe', 'orb-grover', 'orb-qft'],
    description: 'Portfolio Markowitz optimization, Black-Scholes derivative pricing, and algorithmic arbitrage via quantum amplitude estimation.',
    algorithms: ['VQE / QAOA', 'Quantum Amplitude Estimation'],
    circuitPreset: {
      num_qubits: 3,
      gates: [
        { gate: 'H', targets: [0], controls: [], step: 0 },
        { gate: 'H', targets: [1], controls: [], step: 0 },
        { gate: 'RY', targets: [2], controls: [], step: 0, params: [1.2] },
        { gate: 'CX', targets: [1], controls: [0], step: 1 },
        { gate: 'CX', targets: [2], controls: [1], step: 2 }
      ],
      name: 'Financial Portfolio QAOA Ansatz',
      shots: 1024
    }
  },
  {
    id: 'ind-pharma',
    name: 'Life Sciences',
    category: 'Bio & Pharma',
    icon: <Dna size={18} />,
    connectedOrbitIds: ['orb-vqe', 'orb-bell', 'orb-superpos'],
    description: 'Simulating electronic Hamiltonian ground states of complex enzymes, nitrogenase catalysts, and molecular drug binding pockets.',
    algorithms: ['Variational Quantum Eigensolver (VQE)', 'UCCSD Ansatz'],
    circuitPreset: {
      num_qubits: 2,
      gates: [
        { gate: 'RY', targets: [0], controls: [], step: 0, params: [1.57] },
        { gate: 'RY', targets: [1], controls: [], step: 0, params: [0.78] },
        { gate: 'CX', targets: [1], controls: [0], step: 1 },
        { gate: 'RZ', targets: [0], controls: [], step: 2, params: [0.5] }
      ],
      name: 'Molecular H2 Ground State VQE',
      shots: 1024
    }
  },
  {
    id: 'ind-energy',
    name: 'Energy & Utilities',
    category: 'Materials & Grid',
    icon: <Zap size={18} />,
    connectedOrbitIds: ['orb-grover', 'orb-vqe', 'orb-qec'],
    description: 'Solid-state battery electrolyte design, smart-grid dispatch optimization, and carbon capture molecular modeling.',
    algorithms: ['Quantum Phase Estimation', 'VQE Material Simulation'],
    circuitPreset: {
      num_qubits: 3,
      gates: [
        { gate: 'H', targets: [0], controls: [], step: 0 },
        { gate: 'H', targets: [1], controls: [], step: 0 },
        { gate: 'CX', targets: [2], controls: [0], step: 1 },
        { gate: 'RZ', targets: [2], controls: [], step: 2, params: [1.0] }
      ],
      name: 'Grid Dispatch Superposition Engine',
      shots: 1024
    }
  },
  {
    id: 'ind-telecom',
    name: 'Telecom & Cable',
    category: 'Communications',
    icon: <Radio size={18} />,
    connectedOrbitIds: ['orb-bell', 'orb-kickback', 'orb-qec'],
    description: 'Quantum Key Distribution (BB84/E91), quantum repeater entanglement distillation, and channel capacity optimization.',
    algorithms: ['EPR Bell Teleportation', 'Quantum Error Correction'],
    circuitPreset: {
      num_qubits: 3,
      gates: [
        { gate: 'H', targets: [1], controls: [], step: 0 },
        { gate: 'CX', targets: [2], controls: [1], step: 1 },
        { gate: 'CX', targets: [1], controls: [0], step: 2 },
        { gate: 'H', targets: [0], controls: [], step: 3 }
      ],
      name: 'Quantum Teleportation & Repeater',
      shots: 1024
    }
  },
  {
    id: 'ind-transit',
    name: 'Public Transit & Logistics',
    category: 'Transportation',
    icon: <Truck size={18} />,
    connectedOrbitIds: ['orb-grover', 'orb-kickback'],
    description: 'Traveling Salesperson routing, container vessel scheduling, and multi-modal fleet dispatch over combinatorial graph spaces.',
    algorithms: ['Grover Database Search', 'QUBO Optimization'],
    circuitPreset: {
      num_qubits: 3,
      gates: [
        { gate: 'H', targets: [0], controls: [], step: 0 },
        { gate: 'H', targets: [1], controls: [], step: 0 },
        { gate: 'H', targets: [2], controls: [], step: 0 },
        { gate: 'CZ', targets: [1], controls: [0], step: 1 },
        { gate: 'H', targets: [0], controls: [], step: 2 },
        { gate: 'H', targets: [1], controls: [], step: 2 }
      ],
      name: 'Combinatorial Routing Oracle',
      shots: 1024
    }
  },
  {
    id: 'ind-insurance',
    name: 'P&C Insurance & Risk',
    category: 'Actuarial Modeling',
    icon: <Shield size={18} />,
    connectedOrbitIds: ['orb-qft', 'orb-grover'],
    description: 'Monte Carlo risk aggregation, extreme tail-loss catastrophe modeling with quadratic quantum speedup over classical sampling.',
    algorithms: ['Quantum Monte Carlo', 'Amplitude Estimation'],
    circuitPreset: {
      num_qubits: 2,
      gates: [
        { gate: 'H', targets: [0], controls: [], step: 0 },
        { gate: 'CX', targets: [1], controls: [0], step: 1 },
        { gate: 'RY', targets: [0], controls: [], step: 2, params: [0.65] }
      ],
      name: 'Quantum Monte Carlo Risk Engine',
      shots: 1024
    }
  },
  {
    id: 'ind-cyber',
    name: 'Cybersecurity',
    category: 'Information Security',
    icon: <Bot size={18} />,
    connectedOrbitIds: ['orb-shor', 'orb-qft', 'orb-qec'],
    description: 'Post-quantum lattice cryptography migration, Shor integer factorization vulnerability testing, and entropy harvesting.',
    algorithms: ['Shor Factoring Algorithm', 'Quantum Phase Estimation'],
    circuitPreset: {
      num_qubits: 3,
      gates: [
        { gate: 'H', targets: [0], controls: [], step: 0 },
        { gate: 'H', targets: [1], controls: [], step: 0 },
        { gate: 'CX', targets: [2], controls: [0], step: 1 },
        { gate: 'H', targets: [0], controls: [], step: 2 }
      ],
      name: "Shor's Factoring Subroutine",
      shots: 1024
    }
  }
];

const ORBIT_NODES: OrbitNode[] = [
  {
    id: 'orb-superpos',
    name: 'Hadamard Superposition',
    subroutine: 'H · |0⟩ → |+⟩',
    angle: 0,
    connectedOutcomeIds: ['out-speed', 'out-scale'],
    complexity: 'O(1)',
    description: 'Creates unbiased quantum parallel superposition across 2^n basis states simultaneously.'
  },
  {
    id: 'orb-bell',
    name: 'Entanglement Synthesis',
    subroutine: 'CX(0→1) · (H ⊗ I)',
    angle: Math.PI * 0.25,
    connectedOutcomeIds: ['out-security', 'out-precision'],
    complexity: 'O(1)',
    description: 'Generates non-local Einstein-Podolsky-Rosen (EPR) correlations exceeding Bell-CHSH limits.'
  },
  {
    id: 'orb-kickback',
    name: 'Phase Kickback',
    subroutine: 'U|x⟩|−⟩ = (-1)^f(x)|x⟩|−⟩',
    angle: Math.PI * 0.5,
    connectedOutcomeIds: ['out-speed', 'out-savings'],
    complexity: 'O(1) query',
    description: 'Encodes boolean function answers directly into quantum phase without measuring target registers.'
  },
  {
    id: 'orb-grover',
    name: 'Grover Diffusion',
    subroutine: '2|s⟩⟨s| - I',
    angle: Math.PI * 0.75,
    connectedOutcomeIds: ['out-speed', 'out-savings'],
    complexity: 'O(√N)',
    description: 'Inverts amplitudes about the mean to amplify winning search states with quadratic speedup.'
  },
  {
    id: 'orb-qft',
    name: 'Quantum Fourier Transform',
    subroutine: 'QFT_n',
    angle: Math.PI * 1.0,
    connectedOutcomeIds: ['out-speed', 'out-scale'],
    complexity: 'O(n²)',
    description: 'Performs discrete Fourier transform in Hilbert space exponentially faster than classical FFT O(n 2^n).'
  },
  {
    id: 'orb-vqe',
    name: 'VQE Variational Ansatz',
    subroutine: '|ψ(θ)⟩ = U(θ)|0⟩',
    angle: Math.PI * 1.25,
    connectedOutcomeIds: ['out-precision', 'out-savings'],
    complexity: 'Hybrid NISQ',
    description: 'Optimizes parameterized rotation gates classically to discover molecular ground state energies.'
  },
  {
    id: 'orb-shor',
    name: 'Shor Periodicity',
    subroutine: 'QPE(a^x mod N)',
    angle: Math.PI * 1.5,
    connectedOutcomeIds: ['out-speed', 'out-security'],
    complexity: 'O(n³)',
    description: 'Reduces RSA prime factorization to order-finding via Quantum Phase Estimation.'
  },
  {
    id: 'orb-qec',
    name: 'Syndrome Measurement QEC',
    subroutine: 'Stabilizer Codes',
    angle: Math.PI * 1.75,
    connectedOutcomeIds: ['out-security', 'out-precision'],
    complexity: 'Fault-Tolerant',
    description: 'Detects and corrects bit-flip and phase-flip errors without collapsing quantum superposition.'
  }
];

const OUTCOMES: OutcomeNode[] = [
  {
    id: 'out-savings',
    name: 'Computational Savings',
    speedup: 'Polynomial Cost Reduction',
    description: 'Millions of classical CPU/GPU cluster hours compressed into minutes of quantum processing.'
  },
  {
    id: 'out-speed',
    name: 'Quantum Speedup',
    speedup: 'Exponential & Quadratic',
    description: 'Solves previously intractable combinatorial search and prime factorization problems.'
  },
  {
    id: 'out-precision',
    name: 'Chemical Precision',
    speedup: '< 1 kcal/mol Accuracy',
    description: 'Accurately computes electron correlation energies beyond the Hartree-Fock classical limit.'
  },
  {
    id: 'out-security',
    name: 'Information Security',
    speedup: 'Unconditional Cryptography',
    description: 'Quantum key distribution provides physical proof against eavesdropping via no-cloning theorem.'
  },
  {
    id: 'out-scale',
    name: 'Scale & High Dimension',
    speedup: 'Hilbert 2^n States',
    description: 'Exponential state space representation with merely n physical qubits (50 qubits = 1.12 × 10^15 states).'
  }
];

export const QuantumAdvantageMap: React.FC<QuantumAdvantageMapProps> = ({
  onLoadCircuitToStudio
}) => {
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>('ind-fin');
  const [selectedOrbitId, setSelectedOrbitId] = useState<string | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null);

  // Active highlighted entities
  const activeIndustry = INDUSTRIES.find((ind) => ind.id === selectedIndustryId);

  // Determine active orbit nodes
  const activeOrbitIds = selectedIndustryId
    ? activeIndustry?.connectedOrbitIds || []
    : selectedOutcomeId
    ? ORBIT_NODES.filter((o) => o.connectedOutcomeIds.includes(selectedOutcomeId)).map((o) => o.id)
    : selectedOrbitId
    ? [selectedOrbitId]
    : [];

  // Determine active outcome nodes
  const activeOutcomeIds = selectedIndustryId
    ? Array.from(
        new Set(
          activeOrbitIds.flatMap((oId) => {
            const oNode = ORBIT_NODES.find((o) => o.id === oId);
            return oNode ? oNode.connectedOutcomeIds : [];
          })
        )
      )
    : selectedOutcomeId
    ? [selectedOutcomeId]
    : [];

  // Center hub position in SVG viewBox (1100 x 620)
  const CX = 550;
  const CY = 310;
  const RX = 210;
  const RY = 145;

  // Geometry calculations
  const industryPositions = INDUSTRIES.map((_, idx) => {
    const total = INDUSTRIES.length;
    const y = 60 + idx * ((520 - 60) / (total - 1));
    return { x: 190, y };
  });

  const orbitPositions = ORBIT_NODES.map((orb) => {
    const x = CX + RX * Math.cos(orb.angle);
    const y = CY + RY * Math.sin(orb.angle);
    return { id: orb.id, x, y };
  });

  const outcomePositions = OUTCOMES.map((_, idx) => {
    const total = OUTCOMES.length;
    const y = 90 + idx * ((490 - 90) / (total - 1));
    return { x: 910, y };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-intermediate" style={{ marginBottom: '8px' }}>
              Interactive Learning Session
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 4px 0' }}>
              Quantum Advantage & Industry Constellation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '850px' }}>
              Explore how real-world industrial sectors connect through quantum circuit subroutines to unlock unprecedented computational outcomes. Click on any industry, algorithm, or outcome to light up its quantum pathway!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setSelectedIndustryId(null);
                setSelectedOrbitId(null);
                setSelectedOutcomeId(null);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Show All Connections
            </button>
            {activeIndustry && (
              <button
                onClick={() => onLoadCircuitToStudio(activeIndustry.circuitPreset)}
                className="btn-primary"
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Play size={16} fill="#050811" /> Load {activeIndustry.name} Circuit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          padding: '20px',
          background: 'radial-gradient(ellipse at 50% 50%, #0c1326 0%, #040711 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '640px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.08)'
        }}
      >
        {/* Column Headers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'absolute',
          top: '20px',
          left: '30px',
          right: '30px',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
            Industries & Domains
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--primary-violet)', textTransform: 'uppercase' }}>
            QuantumLab Core Engine & Subroutines
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
            Quantum Outcomes
          </span>
        </div>

        {/* SVG Drawing Surface */}
        <svg
          viewBox="0 0 1100 620"
          style={{ width: '100%', height: '100%', minHeight: '600px', display: 'block' }}
        >
          <defs>
            {/* Cyan Glow Filter */}
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for Connections */}
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Concentric Background Orbital Rings */}
          <ellipse
            cx={CX}
            cy={CY}
            rx={RX}
            ry={RY}
            fill="none"
            stroke="rgba(0, 240, 255, 0.1)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={RX * 0.55}
            ry={RY * 0.55}
            fill="none"
            stroke="rgba(139, 92, 246, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* CONNECTING BEZIER CURVES: Left (Industries) -> Center (Orbits) */}
          {INDUSTRIES.map((ind, indIdx) => {
            const startPos = industryPositions[indIdx];
            const isIndActive = !selectedIndustryId || selectedIndustryId === ind.id;

            return ind.connectedOrbitIds.map((orbId) => {
              const orbPos = orbitPositions.find((o) => o.id === orbId);
              if (!orbPos) return null;

              const isConnectedActive =
                isIndActive && (!selectedOrbitId || selectedOrbitId === orbId);

              // Cubic bezier control points
              const dx = (orbPos.x - startPos.x) * 0.5;
              const d = `M ${startPos.x} ${startPos.y} C ${startPos.x + dx} ${startPos.y}, ${orbPos.x - dx} ${orbPos.y}, ${orbPos.x} ${orbPos.y}`;

              return (
                <g key={`ind-${ind.id}-orb-${orbId}`}>
                  {/* Background faint path */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isConnectedActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)'}
                    strokeWidth={isConnectedActive ? '2.5' : '1'}
                    opacity={isConnectedActive ? 0.9 : 0.12}
                    filter={isConnectedActive ? 'url(#cyanGlow)' : undefined}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Animated glowing pulses for active pathways */}
                  {isConnectedActive && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeDasharray="10 30"
                      opacity="0.85"
                      className="animated-pulse-path"
                    />
                  )}
                </g>
              );
            });
          })}

          {/* CONNECTING BEZIER CURVES: Center (Orbits) -> Right (Outcomes) */}
          {ORBIT_NODES.map((orb) => {
            const orbPos = orbitPositions.find((o) => o.id === orb.id);
            if (!orbPos) return null;

            const isOrbActive = activeOrbitIds.length === 0 || activeOrbitIds.includes(orb.id);

            return orb.connectedOutcomeIds.map((outId) => {
              const outIdx = OUTCOMES.findIndex((o) => o.id === outId);
              if (outIdx === -1) return null;
              const outPos = outcomePositions[outIdx];

              const isPathActive =
                isOrbActive &&
                (activeOutcomeIds.length === 0 || activeOutcomeIds.includes(outId));

              const dx = (outPos.x - orbPos.x) * 0.5;
              const d = `M ${orbPos.x} ${orbPos.y} C ${orbPos.x + dx} ${orbPos.y}, ${outPos.x - dx} ${outPos.y}, ${outPos.x} ${outPos.y}`;

              return (
                <g key={`orb-${orb.id}-out-${outId}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isPathActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)'}
                    strokeWidth={isPathActive ? '2.5' : '1'}
                    opacity={isPathActive ? 0.9 : 0.12}
                    filter={isPathActive ? 'url(#cyanGlow)' : undefined}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {isPathActive && (
                    <path
                      d={d}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="8 24"
                      opacity="0.9"
                      className="animated-pulse-path"
                    />
                  )}
                </g>
              );
            });
          })}

          {/* CENTER ENGINE HUB */}
          <g transform={`translate(${CX}, ${CY})`} style={{ cursor: 'pointer' }}>
            {/* Outer pulsating ring */}
            <circle
              r="48"
              fill="rgba(0, 240, 255, 0.08)"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="1.5"
              filter="url(#cyanGlow)"
            />
            <circle
              r="34"
              fill="#060b18"
              stroke="#00f0ff"
              strokeWidth="2"
            />
            {/* Glowing Icon */}
            <text
              textAnchor="middle"
              dy="6"
              fill="#00f0ff"
              fontSize="20"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              &gt;|
            </text>
            <text
              textAnchor="middle"
              y="58"
              fill="var(--text-dim)"
              fontSize="9"
              letterSpacing="0.15em"
              fontWeight="600"
            >
              QUANTUMLAB ENGINE
            </text>
          </g>

          {/* ORBITAL NODES (Subroutines) */}
          {ORBIT_NODES.map((orb) => {
            const pos = orbitPositions.find((p) => p.id === orb.id);
            if (!pos) return null;

            const isActive = activeOrbitIds.includes(orb.id);

            return (
              <g
                key={orb.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => {
                  setSelectedOrbitId(orb.id === selectedOrbitId ? null : orb.id);
                  setSelectedIndustryId(null);
                }}
                style={{ cursor: 'pointer', transition: 'all 0.25s ease' }}
              >
                {/* Node backdrop pill */}
                <rect
                  x="-65"
                  y="-18"
                  width="130"
                  height="36"
                  rx="18"
                  fill={isActive ? '#09152b' : '#070b16'}
                  stroke={isActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isActive ? '2' : '1'}
                  filter={isActive ? 'url(#cyanGlow)' : undefined}
                />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={isActive ? '#00f0ff' : 'var(--text-muted)'}
                  fontSize="10"
                  fontWeight={isActive ? '700' : '500'}
                  fontFamily="var(--font-sans)"
                >
                  {orb.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* HTML OVERLAY: Left Column Cards (Industries) */}
        <div style={{
          position: 'absolute',
          top: '55px',
          left: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '210px',
          zIndex: 20
        }}>
          {INDUSTRIES.map((ind) => {
            const isSelected = selectedIndustryId === ind.id;
            return (
              <div
                key={ind.id}
                onClick={() => {
                  setSelectedIndustryId(isSelected ? null : ind.id);
                  setSelectedOrbitId(null);
                  setSelectedOutcomeId(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(7, 12, 26, 0.85)',
                  border: isSelected ? '2px solid #00f0ff' : '1px solid var(--border-glass)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#050811' : 'var(--primary-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {ind.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#fff' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ind.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: isSelected ? 'var(--primary-cyan)' : 'var(--text-dim)' }}>
                    {ind.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HTML OVERLAY: Right Column Cards (Outcomes) */}
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '180px',
          zIndex: 20
        }}>
          {OUTCOMES.map((out) => {
            const isHighlighted = activeOutcomeIds.includes(out.id);
            return (
              <div
                key={out.id}
                onClick={() => {
                  setSelectedOutcomeId(selectedOutcomeId === out.id ? null : out.id);
                  setSelectedIndustryId(null);
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '24px',
                  background: isHighlighted ? 'rgba(0, 240, 255, 0.15)' : 'rgba(7, 12, 26, 0.85)',
                  border: isHighlighted ? '2px solid #00f0ff' : '1px solid var(--border-glass)',
                  boxShadow: isHighlighted ? '0 0 20px rgba(0, 240, 255, 0.35)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isHighlighted ? '#00f0ff' : 'var(--text-main)' }}>
                  {out.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: isHighlighted ? '#38bdf8' : 'var(--text-dim)', marginTop: '2px' }}>
                  {out.speedup}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector Card for the Selected Entity */}
      {activeIndustry && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            background: 'linear-gradient(135deg, rgba(7, 12, 28, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-advanced">{activeIndustry.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-amber)', fontWeight: 600 }}>
                {activeIndustry.algorithms.join(' • ')}
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '4px 0' }}>
              {activeIndustry.name}: Quantum Transformation Pathway
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '6px 0 0 0' }}>
              {activeIndustry.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onLoadCircuitToStudio(activeIndustry.circuitPreset)}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Play size={16} fill="#050811" /> Launch Circuit in Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
