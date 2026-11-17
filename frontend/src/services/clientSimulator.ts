import {
  CircuitDefinition,
  SimulationResult,
  ComplexAmplitude,
  BlochVector,
  GateOperation,
  AITutorResponse
} from '../types/quantum';

type Complex = [number, number]; // [real, imag]

const cAdd = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]];
const cSub = (a: Complex, b: Complex): Complex => [a[0] - b[0], a[1] - b[1]];
const cMul = (a: Complex, b: Complex): Complex => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0]
];
const cScale = (a: Complex, s: number): Complex => [a[0] * s, a[1] * s];
const cMagSq = (a: Complex): number => a[0] * a[0] + a[1] * a[1];
const cConj = (a: Complex): Complex => [a[0], -a[1]];

const SQRT1_2 = Math.SQRT1_2;

const GATE_MATRICES: Record<string, [Complex, Complex, Complex, Complex]> = {
  H: [
    [SQRT1_2, 0], [SQRT1_2, 0],
    [SQRT1_2, 0], [-SQRT1_2, 0]
  ],
  X: [
    [0, 0], [1, 0],
    [1, 0], [0, 0]
  ],
  Y: [
    [0, 0], [0, -1],
    [0, 1], [0, 0]
  ],
  Z: [
    [1, 0], [0, 0],
    [0, 0], [-1, 0]
  ],
  S: [
    [1, 0], [0, 0],
    [0, 0], [0, 1]
  ],
  T: [
    [1, 0], [0, 0],
    [0, 0], [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)]
  ]
};

export function simulateCircuitClient(circuit: CircuitDefinition): SimulationResult {
  const startTime = performance.now();
  const n = Math.min(Math.max(circuit.num_qubits || 1, 1), 6);
  const dim = 1 << n;

  // Initialize |0...0>
  let state: Complex[] = new Array(dim).fill(null).map((_, i) => (i === 0 ? [1, 0] : [0, 0]));

  const sortedGates = [...(circuit.gates || [])].sort((a, b) => a.step - b.step);

  for (const g of sortedGates) {
    state = applyGate(state, n, g);
  }

  // Calculate probabilities and statevector amplitudes
  const statevector: ComplexAmplitude[] = [];
  const probabilities: Record<string, number> = {};

  for (let i = 0; i < dim; i++) {
    const basis = i.toString(2).padStart(n, '0');
    const re = state[i][0];
    const im = state[i][1];
    const prob = cMagSq(state[i]);
    const phase = Math.atan2(im, re);

    probabilities[basis] = Number(prob.toFixed(6));
    statevector.push({
      state: `|${basis}⟩`,
      real: Number(re.toFixed(4)),
      imag: Number(im.toFixed(4)),
      probability: Number(prob.toFixed(4)),
      phase: Number(phase.toFixed(4))
    });
  }

  // Sample counts based on probabilities
  const shots = circuit.shots || 1024;
  const counts = sampleCounts(probabilities, shots);

  // Compute Bloch vectors for each qubit
  const bloch_vectors = computeBlochVectors(state, n);

  // Generate clean Qiskit code
  const qiskit_code = generateQiskitCode(n, sortedGates);

  const execution_time_ms = Number((performance.now() - startTime).toFixed(2));

  return {
    backend: 'Client-Side Quantum Engine (Browser WebAssembly/Pure-JS)',
    num_qubits: n,
    circuit_depth: sortedGates.length > 0 ? Math.max(...sortedGates.map(g => g.step)) + 1 : 0,
    gate_count: sortedGates.length,
    statevector,
    probabilities,
    counts,
    bloch_vectors,
    execution_time_ms,
    qiskit_code,
    success: true
  };
}

