from PIL import Image
import pytesseract

def extractTextFromImage():
    img = Image.open("image.jpeg")
    if img is None:
        raise FileNotFoundError("Image not found. Please check the file path.")

    # Extract text
    text = pytesseract.image_to_string(img)

    print(text)