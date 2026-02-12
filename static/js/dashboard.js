/* ===============================
   STOX AI DATABASE (PHASE 3.3)
=============================== */

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



/* ===== Make toggleDropdown global ===== */
function toggleDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) dropdown.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================
     PROFILE DROPDOWN
     ========================== */
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    userProfile.addEventListener("click", (event) => {
      toggleDropdown();
      event.stopPropagation();
    });
  }

  window.addEventListener("click", (event) => {
    if (!event.target.closest(".user-profile")) {
      const d = document.getElementById("profileDropdown");
      if (d) d.classList.remove("show");
    }
  });

  /* ==========================
     SIDEBAR TOGGLE
     ========================== */
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebarCheckbox = document.getElementById("sidebarCheckbox");

  function updateSidebarLabel() {
    if (!sidebarToggle || !sidebarCheckbox) return;
    sidebarToggle.title = sidebarCheckbox.checked ? "Close Sidebar" : "Open Sidebar";
    sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
  }

  updateSidebarLabel();
  sidebarCheckbox?.addEventListener("change", updateSidebarLabel);

  /* ==========================
     STOCK CARD CONFIG
     ========================== */
  const stocks = [
    { cardClass: "nvidia-card", modalId: "nvdaDetails", chartId: "stockChartNvidia", livePriceId: "livePriceNvidia", dataId: "chart-data-nvidia", symbol: "NVDA", color: "#00c853" },
    { cardClass: "microsoft-card", modalId: "msftDetails", chartId: "stockChartMS", livePriceId: "livePriceMS", dataId: "chart-data-ms", symbol: "MSFT", color: "#2962ff" },
    { cardClass: "apple-card", modalId: "aaplDetails", chartId: "stockChartApple", livePriceId: "livePriceApple", dataId: "chart-data-apple", symbol: "AAPL", color: "#000000" },
    { cardClass: "amazon-card", modalId: "amznDetails", chartId: "stockChartAMZN", livePriceId: "livePriceAMZN", dataId: "chart-data-amzn", symbol: "AMZN", color: "#ff6d00" },
    { cardClass: "google-card", modalId: "googDetails", chartId: "stockChartGOOG", livePriceId: "livePriceGoogle", dataId: "chart-data-goog", symbol: "GOOGL", color: "#fbbc05" },

    { cardClass: "visa-card", modalId: "visaDetails", chartId: "stockChartVisa", livePriceId: "livePriceVisa", dataId: "chart-data-visa", symbol: "V", color: "#1a1f71" },
    { cardClass: "meta-card", modalId: "metaDetails", chartId: "stockChartMeta", livePriceId: "livePriceMeta", dataId: "chart-data-meta", symbol: "META", color: "#1877f2" },
    { cardClass: "tesla-card", modalId: "tslaDetails", chartId: "stockChartTesla", livePriceId: "livePriceTesla", dataId: "chart-data-tesla", symbol: "TSLA", color: "#cc0000" },
    { cardClass: "berkshire-card", modalId: "brkDetails", chartId: "stockChartBRK", livePriceId: "livePriceBRK", dataId: "chart-data-brk", symbol: "BRK-B", color: "#5c4033" },
    { cardClass: "jpm-card", modalId: "jpmDetails", chartId: "stockChartJPM", livePriceId: "livePriceJPM", dataId: "chart-data-jpm", symbol: "JPM", color: "#0a2540" }
  ];

  const modalOverlay = document.getElementById("modalOverlay");
  const stockObjects = {};

  /* ==========================
     STOCK MODALS + CHARTS
     ========================== */
  stocks.forEach(stock => {
    const card = document.querySelector(`.${stock.cardClass}`);
    const modal = document.getElementById(stock.modalId);
    if (!card || !modal) return;

    const closeBtn = modal.querySelector(".close-btn");
    const favBtn = modal.querySelector(".fav-btn");
    const fullscreenBtn = modal.querySelector(".fullscreen-btn");

    const dataEl = document.getElementById(stock.dataId);
    const dates = JSON.parse(dataEl?.dataset.dates || "[]");
    const prices = JSON.parse(dataEl?.dataset.prices || "[]").map(p => parseFloat(p));
    /* ==========================
   MAKE STOCK NAMES CLICKABLE
========================== */

stocks.forEach(stock => {
  const card = document.querySelector(`.${stock.cardClass}`);
  const nameWrapper = card?.parentElement?.querySelector("span");

  if (nameWrapper && card) {
    nameWrapper.style.cursor = "pointer";

    nameWrapper.addEventListener("click", () => {
      card.click(); // reuse existing logic
    });
  }
});


    // 🔴 OLD FORMAT RESTORED (IMPORTANT)
    stockObjects[stock.modalId] = {
      modal,
      chart: null,
      symbol: stock.symbol,
      dates: [...dates],
      prices: [...prices]
    };

    function renderChart() {
      const st = stockObjects[stock.modalId];
      const ctx = document.getElementById(stock.chartId).getContext("2d");

      if (st.chart) st.chart.destroy();

      st.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: st.dates,
          datasets: [{
            data: st.prices,
            borderColor: stock.color,
            backgroundColor: stock.color + "22",
            borderWidth: 2,
            tension: 0.25,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    function openModal() {
      modal.classList.add("show");
      modalOverlay.classList.add("show");
      modalOverlay.style.pointerEvents = "auto";

      setTimeout(() => {
        if (!stockObjects[stock.modalId].chart) renderChart();
        const ch = stockObjects[stock.modalId].chart;
        if (ch) { ch.resize(); ch.update(); }
      }, 300);
    }
function closeModal() {
  if (document.fullscreenElement) document.exitFullscreen();

  modal.classList.remove("fullscreen-mode", "show");
  modalOverlay.classList.remove("show");
  modalOverlay.style.pointerEvents = "none";

  // 🔥 Fully reset keyboard state
  currentIndex = -1;

  document.querySelectorAll(".keyboard-selected")
    .forEach(el => el.classList.remove("keyboard-selected"));

  // 🔥 Important: Delay focus slightly after animation
  setTimeout(() => {
    searchInput.focus();
  }, 50);
}


    card.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    favBtn?.addEventListener("click", () => favBtn.classList.toggle("active"));
    fullscreenBtn?.addEventListener("click", () => {
      !document.fullscreenElement ? modal.requestFullscreen() : document.exitFullscreen();
    });
  });

  modalOverlay?.addEventListener("click", () => {

  Object.values(stockObjects).forEach(o => {
    o.modal.classList.remove("show", "fullscreen-mode");
  });

  modalOverlay.classList.remove("show");
  modalOverlay.style.pointerEvents = "none";

  // 🔥 Reset keyboard navigation state
  currentIndex = -1;

  document.querySelectorAll(".keyboard-selected")
    .forEach(el => el.classList.remove("keyboard-selected"));

  // 🔥 Restore focus safely
  setTimeout(() => {
    searchInput.focus();
  }, 50);
});


  /* ==========================
     LIVE PRICE + LIVE CHART UPDATE (OLD WORKING LOGIC)
     ========================== */
  async function fetchLiveData() {
    for (const st of stocks) {
      const obj = stockObjects[st.modalId];
      if (!obj) continue;

      try {
        const res = await fetch(`/stock_data/${st.symbol}`);
        const data = await res.json();

        const el = document.getElementById(st.livePriceId);
        if (el && data.price != null) {
          el.textContent = `$${parseFloat(data.price).toFixed(2)}`;
        }

        const time = new Date().toLocaleTimeString();
        obj.dates.push(time);
        obj.prices.push(parseFloat(data.price));

        if (obj.dates.length > 20) {
          obj.dates.shift();
          obj.prices.shift();
        }

        if (obj.chart) {
          obj.chart.data.labels = obj.dates;
          obj.chart.data.datasets[0].data = obj.prices;
          obj.chart.update();
        }

      } catch (e) {
        console.log("Live update error:", st.symbol);
      }
    }
  }

  fetchLiveData();
  setInterval(fetchLiveData, 10000);
    /* =========================
   STOCK SEARCH FILTER
========================= */

const searchInput = document.querySelector(".stock-search-input");
const suggestionBox = document.getElementById("searchSuggestions");

const SUGGESTION_SOURCE = [
  { name: "NVIDIA", symbol: "NVDA" },
  { name: "Microsoft", symbol: "MSFT" },
  { name: "Apple", symbol: "AAPL" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "Google", symbol: "GOOGL" },
  { name: "Tesla", symbol: "TSLA" },
  { name: "Meta", symbol: "META" },
  { name: "Visa", symbol: "V" },
  { name: "Berkshire Hathaway", symbol: "BRK-B" },
  { name: "JPMorgan", symbol: "JPM" }
];

const stockContainers = document.querySelectorAll(
  ".nvidia-card-container, \
   .microsoft-card-container, \
   .apple-card-container, \
   .amazon-card-container, \
   .google-card-container, \
   .visa-card-container, \
   .meta-card-container, \
   .tesla-card-container, \
   .berkshire-card-container, \
   .jpm-card-container"
);

searchInput.addEventListener("input", () => {

  const query = searchInput.value.toLowerCase().trim();
  let firstMatch = null;

  // 🔥 If search empty → FULL RESET
  if (!query) {
    currentIndex = -1;

    document.querySelectorAll(".keyboard-selected")
      .forEach(el => el.classList.remove("keyboard-selected"));

    stockContainers.forEach(container => {
      container.classList.remove("hidden");
    });

    return;
  }

  stockContainers.forEach(container => {

    const text = container.innerText.toLowerCase();

    if (text.includes(query)) {
      container.classList.remove("hidden");

      if (!firstMatch) firstMatch = container;

    } else {
      container.classList.add("hidden");
    }
  });

});
searchInput.addEventListener("input", () => {

  const query = searchInput.value.toLowerCase().trim();

  suggestionBox.innerHTML = "";

  if (!query) {
    suggestionBox.style.display = "none";
    return;
  }

  const matches = SUGGESTION_SOURCE.filter(stock =>
    stock.name.toLowerCase().includes(query) ||
    stock.symbol.toLowerCase().includes(query)
  );

  if (!matches.length) {
    suggestionBox.style.display = "none";
    return;
  }

  matches.slice(0,5).forEach(stock => {

    const item = document.createElement("div");
    item.className = "suggestion-item";

    item.innerHTML = `
      <span>${stock.name}</span>
      <span class="suggestion-symbol">${stock.symbol}</span>
    `;

    item.addEventListener("click", () => {

  searchInput.value = stock.name;
  suggestionBox.style.display = "none";
  suggestionIndex = -1;

  searchInput.dispatchEvent(new Event("input"));

  // 🔥 Find correct card container
  const match = Array.from(stockContainers).find(container =>
    container.innerText.toLowerCase().includes(stock.name.toLowerCase())
  );

  if (match) {
    const card = match.querySelector("div");
    card?.click();
  }

});


    suggestionBox.appendChild(item);
  });

  suggestionBox.style.display = "block";
});
// ==========================
// HIDE SUGGESTIONS ON OUTSIDE CLICK
// ==========================
document.addEventListener("click", (e) => {
  if (!e.target.closest(".stock-search-wrapper")) {
    suggestionBox.style.display = "none";
  }
});



 
let currentIndex = -1;
let suggestionIndex = -1;

// ==========================
// GLOBAL KEYBOARD NAVIGATION
// ==========================
document.addEventListener("keydown", (e) => {

  const query = searchInput.value.trim();
  const suggestions = suggestionBox.querySelectorAll(".suggestion-item");
  const suggestionsVisible = suggestionBox.style.display === "block";

  // 🔹 If user typing inside STOX chat → ignore
  if (document.activeElement === document.getElementById("stox-input")) {
    return;
  }

  // =========================
  // SUGGESTION MODE
  // =========================
  if (suggestionsVisible && suggestions.length && document.activeElement === searchInput) {

    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggestionIndex++;
      if (suggestionIndex >= suggestions.length) suggestionIndex = 0;
      updateSuggestionSelection(suggestions);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      suggestionIndex--;
      if (suggestionIndex < 0) suggestionIndex = suggestions.length - 1;
      updateSuggestionSelection(suggestions);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
        suggestions[suggestionIndex].click();
        suggestionBox.style.display = "none";
        suggestionIndex = -1;
      }
      return;
    }

    if (e.key === "Escape") {
      suggestionBox.style.display = "none";
      suggestionIndex = -1;
      return;
    }
  }

  // =========================
  // STOCK CARD NAVIGATION
  // =========================

  const visibleStocks = Array.from(stockContainers)
    .filter(container => !container.classList.contains("hidden"));

  if (!visibleStocks.length) return;

  const columns = 5;
  const total = visibleStocks.length;
if (e.key === "ArrowDown") {
  e.preventDefault();

  // 🔥 If typing in search → go directly to FIRST STOCK
  if (document.activeElement === searchInput) {
    searchInput.blur();
    searchInput.classList.remove("search-active");

    currentIndex = 0;
    updateSelection(visibleStocks);
    return;
  }

  // 🔥 If neutral → go to SEARCH LEVEL highlight
  if (currentIndex === -1) {
    searchInput.classList.add("search-active");
    currentIndex = -2;
    return;
  }

  // 🔥 If on search highlight → go to first stock
  if (currentIndex === -2) {
    searchInput.classList.remove("search-active");
    currentIndex = 0;
    updateSelection(visibleStocks);
    return;
  }

  // 🔥 Normal grid navigation
  if (currentIndex + columns < total) {
    currentIndex += columns;
    updateSelection(visibleStocks);
  }
}



if (e.key === "ArrowUp") {
  e.preventDefault();

  // 🔥 If typing in search → just exit typing
  if (document.activeElement === searchInput) {
    searchInput.blur();
    searchInput.classList.remove("search-active");
    currentIndex = -1;
    return;
  }

  // 🔥 If on search highlight → go neutral
  if (currentIndex === -2) {
    searchInput.classList.remove("search-active");
    currentIndex = -1;
    return;
  }

  // 🔥 If on first row → go to search highlight
  if (currentIndex >= 0 && currentIndex < columns) {
    document.querySelectorAll(".keyboard-selected")
      .forEach(el => el.classList.remove("keyboard-selected"));

    searchInput.classList.add("search-active");
    currentIndex = -2;
    return;
  }

  // 🔥 Normal upward navigation
  if (currentIndex >= columns) {
    currentIndex -= columns;
    updateSelection(visibleStocks);
  }
}




  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (currentIndex === -1) currentIndex = 0;
    else if (currentIndex + 1 < total) currentIndex++;
    updateSelection(visibleStocks);
    return;
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (currentIndex > 0) currentIndex--;
    updateSelection(visibleStocks);
    return;
  }

 if (e.key === "Enter") {
  e.preventDefault();

  if (currentIndex === -1 || currentIndex === -2) {
    searchInput.focus();
    return;
  }

  if (currentIndex >= 0 && visibleStocks[currentIndex]) {
    visibleStocks[currentIndex]
      .querySelector("div")
      ?.click();
  }
}



});





