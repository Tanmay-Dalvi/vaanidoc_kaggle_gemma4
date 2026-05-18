import re

EMERGENCY_KEYWORDS = [
    # English
    "chest pain",
    "unconscious",
    "not breathing",
    "bleeding",
    "seizure",
    "stroke",
    "heart attack",
    "can't breathe",
    "fainted",
    # Hindi
    "chhati me dard",
    "behosh",
    "saans nahi",
    "khoon",
    "daura",
    "lakwa",
    "dil ka daura",
    "chhati mein dard",
    # Marathi
    "chhatit dukhane",
    "beshuddh",
    "shwas gheta yet nahi",
    "raktastrav",
    "zhatka",
    "hrydayvikar",
]

MEDIUM_KEYWORDS = [
    "fever",
    "pain",
    "vomiting",
    "dizzy",
    "weakness",
    "bukhar",
    "dard",
    "ulti",
    "chakkar",
    "kamzori",
    "tap",
    "dukhne",
    "olti",
    "chakkr",
]


def triage_response(message: str) -> dict:
    """
    Evaluates the message text to determine severity, category, and whether a doctor referral is needed.
    """
    text_lower = message.lower()

    # Check for emergency keywords
    is_emergency = any(keyword in text_lower for keyword in EMERGENCY_KEYWORDS)
    if is_emergency:
        return {
            "severity": "emergency",
            "category": "Immediate Attention Required",
            "refer_to_doctor": True,
            "color": "red",
        }

    # Check for medium keywords
    is_medium = any(keyword in text_lower for keyword in MEDIUM_KEYWORDS)
    if is_medium:
        return {
            "severity": "medium",
            "category": "Consultation Recommended",
            "refer_to_doctor": True,
            "color": "yellow",
        }

    return {
        "severity": "low",
        "category": "Home Care / Observation",
        "refer_to_doctor": False,
        "color": "green",
    }
