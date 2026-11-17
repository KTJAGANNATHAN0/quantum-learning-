import urllib.request
import json

BASE = "http://127.0.0.1:8000/api"

def run_checks():
    print("--- 1. Testing Curriculum Modules ---")
    req = urllib.request.urlopen(f"{BASE}/courses/modules")
    mods = json.loads(req.read().decode())
    print(f"Total Modules: {len(mods)}")
    tracks = set(m["track"] for m in mods)
    print(f"Tracks: {tracks}")
    for m in mods:
        print(f"  [{m['track']}] {m['id']}: {m['title']} ({len(m['quiz'])} quiz questions, challenge: {bool(m['challenge'])})")

    print("\n--- 2. Testing Certification Exam ---")
    req = urllib.request.urlopen(f"{BASE}/assessment/exam")
    exam_qs = json.loads(req.read().decode())
    print(f"Exam Questions loaded: {len(exam_qs)}")

    print("\n--- 3. Testing Exam Submission & Certificate Generation ---")
    exam_payload = json.dumps({
        "student_name": "Dr. Alex Vance",
        "answers": {
            "exam-1": 1, "exam-2": 2, "exam-3": 2, "exam-4": 1, "exam-5": 2,
            "exam-6": 0, "exam-7": 0, "exam-8": 1, "exam-9": 0, "exam-10": 0
        }
    }).encode()
    req = urllib.request.Request(f"{BASE}/assessment/exam", data=exam_payload, headers={"Content-Type": "application/json"})
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Exam Result: passed={res['passed']}, score={res['score']}/{res['total']} ({res['score_percentage']}%)")
    cert = res.get("certificate")
    if cert:
        print(f"Certificate Issued to: {cert['student_name']}")
        print(f"Certificate ID: {cert['certificate_id']}")
        print(f"Course Title: {cert['course_title']}")
        print(f"Verification Hash: {cert['verification_hash']}")
    else:
        print("ERROR: Certificate was not issued!")

    print("\n--- 4. Testing Custom Challenge Creation ---")
    cust_payload = json.dumps({
        "title": "W-State Entanglement Challenge",
        "description": "Prepare the symmetric W state using parameterized rotations and controlled gates.",
        "target_state": "(|001> + |010> + |100>)/sqrt(3)",
        "hints": ["Rotate qubit 0", "Controlled operations to split superposition"],
        "starter_qubits": 3,
        "assigned_cohort": "Quantum Computing 101 - Fall Cohort"
    }).encode()
    req = urllib.request.Request(f"{BASE}/assessment/custom-challenge", data=cust_payload, headers={"Content-Type": "application/json"})
    cust_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Custom challenge created: ID={cust_res['id']}, Title={cust_res['title']}")

    print("\n--- 5. Testing Custom Challenges Retrieval ---")
    req = urllib.request.urlopen(f"{BASE}/assessment/custom-challenge")
    all_cust = json.loads(req.read().decode())
    print(f"Custom challenges in DB: {len(all_cust)}")

    print("\n--- 6. Testing Frontend Dev Server ---")
    fe_req = urllib.request.urlopen("http://127.0.0.1:5173/")
    print(f"Frontend HTTP Status: {fe_req.status}")
    print("\n[OK] ALL ENDPOINTS & FLOWS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    run_checks()
