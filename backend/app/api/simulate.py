from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    CircuitDefinition,
    RawCodeExecutionRequest,
    SimulationResult
)
from backend.app.services.simulation_service import simulation_service

router = APIRouter(prefix="/simulate", tags=["Simulation"])

@router.get("/backends")
def get_backends():
    return simulation_service.get_available_backends()

@router.post("", response_model=SimulationResult)
def simulate_circuit(circuit: CircuitDefinition):
    try:
        return simulation_service.simulate(circuit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/raw", response_model=SimulationResult)
def run_raw_code(req: RawCodeExecutionRequest):
    try:
        return simulation_service.run_raw_code(req.code, req.shots)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compare")
def compare_backends(circuit: CircuitDefinition):
    try:
        return simulation_service.compare_backends(circuit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
