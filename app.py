from flask import Flask, render_template, redirect, url_for, request, jsonify
import requests
import json

app = Flask(__name__)

# ✅ EODHD API KEY
API_KEY = "69822f3295ab04.85754315"

# Stock symbols
SYMBOL_NVDA = "NVDA"
SYMBOL_MSFT = "MSFT"
SYMBOL_AAPL = "AAPL"
SYMBOL_AMZN = "AMZN"
SYMBOL_GOOG = "GOOG"


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

    # ===== Microsoft =====
    dates_ms, prices_ms = get_history(SYMBOL_MSFT)
    current_price_msft = get_live(SYMBOL_MSFT)

    # ===== Apple =====
    dates_apple, prices_apple = get_history(SYMBOL_AAPL)
    current_price_apple = get_live(SYMBOL_AAPL)

    # ===== Amazon =====
    dates_amzn, prices_amzn = get_history(SYMBOL_AMZN)
    current_price_amzn = get_live(SYMBOL_AMZN)

    # ===== Google =====
    dates_goog, prices_goog = get_history(SYMBOL_GOOG)
    current_price_goog = get_live(SYMBOL_GOOG)

    return render_template(
        "dashboard.html",
        username=username,

        # NVIDIA
        symbol=SYMBOL_NVDA,
        price=current_price_nvda,
        dates=json.dumps(dates_nvda),
        prices=json.dumps(prices_nvda),

        # MICROSOFT
        symbol_ms=SYMBOL_MSFT,
        price_ms=current_price_msft,
        dates_ms=json.dumps(dates_ms),
        prices_ms=json.dumps(prices_ms),

        # APPLE
        symbol_apple=SYMBOL_AAPL,
        price_apple=current_price_apple,
        dates_apple=json.dumps(dates_apple),
        prices_apple=json.dumps(prices_apple),

        # AMAZON
        symbol_amzn=SYMBOL_AMZN,
        price_amzn=current_price_amzn,
        dates_amzn=json.dumps(dates_amzn),
        prices_amzn=json.dumps(prices_amzn),

        # GOOGLE
        symbol_goog=SYMBOL_GOOG,
        price_goog=current_price_goog,
        dates_goog=json.dumps(dates_goog),
        prices_goog=json.dumps(prices_goog)
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
