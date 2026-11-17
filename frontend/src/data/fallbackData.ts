export const FALLBACK_DATA = {
  "modules": [
    {
      "id": "mod-1",
      "title": "1. Foundations of Qubits & Superposition",
      "track": "Foundations",
      "level": "Beginner",
      "summary": "Explore the quantum bit (qubit), Dirac bra-ket notation, and create your first superposition state using the Hadamard gate.",
      "theory_markdown": "# Module 1: Foundations of Qubits & Superposition\n\nIn classical computing, the fundamental unit of information is a **bit**, which exists in one of two deterministic states: `0` or `1`.\n\nIn quantum computing, the fundamental unit is the **quantum bit (qubit)**. A qubit state $|\\psi\\rangle$ can be in a linear combination (superposition) of the computational basis states $|0\\rangle$ and $|1\\rangle$:\n\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$\n\nwhere $\\alpha$ and $\\beta$ are complex numbers called **probability amplitudes** satisfying normalization:\n\n$$|\\alpha|^2 + |\\beta|^2 = 1$$\n\n### The Hadamard Gate ($H$)\nThe Hadamard gate rotates a computational basis state into an equal superposition:\n\n$$H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle$$\n$$H|1\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}} = |-\\rangle$$\n\nWhen measuring in the standard basis:\n- Probability of measuring $0$: $P(0) = |1/\\sqrt{2}|^2 = 0.5$ (50%)\n- Probability of measuring $1$: $P(1) = |1/\\sqrt{2}|^2 = 0.5$ (50%)\n",
      "preset_circuit": {
        "num_qubits": 1,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          }
        ],
        "name": "Equal Superposition State |+\u27e9",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q1-1",
          "question": "If a qubit is in state |\u03c8\u27e9 = (1/\u221a2)|0\u27e9 + (1/\u221a2)|1\u27e9, what is the probability of measuring 0?",
          "options": [
            "0%",
            "25%",
            "50%",
            "100%"
          ],
          "correct_option_index": 2,
          "explanation": "The probability is |1/\u221a2|\u00b2 = 1/2 = 50%."
        },
        {
          "id": "q1-2",
          "question": "What happens when you apply two consecutive Hadamard gates (H \u00b7 H) to |0\u27e9?",
          "options": [
            "It remains in equal superposition",
            "It returns to |0\u27e9 because H is unitary and Hermitian (H\u00b2 = I)",
            "It flips to |1\u27e9",
            "The state decoheres"
          ],
          "correct_option_index": 1,
          "explanation": "The Hadamard gate is self-inverse: H \u00b7 H = I."
        }
      ],
      "challenge": {
        "id": "ch-1",
        "title": "Prepare the |\u2212\u27e9 Superposition State",
        "description": "Construct a circuit that transforms the ground state |0\u27e9 into |\u2212\u27e9 = (|0\u27e9 - |1\u27e9)/\u221a2.",
        "target_statevector": null,
        "target_probabilities": null,
        "hints": [
          "Flip the qubit from |0\u27e9 to |1\u27e9 using an X gate first, then apply Hadamard."
        ],
        "starter_circuit": {
          "num_qubits": 1,
          "gates": [],
          "name": "Prepare |\u2212\u27e9 Challenge",
          "shots": 1024,
          "backend": "qiskit_aer"
        }
      }
    },
    {
      "id": "mod-2",
      "title": "2. Single-Qubit Gates & The Bloch Sphere",
      "track": "Foundations",
      "level": "Beginner",
      "summary": "Master Pauli gates (X, Y, Z), phase gates (S, T), and arbitrary 3D Bloch sphere rotations.",
      "theory_markdown": "# Module 2: Single-Qubit Gates & The Bloch Sphere\n\nThe **Bloch Sphere** represents any single-qubit pure state on a unit sphere in $\\mathbb{R}^3$:\n\n$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$\n\n- $\\theta \\in [0, \\pi]$ controls relative probabilities ($P(0) = \\cos^2(\\theta/2)$)\n- $\\phi \\in [0, 2\\pi)$ controls the relative phase\n\n### Key Gates:\n1. **Pauli-X (NOT)**: $\\pi$ rotation about X-axis ($X|0\\rangle = |1\\rangle, X|1\\rangle = |0\\rangle$)\n2. **Pauli-Y**: $\\pi$ rotation about Y-axis ($Y|0\\rangle = i|1\\rangle, Y|1\\rangle = -i|0\\rangle$)\n3. **Pauli-Z**: $\\pi$ phase flip about Z-axis ($Z|0\\rangle = |0\\rangle, Z|1\\rangle = -|1\\rangle$)\n4. **S Gate**: $\\pi/2$ phase rotation ($S = \\sqrt{Z}$)\n5. **T Gate**: $\\pi/4$ phase rotation ($T = \\sqrt{S}$)\n",
      "preset_circuit": {
        "num_qubits": 1,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "S",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "T",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 2
          }
        ],
        "name": "Phase Evolution along the Equator",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q2-1",
          "question": "Which Pauli gate introduces a relative phase of \u03c0 (-1) to the |1\u27e9 state without altering |0\u27e9?",
          "options": [
            "Pauli-X",
            "Pauli-Y",
            "Pauli-Z",
            "Hadamard"
          ],
          "correct_option_index": 2,
          "explanation": "The Pauli-Z gate leaves |0\u27e9 unchanged and maps |1\u27e9 to -|1\u27e9."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-3",
      "title": "3. Quantum Entanglement & Bell States",
      "track": "Foundations",
      "level": "Intermediate",
      "summary": "Build multi-qubit systems, examine the CNOT gate, and generate maximally entangled Bell states.",
      "theory_markdown": "# Module 3: Quantum Entanglement & Bell States\n\n**Entanglement** is a uniquely quantum correlation where the quantum state of each particle cannot be described independently of the others.\n\n### Creating the Bell State $|\\Phi^+\\rangle$:\nStarting from $|00\\rangle$:\n1. Apply $H$ on $q_0$: $\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$\n2. Apply $CX$ (control $q_0$, target $q_1$):\n   $$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$\n\nMeasuring qubit 0 immediately determines qubit 1 with 100% correlation!\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "CX",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 1
          }
        ],
        "name": "Canonical Bell State |\u03a6+\u27e9",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q3-1",
          "question": "In the Bell state (|00\u27e9 + |11\u27e9)/\u221a2, what is the probability of measuring |01\u27e9?",
          "options": [
            "50%",
            "25%",
            "0%",
            "100%"
          ],
          "correct_option_index": 2,
          "explanation": "Amplitudes for |01\u27e9 and |10\u27e9 are exactly zero."
        }
      ],
      "challenge": {
        "id": "ch-3",
        "title": "Construct the |\u03a8+\u27e9 Bell State",
        "description": "Create the entangled state (|01\u27e9 + |10\u27e9)/\u221a2 starting from |00\u27e9.",
        "target_statevector": null,
        "target_probabilities": null,
        "hints": [
          "Apply an X gate to q1, then H to q0, then CX(q0 -> q1)."
        ],
        "starter_circuit": {
          "num_qubits": 2,
          "gates": [],
          "name": "Bell State |\u03a8+\u27e9 Challenge",
          "shots": 1024,
          "backend": "qiskit_aer"
        }
      }
    },
    {
      "id": "mod-4",
      "title": "4. Phase Kickback & Deutsch-Jozsa Algorithm",
      "track": "Query Algorithms",
      "level": "Intermediate",
      "summary": "Harness quantum phase kickback to determine if an unknown boolean function is constant or balanced in a single query.",
      "theory_markdown": "# Module 4: Phase Kickback & Deutsch-Jozsa Algorithm\n\nGiven a black-box boolean function $f: \\{0,1\\}^n \\to \\{0,1\\}$, determine whether $f$ is:\n- **Constant** ($f(x)$ is same for all $x$)\n- **Balanced** ($f(x) = 0$ for half of inputs, $1$ for the other half)\n\n### Complexity:\n- **Classical**: $\\mathcal{O}(2^{n-1} + 1)$ queries in worst case.\n- **Deutsch-Jozsa**: $\\mathcal{O}(1)$ (exactly **one query**)!\n\n### Phase Kickback:\nWhen oracle $|x\\rangle |y\\rangle \\to |x\\rangle |y \\oplus f(x)\\rangle$ acts on $|-\\rangle$:\n$$|x\\rangle |-\\rangle \\to (-1)^{f(x)} |x\\rangle |-\\rangle$$\nInterference on the input register yields $|00...0\\rangle$ if constant, and non-zero if balanced!\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "X",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "CX",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 2
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 3
          }
        ],
        "name": "Deutsch Algorithm (Balanced Oracle)",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q4-1",
          "question": "If measuring the input register in Deutsch-Jozsa yields all zeros |0...0\u27e9, what is f?",
          "options": [
            "Balanced",
            "Constant",
            "Undefined",
            "Decoherent"
          ],
          "correct_option_index": 1,
          "explanation": "Constructive interference on |0...0\u27e9 happens if and only if f is constant."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-5",
      "title": "5. Bernstein-Vazirani Algorithm",
      "track": "Query Algorithms",
      "level": "Intermediate",
      "summary": "Find an unknown n-bit secret string s embedded in a dot-product oracle f(x) = s \u00b7 x with a single quantum evaluation.",
      "theory_markdown": "# Module 5: Bernstein-Vazirani Algorithm\n\nSuppose we have an oracle calculating the inner product $f(x) = s \\cdot x \\pmod 2$ for a hidden string $s \\in \\{0,1\\}^n$.\n\n### Complexity:\n- **Classical**: Requires $n$ independent queries ($x = 1000..., 0100..., \\dots$) to uncover each bit.\n- **Quantum**: Solves for the entire $n$-bit string in **a single query** ($\\mathcal{O}(1)$)!\n\n### Circuit Workflow:\n1. Initialize $n$ query qubits to $|0\\rangle$ and 1 target qubit to $|1\\rangle$.\n2. Apply Hadamards across all $n+1$ qubits.\n3. Apply Oracle $U_f$: for each bit $i$ where $s_i = 1$, apply a CNOT with control $q_i$ and target $q_{\\text{ancilla}}$.\n4. Apply Hadamards across all input qubits.\n5. Measuring the input qubits yields the secret string $s$ with 100% certainty!\n",
      "preset_circuit": {
        "num_qubits": 3,
        "gates": [
          {
            "gate": "X",
            "targets": [
              2
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "H",
            "targets": [
              2
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "CX",
            "targets": [
              2
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 2
          },
          {
            "gate": "CX",
            "targets": [
              2
            ],
            "controls": [
              1
            ],
            "params": [],
            "step": 3
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 4
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 4
          }
        ],
        "name": "Bernstein-Vazirani (Secret s = 11)",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q5-1",
          "question": "How many queries does Bernstein-Vazirani take to discover an n-bit secret string s?",
          "options": [
            "n queries",
            "2\u207f queries",
            "1 query",
            "n/2 queries"
          ],
          "correct_option_index": 2,
          "explanation": "Bernstein-Vazirani discovers all n bits of s in exactly 1 quantum query."
        }
      ],
      "challenge": {
        "id": "ch-5",
        "title": "Find Secret String s = 10",
        "description": "Implement Bernstein-Vazirani for secret s = '10' (q0 = 0, q1 = 1, ancilla = q2).",
        "target_statevector": null,
        "target_probabilities": null,
        "hints": [
          "Only apply CNOT from the qubit where bit is 1 (q1 -> q2). Do not apply CNOT from q0."
        ],
        "starter_circuit": {
          "num_qubits": 3,
          "gates": [],
          "name": "BV s=10 Challenge",
          "shots": 1024,
          "backend": "qiskit_aer"
        }
      }
    },
    {
      "id": "mod-6",
      "title": "6. Simon's Algorithm & Periodicity",
      "track": "Query Algorithms",
      "level": "Advanced",
      "summary": "The historical inspiration for Shor's algorithm: uncover a hidden 2-to-1 XOR period with exponential quantum speedup.",
      "theory_markdown": "# Module 6: Simon's Algorithm & Periodicity\n\nGiven a function $f: \\{0,1\\}^n \\to \\{0,1\\}^n$ guaranteed to satisfy:\n$$f(x) = f(y) \\iff x \\oplus y \\in \\{0^n, s\\}$$\nwhere $s \\in \\{0,1\\}^n$ is an unknown hidden period string.\n\n### Complexity Separation:\n- **Classical**: $\\Omega(2^{n/2})$ queries by birthday paradox.\n- **Simon's Algorithm**: $\\mathcal{O}(n)$ queries and polynomial classical linear system solving!\n\nThis was the first proof of an **exponential quantum speedup** relative to an oracle in bounded-error quantum polynomial time ($\\text{BQP}$).\n",
      "preset_circuit": {
        "num_qubits": 4,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "CX",
            "targets": [
              2
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "CX",
            "targets": [
              3
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 2
          },
          {
            "gate": "CX",
            "targets": [
              3
            ],
            "controls": [
              1
            ],
            "params": [],
            "step": 3
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 4
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 4
          }
        ],
        "name": "Simon's Algorithm (2-bit period s=11)",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q6-1",
          "question": "What kind of speedup does Simon's algorithm provide over classical query complexity?",
          "options": [
            "Quadratic speedup",
            "Exponential speedup",
            "Logarithmic speedup",
            "No speedup"
          ],
          "correct_option_index": 1,
          "explanation": "Simon's algorithm provides an exponential separation (O(n) vs O(2^(n/2)))."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-7",
      "title": "7. Quantum Search: Grover's Algorithm",
      "track": "Advanced Algorithms",
      "level": "Advanced",
      "summary": "Implement amplitude amplification and achieve quadratic speedup for unstructured database search.",
      "theory_markdown": "# Module 7: Quantum Search: Grover's Algorithm\n\nSearching an unsorted database of $N = 2^n$ items classically requires $\\mathcal{O}(N)$ queries. **Grover's Algorithm** finds the marked item in:\n\n$$\\mathcal{O}(\\sqrt{N}) \\text{ queries}$$\n\n### The Two Steps of Grover Iteration:\n1. **Oracle ($U_w$)**: Flips phase of marked state $|w\\rangle$:\n   $$U_w = I - 2|w\\rangle\\langle w|$$\n2. **Diffusion Operator ($U_s$)**: Inversion about the mean amplitude:\n   $$U_s = 2|s\\rangle\\langle s| - I$$\n   where $|s\\rangle = H^{\\otimes n}|0\\rangle$ is uniform superposition.\n\nEach iteration rotates the state vector closer to $|w\\rangle$ until measuring yields $|w\\rangle$ with near 100% probability!\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "CZ",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 2
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 2
          },
          {
            "gate": "X",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 3
          },
          {
            "gate": "X",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 3
          },
          {
            "gate": "CZ",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 4
          },
          {
            "gate": "X",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 5
          },
          {
            "gate": "X",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 5
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 6
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 6
          }
        ],
        "name": "Grover's 2-Qubit Search (Marked State |11\u27e9)",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q7-1",
          "question": "For a 2-qubit database (N = 4), how many Grover iterations are needed for 100% fidelity?",
          "options": [
            "1 iteration",
            "2 iterations",
            "4 iterations",
            "\u221a2 iterations"
          ],
          "correct_option_index": 0,
          "explanation": "For N=4, exactly 1 iteration rotates the state completely onto the target."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-8",
      "title": "8. Quantum Fourier Transform (QFT)",
      "track": "Advanced Algorithms",
      "level": "Advanced",
      "summary": "The quantum analog of discrete Fourier transform, powering Shor's factoring and phase estimation.",
      "theory_markdown": "# Module 8: Quantum Fourier Transform (QFT)\n\nThe **Quantum Fourier Transform** transforms computational basis states $|j\\rangle$ into the Fourier frequency basis:\n\n$$|j\\rangle \\mapsto \\frac{1}{\\sqrt{2^n}}\\sum_{k=0}^{2^n-1} e^{2\\pi i j k / 2^n} |k\\rangle$$\n\n### Complexity:\n- Classical Fast Fourier Transform: $\\mathcal{O}(n 2^n)$ operations.\n- Quantum Fourier Transform: $\\mathcal{O}(n^2)$ gates!\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "S",
            "targets": [
              0
            ],
            "controls": [
              1
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 2
          },
          {
            "gate": "SWAP",
            "targets": [
              0,
              1
            ],
            "controls": [],
            "params": [],
            "step": 3
          }
        ],
        "name": "2-Qubit Quantum Fourier Transform",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q8-1",
          "question": "What is the gate complexity of QFT for n qubits?",
          "options": [
            "O(n\u00b2)",
            "O(2\u207f)",
            "O(n log n)",
            "O(1)"
          ],
          "correct_option_index": 0,
          "explanation": "QFT requires n(n+1)/2 gates, which scales as O(n\u00b2)."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-9",
      "title": "9. Quantum Phase Estimation (QPE)",
      "track": "Advanced Algorithms",
      "level": "Advanced",
      "summary": "Estimate the unknown phase \u03b8 of an eigenvalue U|u\u27e9 = e^(2\u03c0i\u03b8)|u\u27e9 with exponential precision.",
      "theory_markdown": "# Module 9: Quantum Phase Estimation (QPE)\n\nMany quantum algorithms (including Shor's algorithm and quantum chemistry simulation) reduce to **estimating the phase** $\\theta$ of an eigenvalue of a unitary operator:\n\n$$U|\\psi\\rangle = e^{2\\pi i \\theta}|\\psi\\rangle$$\n\n### Architecture:\n1. Initialize counting register of $t$ qubits in equal superposition ($H^{\\otimes t}$).\n2. Apply controlled-$U^{2^j}$ operations between counting qubits and the eigenstate register.\n3. Apply Inverse Quantum Fourier Transform ($\\text{QFT}^\\dagger$) on the counting register.\n4. Measuring the counting register reveals the binary expansion of $\\theta$!\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "X",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 1
          },
          {
            "gate": "T",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 2
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 3
          }
        ],
        "name": "1-Bit Quantum Phase Estimation",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q9-1",
          "question": "What inverse operation transforms the entangled phase information into readable measurement bits in QPE?",
          "options": [
            "Inverse QFT (QFT\u2020)",
            "Diffusion operator",
            "Hadamard alone",
            "Pauli-X matrix"
          ],
          "correct_option_index": 0,
          "explanation": "Inverse QFT decodes the phase stored in Fourier basis back into computational basis bitstrings."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-10",
      "title": "10. Shor's Factoring Algorithm",
      "track": "Advanced Algorithms",
      "level": "Advanced",
      "summary": "Understand order-finding and how Shor's algorithm factors large composite integers in polynomial time.",
      "theory_markdown": "# Module 10: Shor's Factoring Algorithm\n\nFactoring a large integer $N = p \\cdot q$ is classically intractable (the basis of RSA encryption).\n\n**Shor's Algorithm** factors integers in **polynomial time** $\\mathcal{O}((\\log N)^2 (\\log \\log N))$ by converting factoring into **period/order finding**:\n\nGiven coprime $a < N$, find the smallest integer $r$ such that:\n$$a^r \\equiv 1 \\pmod N$$\n\nOnce the even period $r$ is found via Quantum Phase Estimation on the modular multiplication operator $U_a|y\\rangle = |a y \\pmod N\\rangle$, classical greatest common divisor $\\gcd(a^{r/2} \\pm 1, N)$ reveals the non-trivial prime factors!\n",
      "preset_circuit": {
        "num_qubits": 3,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "H",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "X",
            "targets": [
              2
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "CX",
            "targets": [
              2
            ],
            "controls": [
              1
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "SWAP",
            "targets": [
              0,
              1
            ],
            "controls": [],
            "params": [],
            "step": 2
          },
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 3
          }
        ],
        "name": "Shor's Order-Finding Modular Subroutine",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q10-1",
          "question": "What classical mathematical operation extracts factors from the period r in Shor's algorithm?",
          "options": [
            "Greatest Common Divisor (GCD / Euclidean Algorithm)",
            "Fast Fourier Transform",
            "Matrix determinant",
            "Gradient Descent"
          ],
          "correct_option_index": 0,
          "explanation": "Euclid's GCD algorithm computes gcd(a^(r/2) \u00b1 1, N) in polynomial time."
        }
      ],
      "challenge": null
    },
    {
      "id": "mod-11",
      "title": "11. Variational Quantum Eigensolver (VQE) & QML",
      "track": "QML & Fault-Tolerance",
      "level": "Advanced",
      "summary": "Construct Parameterized Quantum Circuits (Ansatz) and hybrid classical-quantum optimization loops for molecular ground states.",
      "theory_markdown": "# Module 11: Variational Quantum Eigensolver (VQE) & QML\n\nIn the Noisy Intermediate-Scale Quantum (NISQ) era, deep circuits suffer from noise. **VQE** is a hybrid classical-quantum algorithm:\n\n### The Variational Principle:\nFor any Hamiltonian $H$, the ground state energy $E_0$ is a lower bound for the expectation value of any trial state $|\\psi(\\vec{\\theta})\\rangle$:\n$$\\langle \\psi(\\vec{\\theta}) | H | \\psi(\\vec{\\theta})\\rangle \\ge E_0$$\n\n### Hybrid Workflow:\n1. **Quantum Processor**: Prepares parameterized trial state $|\\psi(\\vec{\\theta})\\rangle$ with rotation gates $R_y(\\theta), R_z(\\theta)$ and entangling CNOTs, then measures expectation value $\\langle H \\rangle$.\n2. **Classical Optimizer**: Computes gradient $\\nabla_\\theta \\langle H \\rangle$ and updates parameters $\\vec{\\theta}$ until convergence.\n",
      "preset_circuit": {
        "num_qubits": 2,
        "gates": [
          {
            "gate": "RY",
            "targets": [
              0
            ],
            "controls": [],
            "params": [
              0.785
            ],
            "step": 0
          },
          {
            "gate": "RY",
            "targets": [
              1
            ],
            "controls": [],
            "params": [
              1.571
            ],
            "step": 0
          },
          {
            "gate": "CX",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "RY",
            "targets": [
              0
            ],
            "controls": [],
            "params": [
              0.392
            ],
            "step": 2
          },
          {
            "gate": "RY",
            "targets": [
              1
            ],
            "controls": [],
            "params": [
              0.392
            ],
            "step": 2
          }
        ],
        "name": "2-Qubit Hardware-Efficient VQE Ansatz",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q11-1",
          "question": "In VQE, which component updates the circuit rotation angles \u03b8 to minimize the energy?",
          "options": [
            "A classical optimizer (e.g. COBYLA, Adam)",
            "A quantum oracle",
            "A Hadamard transform",
            "The quantum register directly"
          ],
          "correct_option_index": 0,
          "explanation": "VQE is hybrid: quantum measures expectation value, classical optimizer updates angles."
        }
      ],
      "challenge": {
        "id": "ch-11",
        "title": "Design an Entangled VQE Ansatz",
        "description": "Create a 2-qubit parameterized ansatz using RY rotations and an entangling CNOT gate.",
        "target_statevector": null,
        "target_probabilities": null,
        "hints": [
          "Place RY on q0 and q1, followed by CX(q0 -> q1)."
        ],
        "starter_circuit": {
          "num_qubits": 2,
          "gates": [],
          "name": "VQE Ansatz Challenge",
          "shots": 1024,
          "backend": "qiskit_aer"
        }
      }
    },
    {
      "id": "mod-12",
      "title": "12. Quantum Error Correction: 3-Qubit Bit-Flip Code",
      "track": "QML & Fault-Tolerance",
      "level": "Advanced",
      "summary": "Protect quantum information from environmental noise using syndrome measurement and quantum error correction codes.",
      "theory_markdown": "# Module 12: Quantum Error Correction (QEC)\n\nQuantum states cannot be cloned (No-Cloning Theorem), and measurement collapses superposition. How can we protect qubits against noise?\n\n### The 3-Qubit Bit-Flip Code:\nEncodes 1 logical qubit into 3 physical qubits:\n$$|0_L\\rangle = |000\\rangle$$\n$$|1_L\\rangle = |111\\rangle$$\n\nAn unknown state $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$ is encoded as:\n$$|\\psi_L\\rangle = \\alpha|000\\rangle + \\beta|111\\rangle$$\n\nIf an environmental bit-flip noise occurs on qubit 1 ($\\to \\alpha|010\\rangle + \\beta|110\\rangle$), **syndrome measurement** detects which qubit flipped without reading or destroying the superposed amplitudes $\\alpha$ and $\\beta$!\n",
      "preset_circuit": {
        "num_qubits": 3,
        "gates": [
          {
            "gate": "H",
            "targets": [
              0
            ],
            "controls": [],
            "params": [],
            "step": 0
          },
          {
            "gate": "CX",
            "targets": [
              1
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 1
          },
          {
            "gate": "CX",
            "targets": [
              2
            ],
            "controls": [
              0
            ],
            "params": [],
            "step": 2
          },
          {
            "gate": "X",
            "targets": [
              1
            ],
            "controls": [],
            "params": [],
            "step": 3
          }
        ],
        "name": "3-Qubit Bit-Flip Code with Simulated Noise",
        "shots": 1024,
        "backend": "qiskit_aer"
      },
      "quiz": [
        {
          "id": "q12-1",
          "question": "Why cannot quantum error correction simply make backup copies of unknown quantum states?",
          "options": [
            "The No-Cloning Theorem forbids copying unknown quantum states",
            "Heisenberg uncertainty makes energy infinite",
            "Classical memory is faster",
            "Qubits are always binary"
          ],
          "correct_option_index": 0,
          "explanation": "The No-Cloning theorem proves it is impossible to create an identical copy of an arbitrary unknown quantum state."
        }
      ],
      "challenge": null
    }
  ],
  "diagnostic": [
    {
      "id": "diag-1",
      "question": "What is the classical equivalent of a superposition state?",
      "options": [
        "A probabilistic bit (e.g. coin flip)",
        "A transistor in switch state",
        "A NAND gate",
        "There is no direct classical equivalent"
      ],
      "correct": 3
    },
    {
      "id": "diag-2",
      "question": "Which mathematical construct describes a single qubit state vector?",
      "options": [
        "Unit vector in 2D Hilbert space \u2102\u00b2",
        "Scalar real number",
        "Boolean flag",
        "3D vector in \u211d\u00b3 exclusively"
      ],
      "correct": 0
    },
    {
      "id": "diag-3",
      "question": "What gate is used to create entanglement starting from |00\u27e9?",
      "options": [
        "Pauli-X",
        "Hadamard followed by CNOT",
        "Toffoli alone",
        "SWAP"
      ],
      "correct": 1
    },
    {
      "id": "diag-4",
      "question": "What speedup does Grover's search algorithm provide over classical search?",
      "options": [
        "Exponential speedup",
        "Quadratic speedup (O(\u221aN))",
        "Linear speedup",
        "Zero speedup"
      ],
      "correct": 1
    }
  ],
  "exam": [
    {
      "id": "exam-1",
      "question": "What is the normalization condition for statevector |\u03c8\u27e9 = \u03b1|0\u27e9 + \u03b2|1\u27e9?",
      "options": [
        "\u03b1 + \u03b2 = 1",
        "|\u03b1|\u00b2 + |\u03b2|\u00b2 = 1",
        "\u03b1 \u00b7 \u03b2 = 0",
        "|\u03b1| + |\u03b2| = 1"
      ],
      "category": "Foundations"
    },
    {
      "id": "exam-2",
      "question": "On the Bloch sphere, which state corresponds to polar coordinates \u03b8 = \u03c0/2 and \u03c6 = 0?",
      "options": [
        "|0\u27e9",
        "|1\u27e9",
        "|+\u27e9 = (|0\u27e9 + |1\u27e9)/\u221a2",
        "|-i\u27e9"
      ],
      "category": "Foundations"
    },
    {
      "id": "exam-3",
      "question": "What is the matrix product of two consecutive Hadamard gates (H \u00b7 H)?",
      "options": [
        "Pauli-X",
        "Pauli-Z",
        "Identity Matrix (I)",
        "Zero Matrix"
      ],
      "category": "Gates"
    },
    {
      "id": "exam-4",
      "question": "In the maximally entangled Bell state |\u03a6+\u27e9 = (|00\u27e9 + |11\u27e9)/\u221a2, what is the single-qubit reduced density matrix for qubit 0?",
      "options": [
        "|0\u27e9\u27e80|",
        "Maximally mixed state I/2 (Bloch vector radius r = 0)",
        "|+\u27e9\u27e8+|",
        "Pure state with r = 1"
      ],
      "category": "Entanglement"
    },
    {
      "id": "exam-5",
      "question": "How many queries does the Deutsch-Jozsa algorithm require to evaluate if a boolean function is constant or balanced?",
      "options": [
        "2\u207f\u207b\u00b9 + 1",
        "n queries",
        "Exactly 1 query",
        "O(\u221aN) queries"
      ],
      "category": "Query Algorithms"
    },
    {
      "id": "exam-6",
      "question": "In Bernstein-Vazirani, what mechanism causes the secret string s to appear directly upon measuring the input register?",
      "options": [
        "Phase kickback from the ancilla qubit",
        "Quantum decoherence",
        "Classical parity checking",
        "Modular exponentiation"
      ],
      "category": "Query Algorithms"
    },
    {
      "id": "exam-7",
      "question": "What is the computational purpose of the Grover diffusion operator (2|s\u27e9\u27e8s| - I)?",
      "options": [
        "Inversion about the mean amplitude to amplify the marked state",
        "Randomizing the quantum phase",
        "Measuring all qubits simultaneously",
        "Resetting qubits to |0\u27e9"
      ],
      "category": "Grover Search"
    },
    {
      "id": "exam-8",
      "question": "What is the gate complexity of the Quantum Fourier Transform (QFT) on n qubits?",
      "options": [
        "O(2\u207f)",
        "O(n\u00b2)",
        "O(n log n)",
        "O(1)"
      ],
      "category": "Fourier Subroutines"
    },
    {
      "id": "exam-9",
      "question": "How does Shor's algorithm reduce the integer factoring problem into a quantum algorithm?",
      "options": [
        "By formulating it as order/period finding via Quantum Phase Estimation",
        "By Grover database search",
        "By direct brute-force division",
        "By neural network regression"
      ],
      "category": "Shor's Algorithm"
    },
    {
      "id": "exam-10",
      "question": "In the Variational Quantum Eigensolver (VQE), what role does the classical computer play?",
      "options": [
        "Optimizing the parameterized rotation angles \u03b8 using gradient descent or COBYLA",
        "Simulating the entire statevector classically",
        "Transpiling CNOT gates",
        "Generating random noise"
      ],
      "category": "Quantum Machine Learning"
    }
  ],
  "cohort": {
    "cohort_name": "Quantum Computing 101 - Fall Cohort",
    "total_students": 32,
    "average_completion_rate": 81.2,
    "average_quiz_score": 87.5,
    "certified_count": 14,
    "modules_progress": [
      {
        "module_id": "mod-1",
        "title": "Foundations of Qubits",
        "completed_count": 32,
        "avg_score": 96
      },
      {
        "module_id": "mod-2",
        "title": "Single-Qubit Gates",
        "completed_count": 31,
        "avg_score": 90
      },
      {
        "module_id": "mod-3",
        "title": "Entanglement & Bell States",
        "completed_count": 29,
        "avg_score": 88
      },
      {
        "module_id": "mod-4",
        "title": "Deutsch-Jozsa",
        "completed_count": 26,
        "avg_score": 82
      },
      {
        "module_id": "mod-5",
        "title": "Bernstein-Vazirani",
        "completed_count": 24,
        "avg_score": 85
      },
      {
        "module_id": "mod-6",
        "title": "Simon's Algorithm",
        "completed_count": 22,
        "avg_score": 80
      },
      {
        "module_id": "mod-7",
        "title": "Grover's Search",
        "completed_count": 20,
        "avg_score": 78
      },
      {
        "module_id": "mod-8",
        "title": "Quantum Fourier Transform",
        "completed_count": 18,
        "avg_score": 74
      },
      {
        "module_id": "mod-9",
        "title": "Quantum Phase Estimation",
        "completed_count": 16,
        "avg_score": 72
      },
      {
        "module_id": "mod-10",
        "title": "Shor's Factoring",
        "completed_count": 15,
        "avg_score": 70
      },
      {
        "module_id": "mod-11",
        "title": "VQE & QML",
        "completed_count": 13,
        "avg_score": 75
      },
      {
        "module_id": "mod-12",
        "title": "Quantum Error Correction",
        "completed_count": 11,
        "avg_score": 69
      }
    ],
    "students": [
      {
        "id": "s-1",
        "name": "Alice Chen",
        "progress_pct": 100,
        "circuits_built": 28,
        "quiz_avg": 98,
        "status": "Certified"
      },
      {
        "id": "s-2",
        "name": "Bob Miller",
        "progress_pct": 92,
        "circuits_built": 23,
        "quiz_avg": 91,
        "status": "Certified"
      },
      {
        "id": "s-3",
        "name": "Clara Novak",
        "progress_pct": 95,
        "circuits_built": 25,
        "quiz_avg": 94,
        "status": "Certified"
      },
      {
        "id": "s-4",
        "name": "David Kim",
        "progress_pct": 75,
        "circuits_built": 18,
        "quiz_avg": 82,
        "status": "On Track"
      },
      {
        "id": "s-5",
        "name": "Elena Rostova",
        "progress_pct": 58,
        "circuits_built": 12,
        "quiz_avg": 76,
        "status": "Needs Review"
      }
    ],
    "custom_assignments": []
  }
} as const;
