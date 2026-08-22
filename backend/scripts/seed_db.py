# -*- coding: utf-8 -*-
"""Seed default test accounts and departments into the active database."""
import os
import sys
from datetime import datetime, date, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Department, Employee, Payroll, Leave, Attendance, Notification

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Departments
        eng = db.query(Department).filter(Department.name == "Engineering").first()
        if not eng:
            eng = Department(name="Engineering")
            db.add(eng)

        hr_dept = db.query(Department).filter(Department.name == "Human Resources").first()
        if not hr_dept:
            hr_dept = Department(name="Human Resources")
            db.add(hr_dept)

        db.flush()

        # 2. Users & Employees
        users_data = [
            ("alice@company.com", "Alice Employee", "employee", "Software Engineer", eng.id, "+1-555-0101"),
            ("bob@company.com", "Bob HR", "hr_officer", "HR Manager", hr_dept.id, "+1-555-0102"),
            ("carol@company.com", "Carol Admin", "admin", "System Administrator", eng.id, "+1-555-0103"),
            ("dave@company.com", "Dave Employee", "employee", "QA Engineer", eng.id, "+1-555-0104"),
        ]

        for email, name, role, title, dept_id, phone in users_data:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    name=name,
                    password_hash=get_password_hash("Password123!"),
                    role=role,
                    is_active=True
                )
                db.add(user)
                db.flush()

            emp = db.query(Employee).filter(Employee.user_id == user.id).first()
            if not emp:
                emp = Employee(
                    user_id=user.id,
                    name=name,
                    work_email=email,
                    work_phone=phone,
                    job_title=title,
                    department_id=dept_id,
                    active=True
                )
                db.add(emp)
                db.flush()

            pay = db.query(Payroll).filter(Payroll.employee_id == emp.id).first()
            if not pay:
                pay = Payroll(
                    employee_id=emp.id,
                    basic_salary=5000.0 if role == "employee" else 7500.0,
                    allowances=1000.0,
                    deductions=500.0,
                    net_salary=5500.0 if role == "employee" else 8000.0,
                    payment_frequency="monthly",
                    currency="USD"
                )
                db.add(pay)

        db.commit()
        print("Database seeded successfully with default test accounts!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
