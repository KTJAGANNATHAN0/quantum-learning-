import os
import re
import json
import urllib.request
import urllib.error
from typing import Dict, List, Any, Optional, Tuple
from backend.app.models.schemas import (
    AITutorRequest,
    AITutorResponse,
    CircuitDefinition,
    SimulationResult
)

def _load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and v:
                            os.environ[k] = v
        except Exception:
            pass

_load_env_file()

class AITutorService:
    """
    Context-Aware AI Quantum Tutor and Diagnostic Assistant.
    Inspects circuits, statevectors, and measurement distributions
    to provide pedagogical guidance and catch errors.
    """

    def _call_gemini(self, key: str, prompt: str, system: str) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        payload = {
            "contents": [{"parts": [{"text": f"{system}\n\nUser Question:\n{prompt}"}]}]
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]

    def _call_openai_compatible(self, url: str, key: str, model: str, prompt: str, system: str) -> Optional[str]:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ]
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]

    def _call_openrouter(self, key: str, model: str, prompt: str, system: str) -> Optional[str]:
        payload = {
            "model": model or "meta-llama/llama-3.3-70b-instruct:free",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ]
        }
        req = urllib.request.Request(
            "https://openrouter.ai/api/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {key}",
                "HTTP-Referer": "https://quantumlab.org",
                "X-Title": "QuantumLab AI Tutor",
                "User-Agent": "QuantumLab/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            clean_res = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
            return clean_res or content

    def test_openrouter_connection(self, key: str, model: str) -> Dict[str, Any]:
        if not key:
            return {"success": False, "error": "No API key provided"}
        try:
            prompt = "Return a one-sentence confirmation: 'OpenRouter connection successful and quantum intelligence is active.'"
            system = "You are QuantumLab AI Tutor."
            res = self._call_openrouter(key, model, prompt, system)
            if res:
                return {"success": True, "reply": res, "model": model}
            return {"success": False, "error": "Empty response from OpenRouter"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _query_live_llm(self, prompt: str, context_str: str, user_key: Optional[str] = None, user_model: Optional[str] = None) -> Optional[str]:
        _load_env_file()
        system = (
            "You are QuantumLab AI Tutor, an expert professor of quantum computing and physics. "
            "You are assisting a student working on an interactive quantum circuit canvas. "
            f"Here is the student's active circuit context:\n{context_str}\n"
            "Provide helpful, mathematically accurate, encouraging, and clear pedagogical guidance in markdown."
        )

        # 1. User-supplied OpenRouter API key or environment key
        openrouter_key = user_key or os.environ.get("OPENROUTER_API_KEY")
        if openrouter_key:
            target_model = user_model or "meta-llama/llama-3.3-70b-instruct:free"
            try:
                res = self._call_openrouter(openrouter_key, target_model, prompt, system)
                if res:
                    return res
            except Exception as e:
                print(f"[OpenRouter Error]: {e}")

        # 2. Fallbacks (Groq, Gemini, OpenAI)
        groq_key = os.environ.get("GROQ_API_KEY")
        if groq_key:
            groq_models = [
                "openai/gpt-oss-120b",
                "openai/gpt-oss-20b",
                "groq/compound-mini",
                "qwen/qwen3.6-27b"
            ]
            for model_name in groq_models:
                try:
                    res = self._call_openai_compatible(
                        "https://api.groq.com/openai/v1/chat/completions",
                        groq_key,
                        model_name,
                        prompt,
                        system
                    )
                    if res:
                        clean_res = re.sub(r"<think>.*?</think>", "", res, flags=re.DOTALL).strip()
                        return clean_res or res
                except Exception:
                    continue

        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            try:
                return self._call_gemini(gemini_key, prompt, system)
            except Exception:
                pass

        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            try:
                return self._call_openai_compatible("https://api.openai.com/v1/chat/completions", openai_key, "gpt-4o-mini", prompt, system)
            except Exception:
                pass

        return None

    def _check_untouched_qubits(self, gates: List[Any], num_qubits: int) -> List[str]:
        touched = set()
        for g in gates:
            touched.update(g.targets)
            if g.controls:
                touched.update(g.controls)
        untouched = [q for q in range(num_qubits) if q not in touched]
        if untouched:
            return [f"Qubit(s) {untouched} have no gates applied and remain in the static state |0⟩."]
        return []

    def _check_redundant_gates(self, gates: List[Any], num_qubits: int) -> List[str]:
        gates_by_qubit: Dict[int, List[str]] = {q: [] for q in range(num_qubits)}
        for g in sorted(gates, key=lambda x: x.step):
            for t in g.targets:
                gates_by_qubit[t].append(g.gate.upper())

        optimizations = []
        for q, g_list in gates_by_qubit.items():
            for i in range(len(g_list) - 1):
                if g_list[i] in ("H", "X", "Y", "Z") and g_list[i] == g_list[i + 1]:
                    optimizations.append(
                        f"Consecutive self-inverse {g_list[i]} gates detected on qubit {q} at steps {i} and {i+1}."
                    )
        return optimizations

    def _check_state_properties(self, num_qubits: int, result: Optional[SimulationResult]) -> Tuple[bool, bool]:
        if not result or not result.probabilities:
            return False, False

        non_zero = [s for s, p in result.probabilities.items() if p > 0.001]
        is_super = len(non_zero) > 1
        is_entangled = False

        if num_qubits == 2 and len(non_zero) == 2:
            p_vals = [result.probabilities[s] for s in non_zero]
            if abs(p_vals[0] - 0.5) < 0.05 and abs(p_vals[1] - 0.5) < 0.05:
                if set(non_zero) in ({"00", "11"}, {"01", "10"}):
                    is_entangled = True

        if result.bloch_vectors and num_qubits > 1:
            for bv in result.bloch_vectors:
                r = (bv.x**2 + bv.y**2 + bv.z**2)**0.5
                if r < 0.2 and is_super:
                    is_entangled = True

        return is_super, is_entangled

    def analyze_circuit(self, circuit: Optional[CircuitDefinition], result: Optional[SimulationResult]) -> Dict[str, Any]:
        if not circuit or not circuit.gates:
            return {
                "summary": "Empty circuit or uninitialized register.",
                "issues": ["No gates placed yet. The qubits remain in the ground state |0...0⟩."],
                "optimizations": [],
                "is_entangled": False,
                "is_superposition": False
            }

        num_qubits = circuit.num_qubits
        issues = self._check_untouched_qubits(circuit.gates, num_qubits)
        optimizations = self._check_redundant_gates(circuit.gates, num_qubits)
        is_superposition, is_entangled = self._check_state_properties(num_qubits, result)

        return {
            "summary": f"Circuit with {num_qubits} qubits, {len(circuit.gates)} gates, depth {result.circuit_depth if result else 0}.",
            "issues": issues,
            "optimizations": optimizations,
            "is_entangled": is_entangled,
            "is_superposition": is_superposition
        }

    def generate_response(self, request: AITutorRequest) -> AITutorResponse:
        analysis = self.analyze_circuit(request.circuit, request.simulation_result)
        action = request.action or "chat"
        user_msg = request.message.lower()

        # Context string
        gates_str = ", ".join([f"{g.gate}(target={g.targets}, ctrl={g.controls})" for g in (request.circuit.gates if request.circuit else [])])
        probs = request.simulation_result.probabilities if (request.simulation_result and request.simulation_result.probabilities) else {}
        prob_str = ", ".join([f"|{k}>: {v*100:.1f}%" for k, v in probs.items() if v > 0.01])

        context_summary = (
            f"- Qubits: {request.circuit.num_qubits if request.circuit else 0}\n"
            f"- Gates: {gates_str}\n"
            f"- Probabilities: {prob_str}\n"
            f"- Entangled: {analysis['is_entangled']}\n"
            f"- Superposition: {analysis['is_superposition']}"
        )

        # If user connected OpenRouter, let live LLM provide customized deep answers for quick actions
        if request.api_key and action != "chat":
            action_prompts = {
                "explain_state": f"Explain the quantum state of this circuit in depth based on these measurement probabilities: {prob_str}. Focus on the Bloch sphere coordinates and physical intuition.",
                "diagnose_error": f"Analyze this quantum circuit for possible bugs, disconnected qubits, or phase errors: {gates_str}. Automated analysis flagged: {analysis['issues']}.",
                "optimize": f"Suggest quantum circuit depth optimizations or gate cancellations for: {gates_str}.",
                "hint": f"Give a pedagogical hint for advancing this quantum algorithm: {gates_str}."
            }
            custom_prompt = action_prompts.get(action, request.message)
            live_action_reply = self._query_live_llm(custom_prompt, context_summary, user_key=request.api_key, user_model=request.model)
            if live_action_reply:
                return AITutorResponse(
                    reply=live_action_reply,
                    analysis=analysis,
                    suggestions=["Explain the statevector math", "Suggest circuit optimization", "How does this map to real hardware?"],
                    detected_issues=analysis["issues"]
                )

        if action == "explain_state":
            if analysis["is_entangled"]:
                reply = (
                    "### Quantum Entanglement Detected!\n\n"
                    "Your circuit has successfully created an **entangled quantum state** (such as a Bell state).\n\n"
                    f"- **Measured Outcomes**: {prob_str}\n"
                    "- **Bloch Sphere Significance**: Notice how the individual qubit Bloch vector lengths shrink toward the center (radius $r \\to 0$). In quantum mechanics, an entangled qubit has no independent single-qubit pure state; it can only be described by the joint density matrix of the composite system.\n"
                    "- **Correlation**: Measuring the first qubit instantaneously determines the state of the second qubit with 100% correlation!"
                )
                suggestions = ["Add a phase gate (Z or S) to see Bell state phase changes", "Test with a CNOT gate in reverse"]
            elif analysis["is_superposition"]:
                reply = (
                    "### Superposition State\n\n"
                    f"Your circuit is currently in a **quantum superposition** across multiple basis states:\n\n"
                    f"- **Outcome Probabilities**: {prob_str}\n"
                    "- The Hadamard ($H$) or rotation gates have rotated the statevector away from the computational basis poles ($|0\\rangle$ or $|1\\rangle$) onto the equator of the Bloch sphere.\n"
                    "- When measured repeatedly across multiple shots, you observe a probabilistic distribution determined by the square magnitudes $|\\alpha|^2$ of the complex amplitudes."
                )
                suggestions = ["Try adding a CNOT gate to entangle these qubits", "Apply another Hadamard to observe interference"]
            else:
                reply = (
                    "### Computational Basis State\n\n"
                    f"The quantum register is currently in a deterministic basis state: {prob_str or '|0...0⟩'}.\n\n"
                    "- All qubits point directly to the North or South poles of their Bloch spheres.\n"
                    "- Measurement will yield this exact bitstring with near 100% certainty (zero quantum uncertainty)."
                )
                suggestions = ["Apply a Hadamard (H) gate to create an equal superposition", "Apply an X gate (NOT) to flip |0⟩ to |1⟩"]

        elif action == "diagnose_error":
            if analysis["issues"] or analysis["optimizations"]:
                issues_md = "\n".join([f"- **Issue**: {i}" for i in analysis["issues"]])
                opt_md = "\n".join([f"- **Optimization**: {o}" for o in analysis["optimizations"]])
                reply = (
                    "### Circuit Diagnostic Report\n\n"
                    f"{issues_md}\n\n"
                    f"{opt_md}\n\n"
                    "**Recommendations:**\n"
                    "Ensure all qubits that should participate in the algorithm have proper initialization and entanglement operations. Check your gate sequencing to avoid redundant identity operations."
                )
            else:
                reply = (
                    "### Circuit Health: Excellent\n\n"
                    "No structural flaws or redundant gates detected! Your circuit structure is clean, all active qubits are engaged, and gate sequencing is consistent."
                )
            suggestions = ["Run a multi-backend comparison", "Inspect the 3D Bloch sphere vector"]

        elif action == "optimize":
            if analysis["optimizations"]:
                reply = (
                    "### Optimization Opportunities\n\n"
                    + "\n".join([f"- {o}" for o in analysis["optimizations"]]) +
                    "\n\nReducing gate depth is vital on Noisy Intermediate-Scale Quantum (NISQ) devices to minimize decoherence."
                )
            else:
                reply = "Your circuit is already optimized with minimal depth for the currently specified operations."

        elif action == "hint":
            reply = (
                "### Pedagogical Hint\n\n"
                "Think about the **basis transformation**: to create interference (the heart of quantum algorithms like Grover's and Deutsch-Jozsa), you must rotate into the $|+\\rangle, |-\\rangle$ basis using $H$ gates before and after applying the problem Oracle.\n\n"
                "Remember: $H X H = Z$ and $H Z H = X$!"
            )
            suggestions = ["Show me how Grover's diffusion operator works", "Explain phase kickback"]

        else: # Standard chat
            context_summary = (
                f"- Qubits: {request.circuit.num_qubits if request.circuit else 0}\n"
                f"- Gates: {gates_str}\n"
                f"- Probabilities: {prob_str}\n"
                f"- Entangled: {analysis['is_entangled']}\n"
                f"- Superposition: {analysis['is_superposition']}"
            )
            live_reply = self._query_live_llm(
                request.message,
                context_summary,
                user_key=request.api_key,
                user_model=request.model
            )
            if live_reply:
                reply = live_reply
                suggestions = ["Explain the statevector math", "Suggest circuit optimization", "How does this map to real hardware?"]
            elif "bell" in user_msg or "entangle" in user_msg:
                reply = (
                    "### Bell States & Entanglement\n\n"
                    "A Bell state is the simplest maximally entangled 2-qubit state. To create the canonical Bell state $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$:\n\n"
                    "1. Apply a **Hadamard ($H$) gate** on $q_0$ $\\to$ creates $\\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} \\otimes |0\\rangle = \\frac{|00\\rangle + |10\\rangle}{\\sqrt{2}}$\n"
                    "2. Apply a **CNOT gate** with control $q_0$ and target $q_1$ $\\to$ flips $q_1$ only when $q_0$ is $|1\\rangle$, producing $\\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$!\n\n"
                    "Notice that when you simulate this in the workspace, the probability of measuring $|00\\rangle$ is 50% and $|11\\rangle$ is 50%, with zero probability for $|01\\rangle$ or $|10\\rangle$."
                )
            elif "grover" in user_msg or "search" in user_msg:
                reply = (
                    "### Grover's Quantum Search Algorithm\n\n"
                    "Grover's algorithm provides a quadratic speedup $\\mathcal{O}(\\sqrt{N})$ for searching unsorted databases of size $N = 2^n$.\n\n"
                    "It works through two alternating stages:\n"
                    "1. **The Oracle ($U_f$)**: Flips the phase (multiplies amplitude by $-1$) of the target marked state: $|x\\rangle \\to (-1)^{f(x)}|x\\rangle$.\n"
                    "2. **The Diffusion Operator ($2|s\\rangle\\langle s| - I$)**: Inversion about the mean amplitude. This boosts the amplitude of the marked state while suppressing the amplitudes of all unmarked states!\n\n"
                    "After approximately $\\approx \\frac{\\pi}{4}\\sqrt{N}$ iterations, the target state can be measured with near 100% probability."
                )
            elif "bloch" in user_msg or "sphere" in user_msg:
                reply = (
                    r"### The Bloch Sphere Explained" "\n\n"
                    r"The Bloch sphere is a geometric representation of a single qubit pure state $|\psi\rangle = \cos(\theta/2)|0\rangle + e^{i\phi}\sin(\theta/2)|1\rangle$ as a unit sphere in $\mathbb{R}^3$:" "\n\n"
                    r"- **North Pole ($z = +1$)**: Ground state $|0\rangle$" "\n"
                    r"- **South Pole ($z = -1$)**: Excited state $|1\rangle$" "\n"
                    r"- **Equator ($z = 0$)**: Equal superposition states ($|+\rangle, |-\rangle, |+i\rangle, |-i\rangle$)" "\n"
                    r"- **$\theta$**: Polar angle controlling relative probabilities ($P(0) = \cos^2(\theta/2)$)" "\n"
                    r"- **$\phi$**: Azimuthal angle controlling the quantum relative phase between $|0\rangle$ and $|1\rangle$." "\n\n"
                    "Check the 3D Bloch sphere in the right visualizer panel: you can rotate and inspect the vector in real time!"
                )
            else:
                reply = (
                    f"Hello! I am your Quantum AI Tutor. I'm actively monitoring your circuit: **{request.circuit.num_qubits if request.circuit else 0} qubits**, "
                    f"**{len(request.circuit.gates) if request.circuit else 0} gates**.\n\n"
                    "I can help you build intuition for:\n"
                    "- **Quantum States & Superposition**: understanding amplitudes, relative phases, and Bloch spheres.\n"
                    "- **Entanglement & Non-locality**: Bell states, GHZ states, and quantum teleportation.\n"
                    "- **Quantum Algorithms**: Deutsch-Jozsa, Grover's search, Quantum Fourier Transform (QFT).\n"
                    "- **Code Conversion**: translating between visual circuits, Qiskit Python, PennyLane, and OpenQASM."
                )
                suggestions = ["How do I create a Bell state?", "Explain Grover's algorithm", "Diagnose my circuit"]

        return AITutorResponse(
            reply=reply,
            analysis=analysis,
            suggestions=suggestions,
            detected_issues=analysis["issues"]
        )

ai_tutor_service = AITutorService()
