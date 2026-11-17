from typing import List, Optional
from backend.app.models.schemas import (
    ModuleContent,
    QuizQuestion,
    CodingChallenge,
    CircuitDefinition,
    GateOperation
)

class CourseService:
    def __init__(self):
        self._modules: List[ModuleContent] = [
            # ================= TRACK A: FOUNDATIONS =================
            ModuleContent(
                id="mod-1",
                title="1. Foundations of Qubits & Superposition",
                track="Foundations",
                level="Beginner",
                summary="Explore the quantum bit (qubit), Dirac bra-ket notation, and create your first superposition state using the Hadamard gate.",
                theory_markdown=r"""# Module 1: Foundations of Qubits & Superposition

In classical computing, the fundamental unit of information is a **bit**, which exists in one of two deterministic states: `0` or `1`.

In quantum computing, the fundamental unit is the **quantum bit (qubit)**. A qubit state $|\psi\rangle$ can be in a linear combination (superposition) of the computational basis states $|0\rangle$ and $|1\rangle$:

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$$

where $\alpha$ and $\beta$ are complex numbers called **probability amplitudes** satisfying normalization:

$$|\alpha|^2 + |\beta|^2 = 1$$

### The Hadamard Gate ($H$)
The Hadamard gate rotates a computational basis state into an equal superposition:

$$H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle$$
$$H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}} = |-\rangle$$

When measuring in the standard basis:
- Probability of measuring $0$: $P(0) = |1/\sqrt{2}|^2 = 0.5$ (50%)
- Probability of measuring $1$: $P(1) = |1/\sqrt{2}|^2 = 0.5$ (50%)
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=1,
                    gates=[GateOperation(gate="H", targets=[0], step=0)],
                    name="Equal Superposition State |+⟩"
                ),
                quiz=[
                    QuizQuestion(
                        id="q1-1",
                        question="If a qubit is in state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩, what is the probability of measuring 0?",
                        options=["0%", "25%", "50%", "100%"],
                        correct_option_index=2,
                        explanation="The probability is |1/√2|² = 1/2 = 50%."
                    ),
                    QuizQuestion(
                        id="q1-2",
                        question="What happens when you apply two consecutive Hadamard gates (H · H) to |0⟩?",
                        options=["It remains in equal superposition", "It returns to |0⟩ because H is unitary and Hermitian (H² = I)", "It flips to |1⟩", "The state decoheres"],
                        correct_option_index=1,
                        explanation="The Hadamard gate is self-inverse: H · H = I."
                    )
                ],
                challenge=CodingChallenge(
                    id="ch-1",
                    title="Prepare the |−⟩ Superposition State",
                    description="Construct a circuit that transforms the ground state |0⟩ into |−⟩ = (|0⟩ - |1⟩)/√2.",
                    hints=["Flip the qubit from |0⟩ to |1⟩ using an X gate first, then apply Hadamard."],
                    starter_circuit=CircuitDefinition(num_qubits=1, gates=[], name="Prepare |−⟩ Challenge")
                )
            ),
            ModuleContent(
                id="mod-2",
                title="2. Single-Qubit Gates & The Bloch Sphere",
                track="Foundations",
                level="Beginner",
                summary="Master Pauli gates (X, Y, Z), phase gates (S, T), and arbitrary 3D Bloch sphere rotations.",
                theory_markdown=r"""# Module 2: Single-Qubit Gates & The Bloch Sphere

The **Bloch Sphere** represents any single-qubit pure state on a unit sphere in $\mathbb{R}^3$:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

- $\theta \in [0, \pi]$ controls relative probabilities ($P(0) = \cos^2(\theta/2)$)
- $\phi \in [0, 2\pi)$ controls the relative phase

### Key Gates:
1. **Pauli-X (NOT)**: $\pi$ rotation about X-axis ($X|0\rangle = |1\rangle, X|1\rangle = |0\rangle$)
2. **Pauli-Y**: $\pi$ rotation about Y-axis ($Y|0\rangle = i|1\rangle, Y|1\rangle = -i|0\rangle$)
3. **Pauli-Z**: $\pi$ phase flip about Z-axis ($Z|0\rangle = |0\rangle, Z|1\rangle = -|1\rangle$)
4. **S Gate**: $\pi/2$ phase rotation ($S = \sqrt{Z}$)
5. **T Gate**: $\pi/4$ phase rotation ($T = \sqrt{S}$)
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=1,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="S", targets=[0], step=1),
                        GateOperation(gate="T", targets=[0], step=2)
                    ],
                    name="Phase Evolution along the Equator"
                ),
                quiz=[
                    QuizQuestion(
                        id="q2-1",
                        question="Which Pauli gate introduces a relative phase of π (-1) to the |1⟩ state without altering |0⟩?",
                        options=["Pauli-X", "Pauli-Y", "Pauli-Z", "Hadamard"],
                        correct_option_index=2,
                        explanation="The Pauli-Z gate leaves |0⟩ unchanged and maps |1⟩ to -|1⟩."
                    )
                ]
            ),
            ModuleContent(
                id="mod-3",
                title="3. Quantum Entanglement & Bell States",
                track="Foundations",
                level="Intermediate",
                summary="Build multi-qubit systems, examine the CNOT gate, and generate maximally entangled Bell states.",
                theory_markdown=r"""# Module 3: Quantum Entanglement & Bell States

**Entanglement** is a uniquely quantum correlation where the quantum state of each particle cannot be described independently of the others.

### Creating the Bell State $|\Phi^+\rangle$:
Starting from $|00\rangle$:
1. Apply $H$ on $q_0$: $\frac{|0\rangle + |1\rangle}{\sqrt{2}} \otimes |0\rangle = \frac{|00\rangle + |10\rangle}{\sqrt{2}}$
2. Apply $CX$ (control $q_0$, target $q_1$):
   $$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$

Measuring qubit 0 immediately determines qubit 1 with 100% correlation!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="CX", targets=[1], controls=[0], step=1)
                    ],
                    name="Canonical Bell State |Φ+⟩"
                ),
                quiz=[
                    QuizQuestion(
                        id="q3-1",
                        question="In the Bell state (|00⟩ + |11⟩)/√2, what is the probability of measuring |01⟩?",
                        options=["50%", "25%", "0%", "100%"],
                        correct_option_index=2,
                        explanation="Amplitudes for |01⟩ and |10⟩ are exactly zero."
                    )
                ],
                challenge=CodingChallenge(
                    id="ch-3",
                    title="Construct the |Ψ+⟩ Bell State",
                    description="Create the entangled state (|01⟩ + |10⟩)/√2 starting from |00⟩.",
                    hints=["Apply an X gate to q1, then H to q0, then CX(q0 -> q1)."],
                    starter_circuit=CircuitDefinition(num_qubits=2, gates=[], name="Bell State |Ψ+⟩ Challenge")
                )
            ),

            # ================= TRACK B: QUERY ALGORITHMS =================
            ModuleContent(
                id="mod-4",
                title="4. Phase Kickback & Deutsch-Jozsa Algorithm",
                track="Query Algorithms",
                level="Intermediate",
                summary="Harness quantum phase kickback to determine if an unknown boolean function is constant or balanced in a single query.",
                theory_markdown=r"""# Module 4: Phase Kickback & Deutsch-Jozsa Algorithm

Given a black-box boolean function $f: \{0,1\}^n \to \{0,1\}$, determine whether $f$ is:
- **Constant** ($f(x)$ is same for all $x$)
- **Balanced** ($f(x) = 0$ for half of inputs, $1$ for the other half)

### Complexity:
- **Classical**: $\mathcal{O}(2^{n-1} + 1)$ queries in worst case.
- **Deutsch-Jozsa**: $\mathcal{O}(1)$ (exactly **one query**)!

### Phase Kickback:
When oracle $|x\rangle |y\rangle \to |x\rangle |y \oplus f(x)\rangle$ acts on $|-\rangle$:
$$|x\rangle |-\rangle \to (-1)^{f(x)} |x\rangle |-\rangle$$
Interference on the input register yields $|00...0\rangle$ if constant, and non-zero if balanced!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        GateOperation(gate="X", targets=[1], step=0),
                        GateOperation(gate="H", targets=[0], step=1),
                        GateOperation(gate="H", targets=[1], step=1),
                        GateOperation(gate="CX", targets=[1], controls=[0], step=2),
                        GateOperation(gate="H", targets=[0], step=3)
                    ],
                    name="Deutsch Algorithm (Balanced Oracle)"
                ),
                quiz=[
                    QuizQuestion(
                        id="q4-1",
                        question="If measuring the input register in Deutsch-Jozsa yields all zeros |0...0⟩, what is f?",
                        options=["Balanced", "Constant", "Undefined", "Decoherent"],
                        correct_option_index=1,
                        explanation="Constructive interference on |0...0⟩ happens if and only if f is constant."
                    )
                ]
            ),
            ModuleContent(
                id="mod-5",
                title="5. Bernstein-Vazirani Algorithm",
                track="Query Algorithms",
                level="Intermediate",
                summary="Find an unknown n-bit secret string s embedded in a dot-product oracle f(x) = s · x with a single quantum evaluation.",
                theory_markdown=r"""# Module 5: Bernstein-Vazirani Algorithm

Suppose we have an oracle calculating the inner product $f(x) = s \cdot x \pmod 2$ for a hidden string $s \in \{0,1\}^n$.

### Complexity:
- **Classical**: Requires $n$ independent queries ($x = 1000..., 0100..., \dots$) to uncover each bit.
- **Quantum**: Solves for the entire $n$-bit string in **a single query** ($\mathcal{O}(1)$)!

### Circuit Workflow:
1. Initialize $n$ query qubits to $|0\rangle$ and 1 target qubit to $|1\rangle$.
2. Apply Hadamards across all $n+1$ qubits.
3. Apply Oracle $U_f$: for each bit $i$ where $s_i = 1$, apply a CNOT with control $q_i$ and target $q_{\text{ancilla}}$.
4. Apply Hadamards across all input qubits.
5. Measuring the input qubits yields the secret string $s$ with 100% certainty!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=3,
                    gates=[
                        # Secret string s = '11' (q0=1, q1=1)
                        GateOperation(gate="X", targets=[2], step=0),
                        GateOperation(gate="H", targets=[0], step=1),
                        GateOperation(gate="H", targets=[1], step=1),
                        GateOperation(gate="H", targets=[2], step=1),
                        # Oracle for s = 11: CX from q0->q2 and q1->q2
                        GateOperation(gate="CX", targets=[2], controls=[0], step=2),
                        GateOperation(gate="CX", targets=[2], controls=[1], step=3),
                        # Final Hadamards on inputs
                        GateOperation(gate="H", targets=[0], step=4),
                        GateOperation(gate="H", targets=[1], step=4)
                    ],
                    name="Bernstein-Vazirani (Secret s = 11)"
                ),
                quiz=[
                    QuizQuestion(
                        id="q5-1",
                        question="How many queries does Bernstein-Vazirani take to discover an n-bit secret string s?",
                        options=["n queries", "2ⁿ queries", "1 query", "n/2 queries"],
                        correct_option_index=2,
                        explanation="Bernstein-Vazirani discovers all n bits of s in exactly 1 quantum query."
                    )
                ],
                challenge=CodingChallenge(
                    id="ch-5",
                    title="Find Secret String s = 10",
                    description="Implement Bernstein-Vazirani for secret s = '10' (q0 = 0, q1 = 1, ancilla = q2).",
                    hints=["Only apply CNOT from the qubit where bit is 1 (q1 -> q2). Do not apply CNOT from q0."],
                    starter_circuit=CircuitDefinition(num_qubits=3, gates=[], name="BV s=10 Challenge")
                )
            ),
            ModuleContent(
                id="mod-6",
                title="6. Simon's Algorithm & Periodicity",
                track="Query Algorithms",
                level="Advanced",
                summary="The historical inspiration for Shor's algorithm: uncover a hidden 2-to-1 XOR period with exponential quantum speedup.",
                theory_markdown=r"""# Module 6: Simon's Algorithm & Periodicity

Given a function $f: \{0,1\}^n \to \{0,1\}^n$ guaranteed to satisfy:
$$f(x) = f(y) \iff x \oplus y \in \{0^n, s\}$$
where $s \in \{0,1\}^n$ is an unknown hidden period string.

### Complexity Separation:
- **Classical**: $\Omega(2^{n/2})$ queries by birthday paradox.
- **Simon's Algorithm**: $\mathcal{O}(n)$ queries and polynomial classical linear system solving!

This was the first proof of an **exponential quantum speedup** relative to an oracle in bounded-error quantum polynomial time ($\text{BQP}$).
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=4,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="H", targets=[1], step=0),
                        # Oracle for period s = 11: Copy q0 to q2, CX q0/q1 to q3
                        GateOperation(gate="CX", targets=[2], controls=[0], step=1),
                        GateOperation(gate="CX", targets=[3], controls=[0], step=2),
                        GateOperation(gate="CX", targets=[3], controls=[1], step=3),
                        GateOperation(gate="H", targets=[0], step=4),
                        GateOperation(gate="H", targets=[1], step=4)
                    ],
                    name="Simon's Algorithm (2-bit period s=11)"
                ),
                quiz=[
                    QuizQuestion(
                        id="q6-1",
                        question="What kind of speedup does Simon's algorithm provide over classical query complexity?",
                        options=["Quadratic speedup", "Exponential speedup", "Logarithmic speedup", "No speedup"],
                        correct_option_index=1,
                        explanation="Simon's algorithm provides an exponential separation (O(n) vs O(2^(n/2)))."
                    )
                ]
            ),

            # ================= TRACK C: ADVANCED ALGORITHMS =================
            ModuleContent(
                id="mod-7",
                title="7. Quantum Search: Grover's Algorithm",
                track="Advanced Algorithms",
                level="Advanced",
                summary="Implement amplitude amplification and achieve quadratic speedup for unstructured database search.",
                theory_markdown=r"""# Module 7: Quantum Search: Grover's Algorithm

Searching an unsorted database of $N = 2^n$ items classically requires $\mathcal{O}(N)$ queries. **Grover's Algorithm** finds the marked item in:

$$\mathcal{O}(\sqrt{N}) \text{ queries}$$

### The Two Steps of Grover Iteration:
1. **Oracle ($U_w$)**: Flips phase of marked state $|w\rangle$:
   $$U_w = I - 2|w\rangle\langle w|$$
2. **Diffusion Operator ($U_s$)**: Inversion about the mean amplitude:
   $$U_s = 2|s\rangle\langle s| - I$$
   where $|s\rangle = H^{\otimes n}|0\rangle$ is uniform superposition.

Each iteration rotates the state vector closer to $|w\rangle$ until measuring yields $|w\rangle$ with near 100% probability!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="H", targets=[1], step=0),
                        GateOperation(gate="CZ", targets=[1], controls=[0], step=1),
                        GateOperation(gate="H", targets=[0], step=2),
                        GateOperation(gate="H", targets=[1], step=2),
                        GateOperation(gate="X", targets=[0], step=3),
                        GateOperation(gate="X", targets=[1], step=3),
                        GateOperation(gate="CZ", targets=[1], controls=[0], step=4),
                        GateOperation(gate="X", targets=[0], step=5),
                        GateOperation(gate="X", targets=[1], step=5),
                        GateOperation(gate="H", targets=[0], step=6),
                        GateOperation(gate="H", targets=[1], step=6)
                    ],
                    name="Grover's 2-Qubit Search (Marked State |11⟩)"
                ),
                quiz=[
                    QuizQuestion(
                        id="q7-1",
                        question="For a 2-qubit database (N = 4), how many Grover iterations are needed for 100% fidelity?",
                        options=["1 iteration", "2 iterations", "4 iterations", "√2 iterations"],
                        correct_option_index=0,
                        explanation="For N=4, exactly 1 iteration rotates the state completely onto the target."
                    )
                ]
            ),
            ModuleContent(
                id="mod-8",
                title="8. Quantum Fourier Transform (QFT)",
                track="Advanced Algorithms",
                level="Advanced",
                summary="The quantum analog of discrete Fourier transform, powering Shor's factoring and phase estimation.",
                theory_markdown=r"""# Module 8: Quantum Fourier Transform (QFT)

The **Quantum Fourier Transform** transforms computational basis states $|j\rangle$ into the Fourier frequency basis:

$$|j\rangle \mapsto \frac{1}{\sqrt{2^n}}\sum_{k=0}^{2^n-1} e^{2\pi i j k / 2^n} |k\rangle$$

### Complexity:
- Classical Fast Fourier Transform: $\mathcal{O}(n 2^n)$ operations.
- Quantum Fourier Transform: $\mathcal{O}(n^2)$ gates!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="S", targets=[0], controls=[1], step=1),
                        GateOperation(gate="H", targets=[1], step=2),
                        GateOperation(gate="SWAP", targets=[0, 1], step=3)
                    ],
                    name="2-Qubit Quantum Fourier Transform"
                ),
                quiz=[
                    QuizQuestion(
                        id="q8-1",
                        question="What is the gate complexity of QFT for n qubits?",
                        options=["O(n²)", "O(2ⁿ)", "O(n log n)", "O(1)"],
                        correct_option_index=0,
                        explanation="QFT requires n(n+1)/2 gates, which scales as O(n²)."
                    )
                ]
            ),
            ModuleContent(
                id="mod-9",
                title="9. Quantum Phase Estimation (QPE)",
                track="Advanced Algorithms",
                level="Advanced",
                summary="Estimate the unknown phase θ of an eigenvalue U|u⟩ = e^(2πiθ)|u⟩ with exponential precision.",
                theory_markdown=r"""# Module 9: Quantum Phase Estimation (QPE)

Many quantum algorithms (including Shor's algorithm and quantum chemistry simulation) reduce to **estimating the phase** $\theta$ of an eigenvalue of a unitary operator:

$$U|\psi\rangle = e^{2\pi i \theta}|\psi\rangle$$

### Architecture:
1. Initialize counting register of $t$ qubits in equal superposition ($H^{\otimes t}$).
2. Apply controlled-$U^{2^j}$ operations between counting qubits and the eigenstate register.
3. Apply Inverse Quantum Fourier Transform ($\text{QFT}^\dagger$) on the counting register.
4. Measuring the counting register reveals the binary expansion of $\theta$!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        # Counting qubit q0, eigenstate q1 = |1>
                        GateOperation(gate="X", targets=[1], step=0),
                        GateOperation(gate="H", targets=[0], step=1),
                        # Controlled-T gate gives phase theta = 1/8
                        GateOperation(gate="T", targets=[1], controls=[0], step=2),
                        GateOperation(gate="H", targets=[0], step=3)
                    ],
                    name="1-Bit Quantum Phase Estimation"
                ),
                quiz=[
                    QuizQuestion(
                        id="q9-1",
                        question="What inverse operation transforms the entangled phase information into readable measurement bits in QPE?",
                        options=["Inverse QFT (QFT†)", "Diffusion operator", "Hadamard alone", "Pauli-X matrix"],
                        correct_option_index=0,
                        explanation="Inverse QFT decodes the phase stored in Fourier basis back into computational basis bitstrings."
                    )
                ]
            ),
            ModuleContent(
                id="mod-10",
                title="10. Shor's Factoring Algorithm",
                track="Advanced Algorithms",
                level="Advanced",
                summary="Understand order-finding and how Shor's algorithm factors large composite integers in polynomial time.",
                theory_markdown=r"""# Module 10: Shor's Factoring Algorithm

Factoring a large integer $N = p \cdot q$ is classically intractable (the basis of RSA encryption).

**Shor's Algorithm** factors integers in **polynomial time** $\mathcal{O}((\log N)^2 (\log \log N))$ by converting factoring into **period/order finding**:

Given coprime $a < N$, find the smallest integer $r$ such that:
$$a^r \equiv 1 \pmod N$$

Once the even period $r$ is found via Quantum Phase Estimation on the modular multiplication operator $U_a|y\rangle = |a y \pmod N\rangle$, classical greatest common divisor $\gcd(a^{r/2} \pm 1, N)$ reveals the non-trivial prime factors!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=3,
                    gates=[
                        GateOperation(gate="H", targets=[0], step=0),
                        GateOperation(gate="H", targets=[1], step=0),
                        GateOperation(gate="X", targets=[2], step=0),
                        # Modular multiplier toy model: swap/control
                        GateOperation(gate="CX", targets=[2], controls=[1], step=1),
                        GateOperation(gate="SWAP", targets=[0, 1], step=2),
                        GateOperation(gate="H", targets=[0], step=3)
                    ],
                    name="Shor's Order-Finding Modular Subroutine"
                ),
                quiz=[
                    QuizQuestion(
                        id="q10-1",
                        question="What classical mathematical operation extracts factors from the period r in Shor's algorithm?",
                        options=["Greatest Common Divisor (GCD / Euclidean Algorithm)", "Fast Fourier Transform", "Matrix determinant", "Gradient Descent"],
                        correct_option_index=0,
                        explanation="Euclid's GCD algorithm computes gcd(a^(r/2) ± 1, N) in polynomial time."
                    )
                ]
            ),

            # ================= TRACK D: QML & FAULT-TOLERANCE =================
            ModuleContent(
                id="mod-11",
                title="11. Variational Quantum Eigensolver (VQE) & QML",
                track="QML & Fault-Tolerance",
                level="Advanced",
                summary="Construct Parameterized Quantum Circuits (Ansatz) and hybrid classical-quantum optimization loops for molecular ground states.",
                theory_markdown=r"""# Module 11: Variational Quantum Eigensolver (VQE) & QML

In the Noisy Intermediate-Scale Quantum (NISQ) era, deep circuits suffer from noise. **VQE** is a hybrid classical-quantum algorithm:

### The Variational Principle:
For any Hamiltonian $H$, the ground state energy $E_0$ is a lower bound for the expectation value of any trial state $|\psi(\vec{\theta})\rangle$:
$$\langle \psi(\vec{\theta}) | H | \psi(\vec{\theta})\rangle \ge E_0$$

### Hybrid Workflow:
1. **Quantum Processor**: Prepares parameterized trial state $|\psi(\vec{\theta})\rangle$ with rotation gates $R_y(\theta), R_z(\theta)$ and entangling CNOTs, then measures expectation value $\langle H \rangle$.
2. **Classical Optimizer**: Computes gradient $\nabla_\theta \langle H \rangle$ and updates parameters $\vec{\theta}$ until convergence.
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=2,
                    gates=[
                        GateOperation(gate="RY", targets=[0], params=[0.785], step=0),
                        GateOperation(gate="RY", targets=[1], params=[1.571], step=0),
                        GateOperation(gate="CX", targets=[1], controls=[0], step=1),
                        GateOperation(gate="RY", targets=[0], params=[0.392], step=2),
                        GateOperation(gate="RY", targets=[1], params=[0.392], step=2)
                    ],
                    name="2-Qubit Hardware-Efficient VQE Ansatz"
                ),
                quiz=[
                    QuizQuestion(
                        id="q11-1",
                        question="In VQE, which component updates the circuit rotation angles θ to minimize the energy?",
                        options=["A classical optimizer (e.g. COBYLA, Adam)", "A quantum oracle", "A Hadamard transform", "The quantum register directly"],
                        correct_option_index=0,
                        explanation="VQE is hybrid: quantum measures expectation value, classical optimizer updates angles."
                    )
                ],
                challenge=CodingChallenge(
                    id="ch-11",
                    title="Design an Entangled VQE Ansatz",
                    description="Create a 2-qubit parameterized ansatz using RY rotations and an entangling CNOT gate.",
                    hints=["Place RY on q0 and q1, followed by CX(q0 -> q1)."],
                    starter_circuit=CircuitDefinition(num_qubits=2, gates=[], name="VQE Ansatz Challenge")
                )
            ),
            ModuleContent(
                id="mod-12",
                title="12. Quantum Error Correction: 3-Qubit Bit-Flip Code",
                track="QML & Fault-Tolerance",
                level="Advanced",
                summary="Protect quantum information from environmental noise using syndrome measurement and quantum error correction codes.",
                theory_markdown=r"""# Module 12: Quantum Error Correction (QEC)

Quantum states cannot be cloned (No-Cloning Theorem), and measurement collapses superposition. How can we protect qubits against noise?

### The 3-Qubit Bit-Flip Code:
Encodes 1 logical qubit into 3 physical qubits:
$$|0_L\rangle = |000\rangle$$
$$|1_L\rangle = |111\rangle$$

An unknown state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ is encoded as:
$$|\psi_L\rangle = \alpha|000\rangle + \beta|111\rangle$$

If an environmental bit-flip noise occurs on qubit 1 ($\to \alpha|010\rangle + \beta|110\rangle$), **syndrome measurement** detects which qubit flipped without reading or destroying the superposed amplitudes $\alpha$ and $\beta$!
""",
                preset_circuit=CircuitDefinition(
                    num_qubits=3,
                    gates=[
                        # State preparation on q0: H gives (|0>+|1>)/sqrt(2)
                        GateOperation(gate="H", targets=[0], step=0),
                        # Encoding into 3 qubits:
                        GateOperation(gate="CX", targets=[1], controls=[0], step=1),
                        GateOperation(gate="CX", targets=[2], controls=[0], step=2),
                        # Simulated bit-flip error on q1:
                        GateOperation(gate="X", targets=[1], step=3)
                    ],
                    name="3-Qubit Bit-Flip Code with Simulated Noise"
                ),
                quiz=[
                    QuizQuestion(
                        id="q12-1",
                        question="Why cannot quantum error correction simply make backup copies of unknown quantum states?",
                        options=["The No-Cloning Theorem forbids copying unknown quantum states", "Heisenberg uncertainty makes energy infinite", "Classical memory is faster", "Qubits are always binary"],
                        correct_option_index=0,
                        explanation="The No-Cloning theorem proves it is impossible to create an identical copy of an arbitrary unknown quantum state."
                    )
                ]
            )
        ]

    def get_all_modules(self) -> List[ModuleContent]:
        return self._modules

    def get_modules_by_track(self, track: str) -> List[ModuleContent]:
        return [m for m in self._modules if m.track.lower() == track.lower()]

    def get_module(self, module_id: str) -> Optional[ModuleContent]:
        for m in self._modules:
            if m.id == module_id:
                return m
        return None

course_service = CourseService()
