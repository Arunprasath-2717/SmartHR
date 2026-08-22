# -*- coding: utf-8 -*-
from odoo import models, fields


class DayflowLeave(models.Model):
    _name = 'dayflow.leave'
    _description = 'Dayflow Employee Leave Request'
    _order = 'create_date desc, id desc'

    employee_id = fields.Many2one(
        'hr.employee',
        string='Employee',
        required=True,
        ondelete='cascade'
    )
    leave_type = fields.Selection([
        ('paid', 'Paid'),
        ('sick', 'Sick'),
        ('unpaid', 'Unpaid'),
    ], string='Leave Type', required=True)

    start_date = fields.Date(string='Start Date', required=True)
    end_date = fields.Date(string='End Date', required=True)
    remarks = fields.Text(string='Remarks')

    status = fields.Selection([
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], string='Status', default='pending', required=True)

    approver_comments = fields.Text(string='Approver Comments')