function updateSelection(visibleStocks) {

  // remove old highlights
  document.querySelectorAll(".keyboard-selected")
    .forEach(el => el.classList.remove("keyboard-selected"));

  if (currentIndex >= 0 && visibleStocks[currentIndex]) {

    const container = visibleStocks[currentIndex];

    const card = container.querySelector(
      ".nvidia-card, \
       .microsoft-card, \
       .apple-card, \
       .amazon-card, \
       .google-card, \
       .visa-card, \
       .meta-card, \
       .tesla-card, \
       .berkshire-card, \
       .jpm-card"
    );

    card?.classList.add("keyboard-selected");

    container.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}
function updateSuggestionSelection(suggestions) {

  suggestions.forEach(item =>
    item.classList.remove("suggestion-active")
  );

  if (suggestionIndex >= 0 && suggestions[suggestionIndex]) {
    suggestions[suggestionIndex]
      .classList.add("suggestion-active");
  }
}

  /* ==========================
     STOX PANEL (FIXED & STABLE)
     ========================== */
  console.log("STOX JS LOADED");

  const stoxOrb = document.getElementById("stox-orb");
  const stoxPanel = document.getElementById("stox-panel");
  const stoxClose = document.getElementById("stox-close");
  const stoxInput = document.getElementById("stox-input");
  const headerLogoSlot = document.getElementById("stox-header-logo");
 


  if (!stoxOrb || !stoxPanel || !stoxClose || !headerLogoSlot) return;

  // Default dashboard state
stoxOrb.classList.add("glow", "breath");


  let isStoxOpen = false;
  const originalParent = stoxOrb.parentElement;

 function openStox() {
  stoxPanel.classList.add("active");
    stoxOrb.classList.add("panel-open"); // 👈 STEP 3 (ADD HERE)

  // ❌ stop breathing
  stoxOrb.classList.remove("breath");

  // ✅ keep glow
  stoxOrb.classList.add("glow");

  headerLogoSlot.appendChild(stoxOrb);
  stoxOrb.style.position = "static";
  stoxOrb.style.margin = "0 ";

  isStoxOpen = true;
}


function closeStox() {
  stoxPanel.classList.remove("active");
    stoxOrb.classList.remove("panel-open"); // 👈 STEP 3 (ADD HERE) 
  originalParent.appendChild(stoxOrb);
  stoxOrb.style.position = "fixed";
  stoxOrb.style.top = "20px";
  stoxOrb.style.right = "20px";

  // ✅ restore dashboard behavior
  stoxOrb.classList.add("breath", "glow");

  isStoxOpen = false;
}


  function toggleStox() {
    isStoxOpen ? closeStox() : openStox();
  }

  stoxOrb.addEventListener("click", toggleStox);
  stoxClose.addEventListener("click", closeStox);

  document.addEventListener("keydown", (e) => {
    const el = document.activeElement;
    if (
      el === stoxInput ||
      el?.tagName === "INPUT" ||
      el?.tagName === "TEXTAREA" ||
      el?.isContentEditable
    ) return;

    if (e.key.toLowerCase() === "s") toggleStox();
  });

});
/* ==========================
   STOX CHAT – PHASE 2.1.1
   ========================== */
