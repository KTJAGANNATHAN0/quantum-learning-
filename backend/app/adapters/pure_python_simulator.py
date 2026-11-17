import time
import math
import cmath
import random
from typing import List, Dict, Tuple, Optional
from backend.app.models.schemas import (
    CircuitDefinition,
    SimulationResult,
    ComplexAmplitude,
    BlochVector,
    GateOperation
)

class PureQuantumSimulator:
    """
    High-performance, pure-Python exact quantum statevector simulator.
    Operates with zero C-extension/DLL dependencies, making it 100% resilient
    across all platforms, sandboxes, and Windows Application Control environments.
    """

    GATE_MATRICES = {
        "H": (
            (1.0 / math.sqrt(2), 1.0 / math.sqrt(2)),
            (1.0 / math.sqrt(2), -1.0 / math.sqrt(2))
        ),
        "X": (
            (0.0, 1.0),
            (1.0, 0.0)
        ),
        "Y": (
            (0.0, -1.0j),
            (1.0j, 0.0)
        ),
        "Z": (
            (1.0, 0.0),
            (0.0, -1.0)
        ),
        "S": (
            (1.0, 0.0),
            (0.0, 1.0j)
        ),
        "T": (
            (1.0, 0.0),
            (0.0, cmath.exp(1.0j * math.pi / 4.0))
        )
    }

    def _apply_single_qubit_gate(self, state: List[complex], n: int, qubit: int, matrix: Tuple[Tuple[complex, complex], Tuple[complex, complex]]) -> List[complex]:
        m00, m01 = matrix[0]
        m10, m11 = matrix[1]
        new_state = list(state)
        step = 1 << qubit

        for k in range(0, 1 << n, step << 1):
            for j in range(step):
                i0 = k + j
                i1 = i0 + step
                v0 = state[i0]
                v1 = state[i1]
                new_state[i0] = m00 * v0 + m01 * v1
                new_state[i1] = m10 * v0 + m11 * v1

        return new_state

    def _apply_controlled_gate(self, state: List[complex], n: int, control: int, target: int, matrix: Tuple[Tuple[complex, complex], Tuple[complex, complex]]) -> List[complex]:
        m00, m01 = matrix[0]
        m10, m11 = matrix[1]
        new_state = list(state)
        ctrl_mask = 1 << control
        target_step = 1 << target

        for i in range(1 << n):
            # Apply only if control bit is 1 and target bit is 0
            if (i & ctrl_mask) and not (i & target_step):
                i0 = i
                i1 = i + target_step
                v0 = state[i0]
                v1 = state[i1]
                new_state[i0] = m00 * v0 + m01 * v1
                new_state[i1] = m10 * v0 + m11 * v1

        return new_state

    def _apply_swap(self, state: List[complex], n: int, q1: int, q2: int) -> List[complex]:
        new_state = list(state)
        mask1 = 1 << q1
        mask2 = 1 << q2
        for i in range(1 << n):
            bit1 = 1 if (i & mask1) else 0
            bit2 = 1 if (i & mask2) else 0
            if bit1 != bit2 and bit1 == 0:
                partner = (i ^ mask1) ^ mask2
                new_state[i], new_state[partner] = state[partner], state[i]
        return new_state

    def _apply_ccx(self, state: List[complex], n: int, c1: int, c2: int, target: int) -> List[complex]:
        new_state = list(state)
        mask = (1 << c1) | (1 << c2)
        target_step = 1 << target
        for i in range(1 << n):
            if (i & mask) == mask and not (i & target_step):
                partner = i + target_step
                new_state[i], new_state[partner] = state[partner], state[i]
        return new_state

    def _compute_bloch_vectors(self, state: List[complex], n: int) -> List[BlochVector]:
        vectors = []
        for q in range(n):
            rho00 = 0.0
            rho11 = 0.0
            rho01 = 0.0j

            mask = 1 << q
            for i in range(1 << n):
                if not (i & mask):
                    partner = i + mask
                    rho00 += (state[i].real**2 + state[i].imag**2)
                    rho11 += (state[partner].real**2 + state[partner].imag**2)
                    rho01 += state[i] * state[partner].conjugate()

            x = float(2.0 * rho01.real)
            y = float(-2.0 * rho01.imag)
            z = float(rho00 - rho11)

            z_clamped = max(-1.0, min(1.0, z))
            theta = float(math.acos(z_clamped))
            phi = float(math.atan2(y, x))
            if phi < 0:
                phi += 2.0 * math.pi

            vectors.append(
                BlochVector(
                    qubit=q,
                    x=round(x, 4),
                    y=round(y, 4),
                    z=round(z, 4),
                    theta=round(theta, 4),
                    phi=round(phi, 4),
                    p0=round(rho00, 4),
                    p1=round(rho11, 4)
                )
            )
        return vectors

    def _sample_counts(self, probabilities: Dict[str, float], shots: int) -> Dict[str, int]:
        states = list(probabilities.keys())
        weights = list(probabilities.values())
        samples = random.choices(states, weights=weights, k=shots)
        counts = {}
        for s in samples:
            counts[s] = counts.get(s, 0) + 1
        return counts

    def _apply_gate(self, state: List[complex], n: int, g: GateOperation) -> List[complex]:
        gate_name = g.gate.upper()
        t = g.targets
        c = g.controls or []
        p = g.params or []

        if not t:
            return state

        if gate_name in self.GATE_MATRICES:
            return self._apply_single_qubit_gate(state, n, t[0], self.GATE_MATRICES[gate_name])
        elif gate_name == "RX":
            angle = p[0] if p else math.pi / 2.0
            mat = (
                (math.cos(angle / 2.0), -1.0j * math.sin(angle / 2.0)),
                (-1.0j * math.sin(angle / 2.0), math.cos(angle / 2.0))
            )
            return self._apply_single_qubit_gate(state, n, t[0], mat)
        elif gate_name == "RY":
            angle = p[0] if p else math.pi / 2.0
            mat = (
                (math.cos(angle / 2.0), -math.sin(angle / 2.0)),
                (math.sin(angle / 2.0), math.cos(angle / 2.0))
            )
            return self._apply_single_qubit_gate(state, n, t[0], mat)
        elif gate_name == "RZ":
            angle = p[0] if p else math.pi / 2.0
            mat = (
                (cmath.exp(-1.0j * angle / 2.0), 0.0),
                (0.0, cmath.exp(1.0j * angle / 2.0))
            )
            return self._apply_single_qubit_gate(state, n, t[0], mat)
        elif gate_name in ("CX", "CNOT") and c:
            return self._apply_controlled_gate(state, n, c[0], t[0], self.GATE_MATRICES["X"])
        elif gate_name == "CZ" and c:
            return self._apply_controlled_gate(state, n, c[0], t[0], self.GATE_MATRICES["Z"])
        elif gate_name == "SWAP" and len(t) >= 2:
            return self._apply_swap(state, n, t[0], t[1])
        elif gate_name in ("CCX", "TOFFOLI") and len(c) >= 2:
            return self._apply_ccx(state, n, c[0], c[1], t[0])
        return state

    def _generate_qiskit_code(self, n: int, sorted_gates: List[GateOperation]) -> str:
        qiskit_lines = [
            "# Generated Qiskit Code for Quantum Learning Platform",
            "from qiskit import QuantumCircuit",
            "from qiskit.quantum_info import Statevector",
            "",
            f"qc = QuantumCircuit({n})",
            ""
        ]
        for g in sorted_gates:
            gn = g.gate.upper()
            t = g.targets
            c = g.controls or []
            p = g.params or []
            if gn == "H": qiskit_lines.append(f"qc.h({t[0]})")
            elif gn == "X": qiskit_lines.append(f"qc.x({t[0]})")
            elif gn == "Y": qiskit_lines.append(f"qc.y({t[0]})")
            elif gn == "Z": qiskit_lines.append(f"qc.z({t[0]})")
            elif gn == "S": qiskit_lines.append(f"qc.s({t[0]})")
            elif gn == "T": qiskit_lines.append(f"qc.t({t[0]})")
            elif gn == "RX": qiskit_lines.append(f"qc.rx({(p[0] if p else 1.57):.4f}, {t[0]})")
            elif gn == "RY": qiskit_lines.append(f"qc.ry({(p[0] if p else 1.57):.4f}, {t[0]})")
            elif gn == "RZ": qiskit_lines.append(f"qc.rz({(p[0] if p else 1.57):.4f}, {t[0]})")
            elif gn in ("CX", "CNOT") and c: qiskit_lines.append(f"qc.cx({c[0]}, {t[0]})")
            elif gn == "CZ" and c: qiskit_lines.append(f"qc.cz({c[0]}, {t[0]})")
            elif gn == "SWAP" and len(t) >= 2: qiskit_lines.append(f"qc.swap({t[0]}, {t[1]})")
            elif gn in ("CCX", "TOFFOLI") and len(c) >= 2: qiskit_lines.append(f"qc.ccx({c[0]}, {c[1]}, {t[0]})")

        qiskit_lines.extend(["", "state = Statevector.from_instruction(qc)", "print(state)"])
        return "\n".join(qiskit_lines)

    def simulate(self, circuit: CircuitDefinition) -> SimulationResult:
        start_time = time.time()
        n = circuit.num_qubits
        state = [0.0j] * (1 << n)
        state[0] = 1.0 + 0.0j # Initial state |0...0>

        sorted_gates = sorted(circuit.gates, key=lambda g: (g.step, g.targets[0] if g.targets else 0))

        for g in sorted_gates:
            state = self._apply_gate(state, n, g)

        probabilities = {}
        amplitudes = []
        for i, val in enumerate(state):
            bitstring = bin(i)[2:].zfill(n)
            prob = float(val.real**2 + val.imag**2)
            probabilities[bitstring] = round(prob, 5)
            amplitudes.append(
                ComplexAmplitude(
                    state=bitstring,
                    real=round(val.real, 5),
                    imag=round(val.imag, 5),
                    probability=round(prob, 5),
                    phase=round(float(cmath.phase(val)), 4)
                )
            )

        shots = circuit.shots or 1024
        counts = self._sample_counts(probabilities, shots)
        bloch_vectors = self._compute_bloch_vectors(state, n)
        exec_time_ms = round((time.time() - start_time) * 1000.0, 2)
        qiskit_code = self._generate_qiskit_code(n, sorted_gates)

        return SimulationResult(
            backend="Quantum Statevector Engine (High-Performance)",
            num_qubits=n,
            circuit_depth=len(circuit.gates),
            gate_count=len(circuit.gates),
            statevector=amplitudes,
            probabilities=probabilities,
            counts=counts,
            bloch_vectors=bloch_vectors,
            execution_time_ms=exec_time_ms,
            qiskit_code=qiskit_code,
            success=True
        )

pure_simulator = PureQuantumSimulator()
