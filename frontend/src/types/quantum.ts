export interface GateOperation {
  gate: string;
  targets: number[];
  controls?: number[];
  params?: number[];
  step: number;
}

export interface CircuitDefinition {
  num_qubits: number;
  gates: GateOperation[];
  name?: string;
  shots?: number;
  backend?: string;
}

export interface BlochVector {
  qubit: number;
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
  p0: number;
  p1: number;
}

export interface ComplexAmplitude {
  state: string;
  real: number;
  imag: number;
  probability: number;
  phase: number;
}

export interface SimulationResult {
  backend: string;
  num_qubits: number;
  circuit_depth: number;
  gate_count: number;
  statevector: ComplexAmplitude[];
  probabilities: Record<string, number>;
  counts: Record<string, number>;
  bloch_vectors: BlochVector[];
  execution_time_ms: number;
  qiskit_code?: string;
  success: boolean;
  error_message?: string;
}

export interface AITutorResponse {
  reply: string;
  analysis?: {
    summary: string;
    issues: string[];
    optimizations: string[];
    is_entangled: boolean;
    is_superposition: boolean;
  };
  suggestions: string[];
  detected_issues: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  hints: string[];
  starter_circuit: CircuitDefinition;
}

export interface ModuleContent {
  id: string;
  title: string;
  track: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  theory_markdown: string;
  preset_circuit: CircuitDefinition;
  quiz: QuizQuestion[];
  challenge?: CodingChallenge;
}

export interface DiagnosticResult {
  recommended_level: string;
  score: number;
  total: number;
  strengths: string[];
  suggested_modules: string[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
}

export interface CertificateData {
  certificate_id: string;
  student_name: string;
  course_title: string;
  score_percentage: number;
  issued_date: string;
  verification_hash: string;
  issuer: string;
}

export interface ExamResultResponse {
  passed: boolean;
  score: number;
  total: number;
  score_percentage: number;
  feedback: string;
  certificate?: CertificateData;
}

export interface CustomChallengeCreate {
  title: string;
  description: string;
  target_state: string;
  hints: string[];
  starter_qubits: number;
  assigned_cohort?: string;
}
