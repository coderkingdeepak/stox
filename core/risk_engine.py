# core/risk_engine.py

def analyze_risk(ai_text: str):
    """
    Simple heuristic risk analysis based on keywords.
    Returns risk_score (1-10), sentiment, confidence.
    """

    text = ai_text.lower()

    risk_words = ["risk", "volatility", "uncertain", "competition",
                  "regulation", "downturn", "decline", "pressure"]

    positive_words = ["growth", "strong", "opportunity", "expansion",
                      "advantage", "leader", "innovation"]

    risk_count = sum(word in text for word in risk_words)
    positive_count = sum(word in text for word in positive_words)

    # Risk score logic
    risk_score = min(10, max(1, 5 + risk_count - positive_count))

    # Sentiment logic
    if positive_count > risk_count:
        sentiment = "Bullish"
    elif risk_count > positive_count:
        sentiment = "Bearish"
    else:
        sentiment = "Neutral"

    # Confidence logic
    confidence = min(99, 80 + positive_count)

    return {
        "risk_score": risk_score,
        "sentiment": sentiment,
        "confidence": confidence
    }
