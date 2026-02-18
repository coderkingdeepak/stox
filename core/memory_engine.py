# core/memory_engine.py

from flask import session


def update_memory(user_message: str, ai_response: str):
    session["last_user_message"] = user_message
    session["last_ai_response"] = ai_response


def get_previous_context():
    return {
        "last_user_message": session.get("last_user_message"),
        "last_ai_response": session.get("last_ai_response"),
        "last_stock": session.get("last_stock")
    }


def build_context_prompt(user_message: str) -> str:
    """
    Build contextual prompt if user message is a follow-up.
    """
    last_user = session.get("last_user_message")
    last_stock = session.get("last_stock")

    followup_triggers = ["its", "it", "that company", "the company"]

    if last_stock and any(word in user_message.lower() for word in followup_triggers):
        return f"""
Previous discussion was about: {last_stock.upper()}

Follow-up question:
{user_message}
"""

    return user_message

