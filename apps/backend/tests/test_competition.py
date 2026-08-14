import pytest
import uuid

@pytest.mark.asyncio
async def test_job_competition_indicator(client, auth_headers):
    fake_job_id = str(uuid.uuid4())
    response = await client.get(f"/api/v1/jobs/{fake_job_id}/competition", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "competitionLevel" in data
    assert "userMatchScore" in data
    assert "rankHeadline" in data
