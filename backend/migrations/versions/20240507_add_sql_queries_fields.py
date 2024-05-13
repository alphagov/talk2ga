"""Add SQL queries fields

Revision ID: 20240507
Revises: 2414ee75b615
Create Date: 2024-05-07 15:24:16.086408

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "20240507"
down_revision: Union[str, None] = "2414ee75b615"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "question",
        sa.Column(
            "executed_sql_query", sqlmodel.sql.sqltypes.AutoString(), nullable=True
        ),
    )
    op.add_column(
        "question",
        sa.Column(
            "generated_sql_queries", sqlmodel.sql.sqltypes.AutoString(), nullable=True
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("question", "generated_sql_queries")
    op.drop_column("question", "executed_sql_query")
    # ### end Alembic commands ###
