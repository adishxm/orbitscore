"""Initial schema for OrbitScore spatial-temporal and compliance registry

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-25 01:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Missions table
    op.create_table(
        'missions',
        sa.Column('mission_id', sa.String(length=128), primary_key=True),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('data_json', sa.Text(), nullable=False),
        sa.Column('updated_at', sa.String(length=64), nullable=False)
    )

    # 2. Artifacts table
    op.create_table(
        'artifacts',
        sa.Column('artifact_id', sa.String(length=128), primary_key=True),
        sa.Column('mission_id', sa.String(length=128), nullable=False),
        sa.Column('filename', sa.String(length=256), nullable=False),
        sa.Column('media_type', sa.String(length=128), nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False),
        sa.Column('content_blob', sa.LargeBinary(), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=False),
        sa.Column('uploaded_at', sa.String(length=64), nullable=False)
    )

    # 3. Fields table
    op.create_table(
        'fields',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('mission_id', sa.String(length=128), nullable=False),
        sa.Column('field_name', sa.String(length=128), nullable=False),
        sa.Column('value_json', sa.Text(), nullable=True),
        sa.Column('human_confirmed', sa.Integer(), server_default='0', nullable=False),
        sa.Column('artifact_id', sa.String(length=128), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.String(length=64), nullable=False)
    )

    # 4. Evaluations table
    op.create_table(
        'evaluations',
        sa.Column('mission_id', sa.String(length=128), primary_key=True),
        sa.Column('profile_id', sa.String(length=128), nullable=False),
        sa.Column('result_json', sa.Text(), nullable=False),
        sa.Column('evaluated_at', sa.String(length=64), nullable=False)
    )

    # 5. Reviews table
    op.create_table(
        'reviews',
        sa.Column('finding_id', sa.String(length=128), primary_key=True),
        sa.Column('mission_id', sa.String(length=128), nullable=False),
        sa.Column('decision', sa.String(length=64), nullable=False),
        sa.Column('note', sa.Text(), nullable=False),
        sa.Column('reviewer', sa.String(length=128), nullable=False),
        sa.Column('reviewed_at', sa.String(length=64), nullable=False)
    )

    # 6. Counterfactuals table
    op.create_table(
        'counterfactuals',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('mission_id', sa.String(length=128), nullable=False),
        sa.Column('request_json', sa.Text(), nullable=False),
        sa.Column('response_json', sa.Text(), nullable=False),
        sa.Column('created_at', sa.String(length=64), nullable=False)
    )

    # 7. Provenance table
    op.create_table(
        'provenance',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('sequence_num', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(length=128), nullable=False),
        sa.Column('payload_json', sa.Text(), nullable=False),
        sa.Column('timestamp_iso', sa.String(length=64), nullable=False),
        sa.Column('prev_sha256', sa.String(length=64), nullable=False),
        sa.Column('event_sha256', sa.String(length=64), nullable=False)
    )

    # 8. Spatio-temporal TLE Snapshots
    op.create_table(
        'tle_snapshots',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('norad_id', sa.String(length=64), nullable=False),
        sa.Column('epoch', sa.String(length=64), nullable=False),
        sa.Column('raw_tle', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=64), nullable=False),
        sa.Column('fetched_at', sa.String(length=64), nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=False)
    )

    # 9. Spatio-temporal Conjunction Events
    op.create_table(
        'cdm_events',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('event_id', sa.String(length=128), nullable=False),
        sa.Column('norad_primary', sa.String(length=64), nullable=False),
        sa.Column('norad_secondary', sa.String(length=64), nullable=False),
        sa.Column('tca', sa.String(length=64), nullable=False),
        sa.Column('miss_distance_m', sa.Float(), nullable=False),
        sa.Column('relative_speed_m_s', sa.Float(), nullable=False),
        sa.Column('raw_cdm_json', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=64), nullable=False),
        sa.Column('fetched_at', sa.String(length=64), nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('cdm_events')
    op.drop_table('tle_snapshots')
    op.drop_table('provenance')
    op.drop_table('counterfactuals')
    op.drop_table('reviews')
    op.drop_table('evaluations')
    op.drop_table('fields')
    op.drop_table('artifacts')
    op.drop_table('missions')
