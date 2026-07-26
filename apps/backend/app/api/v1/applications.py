from fastapi import APIRouter, Depends
import uuid

router = APIRouter()

@router.post("/")
async def create_application():
    pass

@router.get("/")
async def get_applications():
    return []

@router.get("/{app_id}")
async def get_application(app_id: uuid.UUID):
    pass

@router.put("/{app_id}/status")
async def update_status(app_id: uuid.UUID):
    pass
