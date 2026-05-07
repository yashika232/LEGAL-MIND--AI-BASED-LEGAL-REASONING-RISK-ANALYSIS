from groq import Groq
from config import GROQ_API_KEY

_client=None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def run_llama(prompt: str) -> str:
    try:
        client = get_client()
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq API Error: {str(e)}"


def is_groq_available() -> bool:
    return bool(GROQ_API_KEY)
