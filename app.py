import os
from openai import OpenAI
from google import genai
from groq import Groq

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
client_gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
client_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))



from flask import Flask, render_template, redirect, url_for, request, jsonify, session
import requests
import json

app = Flask(__name__)
app.secret_key = "stox_secret_key_2026"
OPENAI_ENABLED = True
GEMINI_ENABLED = True
GROQ_ENABLED = True



# ===============================
# STOX BACKEND DATABASE
# ===============================

STOCK_DATABASE = {
    "nvidia": {
        "name": "NVIDIA",
        "sector": "Semiconductors / AI",
        "risk": "High volatility due to rapid AI-driven growth.",
        "future": "Strong AI and data center demand could drive long-term growth.",
        "description": "NVIDIA is a global leader in GPUs and AI chips."
    },
    "tesla": {
        "name": "Tesla",
        "sector": "Electric Vehicles / Clean Energy",
        "risk": "High competition and market volatility.",
        "future": "Growth depends on EV adoption and battery innovation.",
        "description": "Tesla designs electric vehicles and clean energy systems."
    },
    "apple": {
        "name": "Apple",
        "sector": "Consumer Technology",
        "risk": "Moderate risk due to market saturation.",
        "future": "Steady growth via ecosystem and services expansion.",
        "description": "Apple creates iPhones, Macs, and digital services."
    }
}
# ===============================
# STOX PERSONALITY ENGINE
# ===============================

def apply_personality(title, body, confidence, category="general"):

    disclaimer = ""

    # Add smart disclaimer only for forward-looking analysis
    if category in ["future", "growth", "risk"]:
        disclaimer = "\n\n⚠ Note: This analysis is informational and not financial advice."

    # Professional structured formatting
    formatted_body = (
        f"{body.strip()}\n"
        f"{disclaimer}"
    )

    return {
        "title": title,
        "body": formatted_body,
        "confidence": confidence
    }


# ✅ EODHD API KEY
API_KEY = "6992ad38352584.18657888"

# ===== STOCK SYMBOLS =====
SYMBOL_NVDA = "NVDA"
SYMBOL_MSFT = "MSFT"
SYMBOL_AAPL = "AAPL"
SYMBOL_AMZN = "AMZN"
SYMBOL_GOOG = "GOOG"

# ===== NEW STOCK SYMBOLS =====
SYMBOL_VISA = "V"
SYMBOL_META = "META"
SYMBOL_TSLA = "TSLA"
SYMBOL_BRK = "BRK.B"
SYMBOL_JPM = "JPM"


@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        return redirect(url_for("dashboard", username=username))
    return render_template("index.html")


