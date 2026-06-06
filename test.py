#!/usr/bin/env python3
import subprocess
import urllib.request
import urllib.error
import json
import time
import sys
import os

# Start server on a test port
PORT = 8999
server_process = subprocess.Popen(
    [sys.executable, "server.py", str(PORT)],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

time.sleep(1.5)  # wait for server to start

# Helper to query the server
def query_api(path, method="GET", data=None):
    url = f"http://localhost:{PORT}{path}"
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(data).encode("utf-8")
    else:
        encoded_data = None
    try:
        with urllib.request.urlopen(req, data=encoded_data) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 0, str(e)

# Run tests
tests_failed = 0

print("Running Lorentz.ai Integration Tests...\n")

try:
    # Test 1: Status Check
    status, res = query_api("/api/status")
    if status == 200 and res.get("status") == "ok":
        print("[PASS] Test 1: API Status endpoint")
    else:
        print(f"[FAIL] Test 1: API Status endpoint (Status: {status}, Response: {res})")
        tests_failed += 1

    # Test 2: Get Messages
    status, res = query_api("/api/chat/messages?student_id=JD")
    if status == 200 and isinstance(res, list) and len(res) > 0:
        print(f"[PASS] Test 2: Get Chat Messages (Count: {len(res)})")
    else:
        print(f"[FAIL] Test 2: Get Chat Messages (Status: {status}, Response: {res})")
        tests_failed += 1

    # Test 3: Send Message
    status, res = query_api("/api/chat/send", "POST", {"student_id": "JD", "text": "Testing time dilation"})
    if status == 200 and "ai_message" in res:
        print("[PASS] Test 3: Send Message and receive AI response")
    else:
        print(f"[FAIL] Test 3: Send Message (Status: {status}, Response: {res})")
        tests_failed += 1

    # Test 4: Get Graph
    status, res = query_api("/api/chat/graph?student_id=JD")
    if status == 200 and "nodes" in res and "edges" in res:
        print(f"[PASS] Test 4: Get Chat Graph (Nodes: {len(res['nodes'])}, Edges: {len(res['edges'])})")
    else:
        print(f"[FAIL] Test 4: Get Chat Graph (Status: {status}, Response: {res})")
        tests_failed += 1

    # Test 5: Get KMerge lines and commits
    status_lines, res_lines = query_api("/api/kmerge/lines")
    status_commits, res_commits = query_api("/api/kmerge/commits")
    if status_lines == 200 and status_commits == 200:
        print(f"[PASS] Test 5: Get KMerge Doc Lines and Commits")
    else:
        print(f"[FAIL] Test 5: KMerge endpoints (Lines status: {status_lines}, Commits status: {status_commits})")
        tests_failed += 1

    # Test 6: Verify Hash
    status, res_events = query_api("/api/axiom/events")
    if status == 200 and len(res_events) > 0:
        test_hash = res_events[0]["hash"]
        status_verify, res_verify = query_api("/api/revisor/verify-hash", "POST", {"hash": test_hash})
        if status_verify == 200 and res_verify.get("found"):
            print(f"[PASS] Test 6: Verify Hash in Axiom Ledger ({test_hash})")
        else:
            print(f"[FAIL] Test 6: Verify Hash (Status: {status_verify}, Response: {res_verify})")
            tests_failed += 1
    else:
        print(f"[FAIL] Test 6: Could not query Axiom events to test verification")
        tests_failed += 1

    # Test 7: Blockchain Config Persistence (GET/POST)
    config_payload = {
        "sbc": "0x1111111111111111111111111111111111111111",
        "knowledge": "0x2222222222222222222222222222222222222222"
    }
    status_post, res_post = query_api("/api/blockchain/config", "POST", config_payload)
    status_get, res_get = query_api("/api/blockchain/config", "GET")
    if status_post == 200 and status_get == 200 and res_get.get("sbc") == config_payload["sbc"] and res_get.get("knowledge") == config_payload["knowledge"]:
        print("[PASS] Test 7: Blockchain Config Persistence (GET/POST)")
    else:
        print(f"[FAIL] Test 7: Blockchain Config Persistence (Post Status: {status_post}, Get Status: {status_get}, Response: {res_get})")
        tests_failed += 1

    # Test 8: Static file serving
    url_static = f"http://localhost:{PORT}/Lorentz.html"
    try:
        with urllib.request.urlopen(url_static) as response:
            html_content = response.read().decode("utf-8")
            if response.status == 200 and "<title>Lorentz.ai</title>" in html_content:
                print("[PASS] Test 8: Static file serving (Lorentz.html)")
            else:
                print(f"[FAIL] Test 8: Static file serving did not return correct title")
                tests_failed += 1
    except Exception as e:
        print(f"[FAIL] Test 8: Static file serving error: {e}")
        tests_failed += 1

finally:
    # Cleanup
    server_process.terminate()
    server_process.wait()

print("\n-------------------------------------------")
if tests_failed == 0:
    print("ALL TESTS PASSED! 🎉")
    sys.exit(0)
else:
    print(f"{tests_failed} TESTS FAILED.")
    sys.exit(1)
