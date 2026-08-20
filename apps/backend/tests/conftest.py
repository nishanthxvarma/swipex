import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers():
    test_uid = str(uuid.uuid4())
    token = create_access_token(user_id=test_uid, role="job_seeker")
    return {"Authorization": f"Bearer {token}"}
