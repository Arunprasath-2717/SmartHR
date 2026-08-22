import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from datetime import datetime, date, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.payroll import Payroll
from app.models.notification import Notification

# In-memory SQLite database for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # 1. Seed Departments
    dept_eng = Department(name="Engineering")
    dept_hr = Department(name="Human Resources")
    session.add_all([dept_eng, dept_hr])
    session.flush()

    # 2. Seed Users
    emp_user = User(
        email="alice@company.com",
        name="Alice Employee",
        password_hash=get_password_hash("Password123!"),
        role="employee",
        is_active=True
    )
    hr_user = User(
        email="bob@company.com",
        name="Bob HR",
        password_hash=get_password_hash("Password123!"),
        role="hr_officer",
        is_active=True
    )
    admin_user = User(
        email="carol@company.com",
        name="Carol Admin",
        password_hash=get_password_hash("Password123!"),
        role="admin",
        is_active=True
    )
    emp_user_2 = User(
        email="dave@company.com",
        name="Dave Employee",
        password_hash=get_password_hash("Password123!"),
        role="employee",
        is_active=True
    )
    session.add_all([emp_user, hr_user, admin_user, emp_user_2])
    session.flush()

    # 3. Seed Employees
    emp_alice = Employee(
        user_id=emp_user.id,
        name="Alice Employee",
        work_email="alice@company.com",
        work_phone="+1-555-0101",
        job_title="Software Engineer",
        department_id=dept_eng.id,
        emergency_contact="John Employee",
        emergency_phone="+1-555-9999",
        active=True
    )
    emp_bob = Employee(
        user_id=hr_user.id,
        name="Bob HR",
        work_email="bob@company.com",
        work_phone="+1-555-0102",
        job_title="HR Manager",
        department_id=dept_hr.id,
        active=True
    )
    emp_dave = Employee(
        user_id=emp_user_2.id,
        name="Dave Employee",
        work_email="dave@company.com",
        work_phone="+1-555-0104",
        job_title="QA Engineer",
        department_id=dept_eng.id,
        active=True
    )
    session.add_all([emp_alice, emp_bob, emp_dave])
    session.flush()

    # 4. Seed Payrolls
    payroll_alice = Payroll(
        employee_id=emp_alice.id,
        basic_salary=5000.0,
        allowances=1000.0,
        deductions=500.0,
        net_salary=5500.0,
        payment_frequency="monthly",
        currency="USD"
    )
    payroll_bob = Payroll(
        employee_id=emp_bob.id,
        basic_salary=6000.0,
        allowances=1200.0,
        deductions=600.0,
        net_salary=6600.0,
        payment_frequency="monthly",
        currency="USD"
    )
    session.add_all([payroll_alice, payroll_bob])

    # 5. Seed Attendance
    att_alice = Attendance(
        employee_id=emp_alice.id,
        check_in=datetime(2026, 8, 1, 9, 0, tzinfo=timezone.utc),
        check_out=datetime(2026, 8, 1, 17, 30, tzinfo=timezone.utc),
        worked_hours=8.5
    )
    session.add(att_alice)

    # 6. Seed Leaves
    leave_alice = Leave(
        employee_id=emp_alice.id,
        leave_type="paid",
        start_date=date(2026, 9, 1),
        end_date=date(2026, 9, 5),
        remarks="Vacation",
        status="pending",
        ai_is_anomaly=False,
        ai_score=0.0,
        ai_risk_level="low",
        ai_evaluation_status="evaluated"
    )
    leave_dave = Leave(
        employee_id=emp_dave.id,
        leave_type="sick",
        start_date=date(2026, 9, 10),
        end_date=date(2026, 9, 12),
        remarks="Flu",
        status="pending",
        ai_is_anomaly=False,
        ai_score=0.0,
        ai_risk_level="low",
        ai_evaluation_status="evaluated"
    )
    session.add_all([leave_alice, leave_dave])

    # 7. Seed Notification
    notif_alice = Notification(
        user_id=emp_user.id,
        title="Welcome to Dayflow",
        message="Your profile has been created.",
        notification_type="info",
        is_read=False
    )
    notif_dave = Notification(
        user_id=emp_user_2.id,
        title="System Notice",
        message="Notice for Dave.",
        notification_type="info",
        is_read=False
    )
    session.add_all([notif_alice, notif_dave])

    session.commit()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers_emp():
    token = create_access_token(subject=1, role="employee")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_hr():
    token = create_access_token(subject=2, role="hr_officer")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_admin():
    token = create_access_token(subject=3, role="admin")
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_dave():
    token = create_access_token(subject=4, role="employee")
    return {"Authorization": f"Bearer {token}"}