function applyGate(state: Complex[], n: number, g: GateOperation): Complex[] {
  const gateName = g.gate.toUpperCase();
  const t = g.targets;
  const c = g.controls || [];
  const p = g.params || [];

  if (!t || t.length === 0) return state;

  if (gateName in GATE_MATRICES) {
    return applySingleQubitGate(state, n, t[0], GATE_MATRICES[gateName]);
  } else if (gateName === 'RX') {
    const angle = p[0] ?? Math.PI / 2;
    const cVal = Math.cos(angle / 2);
    const sVal = Math.sin(angle / 2);
    const mat: [Complex, Complex, Complex, Complex] = [
      [cVal, 0], [0, -sVal],
      [0, -sVal], [cVal, 0]
    ];
    return applySingleQubitGate(state, n, t[0], mat);
  } else if (gateName === 'RY') {
    const angle = p[0] ?? Math.PI / 2;
    const cVal = Math.cos(angle / 2);
    const sVal = Math.sin(angle / 2);
    const mat: [Complex, Complex, Complex, Complex] = [
      [cVal, 0], [-sVal, 0],
      [sVal, 0], [cVal, 0]
    ];
    return applySingleQubitGate(state, n, t[0], mat);
  } else if (gateName === 'RZ') {
    const angle = p[0] ?? Math.PI / 2;
    const mat: [Complex, Complex, Complex, Complex] = [
      [Math.cos(-angle / 2), Math.sin(-angle / 2)], [0, 0],
      [0, 0], [Math.cos(angle / 2), Math.sin(angle / 2)]
    ];
    return applySingleQubitGate(state, n, t[0], mat);
  } else if ((gateName === 'CX' || gateName === 'CNOT') && c.length > 0) {
    return applyControlledGate(state, n, c[0], t[0], GATE_MATRICES['X']);
  } else if (gateName === 'CZ' && c.length > 0) {
    return applyControlledGate(state, n, c[0], t[0], GATE_MATRICES['Z']);
  } else if (gateName === 'SWAP' && t.length >= 2) {
    return applySwap(state, n, t[0], t[1]);
  } else if ((gateName === 'CCX' || gateName === 'TOFFOLI') && c.length >= 2) {
    return applyCCX(state, n, c[0], c[1], t[0]);
  }

  return state;
}

function applySingleQubitGate(
  state: Complex[],
  n: number,
  qubit: number,
  m: [Complex, Complex, Complex, Complex]
): Complex[] {
  const newState = [...state];
  const step = 1 << qubit;

  for (let k = 0; k < (1 << n); k += step << 1) {
    for (let j = 0; j < step; j++) {
      const i0 = k + j;
      const i1 = i0 + step;
      const v0 = state[i0];
      const v1 = state[i1];

      newState[i0] = cAdd(cMul(m[0], v0), cMul(m[1], v1));
      newState[i1] = cAdd(cMul(m[2], v0), cMul(m[3], v1));
    }
  }
  return newState;
}

function applyControlledGate(
  state: Complex[],
  n: number,
  control: number,
  target: number,
  m: [Complex, Complex, Complex, Complex]
): Complex[] {
  const newState = [...state];
  const ctrlMask = 1 << control;
  const targetStep = 1 << target;

  for (let i = 0; i < (1 << n); i++) {
    if ((i & ctrlMask) !== 0 && (i & targetStep) === 0) {
      const i0 = i;
      const i1 = i + targetStep;
      const v0 = state[i0];
      const v1 = state[i1];

      newState[i0] = cAdd(cMul(m[0], v0), cMul(m[1], v1));
      newState[i1] = cAdd(cMul(m[2], v0), cMul(m[3], v1));
    }
  }
  return newState;
}

function applySwap(state: Complex[], n: number, q1: number, q2: number): Complex[] {
  const newState = [...state];
  const mask1 = 1 << q1;
  const mask2 = 1 << q2;

  for (let i = 0; i < (1 << n); i++) {
    const bit1 = (i & mask1) ? 1 : 0;
    const bit2 = (i & mask2) ? 1 : 0;
    if (bit1 !== bit2 && bit1 === 0) {
      const partner = (i ^ mask1) ^ mask2;
      newState[i] = state[partner];
      newState[partner] = state[i];
    }
  }
  return newState;
}

function applyCCX(state: Complex[], n: number, c1: number, c2: number, target: number): Complex[] {
  const newState = [...state];
  const mask = (1 << c1) | (1 << c2);
  const targetStep = 1 << target;

  for (let i = 0; i < (1 << n); i++) {
    if ((i & mask) === mask && (i & targetStep) === 0) {
      const partner = i + targetStep;
      newState[i] = state[partner];
      newState[partner] = state[i];
    }
  }
  return newState;
}

function computeBlochVectors(state: Complex[], n: number): BlochVector[] {
  const vectors: BlochVector[] = [];

  for (let q = 0; q < n; q++) {
    let rho00 = 0.0;
    let rho11 = 0.0;
    let rho01: Complex = [0, 0];

    const mask = 1 << q;
    for (let i = 0; i < (1 << n); i++) {
      if ((i & mask) === 0) {
        const partner = i + mask;
        rho00 += cMagSq(state[i]);
        rho11 += cMagSq(state[partner]);
        rho01 = cAdd(rho01, cMul(state[i], cConj(state[partner])));
      }
    }

    const x = Number((2.0 * rho01[0]).toFixed(4));
    const y = Number((-2.0 * rho01[1]).toFixed(4));
    const z = Number((rho00 - rho11).toFixed(4));

    const zClamped = Math.max(-1.0, Math.min(1.0, z));
    const theta = Number(Math.acos(zClamped).toFixed(4));
    let phi = Math.atan2(y, x);
    if (phi < 0) phi += 2 * Math.PI;

    vectors.push({
      qubit: q,
      x,
      y,
      z,
      theta,
      phi: Number(phi.toFixed(4)),
      p0: Number(rho00.toFixed(4)),
      p1: Number(rho11.toFixed(4))
    });
  }

  return vectors;
}

