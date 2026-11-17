import {
  CircuitDefinition,
  SimulationResult,
  AITutorResponse,
  ModuleContent,
  DiagnosticResult
} from '../types/quantum';

const API_BASE = typeof window !== 'undefined' && window.location.port === '5173'
  ? '/api'
  : 'http://127.0.0.1:8000/api';

export const api = {
  async simulateCircuit(circuit: CircuitDefinition): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circuit)
    });
    if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
    return res.json();
  },

  async runRawCode(code: string, shots = 1024): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulate/raw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, shots })
    });
    if (!res.ok) throw new Error(`Raw execution failed: ${res.statusText}`);
    return res.json();
  },

  async compareBackends(circuit: CircuitDefinition): Promise<Record<string, SimulationResult>> {
    const res = await fetch(`${API_BASE}/simulate/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(circuit)
    });
    if (!res.ok) throw new Error(`Comparison failed: ${res.statusText}`);
    return res.json();
  },

  async askAITutor(
    message: string,
    circuit?: CircuitDefinition,
    simulationResult?: SimulationResult,
    action: string = 'chat',
    apiKey?: string,
    model?: string
  ): Promise<AITutorResponse> {
    const key = apiKey !== undefined
      ? apiKey
      : (typeof window !== 'undefined' ? localStorage.getItem('openrouter_api_key') || undefined : undefined);
    const mod = model || (typeof window !== 'undefined' ? localStorage.getItem('openrouter_model') || 'meta-llama/llama-3.3-70b-instruct:free' : 'meta-llama/llama-3.3-70b-instruct:free');

    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        circuit,
        simulation_result: simulationResult,
        action,
        api_key: key,
        model: mod,
        provider: 'openrouter'
      })
    });
    if (!res.ok) throw new Error(`AI Tutor request failed: ${res.statusText}`);
    return res.json();
  },

  async testOpenRouterConnection(apiKey: string, model: string): Promise<{ success: boolean; reply?: string; error?: string; model?: string }> {
    const res = await fetch(`${API_BASE}/ai/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, model })
    });
    if (!res.ok) throw new Error(`Connection test failed: ${res.statusText}`);
    return res.json();
  },

  async getModules(): Promise<ModuleContent[]> {
    const res = await fetch(`${API_BASE}/courses/modules`);
    if (!res.ok) throw new Error(`Failed to load modules: ${res.statusText}`);
    return res.json();
  },

  async getDiagnosticQuiz(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/assessment/diagnostic`);
    if (!res.ok) throw new Error(`Failed to load diagnostic quiz: ${res.statusText}`);
    return res.json();
  },

  async submitDiagnostic(answers: Record<string, number>): Promise<DiagnosticResult> {
    const res = await fetch(`${API_BASE}/assessment/diagnostic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error(`Failed to submit diagnostic: ${res.statusText}`);
    return res.json();
  },

  async submitChallenge(challengeId: string, circuit: CircuitDefinition): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge_id: challengeId, circuit })
    });
    if (!res.ok) throw new Error(`Failed to submit challenge: ${res.statusText}`);
    return res.json();
  },

  async getInstructorCohortData(): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/instructor/cohort`);
    if (!res.ok) throw new Error(`Failed to load cohort data: ${res.statusText}`);
    return res.json();
  },

  async getCertificationExam(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/assessment/exam`);
    if (!res.ok) throw new Error(`Failed to load certification exam: ${res.statusText}`);
    return res.json();
  },

  async submitCertificationExam(student_name: string, answers: Record<string, number>): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name, answers })
    });
    if (!res.ok) throw new Error(`Failed to submit certification exam: ${res.statusText}`);
    return res.json();
  },

  async createCustomChallenge(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/custom-challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to create custom challenge: ${res.statusText}`);
    return res.json();
  },

  async getCustomChallenges(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/assessment/custom-challenge`);
    if (!res.ok) throw new Error(`Failed to fetch custom challenges: ${res.statusText}`);
    return res.json();
  }
};
