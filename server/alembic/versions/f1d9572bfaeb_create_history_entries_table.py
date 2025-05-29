"""create_history_entries_table

Revision ID: f1d9572bfaeb
Revises: ed89a10732f3
Create Date: 2025-05-29 11:54:44.324438

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1d9572bfaeb'
down_revision: Union[str, None] = 'ed89a10732f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
