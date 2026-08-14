import pytest
import uuid

@pytest.mark.asyncio
async def test_get_notifications(client, auth_headers):
    response = await client.get("/api/v1/notifications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "notifications" in data
    assert "unreadCount" in data

@pytest.mark.asyncio
async def test_get_unread_count(client, auth_headers):
    response = await client.get("/api/v1/notifications/unread-count", headers=auth_headers)
    assert response.status_code == 200
    assert "unreadCount" in response.json()

@pytest.mark.asyncio
async def test_notification_preferences(client, auth_headers):
    # Fetch preferences
    get_res = await client.get("/api/v1/notifications/preferences", headers=auth_headers)
    assert get_res.status_code == 200
    
    # Update preferences
    update_res = await client.put(
        "/api/v1/notifications/preferences",
        json={"jobRecommendations": False},
        headers=auth_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["jobRecommendations"] is False
