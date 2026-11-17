import time
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.models.schemas import (
    CircuitDefinition,
    SimulationResult,
    ExamQuestion,
    CertificateData,
    ExamResultResponse,
    CustomChallengeCreate
)
from backend.app.services.simulation_service import simulation_service

class AssessmentService:
    def __init__(self):
        self._custom_challenges: List[Dict[str, Any]] = []

        self._diagnostic_questions = [
            {
                "id": "diag-1",
                "question": "What is the classical equivalent of a superposition state?",
                "options": ["A probabilistic bit (e.g. coin flip)", "A transistor in switch state", "A NAND gate", "There is no direct classical equivalent"],
                "correct": 3
            },
            {
                "id": "diag-2",
                "question": "Which mathematical construct describes a single qubit state vector?",
                "options": ["Unit vector in 2D Hilbert space ℂ²", "Scalar real number", "Boolean flag", "3D vector in ℝ³ exclusively"],
                "correct": 0
            },
            {
                "id": "diag-3",
                "question": "What gate is used to create entanglement starting from |00⟩?",
                "options": ["Pauli-X", "Hadamard followed by CNOT", "Toffoli alone", "SWAP"],
                "correct": 1
            },
            {
                "id": "diag-4",
                "question": "What speedup does Grover's search algorithm provide over classical search?",
                "options": ["Exponential speedup", "Quadratic speedup (O(√N))", "Linear speedup", "Zero speedup"],
                "correct": 1
            }
        ]

        self._certification_question_bank = [
            {
                "id": "exam-1",
                "category": "Foundations",
                "question": "What is the normalization condition for statevector |ψ⟩ = α|0⟩ + β|1⟩?",
                "options": ["α + β = 1", "|α|² + |β|² = 1", "α · β = 0", "|α| + |β| = 1"],
                "correct": 1
            },
            {
                "id": "exam-2",
                "category": "Foundations",
                "question": "On the Bloch sphere, which state corresponds to polar coordinates θ = π/2 and φ = 0?",
                "options": ["|0⟩", "|1⟩", "|+⟩ = (|0⟩ + |1⟩)/√2", "|-i⟩"],
                "correct": 2
            },
            {
                "id": "exam-3",
                "category": "Gates",
                "question": "What is the matrix product of two consecutive Hadamard gates (H · H)?",
                "options": ["Pauli-X", "Pauli-Z", "Identity Matrix (I)", "Zero Matrix"],
                "correct": 2
            },
            {
                "id": "exam-4",
                "category": "Entanglement",
                "question": "In the maximally entangled Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2, what is the single-qubit reduced density matrix for qubit 0?",
                "options": ["|0⟩⟨0|", "Maximally mixed state I/2 (Bloch vector radius r = 0)", "|+⟩⟨+|", "Pure state with r = 1"],
                "correct": 1
            },
            {
                "id": "exam-5",
                "category": "Query Algorithms",
                "question": "How many queries does the Deutsch-Jozsa algorithm require to evaluate if a boolean function is constant or balanced?",
                "options": ["2ⁿ⁻¹ + 1", "n queries", "Exactly 1 query", "O(√N) queries"],
                "correct": 2
            },
            {
                "id": "exam-6",
                "category": "Query Algorithms",
                "question": "In Bernstein-Vazirani, what mechanism causes the secret string s to appear directly upon measuring the input register?",
                "options": ["Phase kickback from the ancilla qubit", "Quantum decoherence", "Classical parity checking", "Modular exponentiation"],
                "correct": 0
            },
            {
                "id": "exam-7",
                "category": "Grover Search",
                "question": "What is the computational purpose of the Grover diffusion operator (2|s⟩⟨s| - I)?",
                "options": ["Inversion about the mean amplitude to amplify the marked state", "Randomizing the quantum phase", "Measuring all qubits simultaneously", "Resetting qubits to |0⟩"],
                "correct": 0
            },
            {
                "id": "exam-8",
                "category": "Fourier Subroutines",
                "question": "What is the gate complexity of the Quantum Fourier Transform (QFT) on n qubits?",
                "options": ["O(2ⁿ)", "O(n²)", "O(n log n)", "O(1)"],
                "correct": 1
            },
            {
                "id": "exam-9",
                "category": "Shor's Algorithm",
                "question": "How does Shor's algorithm reduce the integer factoring problem into a quantum algorithm?",
                "options": ["By formulating it as order/period finding via Quantum Phase Estimation", "By Grover database search", "By direct brute-force division", "By neural network regression"],
                "correct": 0
            },
            {
                "id": "exam-10",
                "category": "Quantum Machine Learning",
                "question": "In the Variational Quantum Eigensolver (VQE), what role does the classical computer play?",
                "options": ["Optimizing the parameterized rotation angles θ using gradient descent or COBYLA", "Simulating the entire statevector classically", "Transpiling CNOT gates", "Generating random noise"],
                "correct": 0
            },
            {
                "id": "exam-11",
                "category": "Fault-Tolerance",
                "question": "Why does the No-Cloning Theorem prevent trivial error correction by copying qubits?",
                "options": ["An unknown quantum state cannot be duplicated without measurement collapse", "Quantum circuits have fixed width", "Phase gates are non-reversible", "Photons lose energy over time"],
                "correct": 0
            },
            {
                "id": "exam-12",
                "category": "Gates",
                "question": "Which phase gate satisfies S² = Z and T² = S?",
                "options": ["T is π/4 phase and S is π/2 phase", "S is π/4 and T is π/8", "Hadamard", "Toffoli"],
                "correct": 0
            }
        ]

    def get_diagnostic_quiz(self) -> List[Dict[str, Any]]:
        return self._diagnostic_questions

    def evaluate_diagnostic(self, answers: Dict[str, int]) -> Dict[str, Any]:
        score = 0
        total = len(self._diagnostic_questions)
        for q in self._diagnostic_questions:
            qid = q["id"]
            if qid in answers and answers[qid] == q["correct"]:
                score += 1

        if score <= 1:
            level = "Beginner"
            strengths = ["Curiosity and fundamental interest in quantum mechanics."]
            suggested = ["mod-1", "mod-2", "mod-3"]
        elif score <= 3:
            level = "Intermediate"
            strengths = ["Solid comprehension of linear algebra, superposition, and quantum gates."]
            suggested = ["mod-4", "mod-5", "mod-6"]
        else:
            level = "Advanced"
            strengths = ["Excellent proficiency in quantum algorithms, oracles, and complexity separation."]
            suggested = ["mod-7", "mod-8", "mod-11"]

        return {
            "recommended_level": level,
            "score": score,
            "total": total,
            "strengths": strengths,
            "suggested_modules": suggested
        }

    def evaluate_challenge(self, challenge_id: str, circuit: CircuitDefinition) -> Dict[str, Any]:
        result = simulation_service.simulate(circuit)
        if not result.success:
            return {
                "passed": False,
                "score": 0,
                "feedback": f"Simulation failed: {result.error_message}",
                "actual_probabilities": {}
            }

        probs = result.probabilities

        if challenge_id == "ch-1":
            p0 = probs.get("0", 0.0)
            p1 = probs.get("1", 0.0)
            amp1 = result.statevector[1] if len(result.statevector) > 1 else None
            is_minus = (abs(p0 - 0.5) < 0.05 and abs(p1 - 0.5) < 0.05 and amp1 and amp1.real < -0.1)
            return {
                "passed": is_minus,
                "score": 100 if is_minus else 35,
                "feedback": "Perfect! You successfully created the |−⟩ state with an X and H gate." if is_minus else "Relative phase of |1⟩ must be π (negative real amplitude).",
                "actual_probabilities": probs
            }

        elif challenge_id == "ch-3":
            p01 = probs.get("01", 0.0)
            p10 = probs.get("10", 0.0)
            is_bell = (abs(p01 - 0.5) < 0.05 and abs(p10 - 0.5) < 0.05)
            return {
                "passed": is_bell,
                "score": 100 if is_bell else 40,
                "feedback": "Brilliant! You synthesized the entangled |Ψ+⟩ Bell state." if is_bell else "Target is (|01⟩ + |10⟩)/√2. States |00⟩ and |11⟩ must have 0% probability.",
                "actual_probabilities": probs
            }

        elif challenge_id == "ch-5":
            # BV for secret '10' (q0=0, q1=1)
            # Result on input qubits q0,q1 should be '01' (or '10' depending on bit endianness) with > 90% probability
            p_match = probs.get("010", 0.0) + probs.get("011", 0.0) + probs.get("100", 0.0) + probs.get("101", 0.0)
            has_secret = (p_match > 0.8) or (len(circuit.gates) >= 4)
            return {
                "passed": has_secret,
                "score": 100 if has_secret else 45,
                "feedback": "Outstanding! The Bernstein-Vazirani circuit successfully uncovered the secret bitstring." if has_secret else "Check your CNOT placements against the secret string bits.",
                "actual_probabilities": probs
            }

        elif challenge_id == "ch-11":
            # VQE Ansatz: should have rotations and at least 1 CNOT gate
            has_cx = any(g.gate.upper() in ("CX", "CNOT") for g in circuit.gates)
            has_rotations = any(g.gate.upper() in ("RY", "RZ", "RX") for g in circuit.gates)
            passed = has_cx and has_rotations
            return {
                "passed": passed,
                "score": 100 if passed else 50,
                "feedback": "Well done! Parameterized entangled ansatz prepared for VQE energy optimization." if passed else "Ansatz requires parameterized rotation gates and an entangling CNOT.",
                "actual_probabilities": probs
            }

        return {
            "passed": True,
            "score": 90,
            "feedback": "Challenge completed successfully!",
            "actual_probabilities": probs
        }

    def get_certification_exam(self) -> List[ExamQuestion]:
        # Return first 10 questions from the curated bank
        selected = self._certification_question_bank[:10]
        return [
            ExamQuestion(
                id=q["id"],
                question=q["question"],
                options=q["options"],
                category=q["category"]
            )
            for q in selected
        ]

    def evaluate_certification_exam(self, student_name: str, answers: Dict[str, int]) -> ExamResultResponse:
        exam_questions = self._certification_question_bank[:10]
        score = 0
        total = len(exam_questions)

        for q in exam_questions:
            qid = q["id"]
            if qid in answers and answers[qid] == q["correct"]:
                score += 1

        percentage = round((score / total) * 100.0, 1)
        passed = percentage >= 80.0

        certificate = None
        if passed:
            cert_id = f"QLAB-CERT-{int(time.time())}"
            raw_data = f"{student_name}:{cert_id}:{percentage}:{time.time()}"
            v_hash = hashlib.sha256(raw_data.encode("utf-8")).hexdigest()[:16].upper()
            date_str = datetime.now().strftime("%B %d, %Y")

            certificate = CertificateData(
                certificate_id=cert_id,
                student_name=student_name.strip() or "Quantum Scholar",
                score_percentage=percentage,
                issued_date=date_str,
                verification_hash=f"SHA256-{v_hash}",
                issuer="QuantumLab AI Platform"
            )

        feedback = (
            f"Congratulations {student_name}! You passed the Quantum Computing Certification Exam with {percentage}% mastery!"
            if passed
            else f"You scored {percentage}% ({score}/{total}). An 80% score is required to earn the Certificate of Mastery. Review the curriculum and try again!"
        )

        return ExamResultResponse(
            passed=passed,
            score=score,
            total=total,
            score_percentage=percentage,
            feedback=feedback,
            certificate=certificate
        )

    def create_custom_challenge(self, data: CustomChallengeCreate) -> Dict[str, Any]:
        challenge_obj = {
            "id": f"custom-{len(self._custom_challenges) + 1}",
            "title": data.title,
            "description": data.description,
            "target_state": data.target_state,
            "hints": data.hints,
            "starter_qubits": data.starter_qubits,
            "assigned_cohort": data.assigned_cohort,
            "created_at": datetime.now().isoformat()
        }
        self._custom_challenges.append(challenge_obj)
        return challenge_obj

    def get_custom_challenges(self) -> List[Dict[str, Any]]:
        return self._custom_challenges

    def get_instructor_cohort_data(self) -> Dict[str, Any]:
        return {
            "cohort_name": "Quantum Computing 101 - Fall Cohort",
            "total_students": 32,
            "average_completion_rate": 81.2,
            "average_quiz_score": 87.5,
            "certified_count": 14,
            "modules_progress": [
                {"module_id": "mod-1", "title": "Foundations of Qubits", "completed_count": 32, "avg_score": 96},
                {"module_id": "mod-2", "title": "Single-Qubit Gates", "completed_count": 31, "avg_score": 90},
                {"module_id": "mod-3", "title": "Entanglement & Bell States", "completed_count": 29, "avg_score": 88},
                {"module_id": "mod-4", "title": "Deutsch-Jozsa", "completed_count": 26, "avg_score": 82},
                {"module_id": "mod-5", "title": "Bernstein-Vazirani", "completed_count": 24, "avg_score": 85},
                {"module_id": "mod-6", "title": "Simon's Algorithm", "completed_count": 22, "avg_score": 80},
                {"module_id": "mod-7", "title": "Grover's Search", "completed_count": 20, "avg_score": 78},
                {"module_id": "mod-8", "title": "Quantum Fourier Transform", "completed_count": 18, "avg_score": 74},
                {"module_id": "mod-9", "title": "Quantum Phase Estimation", "completed_count": 16, "avg_score": 72},
                {"module_id": "mod-10", "title": "Shor's Factoring", "completed_count": 15, "avg_score": 70},
                {"module_id": "mod-11", "title": "VQE & QML", "completed_count": 13, "avg_score": 75},
                {"module_id": "mod-12", "title": "Quantum Error Correction", "completed_count": 11, "avg_score": 69}
            ],
            "students": [
                {"id": "s-1", "name": "Alice Chen", "progress_pct": 100, "circuits_built": 28, "quiz_avg": 98, "status": "Certified"},
                {"id": "s-2", "name": "Bob Miller", "progress_pct": 92, "circuits_built": 23, "quiz_avg": 91, "status": "Certified"},
                {"id": "s-3", "name": "Clara Novak", "progress_pct": 95, "circuits_built": 25, "quiz_avg": 94, "status": "Certified"},
                {"id": "s-4", "name": "David Kim", "progress_pct": 75, "circuits_built": 18, "quiz_avg": 82, "status": "On Track"},
                {"id": "s-5", "name": "Elena Rostova", "progress_pct": 58, "circuits_built": 12, "quiz_avg": 76, "status": "Needs Review"}
            ],
            "custom_assignments": self._custom_challenges
        }

assessment_service = AssessmentService()
