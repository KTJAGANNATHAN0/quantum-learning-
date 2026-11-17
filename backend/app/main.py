from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.simulate import router as simulate_router
from backend.app.api.ai_tutor import router as ai_router
from backend.app.api.courses import router as courses_router
from backend.app.api.assessment import router as assessment_router

app = FastAPI(
    title="AI-Based Interactive Quantum Algorithm Learning Platform API",
    description="Backend simulation engine, circuit-aware AI tutor, and interactive curriculum platform",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(assessment_router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "AI Interactive Quantum Algorithm Learning Platform",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "engine": "Qiskit Aer 0.17.2"}
