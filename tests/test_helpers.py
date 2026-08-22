# -*- coding: utf-8 -*-
"""
Shared Test Helpers & Mock Infrastructure for Dayflow API Tests.
Provides concrete mock models and environments for seamless, leak-free testing.
"""
import sys
import importlib.util
from datetime import datetime, date
from unittest.mock import MagicMock

class DummyResponse:
    def __init__(self, output, status=200, headers=None):
        self.output = output
        self.status = status
        self.headers = headers or []

def dummy_route(*args, **kwargs):
    def decorator(fn):
        return fn
    return decorator

# Global Odoo Mocks
mock_odoo = MagicMock()
mock_models = MagicMock()
mock_models.Model = object
mock_odoo.models = mock_models

mock_fields = MagicMock()
mock_fields.Datetime.now = lambda: datetime(2026, 8, 22, 9, 0, 0)
mock_fields.Date.today = lambda: date(2026, 8, 22)
mock_odoo.fields = mock_fields

mock_api = MagicMock()
mock_odoo.api = mock_api

mock_http = MagicMock()
mock_http.Controller = object
mock_http.Response = DummyResponse
mock_http.route = dummy_route
mock_odoo.http = mock_http

sys.modules['odoo'] = mock_odoo
sys.modules['odoo.http'] = mock_http
sys.modules['odoo.models'] = mock_models
sys.modules['odoo.fields'] = mock_fields
sys.modules['odoo.api'] = mock_api

# Concrete Model Simulator Classes
class MockDepartment:
    def __init__(self, id=1, name="Engineering"):
        self.id = id
        self.name = name

    def exists(self):
        return True

    def sudo(self):
        return self

class MockUser:
    def __init__(self, id=101, name="Alice Employee", login="alice@company.com", role="employee"):
        self.id = id
        self.name = name
        self.login = login
        self.email = login
        self.role = role
        self.employee_id = None

    def _is_public(self):
        return False

    def _is_admin(self):
        return self.role == "admin"

    def has_group(self, group_xml_id):
        if self.role == "admin":
            return True
        if self.role == "hr_officer":
            return group_xml_id in [
                'dayflow_core.group_dayflow_hr_officer',
                'dayflow_core.group_dayflow_employee',
                'base.group_user'
            ]
        if self.role == "employee":
            return group_xml_id in [
                'dayflow_core.group_dayflow_employee',
                'base.group_user'
            ]
        return False

    def exists(self):
        return True

    def sudo(self):
        return self

class MockEmployee:
    def __init__(self, id=501, name="Alice Employee", work_email="alice@company.com", user=None, role="employee"):
        self.id = id
        self.name = name
        self.work_email = work_email
        self.work_phone = "+1-555-0101"
        self.mobile_phone = "+1-555-0102"
        self.department_id = MockDepartment()
        self.job_title = "Software Engineer"
        self.emergency_contact = "Bob"
        self.emergency_phone = "+1-555-0199"
        self.active = True
        self.user_id = user or MockUser(id=id-400, name=name, login=work_email, role=role)

    def exists(self):
        return True

    def sudo(self):
        return self

    def write(self, vals):
        for k, v in vals.items():
            setattr(self, k, v)
        return True

class MockAttendance:
    def __init__(self, id=1, employee=None, check_in=None, check_out=None, worked_hours=0.0):
        self.id = id
        self.employee_id = employee or MockEmployee()
        self.check_in = check_in or datetime(2026, 8, 22, 9, 0, 0)
        self.check_out = check_out
        self.worked_hours = worked_hours

    def exists(self):
        return True

    def sudo(self):
        return self

    def write(self, vals):
        for k, v in vals.items():
            setattr(self, k, v)
        return True

class MockLeave:
    def __init__(self, id=1, employee=None, leave_type="paid", start_date=None, end_date=None, remarks=""):
        self.id = id
        self.employee_id = employee or MockEmployee()
        self.leave_type = leave_type
        self.start_date = start_date or date(2026, 9, 1)
        self.end_date = end_date or date(2026, 9, 5)
        self.remarks = remarks
        self.status = "pending"
        self.approver_comments = ""
        self.ai_is_anomaly = False
        self.ai_score = 0.0
        self.ai_risk_level = "low"
        self.ai_reasons = ""
        self.ai_evaluation_status = "evaluated"

    def exists(self):
        return True

    def sudo(self):
        return self

    def write(self, vals):
        for k, v in vals.items():
            setattr(self, k, v)
        return True

