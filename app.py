from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests
import json

app = Flask(__name__)

# ✅ EODHD API KEY
API_KEY = "69873c3b8b18f1.56302887"

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


if __name__ == "__main__":
    app.run(debug=True)