@app.route("/dashboard/<username>")
def dashboard(username):

    # ----------- FUNCTION TO GET HISTORICAL DATA -----------
    def get_history(symbol):
        url = f"https://eodhd.com/api/eod/{symbol}.US?api_token={API_KEY}&fmt=json&period=d&order=d&limit=30"
        try:
            data = requests.get(url).json()
            dates = [i["date"] for i in data][::-1]
            prices = [round(i["close"], 2) for i in data][::-1]
        except:
            dates, prices = [], []
        return dates, prices

    # ----------- FUNCTION TO GET LIVE PRICE -----------
    def get_live(symbol):
        url = f"https://eodhd.com/api/real-time/{symbol}.US?api_token={API_KEY}&fmt=json"
        try:
            data = requests.get(url).json()
            return data.get("close")
        except:
            return None

    # ===== NVIDIA =====
    dates_nvda, prices_nvda = get_history(SYMBOL_NVDA)
    current_price_nvda = get_live(SYMBOL_NVDA)

    # ===== MICROSOFT =====
    dates_ms, prices_ms = get_history(SYMBOL_MSFT)
    current_price_msft = get_live(SYMBOL_MSFT)

    # ===== APPLE =====
    dates_apple, prices_apple = get_history(SYMBOL_AAPL)
    current_price_apple = get_live(SYMBOL_AAPL)

    # ===== AMAZON =====
    dates_amzn, prices_amzn = get_history(SYMBOL_AMZN)
    current_price_amzn = get_live(SYMBOL_AMZN)

    # ===== GOOGLE =====
    dates_goog, prices_goog = get_history(SYMBOL_GOOG)
    current_price_goog = get_live(SYMBOL_GOOG)

    # ===== VISA =====
    dates_visa, prices_visa = get_history(SYMBOL_VISA)
    current_price_visa = get_live(SYMBOL_VISA)

    # ===== META =====
    dates_meta, prices_meta = get_history(SYMBOL_META)
    current_price_meta = get_live(SYMBOL_META)

    # ===== TESLA =====
    dates_tsla, prices_tsla = get_history(SYMBOL_TSLA)
    current_price_tsla = get_live(SYMBOL_TSLA)

    # ===== BERKSHIRE =====
    dates_brk, prices_brk = get_history(SYMBOL_BRK)
    current_price_brk = get_live(SYMBOL_BRK)

    # ===== JPMORGAN =====
    dates_jpm, prices_jpm = get_history(SYMBOL_JPM)
    current_price_jpm = get_live(SYMBOL_JPM)

    return render_template(
        "dashboard.html",
        username=username,

        # ===== NVIDIA =====
        symbol=SYMBOL_NVDA,
        price=current_price_nvda,
        dates=json.dumps(dates_nvda),
        prices=json.dumps(prices_nvda),

        # ===== MICROSOFT =====
        symbol_ms=SYMBOL_MSFT,
        price_ms=current_price_msft,
        dates_ms=json.dumps(dates_ms),
        prices_ms=json.dumps(prices_ms),

        # ===== APPLE =====
        symbol_apple=SYMBOL_AAPL,
        price_apple=current_price_apple,
        dates_apple=json.dumps(dates_apple),
        prices_apple=json.dumps(prices_apple),

        # ===== AMAZON =====
        symbol_amzn=SYMBOL_AMZN,
        price_amzn=current_price_amzn,
        dates_amzn=json.dumps(dates_amzn),
        prices_amzn=json.dumps(prices_amzn),

        # ===== GOOGLE =====
        symbol_goog=SYMBOL_GOOG,
        price_goog=current_price_goog,
        dates_goog=json.dumps(dates_goog),
        prices_goog=json.dumps(prices_goog),

        # ===== VISA =====
        symbol_visa=SYMBOL_VISA,
        price_visa=current_price_visa,
        dates_visa=json.dumps(dates_visa),
        prices_visa=json.dumps(prices_visa),

        # ===== META =====
        symbol_meta=SYMBOL_META,
        price_meta=current_price_meta,
        dates_meta=json.dumps(dates_meta),
        prices_meta=json.dumps(prices_meta),

        # ===== TESLA =====
        symbol_tsla=SYMBOL_TSLA,
        price_tsla=current_price_tsla,
        dates_tsla=json.dumps(dates_tsla),
        prices_tsla=json.dumps(prices_tsla),

        # ===== BERKSHIRE =====
        symbol_brk=SYMBOL_BRK,
        price_brk=current_price_brk,
        dates_brk=json.dumps(dates_brk),
        prices_brk=json.dumps(prices_brk),

        # ===== JPMORGAN =====
        symbol_jpm=SYMBOL_JPM,
        price_jpm=current_price_jpm,
        dates_jpm=json.dumps(dates_jpm),
        prices_jpm=json.dumps(prices_jpm)
    )


# API endpoint for real-time JS updates every 10 sec
@app.route("/stock_data/<symbol>")
def stock_data(symbol):
    url = f"https://eodhd.com/api/real-time/{symbol}.US?api_token={API_KEY}&fmt=json"
    try:
        data = requests.get(url).json()
    except:
        data = {}

    return jsonify({
        "symbol": symbol.upper(),
        "price": data.get("close"),
        "timestamp": data.get("timestamp")
    })
# ===============================
# STOX AI BACKEND (PHASE 4.5)
# Professional + Confident Tone
# ===============================

