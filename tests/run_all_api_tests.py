# -*- coding: utf-8 -*-
"""
Dayflow Master API Test Runner (FastAPI Edition).
Discovers and executes all unit, integration, and security test suites using pytest.
"""
import os
import sys
import subprocess
import time

def run_all_tests():
    start_time = time.time()
    print("=" * 80)
    print("      DAYFLOW FASTAPI BACKEND — MASTER END-TO-END API TEST RUNNER       ")
    print("=" * 80)

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend"))
    venv_pytest = os.path.join(backend_dir, ".venv", "Scripts", "pytest.exe")

    if not os.path.exists(venv_pytest):
        venv_pytest = sys.executable

    cmd = [venv_pytest, os.path.join(backend_dir, "tests"), "-v"]
    print(f"Executing: {' '.join(cmd)}\n")

    res = subprocess.run(cmd, cwd=backend_dir)

    duration = round(time.time() - start_time, 2)
    print("\n" + "=" * 80)
    print("                             TEST RUN SUMMARY                           ")
    print("=" * 80)
    print(f"Status:          {'SUCCESS' if res.returncode == 0 else 'FAILED'}")
    print(f"Execution Time:  {duration}s")
    print("=" * 80)

    return res.returncode

if __name__ == "__main__":
    code = run_all_tests()
    sys.exit(code)
