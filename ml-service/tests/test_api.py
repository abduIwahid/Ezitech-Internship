import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add ml-service root to python path to import app correctly
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def sample_payload():
    return {
        "HighBP": 1.0,
        "HighChol": 1.0,
        "CholCheck": 1.0,
        "BMI": 30.0,
        "Smoker": 1.0,
        "Stroke": 0.0,
        "HeartDiseaseorAttack": 1.0,
        "PhysActivity": 0.0,
        "Fruits": 0.0,
        "Veggies": 1.0,
        "HvyAlcoholConsump": 0.0,
        "AnyHealthcare": 1.0,
        "NoDocbcCost": 0.0,
        "GenHlth": 4.0,
        "MentHlth": 10.0,
        "PhysHlth": 15.0,
        "DiffWalk": 1.0,
        "Sex": 1.0,
        "Age": 9.0,
        "Education": 4.0,
        "Income": 5.0
    }

def test_model_status(client):
    response = client.get("/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["model_loaded"] is True
    assert data["model_name"] == "LightGBM"

def test_predict(client, sample_payload):
    response = client.post("/predict", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert "probability" in data
    assert "prediction" in data
    assert "severity" in data
    assert "confidence" in data
    assert data["probability"] >= 0.0 and data["probability"] <= 1.0
    assert data["severity"] in ["Low", "Moderate", "High", "Critical"]

def test_explain(client, sample_payload):
    response = client.post("/explain", json=sample_payload)
    assert response.status_code == 200
    data = response.json()
    assert "shap_values" in data
    assert "base_value" in data
    assert "clinical_explanation" in data
    assert isinstance(data["shap_values"], dict)
    assert len(data["shap_values"]) > 0
    assert "HighBP" in data["shap_values"]

def test_retrain(client):
    response = client.post("/retrain")
    assert response.status_code == 200
    assert "status" in response.json()

