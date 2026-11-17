from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class GateOperation(BaseModel):
    gate: str = Field(..., description="Gate identifier: H, X, Y, Z, S, T, RX, RY, RZ, CX, CZ, SWAP, CCX, MEASURE")
    targets: List[int] = Field(..., description="Target qubit indices")
    controls: Optional[List[int]] = Field(default=[], description="Control qubit indices")
    params: Optional[List[float]] = Field(default=[], description="Gate parameters (e.g. angle for RX, RY, RZ)")
    step: Optional[int] = Field(default=0, description="Time step in circuit")

class CircuitDefinition(BaseModel):
    num_qubits: int = Field(default=2, ge=1, le=10)
    gates: List[GateOperation] = Field(default_factory=list)
    name: Optional[str] = "Untitled Circuit"
    shots: Optional[int] = Field(default=1024, ge=1, le=10000)
    backend: Optional[str] = Field(default="qiskit_aer", description="Backend: qiskit_aer, pennylane, cirq")

class RawCodeExecutionRequest(BaseModel):
    code: str = Field(..., description="Python Qiskit code to execute")
    shots: Optional[int] = Field(default=1024, ge=1, le=10000)

class BlochVector(BaseModel):
    qubit: int
    x: float
    y: float
    z: float
    theta: float
    phi: float
    p0: float
    p1: float

class ComplexAmplitude(BaseModel):
    state: str
    real: float
    imag: float
    probability: float
    phase: float

class SimulationResult(BaseModel):
    backend: str
    num_qubits: int
    circuit_depth: int
    gate_count: int
    statevector: List[ComplexAmplitude]
    probabilities: Dict[str, float]
    counts: Dict[str, int]
    bloch_vectors: List[BlochVector]
    execution_time_ms: float
    qasm: Optional[str] = None
    qiskit_code: Optional[str] = None
    success: bool = True
    error_message: Optional[str] = None

class AITutorMessage(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class AITutorRequest(BaseModel):
    message: str
    circuit: Optional[CircuitDefinition] = None
    simulation_result: Optional[SimulationResult] = None
    history: Optional[List[AITutorMessage]] = Field(default_factory=list)
    action: Optional[str] = Field(default="chat", description="chat, explain_state, diagnose_error, optimize, hint")
    api_key: Optional[str] = None
    model: Optional[str] = Field(default="meta-llama/llama-3.3-70b-instruct:free")
    provider: Optional[str] = Field(default="openrouter")

class AITutorResponse(BaseModel):
    reply: str
    analysis: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = Field(default_factory=list)
    detected_issues: Optional[List[str]] = Field(default_factory=list)

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_option_index: int
    explanation: str

class CodingChallenge(BaseModel):
    id: str
    title: str
    description: str
    target_statevector: Optional[List[ComplexAmplitude]] = None
    target_probabilities: Optional[Dict[str, float]] = None
    hints: List[str]
    starter_circuit: CircuitDefinition

class ModuleContent(BaseModel):
    id: str
    title: str
    track: str = "Foundations" # Foundations, Query Algorithms, Advanced Algorithms, QML & Fault-Tolerance
    level: str # Beginner, Intermediate, Advanced
    summary: str
    theory_markdown: str
    preset_circuit: CircuitDefinition
    quiz: List[QuizQuestion]
    challenge: Optional[CodingChallenge] = None

class ExamQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    category: str

class ExamSubmissionRequest(BaseModel):
    student_name: str
    answers: Dict[str, int]

class CertificateData(BaseModel):
    certificate_id: str
    student_name: str
    course_title: str = "Quantum Computing & Algorithm Engineering"
    score_percentage: float
    issued_date: str
    verification_hash: str
    issuer: str = "QuantumLab AI Platform"

class ExamResultResponse(BaseModel):
    passed: bool
    score: int
    total: int
    score_percentage: float
    feedback: str
    certificate: Optional[CertificateData] = None

class CustomChallengeCreate(BaseModel):
    title: str
    description: str
    target_state: str # e.g. "|11>" or "Bell |Phi+>"
    hints: List[str] = Field(default_factory=list)
    starter_qubits: int = 2
    assigned_cohort: Optional[str] = "Fall Cohort"

