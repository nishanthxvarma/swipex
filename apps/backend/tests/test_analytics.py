import pytest

@pytest.mark.asyncio
async def test_candidate_analytics(client, auth_headers):
    response = await client.get("/api/v1/analytics/candidate?timeRange=30d", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "careerScore" in data
    assert "funnel" in data
    assert len(data["funnel"]) > 0

@pytest.mark.asyncio
async def test_recruiter_analytics_forbidden_for_candidate(client, auth_headers):
    # Candidate role should be forbidden from accessing recruiter analytics
    response = await client.get("/api/v1/analytics/recruiter?timeRange=30d", headers=auth_headers)
    assert response.status_code in (403, 401)