document.addEventListener("DOMContentLoaded", () => {

  const stoxMessages = document.getElementById("stox-messages");
  const stoxInput = document.getElementById("stox-input");
  const stoxSend = document.getElementById("stox-send");
  const stoxMic = document.getElementById("stox-mic");

if (stoxMic) {
  stoxMic.addEventListener("click", () => {
    if (typeof startVoiceListening === "function") {
      startVoiceListening();
    }
  });
}


  if (!stoxMessages || !stoxInput || !stoxSend) {
    console.warn("STOX chat elements not found (2.1.1)");
    return;
  }
// 🧠 CONTEXT MEMORY (PHASE 2.2.4)
  let lastStockContext = null;
  /* =========================
   STOCK INTELLIGENCE DATABASE (PHASE 3.3)
========================= */



function addStoxMessage(text, sender = "stox") {
  const msg = document.createElement("div");
  msg.className = `stox-msg ${sender}`;
  msg.textContent = text;

  stoxMessages.appendChild(msg);

  const body = stoxMessages.parentElement;
  body.scrollTop = body.scrollHeight;

  if (sender === "stox" && voiceReplyEnabled) {
  speakStox(text);
}

}



  function sendStoxMessage() {
  const text = stoxInput.value.trim();
  if (!text) return;

  addStoxMessage(text, "user");
  stoxInput.value = "";

  const msg = text.toLowerCase();
  const stockKey = getStockKey(msg);


  setTimeout(() => {
    // greetings
    if (msg.includes("hello") || msg.includes("hi")) {
      addStoxMessage("Hey 👋 I’m STOX. Your stock assistant.");
      return;
    }

    // help
    if (msg.includes("help")) {
      addStoxMessage(
        "You can try typing:\n" +
        "• hello\n" +
        "• help\n" +
        "• thanks\n\n" +
        "Stock features are coming next 🚀"
      );
      return;
    }

    // thanks
    if (msg.includes("thank")) {
      addStoxMessage("You’re welcome 😊 Happy to help!");
      return;
    }
    // ==========================
// SMART STOCK AI (PHASE 3.3 CLEAN VERSION)
// ==========================


// If stock name detected
if (stockKey) {

  const stock = STOCK_DATABASE[stockKey];
  lastStockContext = stockKey;
  // --- Direct exact stock name ---
  if (msg === stock.name.toLowerCase()) {
    addStoxMessage(stock.description);
    return;
  }

  // --- EXPLANATION ---
  if (
    msg.includes("explain") ||
    msg.includes("about") ||
    msg.includes("what is")
  ) {
    addStoxMessage(
      `${stock.description}\n\nSector: ${stock.sector || "Technology"}`
    );
    return;
  }

  // --- FUTURE / GROWTH ---
  if (
    msg.includes("future") ||
    msg.includes("growth")
  ) {
    addStoxMessage(stock.future);
    return;
  }

  // --- RISK ---
  if (msg.includes("risk")) {
    addStoxMessage(stock.risk);
    return;
  }

  // --- Direct stock name only ---
  if (msg === stockKey) {
    addStoxMessage(stock.description);
    return;
  }
}


// ==========================
// FOLLOW-UP MEMORY (if no stock mentioned)
// ==========================

if (
  (msg.includes("future") ||
   msg.includes("growth") ||
   msg.includes("risk")) &&
  lastStockContext &&
  STOCK_DATABASE[lastStockContext]
) {

  const stock = STOCK_DATABASE[lastStockContext];

  if (msg.includes("future") || msg.includes("growth")) {
    addStoxMessage(stock.future);
    return;
  }

  if (msg.includes("risk")) {
    addStoxMessage(stock.risk);
    return;
  }
}


if ((msg.includes("open") || msg.includes("show")) && stockKey) {

  const cardClass = `${stockKey}-card`;
  const card = document.querySelector(`.${cardClass}`);

  if (card) {
    card.click();
    addStoxMessage(`Opening ${STOCK_DATABASE[stockKey].name} details 📊`);
    lastStockContext = stockKey;
    return;
  }
}

// ==========================
// NAVIGATION COMMANDS (PHASE 2.2.3)
// ==========================
if (
  msg.includes("top stocks") ||
  msg.includes("show stocks") ||
  msg.includes("stocks list")
) {
  document
    .querySelector(".stock-card-wrapper")
    ?.scrollIntoView({ behavior: "smooth" });

  addStoxMessage("Here are the top global stocks 📈");
  return;
}

if (msg.includes("go home") || msg.includes("dashboard")) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  addStoxMessage("Back to dashboard 🏠");
  return;
}

if (msg.includes("open sidebar")) {
  document.getElementById("sidebarCheckbox")?.click();
  addStoxMessage("Sidebar opened 📂");
  return;
}

if (msg.includes("close sidebar")) {
  const cb = document.getElementById("sidebarCheckbox");
  if (cb && cb.checked) cb.click();
  addStoxMessage("Sidebar closed 📁");
  return;
}



    // fallback
    addStoxMessage("I didn’t get that yet 🤖. Type help.");
  }, 300);
}


  // click send
  stoxSend.addEventListener("click", sendStoxMessage);

  // press Enter
  stoxInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendStoxMessage();
  });
