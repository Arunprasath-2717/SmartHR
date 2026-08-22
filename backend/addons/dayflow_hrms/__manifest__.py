# -*- coding: utf-8 -*-
{
    'name': 'Dayflow HRMS',
    'version': '1.0.0',
    'summary': 'AI-Assisted Human Resource Management System',
    'sequence': 10,
    'description': """
Dayflow HRMS
============
An AI-Assisted Human Resource Management System built on Odoo Community 17.

Features:
---------
* Core Employee Management & Profiles
* Role-Based Access Control (RBAC)
* Attendance Tracking & Work Duration
* Leave Management & Approval Workflows
* Payroll Visibility
* Employee Self-Service & HR Management Dashboards
* AI-Powered Anomaly Detection Integration
    """,
    'category': 'Human Resources',
    'author': 'Dayflow Team',
    'website': 'https://github.com/dayflow/dayflow',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'hr',
        'hr_attendance',
        'hr_holidays',
        'mail',
    ],
    'data': [],
    'demo': [],
    'assets': {},
    'installable': True,
    'application': True,
    'auto_install': False,
}
