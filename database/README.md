# Database Management & Reference Data

## Schema Management & Authority

> [!IMPORTANT]
> **Do not create independent database schemas or manual DDL SQL migration scripts here.**
>
> In the Dayflow architecture, **Odoo ORM** is the single source of truth and sole authority for all relational database schema management, table creation, foreign key constraints, field definitions, indexes, and schema migrations.

## Purpose of this Directory

This directory is strictly reserved for:

1. **`seeds/`**: Development fixtures, reference datasets, and demo data used for populating non-production testing databases.
2. **Backups & Dumps**: Local development reference database dumps and snapshot utilities.
3. **Seed Scripts**: Helper scripts for populating development environments with mock employees, shifts, and attendance history.
