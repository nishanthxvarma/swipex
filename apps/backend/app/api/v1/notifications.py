from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.core.security import get_current_user, parse_id
from app.api.deps import get_notification_service
from app.services.notification_service import NotificationService
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    NotificationPreferencesSchema,
)
from typing import Optional
import uuid

router = APIRouter()

@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    perPage: int = Query(20, ge=1, le=100),
    isRead: Optional[bool] = Query(None),
    type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    data = await service.get_user_notifications(
        user_id=user_id,
        page=page,
        per_page=perPage,
        is_read=isRead,
        notif_type=type,
    )
    return data

@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    count = await service.get_unread_count(user_id)
    return {"unreadCount": count}

@router.put("/{notif_id}/read", response_model=NotificationResponse)
async def mark_read(
    notif_id: str,
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    notif = await service.mark_as_read(parse_id(notif_id), user_id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notif

@router.put("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    return await service.mark_all_as_read(user_id)

@router.delete("/{notif_id}")
async def dismiss_notification(
    notif_id: str,
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    return await service.dismiss_notification(parse_id(notif_id), user_id)

@router.get("/preferences", response_model=NotificationPreferencesSchema)
async def get_preferences(
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    prefs = await service.get_preferences(user_id)
    return NotificationPreferencesSchema.model_validate(prefs)

@router.put("/preferences", response_model=NotificationPreferencesSchema)
async def update_preferences(
    prefs_in: NotificationPreferencesSchema,
    current_user: dict = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service),
):
    user_id = parse_id(current_user["sub"])
    updated = await service.update_preferences(
        user_id, prefs_in.model_dump(exclude_unset=True)
    )
    return NotificationPreferencesSchema.model_validate(updated)
