# quantum-learning-

> **AI-Based Interactive Quantum Algorithm Learning Platform**  
> An educational platform featuring interactive quantum circuit builders, 3D Bloch sphere visualizations, algorithmic walk-throughs, and an AI-powered Quantum Tutor.

🌐 **Live Demo on GitHub Pages**:  
👉 **[https://KTJAGANNATHAN0.github.io/quantum-learning-/](https://KTJAGANNATHAN0.github.io/quantum-learning-/)**

---

## 🌟 Key Features

- **Interactive Quantum Circuit Composer**: Drag-and-drop or configure quantum gates (Hadamard, Pauli X/Y/Z, Phase, CNOT, CZ, Toffoli, SWAP) with multi-qubit support.
- **3D Bloch Sphere Visualizer**: Built with Three.js to render real-time statevector representations and state evolution on the Bloch sphere.
- **Circuit Simulation Engine**: Real-time simulation backend (with Qiskit Aer integration & pure Python exact statevector simulation fallback).
- **AI Quantum Tutor**: Context-aware AI assistant helping learners understand quantum mechanics concepts, superposition, entanglement, and circuit debugging.
- **Assessment Center**: Interactive quizzes, circuit challenges, and step-by-step guided quantum algorithm tracks.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ & npm
- **Python**: 3.10+

### 2. Backend Setup
```bash
# Navigate to the project root
cd "quantum learning"

# Install backend dependencies
pip install -r requirements.txt

# (Optional) Copy environment configuration
cp .env.example .env

# Run FastAPI backend server
uvicorn backend.app.main.py:app --reload --port 8000
```
The backend API and interactive OpenAPI documentation will be available at:
`http://localhost:8000/docs`

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
quantum learning/
├── backend/
│   ├── app/
│   │   ├── adapters/       # Quantum simulator backends (Qiskit Aer, Pure Python)
│   │   ├── api/            # FastAPI routes (simulation, AI tutor, courses, assessments)
│   │   ├── models/         # Pydantic schemas & state models
│   │   ├── services/       # Quantum execution and AI logic
│   │   └── main.py         # Application entry point
│   └── tests/              # Backend verification tests
├── frontend/
│   ├── src/
│   │   ├── components/     # React UI components (BlochSphere, CircuitBuilder, etc.)
│   │   ├── services/       # API clients for simulation and AI tutor
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── .env.example
├── requirements.txt
└── README.md
```

---

## 📄 License
MIT License
