from fastapi import APIRouter
from app.models.branch import BranchOut
from app.core.supabase_client import get_supabase
from app.core.config import get_settings

router = APIRouter(prefix="/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
def list_branches():
    settings = get_settings()
    sb = get_supabase()
    result = (
        sb.table("branches")
        .select("*")
        .eq("tenant_id", settings.default_tenant_id)
        .execute()
    )
    return result.data
