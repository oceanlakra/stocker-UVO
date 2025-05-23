"""remove facebook id column

Revision ID: ed89a10732f3
Revises: b416906b4f79
Create Date: 2025-05-24 00:56:59.409419

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed89a10732f3'
down_revision: Union[str, None] = 'b416906b4f79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
