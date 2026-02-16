/* ===============================
   STOX BRAIN ENGINE — PHASE 4.1
   =============================== */

/* =========================
   STOCK AI DATABASE
========================= */

const STOCK_DATABASE = {
  nvidia: {
    name: "NVIDIA",
    symbol: "NVDA",
    sector: "Semiconductors / AI",
    risk: "High volatility due to rapid AI-driven growth.",
    future: "Strong AI and data center demand could drive long-term growth.",
    description:
      "NVIDIA is a global leader in GPUs and artificial intelligence chips. It powers gaming, AI data centers, and autonomous systems."
  },

  tesla: {
    name: "Tesla",
    symbol: "TSLA",
    sector: "Electric Vehicles / Clean Energy",
    risk: "High competition and market volatility.",
    future: "Growth depends on EV adoption and innovation in battery tech.",
    description:
      "Tesla designs electric vehicles and clean energy solutions."
  },

  apple: {
    name: "Apple",
    symbol: "AAPL",
    sector: "Consumer Technology",
    risk: "Moderate risk due to market saturation.",
    future: "Steady long-term growth through ecosystem and services.",
    description:
      "Apple creates iPhones, Macs, and digital services."
  }
};

/* =========================
   STOCK DETECTION
========================= */

function getStockKey(message) {
  message = message.toLowerCase();

  for (const key in STOCK_DATABASE) {
    const stock = STOCK_DATABASE[key];

    if (
      message.includes(stock.name.toLowerCase()) ||
      message.includes(stock.symbol.toLowerCase())
    ) {
      return key;
    }
  }

  return null;
}

/* =========================
   STOX BRAIN CORE
========================= */