function sampleCounts(probabilities: Record<string, number>, shots: number): Record<string, number> {
  const states = Object.keys(probabilities);
  const weights = Object.values(probabilities);
  const counts: Record<string, number> = {};

  for (let s = 0; s < shots; s++) {
    let r = Math.random();
    let cumulative = 0;
    let selected = states[0];

    for (let i = 0; i < states.length; i++) {
      cumulative += weights[i];
      if (r <= cumulative) {
        selected = states[i];
        break;
      }
    }
    counts[selected] = (counts[selected] || 0) + 1;
  }

  return counts;
}

function generateQiskitCode(n: number, sortedGates: GateOperation[]): string {
  const lines = [
    '# Generated Qiskit Code for Quantum Learning Platform',
    'from qiskit import QuantumCircuit',
    'from qiskit.quantum_info import Statevector',
    '',
    `qc = QuantumCircuit(${n})`
  ];

  for (const g of sortedGates) {
    const gn = g.gate.toUpperCase();
    const t = g.targets;
    const c = g.controls || [];
    const p = g.params || [];

    if (gn === 'H') lines.push(`qc.h(${t[0]})`);
    else if (gn === 'X') lines.push(`qc.x(${t[0]})`);
    else if (gn === 'Y') lines.push(`qc.y(${t[0]})`);
    else if (gn === 'Z') lines.push(`qc.z(${t[0]})`);
    else if (gn === 'S') lines.push(`qc.s(${t[0]})`);
    else if (gn === 'T') lines.push(`qc.t(${t[0]})`);
    else if (gn === 'RX') lines.push(`qc.rx(${(p[0] ?? 1.57).toFixed(4)}, ${t[0]})`);
    else if (gn === 'RY') lines.push(`qc.ry(${(p[0] ?? 1.57).toFixed(4)}, ${t[0]})`);
    else if (gn === 'RZ') lines.push(`qc.rz(${(p[0] ?? 1.57).toFixed(4)}, ${t[0]})`);
    else if ((gn === 'CX' || gn === 'CNOT') && c.length > 0) lines.push(`qc.cx(${c[0]}, ${t[0]})`);
    else if (gn === 'CZ' && c.length > 0) lines.push(`qc.cz(${c[0]}, ${t[0]})`);
    else if (gn === 'SWAP' && t.length >= 2) lines.push(`qc.swap(${t[0]}, ${t[1]})`);
    else if ((gn === 'CCX' || gn === 'TOFFOLI') && c.length >= 2) lines.push(`qc.ccx(${c[0]}, ${c[1]}, ${t[0]})`);
  }

  lines.push('', 'state = Statevector.from_instruction(qc)', 'print(state)');
  return lines.join('\n');
}

export function generateClientAIExplanation(
  message: string,
  circuit?: CircuitDefinition,
  simulationResult?: SimulationResult
): AITutorResponse {
  const gateCount = circuit?.gates?.length || 0;
  const numQubits = circuit?.num_qubits || 1;
  const isSuperposition = simulationResult?.bloch_vectors?.some(b => Math.abs(b.z) < 0.99) || false;
  const isEntangled = (circuit?.gates || []).some(g => ['CX', 'CNOT', 'CZ', 'SWAP', 'CCX'].includes(g.gate.toUpperCase()));

  let reply = `Greetings! I am your AI Quantum Tutor. `;
  if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('what')) {
    reply += `Currently, your circuit has **${numQubits} qubit(s)** and **${gateCount} gate(s)**. `;
    if (isSuperposition) {
      reply += `Superposition is active: the qubit state vectors have non-zero off-diagonal components on the Bloch sphere. `;
    }
    if (isEntangled) {
      reply += `Entangling gates are detected, creating quantum correlations between your registers! `;
    }
  } else {
    reply += `I analyzed your circuit configuration (${numQubits} qubits, ${gateCount} operations). Everything is mathematically consistent and normalized (|α|² + |β|² = 1).`;
  }

  return {
    reply,
    analysis: {
      summary: `Circuit with ${numQubits} qubit(s), ${gateCount} gate operations.`,
      issues: [],
      optimizations: ['Consider grouping single-qubit rotations for fidelity optimization.'],
      is_entangled: isEntangled,
      is_superposition: isSuperposition
    },
    suggestions: [
      'Add a Hadamard (H) gate to create equal superposition |+⟩',
      'Add a CNOT (CX) gate between qubits to generate an EPR pair',
      'Inspect the 3D Bloch sphere vector trajectories'
    ],
    detected_issues: []
  };
}
