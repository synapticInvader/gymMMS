from datetime import date, datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field

MemberStatus = Literal["active", "due", "expiring_soon", "expired"]


class MemberCreate(BaseModel):
    branch_id: UUID
    name: str = Field(min_length=1, max_length=120)
    mobile: str = Field(min_length=10, max_length=15)
    gender: str | None = None
    join_date: date


class MemberOut(BaseModel):
    id: UUID
    tenant_id: UUID
    branch_id: UUID
    name: str
    mobile: str
    gender: str | None
    join_date: date
    status: MemberStatus
    created_at: datetime