from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from flask import Flask, render_template, redirect, url_for, request, jsonify, session

# Import AI clients
from openai import OpenAI
import google.generativeai as genai
from groq import Groq
from core.model_router import choose_model
from core.memory_engine import update_memory, get_previous_context, build_context_prompt
from core.risk_engine import analyze_risk
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)




# Initialize clients
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
client_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))




import requests
import json

app = Flask(__name__)

# Load secret key securely
app.secret_key = os.getenv("FLASK_SECRET_KEY")

# Environment mode
ENV_MODE = os.getenv("FLASK_ENV", "development")

if ENV_MODE == "production":
    app.config["DEBUG"] = False
else:
    app.config["DEBUG"] = True

OPENAI_ENABLED = True
GEMINI_ENABLED = True
GROQ_ENABLED = True
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["30 per minute"]
)



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
API_KEY = "6995443287f2e7.56824660"

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
@app.route("/stox_ai", methods=["POST"])
@limiter.limit("10 per minute")
def stox_ai():

    # -------------------------
    # GET MESSAGE
    # -------------------------
    data = request.get_json()
    user_message = data.get("message", "").strip()

    # ------------------------- 
    # VALIDATION
    # -------------------------
    if not user_message:
        return jsonify({
            "mode": "system",
            "response": {
                "title": "⚠ Invalid Input",
                "body": "Message cannot be empty.",
                "confidence": 0
            }
        }), 400

    # -------------------------
    # GREETING FILTER (ADD HERE)
    # -------------------------
    simple_inputs = ["hello", "hi", "hey", "thanks", "thank you", "help"]

    if user_message.lower() in simple_inputs:
        return jsonify({
            "mode": "system",
            "response": {
                "title": "🤖 STOX Assistant",
                "body": "Hello. I'm STOX, your professional AI stock intelligence assistant. "
                        "How can I assist you today?",
                "confidence": 100
            }
        })    


    # -------------------------
    # MODEL ROUTING
    # -------------------------
    selected_model = choose_model(user_message)
    contextual_message = build_context_prompt(user_message)
    print("Primary model:", selected_model)

    ai_text = None
    mode_used = None
    # -------------------------
    # MODEL EXECUTION
    # -------------------------
    try:
        if selected_model == "openai" and OPENAI_ENABLED:
            logger.info("Trying OpenAI")

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are STOX..."
                    },
                    {
                        "role": "user",
                        "content": contextual_message
                    }
                ],
                timeout=15
            )

            ai_text = completion.choices[0].message.content
            mode_used = "openai"

        elif selected_model == "gemini" and GEMINI_ENABLED:
            logger.info("Trying Gemini")

            model = genai.GenerativeModel("gemini-2.0-flash")

            response = model.generate_content(
                f"""
                You are STOX, a professional AI stock intelligence assistant.
                Tone: confident, structured, professional, not giving financial advice.

                User Question:
                {contextual_message}
                """
            )

            ai_text = response.text
            mode_used = "gemini"
            
        elif GROQ_ENABLED:
            logger.info("Trying Groq")

            completion = client_groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are STOX..."
                    },
                    {
                        "role": "user",
                        "content": contextual_message
                    }
                ],
                timeout=15
            )

            ai_text = completion.choices[0].message.content
            mode_used = "groq"

    except Exception as e:
        logger.error(f"Primary model failed: {str(e)}")



    # -------------------------
    # FALLBACK TO GROQ
    # -------------------------
    if not ai_text and GROQ_ENABLED:
        try:
            logger.info("Fallback to Groq")

            completion = client_groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are STOX..."
                    },
                    {
                        "role": "user",
                        "content": contextual_message
                    }
                ],
                timeout=15
            )

            ai_text = completion.choices[0].message.content
            mode_used = "groq"

        except Exception as e:
            logger.error(f"Fallback failed: {str(e)}")



    # -------------------------
    # RETURN AI RESPONSE
    # -------------------------
    if ai_text:

        update_memory(user_message, ai_text)

        financial_keywords = [
            "stock", "share", "market", "risk", "investment",
            "growth", "analysis", "price", "company"
        ]

        if any(word in user_message.lower() for word in financial_keywords):
            risk_analysis = analyze_risk(ai_text)
        else:
            risk_analysis = {
                "risk_score": None,
                "sentiment": None,
                "confidence": 90
            }

        response_payload = {
            "title": "🧠 STOX AI Analysis",
            "body": ai_text,
            "confidence": risk_analysis["confidence"]
        }

        # Only include analytics if available
        if risk_analysis["risk_score"] is not None:
            response_payload["risk_score"] = risk_analysis["risk_score"]
            response_payload["sentiment"] = risk_analysis["sentiment"]

        return jsonify({
            "mode": "stox-ai",
            "response": response_payload
        })
        

    
    # -------------------------
    # AI FAILURE / SERVICE UNAVAILABLE
    # -------------------------
    return jsonify({
        "mode": "system",
        "response": {
            "title": "⚠ AI Service Unavailable",
            "body": "The AI service is temporarily unavailable. Please try again later.",
            "confidence": 0
       }
   }), 503
    
@app.errorhandler(Exception)
def handle_exception(e):
    print("Internal Server Error:", e)

    return jsonify({
        "mode": "system",
        "response": {
            "title": "⚠ System Error",
            "body": "An unexpected error occurred. Please try again later.",
            "confidence": 0
        }
    }), 500



if __name__ == "__main__":
    app.run()

