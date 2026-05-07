import os

SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///database.db")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-legal-ai-key-lexai-2024-secure")
SECRET_KEY = os.getenv("SECRET_KEY", "flask-secret-key-legal-ai-lexai-2024-secure")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
