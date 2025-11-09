from PIL import Image
import pytesseract
from pathlib import Path

def extractTextFromImage(image_path: str) -> str:
    """
    Extract text from an image using OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text as a string
    """
    img_path = Path(image_path)
    if not img_path.exists():
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    img = Image.open(img_path)
    if img is None:
        raise ValueError("Failed to open image file.")

    # Extract text using OCR
    text = pytesseract.image_to_string(img)
    
    return text.strip() if text else ""