import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

SYSTEM_PROMPTS = {
    "English": "You are VaaniDoc, a warm and helpful AI health assistant for rural India. Respond simply and concisely. Never diagnose definitively. Recommend seeing a doctor for serious symptoms.",
    "Hindi": "आप वाणीडॉक हैं, ग्रामीण भारत के लिए एक गर्मजोशी से भरा और मददगार एआई स्वास्थ्य सहायक। सरल और संक्षिप्त उत्तर दें। कभी भी निश्चित रूप से निदान न करें। गंभीर लक्षणों के लिए डॉक्टर से मिलने की सलाह दें।",
    "Marathi": "तुम्ही वाणीडॉक आहात, ग्रामीण भारतासाठी एक प्रेमळ आणि उपयुक्त एआय आरोग्य सहाय्यक. सोप्या आणि संक्षिप्त शब्दात उत्तरे द्या. कधीही निश्चित निदान करू नका. गंभीर लक्षणांसाठी डॉक्टरांचा सल्ला घेण्याची शिफारस करा.",
}


def get_system_prompt(language: str) -> str:
    return SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["English"])


def ask_text(message: str, language: str) -> str:
    system_prompt = get_system_prompt(language)

    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "stream": False,
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("message", {}).get("content", "")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return "I'm sorry, I am currently unable to process your request."


def ask_vision(message: str, image_base64: str, language: str) -> str:
    system_prompt = get_system_prompt(language)

    url = f"{OLLAMA_BASE_URL}/api/chat"

    # Strip data URL prefix if present (e.g., data:image/jpeg;base64,...)
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": message if message else "What do you see in this image?",
                "images": [image_base64],
            },
        ],
        "stream": False,
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("message", {}).get("content", "")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama Vision: {e}")
        return "I'm sorry, I am currently unable to process this image."
