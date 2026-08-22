# -*- coding: utf-8 -*-
from odoo import models, fields, api


class DayflowPayroll(models.Model):
    _name = 'dayflow.payroll'
    _description = 'Dayflow Employee Salary Structure and Payroll'
    _order = 'id desc'

    employee_id = fields.Many2one(
        'hr.employee',
        string='Employee',
        required=True,
        ondelete='cascade',
        index=True
    )
    basic_salary = fields.Float(string='Basic Salary', default=0.0)
    allowances = fields.Float(string='Allowances', default=0.0)
    deductions = fields.Float(string='Deductions', default=0.0)
    net_salary = fields.Float(string='Net Salary', compute='_compute_net_salary', store=True)
    payment_frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('biweekly', 'Bi-weekly'),
        ('weekly', 'Weekly'),
    ], string='Payment Frequency', default='monthly', required=True)
    currency = fields.Char(string='Currency', default='USD', required=True)

    @api.depends('basic_salary', 'allowances', 'deductions')
    def _compute_net_salary(self):
        for rec in self:
            rec.net_salary = round((rec.basic_salary or 0.0) + (rec.allowances or 0.0) - (rec.deductions or 0.0), 2)