class MockPayroll:
    def __init__(self, id=1, employee=None, basic_salary=5000.0, allowances=1000.0, deductions=500.0):
        self.id = id
        self.employee_id = employee or MockEmployee()
        self.basic_salary = basic_salary
        self.allowances = allowances
        self.deductions = deductions
        self.net_salary = basic_salary + allowances - deductions
        self.payment_frequency = "monthly"
        self.currency = "USD"

    def exists(self):
        return True

    def sudo(self):
        return self

    def write(self, vals):
        for k, v in vals.items():
            setattr(self, k, v)
        if 'basic_salary' in vals or 'allowances' in vals or 'deductions' in vals:
            self.net_salary = self.basic_salary + self.allowances - self.deductions
        return True

class MockNotification:
    def __init__(self, id=1, user=None, title="Alert", message="Msg", notification_type="info", is_read=False):
        self.id = id
        self.user_id = user or MockUser()
        self.title = title
        self.message = message
        self.notification_type = notification_type
        self.is_read = is_read
        self.res_model = None
        self.res_id = None
        self.create_date = datetime(2026, 8, 22, 10, 0, 0)

    def exists(self):
        return True

    def sudo(self):
        return self

    def write(self, vals):
        for k, v in vals.items():
            setattr(self, k, v)
        return True

class MockEnv:
    """Simulates Odoo's request.env with model dictionary indexing"""
    def __init__(self, user=None):
        self.user = user
        self.models = {}

    def __getitem__(self, item):
        if item not in self.models:
            mock_model = MagicMock()
            mock_model.sudo.return_value = mock_model
            self.models[item] = mock_model
        return self.models[item]

    def __contains__(self, item):
        return True

def load_mod(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod

# Load all Dayflow controllers & services
common_mod = load_mod("dayflow_core.controllers.common", "backend/addons/dayflow_core/controllers/common.py")
health_mod = load_mod("dayflow_core.controllers.health", "backend/addons/dayflow_core/controllers/health.py")
auth_mod = load_mod("dayflow_core.controllers.auth", "backend/addons/dayflow_core/controllers/auth.py")
profile_mod = load_mod("dayflow_core.controllers.profile", "backend/addons/dayflow_core/controllers/profile.py")
emp_mod = load_mod("dayflow_core.controllers.employee", "backend/addons/dayflow_core/controllers/employee.py")
att_mod = load_mod("dayflow_core.controllers.attendance", "backend/addons/dayflow_core/controllers/attendance.py")
ai_client_mod = load_mod("dayflow_core.services.ai_client", "backend/addons/dayflow_core/services/ai_client.py")
notif_mod = load_mod("dayflow_core.controllers.notification", "backend/addons/dayflow_core/controllers/notification.py")
leave_mod = load_mod("dayflow_core.controllers.leave", "backend/addons/dayflow_core/controllers/leave.py")
payroll_mod = load_mod("dayflow_core.controllers.payroll", "backend/addons/dayflow_core/controllers/payroll.py")
dashboard_mod = load_mod("dayflow_core.controllers.dashboard", "backend/addons/dayflow_core/controllers/dashboard.py")
reports_mod = load_mod("dayflow_core.controllers.reports", "backend/addons/dayflow_core/controllers/reports.py")

ALL_MODULES = [
    common_mod, health_mod, auth_mod, profile_mod, emp_mod,
    att_mod, ai_client_mod, notif_mod, leave_mod, payroll_mod,
    dashboard_mod, reports_mod
]

def set_request(mock_req):
    """
    Sets the active mock request across all loaded modules and the Odoo http mock.
    """
    mock_http.request = mock_req
    for mod in ALL_MODULES:
        if hasattr(mod, 'request'):
            mod.request = mock_req
