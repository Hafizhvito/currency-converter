/**
 * CURRENCY CONVERTER APPLICATION
 * =============================
 *
 * Author: Hafizh Vito Pratomo
 * Version: 1.0
 * Description: Modern currency converter with real-time exchange rates
 * API: ExchangeRate-API (https://api.exchangerate-api.com)
 *
 * Features:
 * - Real-time currency conversion
 * - 14+ supported currencies
 * - Conversion history (up to 50 items)
 * - Responsive design
 * - Auto-refresh rates every 5 minutes
 * - Keyboard shortcuts
 * - Error handling
 */

"use strict";

// ===== GLOBAL VARIABLES =====
let exchangeRates = {};
let currencies = [];
let conversionHistory = [];

// ===== DOM ELEMENTS =====
const elements = {
  fromAmount: document.getElementById("fromAmount"),
  fromCurrency: document.getElementById("fromCurrency"),
  toAmount: document.getElementById("toAmount"),
  toCurrency: document.getElementById("toCurrency"),
  swapBtn: document.getElementById("swapBtn"),
  resultDisplay: document.getElementById("resultDisplay"),
  resultAmount: document.getElementById("resultAmount"),
  exchangeRate: document.getElementById("exchangeRate"),
  errorMessage: document.getElementById("errorMessage"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  converterForm: document.getElementById("converterForm"),
};

// ===== API CONFIGURATION =====
const API_CONFIG = {
  baseURL: "https://api.exchangerate-api.com/v4/latest/",
  fallbackURL: "https://api.fixer.io/latest", // Backup API
  timeout: 10000, // 10 seconds timeout
  retryAttempts: 3,
};

// ===== CURRENCY DATA =====
const CURRENCY_INFO = {
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺" },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧" },
  JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  IDR: { name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  KRW: { name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  SGD: { name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  THB: { name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  INR: { name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
};

// ===== APPLICATION STATE =====
const appState = {
  isLoading: false,
  lastUpdateTime: null,
  apiCallCount: 0,
  errors: [],
};

/**
 * ===== INITIALIZATION FUNCTIONS =====
 */

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    console.log("🚀 Initializing Currency Converter...");

    showLoading(true);
    await loadCurrencies();
    populateCurrencySelects();
    setDefaultCurrencies();
    loadHistoryFromStorage();
    setupEventListeners();

    console.log("✅ Application initialized successfully");
    showLoading(false);
  } catch (error) {
    console.error("❌ Initialization error:", error);
    showError("Gagal memuat aplikasi. Silakan refresh halaman.");
    showLoading(false);
  }
}

/**
 * ===== API FUNCTIONS =====
 */

/**
 * Load currencies and exchange rates from API
 */
async function loadCurrencies() {
  try {
    console.log("📡 Loading currencies from API...");

    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}USD`,
      API_CONFIG.timeout
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate API response
    if (!data.rates || typeof data.rates !== "object") {
      throw new Error("Invalid API response format");
    }

    exchangeRates = data.rates;
    currencies = Object.keys(data.rates).sort();

    // Add base currency (USD) to the list if not present
    if (!currencies.includes("USD")) {
      currencies.unshift("USD");
      exchangeRates["USD"] = 1;
    }

    // Filter currencies to only include supported ones
    currencies = currencies.filter((currency) => CURRENCY_INFO[currency]);

    appState.lastUpdateTime = new Date();
    appState.apiCallCount++;

    console.log(`✅ Loaded ${currencies.length} currencies`);
    hideError();
  } catch (error) {
    console.error("❌ Error loading currencies:", error);
    appState.errors.push({
      message: error.message,
      timestamp: new Date(),
      function: "loadCurrencies",
    });
    throw new Error("Gagal memuat data mata uang dari server");
  }
}

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Exchange rate
 */
async function getExchangeRate(fromCurrency, toCurrency) {
  try {
    if (fromCurrency === toCurrency) return 1;

    // If we have cached rates, calculate cross rate
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      console.log(`💱 Rate ${fromCurrency}→${toCurrency}: ${rate}`);
      return rate;
    }

    // Fetch fresh data for the specific currency
    console.log(`🔄 Fetching fresh rate for ${fromCurrency}→${toCurrency}`);

    const response = await fetchWithTimeout(
      `${API_CONFIG.baseURL}${fromCurrency}`,
      API_CONFIG.timeout
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates[toCurrency]) {
      throw new Error(`Exchange rate not available for ${toCurrency}`);
    }

    appState.apiCallCount++;
    return data.rates[toCurrency];
  } catch (error) {
    console.error("❌ Error getting exchange rate:", error);
    appState.errors.push({
      message: error.message,
      timestamp: new Date(),
      function: "getExchangeRate",
      currencies: `${fromCurrency}→${toCurrency}`,
    });
    throw new Error("Gagal mendapatkan nilai tukar mata uang");
  }
}

/**
 * Fetch with timeout support
 * @param {string} url - URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - server tidak merespons");
    }
    throw error;
  }
}

/**
 * ===== UI MANIPULATION FUNCTIONS =====
 */

/**
 * Populate currency select elements
 */
function populateCurrencySelects() {
  const fromSelect = elements.fromCurrency;
  const toSelect = elements.toCurrency;

  // Clear existing options (except placeholder)
  fromSelect.innerHTML = '<option value="">Pilih Mata Uang</option>';
  toSelect.innerHTML = '<option value="">Pilih Mata Uang</option>';

  // Add currency options
  currencies.forEach((currency) => {
    const info = CURRENCY_INFO[currency];
    if (!info) return; // Skip unsupported currencies

    const optionText = `${info.flag} ${currency} - ${info.name}`;

    const fromOption = new Option(optionText, currency);
    const toOption = new Option(optionText, currency);

    fromSelect.appendChild(fromOption);
    toSelect.appendChild(toOption);
  });

  console.log(`🎯 Populated selects with ${currencies.length} currencies`);
}

/**
 * Set default currencies (USD to IDR)
 */
function setDefaultCurrencies() {
  elements.fromCurrency.value = "USD";
  elements.toCurrency.value = "IDR";
}

/**
 * Perform currency conversion
 */
async function performConversion() {
  const fromAmount = parseFloat(elements.fromAmount.value);
  const fromCurrency = elements.fromCurrency.value;
  const toCurrency = elements.toCurrency.value;

  // Validation
  if (!fromAmount || !fromCurrency || !toCurrency) {
    hideResult();
    return;
  }

  if (fromAmount <= 0) {
    showError("Jumlah harus lebih besar dari 0");
    return;
  }

  if (fromAmount > 1000000000) {
    showError("Jumlah terlalu besar. Maksimal 1 miliar");
    return;
  }

  try {
    console.log(`🔄 Converting ${fromAmount} ${fromCurrency} to ${toCurrency}`);

    showLoading(true);
    hideError();

    const rate = await getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = fromAmount * rate;

    // Update UI
    elements.toAmount.value = formatNumber(convertedAmount);
    elements.resultAmount.textContent = formatCurrency(
      convertedAmount,
      toCurrency
    );
    elements.exchangeRate.textContent = `1 ${fromCurrency} = ${formatNumber(
      rate
    )} ${toCurrency}`;

    showResult();

    // Add to history
    addToHistory({
      from: { amount: fromAmount, currency: fromCurrency },
      to: { amount: convertedAmount, currency: toCurrency },
      rate: rate,
      timestamp: new Date(),
    });

    console.log(
      `✅ Conversion completed: ${fromAmount} ${fromCurrency} = ${convertedAmount.toFixed(
        4
      )} ${toCurrency}`
    );
    showLoading(false);
  } catch (error) {
    console.error("❌ Conversion error:", error);
    showError(error.message || "Gagal melakukan konversi mata uang");
    showLoading(false);
  }
}

/**
 * Swap currencies between from and to selects
 */
function swapCurrencies() {
  const fromCurrency = elements.fromCurrency.value;
  const toCurrency = elements.toCurrency.value;

  if (fromCurrency && toCurrency) {
    elements.fromCurrency.value = toCurrency;
    elements.toCurrency.value = fromCurrency;

    console.log(`🔄 Swapped currencies: ${fromCurrency} ↔ ${toCurrency}`);

    // Trigger conversion if amount is available
    if (elements.fromAmount.value) {
      performConversion();
    }
  }
}

/**
 * ===== DISPLAY FUNCTIONS =====
 */

/**
 * Show conversion result
 */
function showResult() {
  elements.resultDisplay.style.display = "block";
}

/**
 * Hide conversion result
 */
function hideResult() {
  elements.resultDisplay.style.display = "none";
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.style.display = "block";
  hideResult();
  console.error(`💥 Error displayed: ${message}`);
}

/**
 * Hide error message
 */
function hideError() {
  elements.errorMessage.style.display = "none";
}

/**
 * Show/hide loading state
 * @param {boolean} show - Whether to show loading state
 */
function showLoading(show) {
  if (show) {
    appState.isLoading = true;
    elements.resultDisplay.classList.add("loading");
    elements.resultAmount.innerHTML = '<div class="spinner"></div>';
    elements.exchangeRate.textContent = "Memuat nilai tukar...";
    showResult();
  } else {
    appState.isLoading = false;
    elements.resultDisplay.classList.remove("loading");
  }
}

/**
 * ===== HISTORY MANAGEMENT FUNCTIONS =====
 */

/**
 * Add conversion to history
 * @param {Object} conversion - Conversion data
 */
function addToHistory(conversion) {
  // Add to beginning of array
  conversionHistory.unshift(conversion);

  // Limit history to 50 items for performance
  if (conversionHistory.length > 50) {
    conversionHistory = conversionHistory.slice(0, 50);
  }

  saveHistoryToStorage();
  updateHistoryDisplay();

  console.log(
    `📝 Added to history: ${conversion.from.amount} ${
      conversion.from.currency
    } → ${conversion.to.amount.toFixed(4)} ${conversion.to.currency}`
  );
}

/**
 * Update history display in UI
 */
function updateHistoryDisplay() {
  const historyList = elements.historyList;

  if (conversionHistory.length === 0) {
    historyList.innerHTML =
      '<div class="no-history">Belum ada riwayat konversi</div>';
    return;
  }

  const historyHTML = conversionHistory
    .map((conversion, index) => {
      const fromInfo = CURRENCY_INFO[conversion.from.currency] || {};
      const toInfo = CURRENCY_INFO[conversion.to.currency] || {};

      return `
            <div class="history-item" data-index="${index}" onclick="useHistoryItem(${index})">
                <div class="history-conversion">
                    ${fromInfo.flag || ""} ${formatCurrency(
        conversion.from.amount,
        conversion.from.currency
      )} 
                    → 
                    ${toInfo.flag || ""} ${formatCurrency(
        conversion.to.amount,
        conversion.to.currency
      )}
                </div>
                <div class="history-time">
                    <span>${formatDateTime(conversion.timestamp)}</span>
                    <span>Rate: ${formatNumber(conversion.rate)}</span>
                </div>
            </div>
        `;
    })
    .join("");

  historyList.innerHTML = historyHTML;
}

/**
 * Use a history item to populate the converter
 * @param {number} index - Index of history item
 */
function useHistoryItem(index) {
  const conversion = conversionHistory[index];
  if (!conversion) return;

  elements.fromAmount.value = conversion.from.amount;
  elements.fromCurrency.value = conversion.from.currency;
  elements.toCurrency.value = conversion.to.currency;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Focus on amount input
  elements.fromAmount.focus();

  console.log(
    `📋 Used history item: ${conversion.from.currency} → ${conversion.to.currency}`
  );
}

/**
 * Clear all conversion history
 */
function clearHistory() {
  if (conversionHistory.length === 0) {
    showError("Tidak ada riwayat untuk dihapus");
    return;
  }

  if (confirm("Apakah Anda yakin ingin menghapus semua riwayat konversi?")) {
    conversionHistory = [];
    saveHistoryToStorage();
    updateHistoryDisplay();

    console.log("🗑️ History cleared");

    // Show success message briefly
    const originalText = elements.clearHistoryBtn.textContent;
    elements.clearHistoryBtn.textContent = "✅ Terhapus";
    elements.clearHistoryBtn.disabled = true;

    setTimeout(() => {
      elements.clearHistoryBtn.textContent = originalText;
      elements.clearHistoryBtn.disabled = false;
    }, 2000);
  }
}

/**
 * Save history to storage (using variable storage for Claude.ai compatibility)
 */
function saveHistoryToStorage() {
  try {
    // Using window variable instead of localStorage for Claude.ai compatibility
    window.conversionHistoryData = JSON.stringify(conversionHistory);
    console.log(`💾 Saved ${conversionHistory.length} history items`);
  } catch (error) {
    console.warn("⚠️ Could not save history:", error);
  }
}

/**
 * Load history from storage
 */
function loadHistoryFromStorage() {
  try {
    // Using window variable instead of localStorage for Claude.ai compatibility
    const savedHistory = window.conversionHistoryData;
    if (savedHistory) {
      conversionHistory = JSON.parse(savedHistory).map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      console.log(`📂 Loaded ${conversionHistory.length} history items`);
    }
    updateHistoryDisplay();
  } catch (error) {
    console.warn("⚠️ Could not load history:", error);
    conversionHistory = [];
  }
}

/**
 * ===== UTILITY FUNCTIONS =====
 */

/**
 * Format number with locale-specific formatting
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(number, decimals = 4) {
  if (isNaN(number)) return "0";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Format currency with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency) {
  if (isNaN(amount)) return "0";

  const info = CURRENCY_INFO[currency] || { symbol: currency };
  const formattedAmount = formatNumber(amount, 2);

  // For some currencies, symbol goes after the amount
  const symbolAfterCurrencies = ["EUR", "CHF"];

  if (symbolAfterCurrencies.includes(currency)) {
    return `${formattedAmount} ${info.symbol}`;
  }

  return `${info.symbol} ${formattedAmount}`;
}

/**
 * Format date and time
 * @param {Date} date - Date to format
 * @returns {string} Formatted date time
 */
function formatDateTime(date) {
  if (!(date instanceof Date)) return "";

  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Create debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * ===== EVENT LISTENERS =====
 */

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  console.log("🎧 Setting up event listeners...");

  // Debounced conversion for real-time updates
  const debouncedConversion = debounce(performConversion, 500);

  // Form input events
  elements.fromAmount.addEventListener("input", debouncedConversion);
  elements.fromCurrency.addEventListener("change", performConversion);
  elements.toCurrency.addEventListener("change", performConversion);

  // Swap button with throttling to prevent spam
  const throttledSwap = throttle(swapCurrencies, 500);
  elements.swapBtn.addEventListener("click", throttledSwap);

  // History management
  elements.clearHistoryBtn.addEventListener("click", clearHistory);

  // Form submission prevention
  elements.converterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    performConversion();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);

  // Handle visibility change (auto-refresh when tab becomes visible)
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Handle online/offline status
  window.addEventListener("online", handleOnlineStatus);
  window.addEventListener("offline", handleOfflineStatus);

  console.log("✅ Event listeners setup completed");
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + S: Swap currencies
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    swapCurrencies();
    return;
  }

  // Ctrl/Cmd + R: Refresh rates (prevent default browser refresh)
  if ((e.ctrlKey || e.metaKey) && e.key === "r") {
    e.preventDefault();
    refreshExchangeRates();
    return;
  }

  // Escape: Clear inputs
  if (e.key === "Escape") {
    elements.fromAmount.value = "";
    elements.toAmount.value = "";
    hideResult();
    hideError();
    elements.fromAmount.focus();
  }
}

/**
 * Handle visibility change (tab focus)
 */
function handleVisibilityChange() {
  if (!document.hidden && appState.lastUpdateTime) {
    const timeDiff = Date.now() - appState.lastUpdateTime.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    // Auto-refresh if rates are older than 5 minutes
    if (timeDiff > fiveMinutes) {
      console.log("🔄 Auto-refreshing rates due to stale data");
      refreshExchangeRates();
    }
  }
}

/**
 * Handle online status
 */
function handleOnlineStatus() {
  console.log("🌐 Connection restored");
  hideError();
  // Attempt to refresh rates if they're stale
  if (
    !appState.lastUpdateTime ||
    Date.now() - appState.lastUpdateTime.getTime() > 60000
  ) {
    refreshExchangeRates();
  }
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
  console.log("📡 Connection lost");
  showError(
    "Koneksi internet terputus. Menggunakan nilai tukar terakhir yang tersimpan."
  );
}

/**
 * ===== MAINTENANCE FUNCTIONS =====
 */

/**
 * Refresh exchange rates manually
 */
async function refreshExchangeRates() {
  try {
    console.log("🔄 Manually refreshing exchange rates...");
    await loadCurrencies();

    // Re-convert if there's an active conversion
    if (
      elements.fromAmount.value &&
      elements.fromCurrency.value &&
      elements.toCurrency.value
    ) {
      await performConversion();
    }

    console.log("✅ Exchange rates refreshed");
  } catch (error) {
    console.error("❌ Failed to refresh rates:", error);
    showError("Gagal memperbarui nilai tukar");
  }
}

/**
 * Get application statistics
 * @returns {Object} Application statistics
 */
function getAppStats() {
  return {
    apiCalls: appState.apiCallCount,
    historyItems: conversionHistory.length,
    lastUpdate: appState.lastUpdateTime,
    errors: appState.errors.length,
    supportedCurrencies: currencies.length,
    isOnline: navigator.onLine,
  };
}

/**
 * ===== AUTO-REFRESH FUNCTIONALITY =====
 */

/**
 * Start auto-refresh interval
 */
function startAutoRefresh() {
  // Auto-refresh rates every 5 minutes
  setInterval(async () => {
    try {
      if (!document.hidden && navigator.onLine) {
        console.log("⏰ Auto-refreshing exchange rates...");
        await loadCurrencies();
        console.log("✅ Auto-refresh completed");
      }
    } catch (error) {
      console.warn("⚠️ Auto-refresh failed:", error);
    }
  }, 300000); // 5 minutes
}

/**
 * ===== APPLICATION STARTUP =====
 */

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🎬 DOM loaded, starting application...");

  try {
    await initializeApp();
    startAutoRefresh();

    // Add app stats to global scope for debugging
    window.getCurrencyConverterStats = getAppStats;

    console.log("🎉 Currency Converter ready!");
    console.log(
      "💡 Tip: Use Ctrl+S to swap currencies, Ctrl+R to refresh rates"
    );
  } catch (error) {
    console.error("💥 Failed to start application:", error);
  }
});

// Export functions for testing (if in Node.js environment)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatNumber,
    formatCurrency,
    formatDateTime,
    debounce,
    throttle,
  };
}
