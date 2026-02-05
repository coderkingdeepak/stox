/* ===== Make toggleDropdown global ===== */
function toggleDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("show");
}

document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // PROFILE DROPDOWN
  // ==========================
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

  // ==========================
  // SIDEBAR TOGGLE
  // ==========================
  const sidebarToggle = document.querySelector(".sidebar-toggle");
  const sidebarCheckbox = document.getElementById("sidebarCheckbox");

  function updateSidebarLabel() {
    if (!sidebarToggle || !sidebarCheckbox) return;
    sidebarToggle.title = sidebarCheckbox.checked ? "Close Sidebar" : "Open Sidebar";
    sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
  }
  updateSidebarLabel();
  if (sidebarCheckbox) {
    sidebarCheckbox.addEventListener("change", updateSidebarLabel);
  }

  // ==========================
  // STOCK CARD CONFIG
  // ==========================
  const stocks = [
    // ===== OLD 5 =====
    { cardClass: "nvidia-card", modalId: "nvdaDetails", chartId: "stockChartNvidia", livePriceId: "livePriceNvidia", dataId: "chart-data-nvidia", symbol: "NVDA", color: "#00c853" },
    { cardClass: "microsoft-card", modalId: "msftDetails", chartId: "stockChartMS", livePriceId: "livePriceMS", dataId: "chart-data-ms", symbol: "MSFT", color: "#2962ff" },
    { cardClass: "apple-card", modalId: "aaplDetails", chartId: "stockChartApple", livePriceId: "livePriceApple", dataId: "chart-data-apple", symbol: "AAPL", color: "#000000" },
    { cardClass: "amazon-card", modalId: "amznDetails", chartId: "stockChartAMZN", livePriceId: "livePriceAMZN", dataId: "chart-data-amzn", symbol: "AMZN", color: "#ff6d00" },
    { cardClass: "google-card", modalId: "googDetails", chartId: "stockChartGOOG", livePriceId: "livePriceGoogle", dataId: "chart-data-goog", symbol: "GOOGL", color: "#fbbc05" },

    // ===== NEW 5 =====
    { cardClass: "visa-card", modalId: "visaDetails", chartId: "stockChartVisa", livePriceId: "livePriceVisa", dataId: "chart-data-visa", symbol: "V", color: "#1a1f71" },
    { cardClass: "meta-card", modalId: "metaDetails", chartId: "stockChartMeta", livePriceId: "livePriceMeta", dataId: "chart-data-meta", symbol: "META", color: "#1877f2" },
    { cardClass: "tesla-card", modalId: "tslaDetails", chartId: "stockChartTesla", livePriceId: "livePriceTesla", dataId: "chart-data-tesla", symbol: "TSLA", color: "#cc0000" },
    { cardClass: "berkshire-card", modalId: "brkDetails", chartId: "stockChartBRK", livePriceId: "livePriceBRK", dataId: "chart-data-brk", symbol: "BRK-B", color: "#5c4033" },
    { cardClass: "jpm-card", modalId: "jpmDetails", chartId: "stockChartJPM", livePriceId: "livePriceJPM", dataId: "chart-data-jpm", symbol: "JPM", color: "#0a2540" }
  ];

  const modalOverlay = document.getElementById("modalOverlay");
  const stockObjects = {};

  // ==========================
  // LOADING STOCK CARDS
  // ==========================
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

    stockObjects[stock.modalId] = {
      modal,
      chart: null,
      symbol: stock.symbol,
      dates: [...dates],
      prices: [...prices]
    };

    // ==========================
    // RENDER CHART
    // ==========================
    function renderChart() {
      const st = stockObjects[stock.modalId];
      const ctx = document.getElementById(stock.chartId).getContext("2d");

      if (st.chart) st.chart.destroy();

      st.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: st.dates,
          datasets: [{
            label: stock.symbol + " Price",
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
          layout: {
            padding: { bottom: 35, left: 15, right: 15 }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // ==========================
    // OPEN MODAL
    // ==========================
    function openModal() {
      modal.classList.add("show");
      modalOverlay.classList.add("show");
      modalOverlay.style.pointerEvents = "auto";

      setTimeout(() => {
        if (!stockObjects[stock.modalId].chart) {
          renderChart();
        }
        const ch = stockObjects[stock.modalId].chart;
        if (ch) {
          ch.resize();
          ch.update();
        }
      }, 400);
    }

    // ==========================
    // CLOSE MODAL
    // ==========================
    function closeModal() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      modal.classList.remove("fullscreen-mode");
      modal.classList.remove("show");
      modalOverlay.classList.remove("show");
      modalOverlay.style.pointerEvents = "none";
      document.body.style.overflow = "auto";

      const ch = stockObjects[stock.modalId].chart;
      if (ch) {
        setTimeout(() => {
          ch.resize();
          ch.update();
        }, 200);
      }
    }

    card.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (favBtn) favBtn.addEventListener("click", () => favBtn.classList.toggle("active"));

    // ==========================
    // FULLSCREEN TOGGLE
    // ==========================
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          modal.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }
  });

  // ==========================
  // OVERLAY CLICK CLOSE
  // ==========================
  modalOverlay.addEventListener("click", () => {
    Object.values(stockObjects).forEach(obj => obj.modal.classList.remove("show"));
    modalOverlay.classList.remove("show");
    modalOverlay.style.pointerEvents = "none";
  });

  // ==========================
  // FULLSCREEN EXIT FIX
  // ==========================
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      Object.values(stockObjects).forEach(obj => {
        if (obj.chart) {
          setTimeout(() => {
            obj.chart.resize();
            obj.chart.update();
          }, 300);
        }
      });
    }
  });

  // ==========================
  // LIVE PRICE + LIVE CHART UPDATE
  // ==========================
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
        console.log("Live update error:", st.symbol, e);
      }
    }
  }

  fetchLiveData();
  setInterval(fetchLiveData, 10000);

});
