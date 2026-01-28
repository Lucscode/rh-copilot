import os

# Use environment variable when deployed (Render), fallback to local
API_URL = os.getenv("API_URL", "https://rh-copilot.onrender.com/api")
