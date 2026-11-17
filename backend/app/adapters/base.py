from abc import ABC, abstractmethod
from typing import Dict, Any
from backend.app.models.schemas import CircuitDefinition, SimulationResult

class BaseQuantumAdapter(ABC):
    """
    Abstract Base Class for Quantum Execution Backends (Qiskit Aer, PennyLane, Cirq, etc.)
    """

    @abstractmethod
    def name(self) -> str:
        """Name of the backend."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if backend runtime is installed and active."""
        pass

    @abstractmethod
    def simulate(self, circuit: CircuitDefinition) -> SimulationResult:
        """Simulate an abstract circuit and return complete quantum state metrics."""
        pass

    @abstractmethod
    def run_raw_code(self, code: str, shots: int = 1024) -> SimulationResult:
        """Safely execute raw SDK code (e.g. Qiskit python snippet)."""
        pass
