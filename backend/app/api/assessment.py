from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.models.schemas import (
    ExamQuestion,
    ExamSubmissionRequest,
    ExamResultResponse,
    CustomChallengeCreate,
    CircuitDefinition
)
from pydantic import BaseModel
from backend.app.services.assessment_service import assessment_service

router = APIRouter(prefix="/assessment", tags=["Assessment"])

class DiagnosticSubmission(BaseModel):
    answers: Dict[str, int]

class ChallengeSubmission(BaseModel):
    challenge_id: str
    circuit: CircuitDefinition

@router.get("/diagnostic")
def get_diagnostic():
    return assessment_service.get_diagnostic_quiz()

@router.post("/diagnostic")
def submit_diagnostic(submission: DiagnosticSubmission):
    return assessment_service.evaluate_diagnostic(submission.answers)

@router.post("/challenge")
def submit_challenge(submission: ChallengeSubmission):
    return assessment_service.evaluate_challenge(submission.challenge_id, submission.circuit)

@router.get("/instructor/cohort")
def get_cohort_data():
    return assessment_service.get_instructor_cohort_data()

@router.get("/exam", response_model=List[ExamQuestion])
def get_exam():
    return assessment_service.get_certification_exam()

@router.post("/exam", response_model=ExamResultResponse)
def submit_exam(req: ExamSubmissionRequest):
    return assessment_service.evaluate_certification_exam(req.student_name, req.answers)

@router.get("/custom-challenge")
def list_custom_challenges():
    return assessment_service.get_custom_challenges()

@router.post("/custom-challenge")
def create_custom_challenge(data: CustomChallengeCreate):
    return assessment_service.create_custom_challenge(data)
