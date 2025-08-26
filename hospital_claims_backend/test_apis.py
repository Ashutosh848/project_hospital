#!/usr/bin/env python3
"""
Comprehensive API Testing Script for Hospital Claims Backend
Tests all endpoints including authentication, claims, and dashboard APIs
"""

import requests
import json
import time
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000/api"

# Test data
TEST_USER_DATA = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "role": "data_entry"
}

TEST_CLAIM_DATA = {
    "month": "2024-01",
    "date_of_admission": "2024-01-15",
    "date_of_discharge": "2024-01-20",
    "tpa_name": "Test TPA",
    "parent_insurance": "Test Insurance",
    "claim_id": "TEST001",
    "uhid_ip_no": "UHID001",
    "patient_name": "John Doe",
    "bill_amount": 50000,
    "approved_amount": 45000,
    "mou_discount": 5000,
    "co_pay": 0,
    "consumable_deduction": 0,
    "hospital_discount": 0,
    "paid_by_patient": 0,
    "hospital_discount_authority": "Manager",
    "other_deductions": 0,
    "physical_file_dispatch": "pending",
    "query_reply_date": "2024-01-17",
    "settlement_date": "2024-01-25",
    "tds": 0,
    "amount_settled_in_ac": 45000,
    "total_settled_amount": 45000,
    "difference_amount": 0,
    "reason_less_settlement": "",
    "claim_settled_software": True,
    "receipt_verified_bank": True
}

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, response=None, error=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "timestamp": datetime.now().isoformat(),
            "status_code": response.status_code if response else None,
            "error": str(error) if error else None
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if error:
            print(f"   Error: {error}")
        if response and not success:
            print(f"   Response: {response.text[:200]}...")
        print()

    def test_server_connection(self):
        """Test if the server is running"""
        try:
            response = self.session.get(f"{BASE_URL}/auth/login/")
            self.log_test("Server Connection", True, response)
            return True
        except requests.exceptions.ConnectionError as e:
            self.log_test("Server Connection", False, error=f"Server not running: {e}")
            return False

    def test_authentication_apis(self):
        """Test authentication endpoints"""
        print("🔐 Testing Authentication APIs...")
        
        # Test login endpoint (should return 405 for GET)
        try:
            response = self.session.get(f"{BASE_URL}/auth/login/")
            self.log_test("Login GET (should fail)", response.status_code == 405, response)
        except Exception as e:
            self.log_test("Login GET", False, error=e)

        # Test login with POST (should fail without credentials)
        try:
            response = self.session.post(f"{BASE_URL}/auth/login/", json={})
            self.log_test("Login POST (no credentials)", response.status_code == 400, response)
        except Exception as e:
            self.log_test("Login POST", False, error=e)

        # Test user creation
        try:
            response = self.session.post(f"{BASE_URL}/auth/users/", json=TEST_USER_DATA)
            success = response.status_code in [201, 400]  # 201 for success, 400 if user already exists
            self.log_test("User Creation", success, response)
        except Exception as e:
            self.log_test("User Creation", False, error=e)

        # Test login with valid credentials
        try:
            login_data = {
                "username": TEST_USER_DATA["username"],
                "password": TEST_USER_DATA["password"]
            }
            response = self.session.post(f"{BASE_URL}/auth/login/", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access')
                self.refresh_token = data.get('refresh')
                # Set authorization header for subsequent requests
                self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
                self.log_test("Login with Credentials", True, response)
            else:
                self.log_test("Login with Credentials", False, response)
        except Exception as e:
            self.log_test("Login with Credentials", False, error=e)

        # Test current user endpoint (requires authentication)
        if self.access_token:
            try:
                response = self.session.get(f"{BASE_URL}/auth/users/me/")
                self.log_test("Get Current User", response.status_code == 200, response)
            except Exception as e:
                self.log_test("Get Current User", False, error=e)

        # Test user list endpoint
        try:
            response = self.session.get(f"{BASE_URL}/auth/users/")
            self.log_test("User List", response.status_code == 200, response)
        except Exception as e:
            self.log_test("User List", False, error=e)

    def test_claims_apis(self):
        """Test claims endpoints"""
        print("📋 Testing Claims APIs...")
        
        # Test claims list endpoint
        try:
            response = self.session.get(f"{BASE_URL}/claims/")
            self.log_test("Claims List", response.status_code == 200, response)
        except Exception as e:
            self.log_test("Claims List", False, error=e)

        # Test claim creation
        try:
            response = self.session.post(f"{BASE_URL}/claims/", json=TEST_CLAIM_DATA)
            if response.status_code == 201:
                claim_data = response.json()
                claim_id = claim_data.get('id')
                self.log_test("Claim Creation", True, response)
                
                # Test claim retrieval
                try:
                    response = self.session.get(f"{BASE_URL}/claims/{claim_id}/")
                    self.log_test("Claim Retrieval", response.status_code == 200, response)
                except Exception as e:
                    self.log_test("Claim Retrieval", False, error=e)

                # Test claim update
                try:
                    update_data = {"patient_name": "Jane Doe Updated"}
                    response = self.session.patch(f"{BASE_URL}/claims/{claim_id}/", json=update_data)
                    self.log_test("Claim Update", response.status_code == 200, response)
                except Exception as e:
                    self.log_test("Claim Update", False, error=e)

                # Test claim deletion
                try:
                    response = self.session.delete(f"{BASE_URL}/claims/{claim_id}/")
                    self.log_test("Claim Deletion", response.status_code == 204, response)
                except Exception as e:
                    self.log_test("Claim Deletion", False, error=e)
            else:
                self.log_test("Claim Creation", False, response)
        except Exception as e:
            self.log_test("Claim Creation", False, error=e)

    def test_dashboard_apis(self):
        """Test dashboard endpoints"""
        print("📊 Testing Dashboard APIs...")
        
        # Test dashboard summary
        try:
            response = self.session.get(f"{BASE_URL}/claims/dashboard/summary/")
            self.log_test("Dashboard Summary", response.status_code == 200, response)
        except Exception as e:
            self.log_test("Dashboard Summary", False, error=e)

        # Test dashboard monthwise
        try:
            response = self.session.get(f"{BASE_URL}/claims/dashboard/monthwise/")
            self.log_test("Dashboard Monthwise", response.status_code == 200, response)
        except Exception as e:
            self.log_test("Dashboard Monthwise", False, error=e)

        # Test dashboard companywise
        try:
            response = self.session.get(f"{BASE_URL}/claims/dashboard/companywise/")
            self.log_test("Dashboard Companywise", response.status_code == 200, response)
        except Exception as e:
            self.log_test("Dashboard Companywise", False, error=e)

    def test_error_handling(self):
        """Test error handling"""
        print("⚠️ Testing Error Handling...")
        
        # Test invalid claim ID
        try:
            response = self.session.get(f"{BASE_URL}/claims/99999/")
            self.log_test("Invalid Claim ID", response.status_code == 404, response)
        except Exception as e:
            self.log_test("Invalid Claim ID", False, error=e)

        # Test invalid user ID
        try:
            response = self.session.get(f"{BASE_URL}/auth/users/99999/")
            self.log_test("Invalid User ID", response.status_code == 404, response)
        except Exception as e:
            self.log_test("Invalid User ID", False, error=e)

        # Test unauthorized access (without token)
        try:
            # Temporarily remove authorization header
            original_headers = self.session.headers.copy()
            self.session.headers.pop('Authorization', None)
            response = self.session.get(f"{BASE_URL}/auth/users/me/")
            self.log_test("Unauthorized Access", response.status_code == 401, response)
            # Restore headers
            self.session.headers.update(original_headers)
        except Exception as e:
            self.log_test("Unauthorized Access", False, error=e)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API Tests...")
        print("=" * 50)
        
        # Test server connection first
        if not self.test_server_connection():
            print("❌ Server is not running. Please start the Django server first.")
            return
        
        # Run all test suites
        self.test_authentication_apis()
        self.test_claims_apis()
        self.test_dashboard_apis()
        self.test_error_handling()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['error']}")
        
        # Save results to file
        with open('api_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\n📄 Detailed results saved to: api_test_results.json")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()