window.sendStoxMessage = sendStoxMessage;
/* ==========================
   STOX VOICE REPLY TOGGLE
   ========================== */

let voiceReplyEnabled = false; // DEFAULT = OFF

const voiceToggle = document.getElementById("stox-voice-toggle");

if (voiceToggle) {
  voiceToggle.addEventListener("click", () => {
    voiceReplyEnabled = !voiceReplyEnabled;

    voiceToggle.classList.toggle("on", voiceReplyEnabled);
    voiceToggle.querySelector(".toggle-text").textContent =
      voiceReplyEnabled ? "ON" : "OFF";
  });
}


  console.log("✅ STOX Phase 2.1.1 chat ready");
});
function speakStox(text) {
  if (!window.speechSynthesis) return;

  // ❌ Don’t speak while mic is listening
  if (isListening) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  // Optional: choose a smoother voice
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.toLowerCase().includes("female"));
  if (preferred) utterance.voice = preferred;

  speechSynthesis.cancel(); // stop previous
  speechSynthesis.speak(utterance);
}

/* ===============================
   STOX Voice Input Engine (Phase 2.3.1)
   =============================== */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isListening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
  isListening = true;

  // STOX orb animation
  const orb = document.getElementById("stox-orb");
  if (orb) orb.classList.add("mic-listening");

  // 🎤 mic icon active
  const mic = document.getElementById("stox-mic");
  if (mic) mic.classList.add("listening");
};

