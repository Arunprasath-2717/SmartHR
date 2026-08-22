# -*- coding: utf-8 -*-
"""
Dayflow Master API Test Runner.
Discovers and executes all unit, integration, and security test suites.
"""
import os
import sys
import unittest
import time

# Ensure current directory is on PYTHONPATH
sys.path.insert(0, os.path.abspath('.'))

def run_all_tests():
    start_time = time.time()
    print("=" * 80)
    print("           DAYFLOW BACKEND — MASTER END-TO-END API TEST RUNNER          ")
    print("=" * 80)

    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Discover tests in tests/
    test_files = [
        "tests.api.test_health",
        "tests.api.test_auth",
        "tests.api.test_profile",
        "tests.api.test_employees",
        "tests.api.test_attendance",
        "tests.api.test_leave",
        "tests.api.test_leave_admin",
        "tests.api.test_payroll",
        "tests.api.test_dashboard",
        "tests.api.test_notifications",
        "tests.api.test_reports",
        "tests.security.test_authorization",
        "tests.integration.test_ai_leave",
    ]

    for tf in test_files:
        try:
            loaded_suite = loader.loadTestsFromName(tf)
            suite.addTests(loaded_suite)
            print(f"  [LOADED] {tf} ({loaded_suite.countTestCases()} test cases)")
        except Exception as e:
            print(f"  [ERROR LOADING] {tf}: {e}")

    print("\n" + "-" * 80)
    print(f"Executing {suite.countTestCases()} tests across {len(test_files)} test suites...")
    print("-" * 80 + "\n")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    duration = round(time.time() - start_time, 2)
    print("\n" + "=" * 80)
    print("                             TEST RUN SUMMARY                           ")
    print("=" * 80)
    print(f"Total Tests Run: {result.testsRun}")
    print(f"Passed:          {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures:        {len(result.failures)}")
    print(f"Errors:          {len(result.errors)}")
    print(f"Execution Time:  {duration}s")
    print("=" * 80)

    return len(result.failures) == 0 and len(result.errors) == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