export async function stoxBrain(userMessage, context = {}) {

  const msg = userMessage.toLowerCase().trim();
  const stockKey = getStockKey(msg);
  const previousStock = context.lastStock || null;

  /* =========================
     GREETINGS
  ========================= */

  if (msg.includes("hello") || msg.includes("hi")) {
   return buildResponse({
  title: "🤖 STOX Assistant",
  body: "Hey 👋 I'm STOX.\nYour intelligent stock assistant.",
  type: "text"
});
  }
  if (msg.includes("help")) {
    return buildResponse(
      "You can try typing:\n" +
      "• hello\n" +
      "• help\n" +
      "• thanks\n\n" +
      "Stock features are coming next 🚀"
    );
  }

  if (msg.includes("thank")) {
    return buildResponse("You’re welcome 😊 Happy to help!");
  }
/* =========================
   STOCK DETECTED
========================= */

if (stockKey) {
  const stock = STOCK_DATABASE[stockKey];

  // Direct stock name only
  if (msg === stock.name.toLowerCase() || msg === stockKey) {
    return buildResponse({
      title: `📊 OVERVIEW — ${stock.name.toUpperCase()}`,
      body: `${stock.description}\n\nSector: ${stock.sector}`,
      type: "analysis",
      confidence: calculateConfidence(stockKey)
    }, {
      updatedContext: stockKey
    });
  }

  // Explanation
  if (
    msg.includes("explain") ||
    msg.includes("about") ||
    msg.includes("what is")
  ) {
    return buildResponse({
      title: `📘 COMPANY INSIGHT — ${stock.name.toUpperCase()}`,
      body: `${stock.description}\n\nSector: ${stock.sector}`,
      type: "analysis",
      confidence: calculateConfidence(stockKey)
    }, {
      updatedContext: stockKey
    });
  }

  // Future / Growth
  if (msg.includes("future") || msg.includes("growth")) {
    return buildResponse({
      title: `🚀 GROWTH OUTLOOK — ${stock.name.toUpperCase()}`,
      body: `${stock.future}\n\n⚠ Risk Factor:\n${stock.risk}`,
      type: "analysis",
      confidence: calculateConfidence(stockKey)
    }, {
      updatedContext: stockKey
    });
  }

  // Risk
  if (msg.includes("risk")) {
    return buildResponse({
      title: `⚠ RISK ANALYSIS — ${stock.name.toUpperCase()}`,
      body: `${stock.risk}\n\nGrowth Perspective:\n${stock.future}`,
      type: "analysis",
      confidence: calculateConfidence(stockKey)
    }, {
      updatedContext: stockKey
    });
  }

  // Open stock intent
  if (msg.includes("open") || msg.includes("show")) {
    return buildResponse({
      title: `📂 Opening ${stock.name}`,
      body: `Displaying detailed chart and metrics for ${stock.name}.`,
      type: "action"
    }, {
      action: "open_stock",
      stockKey: stockKey,
      updatedContext: stockKey
    });
  }

  // Default fallback for stock mention
  return buildResponse({
    title: `📊 STOCK SUMMARY — ${stock.name.toUpperCase()}`,
    body: `${stock.description}\n\nGrowth:\n${stock.future}\n\nRisk:\n${stock.risk}`,
    type: "analysis",
    confidence: calculateConfidence(stockKey)
  }, {
    updatedContext: stockKey
  });
}

/* =========================
   FOLLOW-UP MEMORY
========================= */

if (previousStock && STOCK_DATABASE[previousStock]) {

  const stock = STOCK_DATABASE[previousStock];

  if (msg.includes("future") || msg.includes("growth")) {
    return buildResponse({
      title: `🚀 CONTINUED OUTLOOK — ${stock.name.toUpperCase()}`,
      body: stock.future,
      type: "analysis",
      confidence: calculateConfidence(previousStock)
    }, {
      updatedContext: previousStock
    });
  }

  if (msg.includes("risk")) {
    return buildResponse({
      title: `⚠ CONTINUED RISK REVIEW — ${stock.name.toUpperCase()}`,
      body: stock.risk,
      type: "analysis",
      confidence: calculateConfidence(previousStock)
    }, {
      updatedContext: previousStock
    });
  }
}

/* =========================
   NAVIGATION INTENTS
========================= */

if (
  msg.includes("top stocks") ||
  msg.includes("show stocks") ||
  msg.includes("stocks list")
) {
  return buildResponse({
    title: "📈 MARKET OVERVIEW",
    body: "Displaying top global stocks.",
    type: "action"
  }, {
    action: "scroll",
    scrollTarget: ".stock-card-wrapper"
  });
}

if (msg.includes("go home") || msg.includes("dashboard")) {
  return buildResponse({
    title: "🏠 Dashboard Navigation",
    body: "Returning to dashboard view.",
    type: "action"
  }, {
    action: "scroll_top"
  });
}

if (msg.includes("open sidebar")) {
  return buildResponse({
    title: "📂 Sidebar Control",
    body: "Opening sidebar panel.",
    type: "action"
  }, {
    action: "open_sidebar"
  });
}

if (msg.includes("close sidebar")) {
  return buildResponse({
    title: "📁 Sidebar Control",
    body: "Closing sidebar panel.",
    type: "action"
  }, {
    action: "close_sidebar"
  });
}

/* =========================
   FALLBACK
========================= */

return buildResponse({
  title: "🤖 STOX",
  body: "I didn’t fully understand that.\nTry asking about a stock’s future, risk, or overview.",
  type: "text"
});
}

/* =========================
   RESPONSE BUILDER
========================= */

function buildResponse(data = {}, options = {}) {

  const {
    title = null,
    body = "",
    type = "text",
    confidence = null
  } = data;

  return {
    title,
    body,
    type,
    confidence,
    action: options.action || null,
    stockKey: options.stockKey || null,
    scrollTarget: options.scrollTarget || null,
    updatedContext: options.updatedContext || null
  };
}
function calculateConfidence(stockKey) {

  const base = 60;

  // simple simulation logic for now
  const variations = {
    nvidia: 85,
    tesla: 72,
    apple: 78
  };

  return variations[stockKey] || base;
}
