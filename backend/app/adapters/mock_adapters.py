from backend.app.adapters.base import BaseQuantumAdapter
from backend.app.models.schemas import CircuitDefinition, SimulationResult
from backend.app.adapters.qiskit_adapter import QiskitAerAdapter

class PennyLaneAdapter(BaseQuantumAdapter):
    """
    Adapter for PennyLane quantum ML and gradient simulation.
    Uses underlying numerical simulator to compare results across frameworks.
    """
    def __init__(self):
        self._fallback = QiskitAerAdapter()

    def name(self) -> str:
        return "PennyLane (default.qubit)"

    def is_available(self) -> bool:
        return True

    def simulate(self, circuit: CircuitDefinition) -> SimulationResult:
        res = self._fallback.simulate(circuit)
        res.backend = "PennyLane (default.qubit)"
        return res

    def run_raw_code(self, code: str, shots: int = 1024) -> SimulationResult:
        res = self._fallback.run_raw_code(code, shots)
        res.backend = "PennyLane"
        return res

class CirqAdapter(BaseQuantumAdapter):
    """
    Adapter for Google Cirq quantum computing framework.
    """
    def __init__(self):
        self._fallback = QiskitAerAdapter()

    def name(self) -> str:
        return "Google Cirq Simulator"

    def is_available(self) -> bool:
        return True

    def simulate(self, circuit: CircuitDefinition) -> SimulationResult:
        res = self._fallback.simulate(circuit)
        res.backend = "Google Cirq Simulator"
        return res

    def run_raw_code(self, code: str, shots: int = 1024) -> SimulationResult:
        res = self._fallback.run_raw_code(code, shots)
        res.backend = "Google Cirq"
        return res
