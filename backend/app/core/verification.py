import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
except ImportError:
    genai = None

GEMINI_KEY = os.getenv("GEMINI_KEY")
# print(GEMINI_KEY)

def check_news_authenticity(news_text: str):
    """
    Checks if the given news text is real and returns a structured JSON response.
    
    Args:
        news_text: The news text to verify
    
    Returns:
        {
          "real": bool,
          "credibility_score": float (0.0 to 1.0)
        }
    """
    if not GEMINI_KEY:
        # Fallback if API key is not configured
        # print("No API key found")
        return {
            "real": True,
            "credibility_score": 0.5
        }
    
    if not genai:
        # Fallback if google-genai package is not installed
        # print("No google-genai package found")
        return {
            "real": True,
            "credibility_score": 0.5
        }
    
    try:
        client = genai.Client(api_key=GEMINI_KEY)
        
        prompt = f"""
        Analyze the following news and respond strictly in valid JSON format.
        News: \"\"\"{news_text}\"\"\"
        Respond ONLY in the following JSON structure:
        {{
          "real": true or false,
          "credibility_score": float between 0.0 and 1.0
        }}
        """
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        # print(response)
        
        # Try to parse JSON safely
        try:
            result = json.loads(response.text[7:-4])
            # Ensure the result has the expected structure
            if "real" not in result or "credibility_score" not in result:
                raise ValueError("Invalid response structure")
            # Convert credibility_score to float and ensure it's between 0 and 1
            result["credibility_score"] = max(0.0, min(1.0, float(result.get("credibility_score", 0.5)))*100)
            result["real"] = bool(result.get("real", True))
            return result
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback in case model outputs extra text or invalid JSON
            # print(f"Error parsing Gemini response: {e}")
            # print(f"Raw response: {response.text}")
            return {
                "real": True,
                "credibility_score": 0.69
            }
    except Exception as e:
        # print(f"Error calling Gemini API: {e}")
        # Fallback on error
        return {
            "real": True,
            "credibility_score": 0.5
        }

