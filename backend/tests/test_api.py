import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "ELEYSORA AI"


def test_public_opportunities(client):
    response = client.get("/api/v1/opportunities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "title" in data[0]
    assert "verification_status" in data[0]


def test_opportunity_matching(client):
    match_payload = {
        "education_level": "Undergraduate",
        "skills": ["Python", "Git"],
        "interests": ["AI", "Open Source"],
        "category": "Internship"
    }
    response = client.post("/api/v1/opportunities/match", json=match_payload)
    assert response.status_code == 200
    matches = response.json()
    assert isinstance(matches, list)
    assert len(matches) > 0
    assert "match_score" in matches[0]
    assert 0 <= matches[0]["match_score"] <= 100


def test_government_schemes(client):
    response = client.get("/api/v1/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert isinstance(schemes, list)
    assert len(schemes) > 0
    assert "scheme_name" in schemes[0]


def test_community_resources(client):
    response = client.get("/api/v1/community/resources")
    assert response.status_code == 200
    resources = response.json()
    assert isinstance(resources, list)
    assert len(resources) > 0


def test_barrier_to_bridge_analysis(client):
    barrier_payload = {
        "user_goal": "Become an AI Engineer",
        "reported_barrier": "I cannot afford expensive bootcamps and live in a rural area",
        "preferred_language": "English"
    }
    response = client.post("/api/v1/barriers/analyze", json=barrier_payload)
    assert response.status_code == 200
    analysis = response.json()
    assert "barrier_category" in analysis
    assert "possible_solutions" in analysis
    assert len(analysis["possible_solutions"]) > 0


def test_learning_hub_explain(client):
    payload = {
        "topic": "Machine Learning Fundamentals",
        "level": "Beginner",
        "language": "English"
    }
    response = client.post("/api/v1/learning/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simple_analogy" in data
    assert "core_concepts" in data


def test_sustainability_advice(client):
    payload = {
        "area_of_interest": "electricity",
        "language": "English"
    }
    response = client.post("/api/v1/sustainability/advice", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "practical_tips" in data


def test_auth_and_user_flow(client):
    # 1. Register
    reg_payload = {
        "email": "learner@eleysora.ai",
        "password": "Password123!",
        "display_name": "Test Learner",
        "preferred_language": "English"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code in [200, 201]
    token_data = reg_res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get profile
    profile_res = client.get("/api/v1/auth/me", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["display_name"] == "Test Learner"

    # 3. Create Action Card
    card_payload = {
        "title": "Complete Stage 1 Roadmap Lesson",
        "description": "Read introductory tutorial on Python",
        "priority": "High",
        "status": "In Progress"
    }
    card_res = client.post("/api/v1/action-cards", json=card_payload, headers=headers)
    assert card_res.status_code == 201
    card_id = card_res.json()["id"]

    # 4. List Action Cards
    list_cards = client.get("/api/v1/action-cards", headers=headers)
    assert list_cards.status_code == 200
    assert len(list_cards.json()) >= 1

    # 5. Patch Action Card
    patch_res = client.patch(f"/api/v1/action-cards/{card_id}", json={"status": "Completed"}, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Completed"

    # 6. Dashboard overview
    dash_res = client.get("/api/v1/dashboard/overview", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "saved_opportunities_count" in dash_data
    assert "completed_actions_count" in dash_data
    assert dash_data["completed_actions_count"] >= 1
