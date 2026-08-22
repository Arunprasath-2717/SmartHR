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

    # Phase 13 AI Anomaly Fields
    ai_is_anomaly = fields.Boolean(string='AI Anomaly Flag', default=False)
    ai_score = fields.Float(string='AI Anomaly Score', default=0.0)
    ai_risk_level = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], string='AI Risk Level', default='low')
    ai_reasons = fields.Text(string='AI Reasons')
    ai_evaluation_status = fields.Selection([
        ('evaluated', 'Evaluated'),
        ('fallback', 'Fallback'),
        ('skipped', 'Skipped'),
    ], string='AI Evaluation Status', default='fallback')
