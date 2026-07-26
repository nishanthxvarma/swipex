from fastapi import APIRouter
import uuid

router = APIRouter()

@router.get("/")
async def list_companies():
    return []

@router.get("/{company_id}")
async def get_company(company_id: uuid.UUID):
    pass
