from fastapi import APIRouter
import uuid

router = APIRouter()

@router.get("/")
async def get_notifications():
    return []

@router.put("/{notif_id}/read")
async def mark_read(notif_id: uuid.UUID):
    pass

@router.put("/read-all")
async def mark_all_read():
    pass
