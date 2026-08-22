# -*- coding: utf-8 -*-
from odoo import models, fields


class DayflowNotification(models.Model):
    _name = 'dayflow.notification'
    _description = 'Dayflow In-App User Notification'
    _order = 'create_date desc, id desc'

    user_id = fields.Many2one(
        'res.users',
        string='Recipient User',
        required=True,
        ondelete='cascade',
        index=True
    )
    title = fields.Char(string='Title', required=True)
    message = fields.Text(string='Message', required=True)
    notification_type = fields.Selection([
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('danger', 'Danger'),
    ], string='Type', default='info', required=True)
    is_read = fields.Boolean(string='Is Read', default=False, index=True)
    res_model = fields.Char(string='Related Model')
    res_id = fields.Integer(string='Related Record ID')
