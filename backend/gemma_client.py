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

def call_gemini_api(message: str, language: str, image_base64: str = None, ollama_error: str = "") -> str:
    system_prompt = get_system_prompt(language)
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        return f"Ollama failed locally ({ollama_error}). Then Gemini fallback also failed because GEMINI_API_KEY is not set in your .env file or Space secrets."
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    parts = [
        {"text": system_prompt},
        {"text": message if message else "What do you see in this image?"}
    ]
    
    if image_base64:
        clean_image = image_base64.split(",")[1] if "," in image_base64 else image_base64
        parts.append({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": clean_image
            }
        })
        
    payload = {
        "contents": [{
            "parts": parts
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        error_str = str(e)
        if api_key in error_str:
            error_str = error_str.replace(api_key, "HIDDEN_API_KEY")
        print(f"Error communicating with Gemini: {error_str}")
        return f"Ollama failed ({ollama_error}), and then Gemini API also failed ({error_str})."

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
        error_msg = str(e)
        print(f"Ollama failed ({error_msg}), falling back to Gemini API.")
        return call_gemini_api(message, language, None, error_msg)

def ask_vision(message: str, image_base64: str, language: str) -> str:
    system_prompt = get_system_prompt(language)

    url = f"{OLLAMA_BASE_URL}/api/chat"

    # Strip data URL prefix if present
    clean_image_base64 = image_base64
    if "," in clean_image_base64:
        clean_image_base64 = clean_image_base64.split(",")[1]

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": message if message else "What do you see in this image?",
                "images": [clean_image_base64],
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
        error_msg = str(e)
        print(f"Ollama Vision failed ({error_msg}), falling back to Gemini API.")
        return call_gemini_api(message, language, image_base64, error_msg)
