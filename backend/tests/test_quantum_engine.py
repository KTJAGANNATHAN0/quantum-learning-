from backend.app.services.simulation_service import simulation_service
from backend.app.services.ai_tutor_service import ai_tutor_service
from backend.app.services.course_service import course_service
from backend.app.models.schemas import CircuitDefinition, GateOperation, AITutorRequest

def test_bell_state_simulation():
    circuit = CircuitDefinition(
        num_qubits=2,
        gates=[
            GateOperation(gate="H", targets=[0], step=0),
            GateOperation(gate="CX", targets=[1], controls=[0], step=1)
        ],
        name="Bell State Test"
    )
    result = simulation_service.simulate(circuit)
    assert result.success is True
    assert result.num_qubits == 2
    assert "00" in result.probabilities
    assert "11" in result.probabilities
    assert abs(result.probabilities["00"] - 0.5) < 0.05
    assert abs(result.probabilities["11"] - 0.5) < 0.05
    assert len(result.bloch_vectors) == 2
    # In entangled state, single-qubit Bloch vector length shrinks towards zero
    bv0 = result.bloch_vectors[0]
    r0 = (bv0.x**2 + bv0.y**2 + bv0.z**2)**0.5
    assert r0 < 0.1
    print("[PASS] test_bell_state_simulation passed successfully!")

def test_ai_tutor_context():
    circuit = CircuitDefinition(
        num_qubits=2,
        gates=[
            GateOperation(gate="H", targets=[0], step=0),
            GateOperation(gate="CX", targets=[1], controls=[0], step=1)
        ]
    )
    result = simulation_service.simulate(circuit)
    req = AITutorRequest(
        message="Why are outcomes 01 and 10 zero probability?",
        circuit=circuit,
        simulation_result=result,
        action="explain_state"
    )
    resp = ai_tutor_service.generate_response(req)
    assert resp.analysis is not None
    assert resp.analysis["is_entangled"] is True
    assert "entanglement" in resp.reply.lower() or "bell" in resp.reply.lower()
    print("[PASS] test_ai_tutor_context passed successfully!")

def test_curriculum_modules():
    modules = course_service.get_all_modules()
    assert len(modules) == 12
    # Verify 4 tracks
    tracks = set(m.track for m in modules)
    assert len(tracks) == 4
    print(f"[PASS] test_curriculum_modules passed with {len(modules)} modules across {len(tracks)} tracks!")

def test_certification_exam():
    from backend.app.services.assessment_service import assessment_service
    exam = assessment_service.get_certification_exam()
    assert len(exam) == 10
    # Simulate perfect score
    answers = {q.id: 0 for q in exam} # just some answers
    # Provide exact correct answers from question bank
    correct_answers = {q["id"]: q["correct"] for q in assessment_service._certification_question_bank[:10]}
    result = assessment_service.evaluate_certification_exam("Test Scholar", correct_answers)
    assert result.passed is True
    assert result.score_percentage == 100.0
    assert result.certificate is not None
    assert result.certificate.student_name == "Test Scholar"
    assert "SHA256" in result.certificate.verification_hash
    print("[PASS] test_certification_exam passed with verified digital certificate!")

if __name__ == "__main__":
    test_bell_state_simulation()
    test_ai_tutor_context()
    test_curriculum_modules()
    test_certification_exam()
    print("ALL BACKEND TESTS PASSED!")
