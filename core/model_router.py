# core/model_router.py

def choose_model(user_message: str) -> str:
    message = user_message.lower()

    deep_keywords = [
        "analyze", "analysis", "detailed", "long term",
        "strategy", "forecast", "investment strategy"
    ]

    creative_keywords = [
        "explain", "simple", "simply", "summarize",
        "beginner", "basic"
    ]

    # Deep analysis first priority
    if any(word in message for word in deep_keywords):
        return "openai"

    # Creative / beginner explanation
    if any(word in message for word in creative_keywords):
        return "gemini"

    # Default → fast model
    return "groq"
