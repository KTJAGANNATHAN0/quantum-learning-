from fastapi import APIRouter, HTTPException
from typing import List
from backend.app.models.schemas import ModuleContent
from backend.app.services.course_service import course_service

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/modules", response_model=List[ModuleContent])
def list_modules():
    return course_service.get_all_modules()

@router.get("/modules/{module_id}", response_model=ModuleContent)
def get_module(module_id: str):
    module = course_service.get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module