@app.route("/stox_ai", methods=["POST"])
def stox_ai():

    data = request.get_json()
    user_message = data.get("message", "")
    msg = user_message.lower().strip()

    previous_stock = session.get("last_stock", None)
    SYSTEM_PROMPT = """
You are STOX, a professional AI stock intelligence assistant.

Respond strictly in this format:

SUMMARY:
<2-3 sentence structured summary>

COMPETITIVE_ADVANTAGES:
- bullet
- bullet

RISKS:
- bullet
- bullet

FUTURE_OUTLOOK:
- bullet
- bullet

Professional tone only.
No emojis.
No disclaimers.
"""

    # =========================
    # OPENAI MODE
    # =========================
    if OPENAI_ENABLED:
        try:
            print("🔥 Trying OpenAI...")

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content":
                        "You are STOX, a professional AI stock intelligence assistant. "
                        "Tone: confident, structured, professional, not giving financial advice."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )

            ai_text = completion.choices[0].message.content

            return jsonify({
                "mode": "openai",
                "response": {
                    "title": "🧠 STOX AI Analysis",
                    "body": ai_text,
                    "confidence": 95
                }
            })

        except Exception as e:
            print("OpenAI failed:", e)

    # =========================
    # GEMINI MODE
    # =========================
    if GEMINI_ENABLED:
        try:
            print("🟣 Trying Gemini...")

            response = client_gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"""
                You are STOX, a professional AI stock intelligence assistant.
                Tone: confident, structured, professional, not giving financial advice.

                User Question:
                {user_message}
                """
            )

            ai_text = response.text

            return jsonify({
                "mode": "gemini",
                "response": {
                    "title": "🧠 STOX AI Analysis",
                    "body": ai_text,
                    "confidence": 93
                }
            })

        except Exception as e:
            print("Gemini failed:", e)

    # =========================
    # GROQ MODE
    # =========================
    if GROQ_ENABLED:
        try:
            print("🟢 Trying Groq...")

            completion = client_groq.chat.completions.create(
                model="llama-3.3-70b-versatile",

                messages=[
                    {
                        "role": "system",
                        "content":
                        "You are STOX, a professional AI stock intelligence assistant. "
                        "Tone: confident, structured, professional, not giving financial advice."
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            )

            ai_text = completion.choices[0].message.content

            return jsonify({
                "mode": "groq",
                "response": {
                    "title": "🧠 STOX AI Analysis",
                    "body": ai_text,
                    "confidence": 92
                }
            })

        except Exception as e:
            print("Groq failed:", e)

    # =========================
    # PERSONALITY ENGINE
    # =========================
    def format_response(title, body, confidence, category="general"):

        if category == "future":
            body += (
                "\n\nThe growth trajectory remains influenced by broader market "
                "conditions, industry competition, and strategic execution."
            )

        elif category == "risk":
            body += (
                "\n\nRisk exposure should be evaluated within the context of "
                "overall portfolio strategy and market volatility."
            )

        elif category == "overview":
            body += (
                "\n\nThis overview highlights the company’s core positioning "
                "within its sector."
            )

        if category in ["future", "risk"]:
            body += (
                "\n\n⚠ This analysis is provided for informational purposes only "
                "and does not constitute financial advice."
            )

        return {
            "title": title,
            "body": body.strip(),
            "confidence": confidence
        }

    # =========================
    # LOCAL STOCK MATCHING
    # =========================
    for key, stock in STOCK_DATABASE.items():

        if key in msg or stock["name"].lower() in msg:

            session["last_stock"] = key

            if "future" in msg or "growth" in msg:
                return jsonify({
                    "mode": "local",
                    "response": format_response(
                        f"🚀 GROWTH OUTLOOK — {stock['name'].upper()}",
                        f"{stock['future']}\n\nRisk Consideration:\n{stock['risk']}",
                        83,
                        "future"
                    )
                })

            if "risk" in msg:
                return jsonify({
                    "mode": "local",
                    "response": format_response(
                        f"⚠ RISK ANALYSIS — {stock['name'].upper()}",
                        f"{stock['risk']}\n\nGrowth Perspective:\n{stock['future']}",
                        79,
                        "risk"
                    )
                })

            return jsonify({
                "mode": "local",
                "response": format_response(
                    f"📊 OVERVIEW — {stock['name'].upper()}",
                    f"{stock['description']}\n\nSector: {stock['sector']}",
                    90,
                    "overview"
                )
            })

    # =========================
    # FOLLOW-UP MEMORY
    # =========================
    if previous_stock and previous_stock in STOCK_DATABASE:

        stock = STOCK_DATABASE[previous_stock]

        if "future" in msg or "growth" in msg:
            return jsonify({
                "mode": "local",
                "response": format_response(
                    f"🚀 CONTINUED OUTLOOK — {stock['name'].upper()}",
                    stock["future"],
                    80,
                    "future"
                )
            })

        if "risk" in msg:
            return jsonify({
                "mode": "local",
                "response": format_response(
                    f"⚠ CONTINUED RISK REVIEW — {stock['name'].upper()}",
                    stock["risk"],
                    76,
                    "risk"
                )
            })

    # =========================
    # FINAL FALLBACK
    # =========================
    return jsonify({
        "mode": "local",
        "response": format_response(
            "🤖 STOX",
            "I did not fully understand your request. "
            "You may ask about a company's overview, growth outlook, or risk profile.",
            60
        )
    })


if __name__ == "__main__":
    app.run(debug=True)
