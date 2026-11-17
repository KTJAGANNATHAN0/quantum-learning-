import os
import urllib.request
import urllib.error
import json

key = os.getenv("GROQ_API_KEY", "your-groq-api-key-here")
models_to_test = [
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "allam-2-7b",
    "groq/compound-mini",
    "qwen/qwen3.8-27b"
]

for model in models_to_test:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "What is a qubit in 1 sentence?"}]
    }
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())
            ans = data["choices"][0]["message"]["content"]
            safe_ans = ans.encode('ascii', 'ignore').decode()
            print(f"[SUCCESS] Model '{model}' responded:\n{safe_ans}\n")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[FAILED] Model '{model}': HTTP {e.code} -> {body[:150]}")
    except Exception as e:
        print(f"[ERROR] Model '{model}': {e}")
