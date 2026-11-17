from typing import Dict, List, Optional
from backend.app.adapters.base import BaseQuantumAdapter
from backend.app.adapters.qiskit_adapter import QiskitAerAdapter
from backend.app.adapters.mock_adapters import PennyLaneAdapter, CirqAdapter
from backend.app.models.schemas import CircuitDefinition, SimulationResult

class SimulationService:
    def __init__(self):
        self._adapters: Dict[str, BaseQuantumAdapter] = {
            "qiskit_aer": QiskitAerAdapter(),
            "pennylane": PennyLaneAdapter(),
            "cirq": CirqAdapter()
        }

    def get_available_backends(self) -> List[Dict[str, str]]:
        return [
            {"id": key, "name": adapter.name(), "available": adapter.is_available()}
            for key, adapter in self._adapters.items()
        ]

    def simulate(self, circuit: CircuitDefinition) -> SimulationResult:
        backend_key = circuit.backend.lower() if circuit.backend else "qiskit_aer"
        adapter = self._adapters.get(backend_key, self._adapters["qiskit_aer"])
        return adapter.simulate(circuit)

    def run_raw_code(self, code: str, shots: int = 1024, backend: str = "qiskit_aer") -> SimulationResult:
        backend_key = backend.lower() if backend else "qiskit_aer"
        adapter = self._adapters.get(backend_key, self._adapters["qiskit_aer"])
        return adapter.run_raw_code(code, shots)

    def compare_backends(self, circuit: CircuitDefinition) -> Dict[str, SimulationResult]:
        """Run the same circuit on multiple backends side-by-side."""
        results = {}
        for key, adapter in self._adapters.items():
            results[key] = adapter.simulate(circuit)
        return results

simulation_service = SimulationService()
