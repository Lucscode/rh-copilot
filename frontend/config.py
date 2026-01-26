import os

# Use environment variable when deployed (Render), fallback to local
API_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api")
