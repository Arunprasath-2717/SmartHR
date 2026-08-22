"""add missing employee and attendance columns

Revision ID: 0001_schema_sync
Revises: 
Create Date: 2026-08-22 15:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_schema_sync'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add missing columns to employees table
    op.add_column('employees', sa.Column('address', sa.String(length=500), nullable=True))
    op.add_column('employees', sa.Column('profile_picture', sa.String(length=1000), nullable=True))
    op.add_column('employees', sa.Column('documents', sa.Text(), nullable=True))

    # 2. Add missing status column to attendances table
    op.add_column('attendances', sa.Column('status', sa.String(length=50), nullable=False, server_default='Present'))
    op.create_index(op.f('ix_attendances_status'), 'attendances', ['status'], unique=False)


def downgrade() -> None:
    # 1. Drop index and status column from attendances
    op.drop_index(op.f('ix_attendances_status'), table_name='attendances')
    op.drop_column('attendances', 'status')

    # 2. Drop added columns from employees
    op.drop_column('employees', 'documents')
    op.drop_column('employees', 'profile_picture')
    op.drop_column('employees', 'address')
