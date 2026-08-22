from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class BranchOut(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    created_at: datetime