recognition.onend = () => {
  isListening = false;

  // STOX orb animation off
  const orb = document.getElementById("stox-orb");
  if (orb) orb.classList.remove("mic-listening");

  // 🎤 mic icon back to normal
  const mic = document.getElementById("stox-mic");
  if (mic) mic.classList.remove("listening");
};




  recognition.onerror = (event) => {
    console.warn("Speech error:", event.error);
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript.trim();
    console.log("🎙️ You said:", spokenText);

    handleVoiceInput(spokenText);
    recognition.stop();
  };

} else {
  console.warn("Speech Recognition not supported");
}

function handleVoiceInput(text) {
  console.log("🎧 Voice input:", text);

  // 1️⃣ Try action commands first
  const handled = handleVoiceCommand(text);
  if (handled) return;

  // 2️⃣ Otherwise, send to chat brain
  const input = document.getElementById("stox-input");
  if (!input || typeof window.sendStoxMessage !== "function") return;

  input.value = text;
  window.sendStoxMessage();
}
function handleVoiceCommand(text) {
  const msg = text.toLowerCase();

  // 🔹 OPEN STOCKS
  if (msg.includes("open tesla")) {
    document.querySelector(".tesla-card")?.click();
    return true;
  }

  if (msg.includes("open nvidia")) {
    document.querySelector(".nvidia-card")?.click();
    return true;
  }

  if (msg.includes("open apple")) {
    document.querySelector(".apple-card")?.click();
    return true;
  }

  // 🔹 NAVIGATION
  if (msg.includes("go home") || msg.includes("dashboard")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  if (msg.includes("show top stocks")) {
    document
      .querySelector(".stock-card-wrapper")
      ?.scrollIntoView({ behavior: "smooth" });
    return true;
  }

  // 🔹 SIDEBAR
  if (msg.includes("open sidebar")) {
    const cb = document.getElementById("sidebarCheckbox");
    if (cb && !cb.checked) cb.click();
    return true;
  }

  if (msg.includes("close sidebar")) {
    const cb = document.getElementById("sidebarCheckbox");
    if (cb && cb.checked) cb.click();
    return true;
  }

  return false; // not a command
}


function startVoiceListening() {
  if (!recognition || isListening) return;

  setTimeout(() => {
    recognition.start();
  }, 300);
}


function stopVoiceListening() {
  if (!recognition || !isListening) return;
  recognition.stop();
}

// expose globally
window.startVoiceListening = startVoiceListening;
window.stopVoiceListening = stopVoiceListening;
