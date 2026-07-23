import pytest
import sys
import os

# Add model_training to sys.path so tests can find features.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from model_training.features import (
    calculate_bmi_category,
    calculate_bp_category,
    calculate_kidney_stage,
    calculate_cholesterol_ratio,
    calculate_composite_risk_index
)

def test_bmi_categories():
    assert calculate_bmi_category(17.5) == "Underweight"
    assert calculate_bmi_category(22.0) == "Normal"
    assert calculate_bmi_category(27.5) == "Overweight"
    assert calculate_bmi_category(35.0) == "Obese"

def test_bp_categories():
    assert calculate_bp_category(115, 75) == "Normal"
    assert calculate_bp_category(125, 78) == "Elevated"
    assert calculate_bp_category(135, 82) == "Stage 1 Hypertension"
    assert calculate_bp_category(145, 95) == "Stage 2 Hypertension"
    assert calculate_bp_category(185, 125) == "Hypertensive Crisis"

def test_kidney_stages():
    assert calculate_kidney_stage(95.0) == "Stage 1"
    assert calculate_kidney_stage(75.0) == "Stage 2"
    assert calculate_kidney_stage(50.0) == "Stage 3a"
    assert calculate_kidney_stage(35.0) == "Stage 3b"
    assert calculate_kidney_stage(20.0) == "Stage 4"
    assert calculate_kidney_stage(10.0) == "Stage 5"

def test_cholesterol_ratio():
    assert calculate_cholesterol_ratio(200, 50) == 4.0
    assert calculate_cholesterol_ratio(250, 40) == 6.25
    assert calculate_cholesterol_ratio(180, 0) == 0.0

def test_composite_risk_index():
    # High risk case
    high_risk = calculate_composite_risk_index(
        age=70, systolic_bp=150, fasting_blood_sugar=135, gfr=25, smoking=1, history_diabetes=1
    )
    # Low risk case
    low_risk = calculate_composite_risk_index(
        age=30, systolic_bp=110, fasting_blood_sugar=85, gfr=95, smoking=0, history_diabetes=0
    )
    
    assert high_risk > low_risk
    assert 0.0 <= high_risk <= 1.0
    assert 0.0 <= low_risk <= 1.0
