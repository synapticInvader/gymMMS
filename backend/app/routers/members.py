from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.models.member import MemberCreate, MemberOut
from app.core.supabase_client import get_supabase
from app.core.config import get_settings

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members():
    settings = get_settings()
    sb = get_supabase()
    result = (
        sb.table("members")
        .select("*")
        .eq("tenant_id", settings.default_tenant_id)
        .execute()
    )
    return result.data


@router.post("", response_model=MemberOut, status_code=201)
def create_member(payload: MemberCreate):
    settings = get_settings()
    sb = get_supabase()

    existing = (
        sb.table("members")
        .select("id")
        .eq("tenant_id", settings.default_tenant_id)
        .eq("branch_id", str(payload.branch_id))
        .eq("mobile", payload.mobile)
        .execute()
    )
    if existing.data:
        raise HTTPException(409, "A member with this mobile number already exists in this branch")

    record = {
        "tenant_id": settings.default_tenant_id,
        "branch_id": str(payload.branch_id),
        "name": payload.name,
        "mobile": payload.mobile,
        "gender": payload.gender,
        "join_date": payload.join_date.isoformat(),
        "status": "active",
    }
    result = sb.table("members").insert(record).execute()
    return result.data[0]