# -*- coding: utf-8 -*-
{
    'name': 'Dayflow Core',
    'version': '1.0.0',
    'summary': 'Dayflow Core Module, Security Roles, HR and Attendance API',
    'category': 'Human Resources',
    'author': 'Dayflow Team',
    'website': 'https://github.com/Arunprasath-2717/SmartHR',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'hr',
        'hr_attendance',
    ],
    'data': [
        'security/security_groups.xml',
        'security/ir.model.access.csv',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
}
