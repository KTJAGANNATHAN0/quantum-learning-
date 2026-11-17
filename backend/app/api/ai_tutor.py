from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    AITutorRequest,
    AITutorResponse,
    CircuitDefinition
)
from backend.app.services.ai_tutor_service import ai_tutor_service

router = APIRouter(prefix="/ai", tags=["AI Tutor"])

@router.post("/ask", response_model=AITutorResponse)
def ask_ai_tutor(req: AITutorRequest):
    try:
        return ai_tutor_service.generate_response(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/diagnose")
def diagnose_circuit(circuit: CircuitDefinition):
    try:
        return ai_tutor_service.analyze_circuit(circuit, None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-connection")
def test_connection(payload: dict):
    key = payload.get("api_key", "").strip()
    model = payload.get("model", "meta-llama/llama-3.3-70b-instruct:free").strip()
    return ai_tutor_service.test_openrouter_connection(key, model)

