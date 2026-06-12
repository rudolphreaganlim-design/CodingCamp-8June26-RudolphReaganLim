// app.js — Expense & Budget Visualizer
// ES Module: all application logic lives here.

// ── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEY    = "expense_tracker_transactions";
const THEME_KEY      = "expense_tracker_theme";
const CURRENCY_KEY   = "expense_tracker_currency";

// ── State ────────────────────────────────────────────────────────────────────
// Single source of truth for the entire application.

let state = {
  transactions:  [],
  theme:         "light",
  sortDirection: "none",
  currency:      "USD",
};

// ── Currency data ─────────────────────────────────────────────────────────────
// Each entry: [currencyCode, symbol, "Name — Country/Region"]
const CURRENCIES = [
  ["AED","د.إ","UAE Dirham — United Arab Emirates"],
  ["AFN","؋","Afghan Afghani — Afghanistan"],
  ["ALL","L","Albanian Lek — Albania"],
  ["AMD","֏","Armenian Dram — Armenia"],
  ["ANG","ƒ","Netherlands Antillean Guilder — Curaçao / Sint Maarten"],
  ["AOA","Kz","Angolan Kwanza — Angola"],
  ["ARS","$","Argentine Peso — Argentina"],
  ["AUD","A$","Australian Dollar — Australia"],
  ["AWG","ƒ","Aruban Florin — Aruba"],
  ["AZN","₼","Azerbaijani Manat — Azerbaijan"],
  ["BAM","KM","Bosnia-Herzegovina Convertible Mark — Bosnia"],
  ["BBD","Bds$","Barbadian Dollar — Barbados"],
  ["BDT","৳","Bangladeshi Taka — Bangladesh"],
  ["BGN","лв","Bulgarian Lev — Bulgaria"],
  ["BHD",".د.ب","Bahraini Dinar — Bahrain"],
  ["BIF","Fr","Burundian Franc — Burundi"],
  ["BMD","$","Bermudian Dollar — Bermuda"],
  ["BND","B$","Brunei Dollar — Brunei"],
  ["BOB","Bs.","Bolivian Boliviano — Bolivia"],
  ["BRL","R$","Brazilian Real — Brazil"],
  ["BSD","$","Bahamian Dollar — Bahamas"],
  ["BTN","Nu","Bhutanese Ngultrum — Bhutan"],
  ["BWP","P","Botswana Pula — Botswana"],
  ["BYN","Br","Belarusian Ruble — Belarus"],
  ["BZD","BZ$","Belize Dollar — Belize"],
  ["CAD","C$","Canadian Dollar — Canada"],
  ["CDF","Fr","Congolese Franc — DR Congo"],
  ["CHF","Fr","Swiss Franc — Switzerland"],
  ["CLP","$","Chilean Peso — Chile"],
  ["CNY","¥","Chinese Yuan — China"],
  ["COP","$","Colombian Peso — Colombia"],
  ["CRC","₡","Costa Rican Colón — Costa Rica"],
  ["CUP","$","Cuban Peso — Cuba"],
  ["CVE","$","Cape Verdean Escudo — Cape Verde"],
  ["CZK","Kč","Czech Koruna — Czech Republic"],
  ["DJF","Fr","Djiboutian Franc — Djibouti"],
  ["DKK","kr","Danish Krone — Denmark"],
  ["DOP","RD$","Dominican Peso — Dominican Republic"],
  ["DZD","دج","Algerian Dinar — Algeria"],
  ["EGP","£","Egyptian Pound — Egypt"],
  ["ERN","Nfk","Eritrean Nakfa — Eritrea"],
  ["ETB","Br","Ethiopian Birr — Ethiopia"],
  ["EUR","€","Euro — Eurozone"],
  ["FJD","FJ$","Fijian Dollar — Fiji"],
  ["FKP","£","Falkland Islands Pound — Falkland Islands"],
  ["GBP","£","British Pound — United Kingdom"],
  ["GEL","₾","Georgian Lari — Georgia"],
  ["GHS","₵","Ghanaian Cedi — Ghana"],
  ["GIP","£","Gibraltar Pound — Gibraltar"],
  ["GMD","D","Gambian Dalasi — Gambia"],
  ["GNF","Fr","Guinean Franc — Guinea"],
  ["GTQ","Q","Guatemalan Quetzal — Guatemala"],
  ["GYD","$","Guyanese Dollar — Guyana"],
  ["HKD","HK$","Hong Kong Dollar — Hong Kong"],
  ["HNL","L","Honduran Lempira — Honduras"],
  ["HRK","kn","Croatian Kuna — Croatia"],
  ["HTG","G","Haitian Gourde — Haiti"],
  ["HUF","Ft","Hungarian Forint — Hungary"],
  ["IDR","Rp","Indonesian Rupiah — Indonesia"],
  ["ILS","₪","Israeli New Shekel — Israel"],
  ["INR","₹","Indian Rupee — India"],
  ["IQD","ع.د","Iraqi Dinar — Iraq"],
  ["IRR","﷼","Iranian Rial — Iran"],
  ["ISK","kr","Icelandic Króna — Iceland"],
  ["JMD","J$","Jamaican Dollar — Jamaica"],
  ["JOD","JD","Jordanian Dinar — Jordan"],
  ["JPY","¥","Japanese Yen — Japan"],
  ["KES","KSh","Kenyan Shilling — Kenya"],
  ["KGS","лв","Kyrgystani Som — Kyrgyzstan"],
  ["KHR","៛","Cambodian Riel — Cambodia"],
  ["KMF","Fr","Comorian Franc — Comoros"],
  ["KPW","₩","North Korean Won — North Korea"],
  ["KRW","₩","South Korean Won — South Korea"],
  ["KWD","KD","Kuwaiti Dinar — Kuwait"],
  ["KYD","$","Cayman Islands Dollar — Cayman Islands"],
  ["KZT","₸","Kazakhstani Tenge — Kazakhstan"],
  ["LAK","₭","Lao Kip — Laos"],
  ["LBP","ل.ل","Lebanese Pound — Lebanon"],
  ["LKR","Rs","Sri Lankan Rupee — Sri Lanka"],
  ["LRD","$","Liberian Dollar — Liberia"],
  ["LSL","L","Lesotho Loti — Lesotho"],
  ["LYD","LD","Libyan Dinar — Libya"],
  ["MAD","MAD","Moroccan Dirham — Morocco"],
  ["MDL","L","Moldovan Leu — Moldova"],
  ["MGA","Ar","Malagasy Ariary — Madagascar"],
  ["MKD","ден","Macedonian Denar — North Macedonia"],
  ["MMK","K","Myanmar Kyat — Myanmar"],
  ["MNT","₮","Mongolian Tögrög — Mongolia"],
  ["MOP","P","Macanese Pataca — Macao"],
  ["MRU","UM","Mauritanian Ouguiya — Mauritania"],
  ["MUR","Rs","Mauritian Rupee — Mauritius"],
  ["MVR","Rf","Maldivian Rufiyaa — Maldives"],
  ["MWK","MK","Malawian Kwacha — Malawi"],
  ["MXN","$","Mexican Peso — Mexico"],
  ["MYR","RM","Malaysian Ringgit — Malaysia"],
  ["MZN","MT","Mozambican Metical — Mozambique"],
  ["NAD","$","Namibian Dollar — Namibia"],
  ["NGN","₦","Nigerian Naira — Nigeria"],
  ["NIO","C$","Nicaraguan Córdoba — Nicaragua"],
  ["NOK","kr","Norwegian Krone — Norway"],
  ["NPR","Rs","Nepalese Rupee — Nepal"],
  ["NZD","NZ$","New Zealand Dollar — New Zealand"],
  ["OMR","﷼","Omani Rial — Oman"],
  ["PAB","B/.","Panamanian Balboa — Panama"],
  ["PEN","S/","Peruvian Sol — Peru"],
  ["PGK","K","Papua New Guinean Kina — Papua New Guinea"],
  ["PHP","₱","Philippine Peso — Philippines"],
  ["PKR","Rs","Pakistani Rupee — Pakistan"],
  ["PLN","zł","Polish Złoty — Poland"],
  ["PYG","₲","Paraguayan Guaraní — Paraguay"],
  ["QAR","﷼","Qatari Riyal — Qatar"],
  ["RON","lei","Romanian Leu — Romania"],
  ["RSD","din","Serbian Dinar — Serbia"],
  ["RUB","₽","Russian Ruble — Russia"],
  ["RWF","Fr","Rwandan Franc — Rwanda"],
  ["SAR","﷼","Saudi Riyal — Saudi Arabia"],
  ["SBD","$","Solomon Islands Dollar — Solomon Islands"],
  ["SCR","Rs","Seychellois Rupee — Seychelles"],
  ["SDG","ج.س.","Sudanese Pound — Sudan"],
  ["SEK","kr","Swedish Krona — Sweden"],
  ["SGD","S$","Singapore Dollar — Singapore"],
  ["SHP","£","Saint Helena Pound — Saint Helena"],
  ["SLL","Le","Sierra Leonean Leone — Sierra Leone"],
  ["SOS","Sh","Somali Shilling — Somalia"],
  ["SRD","$","Surinamese Dollar — Suriname"],
  ["STN","Db","São Tomé and Príncipe Dobra — São Tomé"],
  ["SVC","₡","Salvadoran Colón — El Salvador"],
  ["SYP","£","Syrian Pound — Syria"],
  ["SZL","L","Swazi Lilangeni — Eswatini"],
  ["THB","฿","Thai Baht — Thailand"],
  ["TJS","SM","Tajikistani Somoni — Tajikistan"],
  ["TMT","T","Turkmenistan Manat — Turkmenistan"],
  ["TND","DT","Tunisian Dinar — Tunisia"],
  ["TOP","T$","Tongan Paʻanga — Tonga"],
  ["TRY","₺","Turkish Lira — Turkey"],
  ["TTD","TT$","Trinidad and Tobago Dollar — Trinidad"],
  ["TWD","NT$","New Taiwan Dollar — Taiwan"],
  ["TZS","Sh","Tanzanian Shilling — Tanzania"],
  ["UAH","₴","Ukrainian Hryvnia — Ukraine"],
  ["UGX","Sh","Ugandan Shilling — Uganda"],
  ["USD","$","US Dollar — United States"],
  ["UYU","$U","Uruguayan Peso — Uruguay"],
  ["UZS","лв","Uzbekistani Som — Uzbekistan"],
  ["VES","Bs.S","Venezuelan Bolívar Soberano — Venezuela"],
  ["VND","₫","Vietnamese Đồng — Vietnam"],
  ["VUV","Vt","Vanuatu Vatu — Vanuatu"],
  ["WST","T","Samoan Tālā — Samoa"],
  ["XAF","Fr","Central African CFA Franc — Central Africa"],
  ["XCD","$","East Caribbean Dollar — East Caribbean"],
  ["XOF","Fr","West African CFA Franc — West Africa"],
  ["XPF","Fr","CFP Franc — French Polynesia"],
  ["YER","﷼","Yemeni Rial — Yemen"],
  ["ZAR","R","South African Rand — South Africa"],
  ["ZMW","ZK","Zambian Kwacha — Zambia"],
  ["ZWL","$","Zimbabwean Dollar — Zimbabwe"],
];

/**
 * getCurrencySymbol(code)
 * Returns the symbol for the given ISO 4217 currency code.
 * Falls back to the code itself if not found.
 */
function getCurrencySymbol(code) {
  const entry = CURRENCIES.find(([c]) => c === code);
  return entry ? entry[1] : code;
}

function loadCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || "USD";
}

function saveCurrency(code) {
  try {
    localStorage.setItem(CURRENCY_KEY, code);
  } catch (e) {
    console.warn("expense-tracker: could not save currency preference.", e);
  }
}

/**
 * initCurrency()
 * Reads saved currency, populates #currency-select, and wires the change handler.
 */
function initCurrency() {
  const saved = loadCurrency();
  state.currency = CURRENCIES.find(([c]) => c === saved) ? saved : "USD";

  const select = document.getElementById("currency-select");
  if (!select) return;

  if (select.options.length === 0) {
    for (const [code, symbol, label] of CURRENCIES) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code} (${symbol}) — ${label.split(" — ")[1]}`;
      select.appendChild(opt);
    }
  }

  select.value = state.currency;

  select.addEventListener("change", () => {
    state.currency = select.value;
    saveCurrency(state.currency);
    renderAll();
  });
}

// ── Storage Module ───────────────────────────────────────────────────────────

/**
 * Required fields that every persisted transaction record must have.
 * Records missing any of these fields are discarded on load.
 */
const REQUIRED_TX_FIELDS = ["id", "name", "date", "amount", "category"];

/**
 * loadFromStorage()
 * Reads the transaction array from localStorage, parses it, and validates
 * each record.  Malformed records are discarded with a console warning.
 * Falls back to an empty array on any parse failure.
 */
function loadFromStorage() {
  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      state.transactions = [];
      return;
    }

    // Validate each record; discard any that are missing required fields.
    const valid = [];
    for (const record of parsed) {
      const missing = REQUIRED_TX_FIELDS.filter(
        (field) => record[field] === undefined || record[field] === null
      );
      if (missing.length > 0) {
        console.warn(
          `expense-tracker: discarding malformed transaction (missing: ${missing.join(", ")})`,
          record
        );
      } else {
        valid.push(record);
      }
    }

    state.transactions = valid;
  } catch {
    state.transactions = [];
    console.warn(
      "expense-tracker: could not parse stored transactions, resetting."
    );
  }
}

/**
 * saveToStorage()
 * Serialises state.transactions to JSON and writes it to localStorage.
 * Shows a user-visible error banner if the write fails (e.g. quota exceeded).
 * The in-memory state is never modified on failure.
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  } catch (e) {
    showStorageError(
      "Could not save data: " + (e.message || "storage error.")
    );
  }
}

/**
 * loadTheme()
 * Reads the persisted theme from localStorage.
 * Returns "light" if no value is stored or the value is unrecognised.
 *
 * @returns {"light"|"dark"}
 */
function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

/**
 * saveTheme(theme)
 * Persists the given theme string to localStorage.
 *
 * @param {"light"|"dark"} theme
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn("expense-tracker: could not save theme preference.", e);
  }
}

// ── Storage Error UI ─────────────────────────────────────────────────────────

/**
 * showStorageError(message)
 * Displays a user-visible error banner at the top of the page.
 * The banner auto-dismisses after 6 seconds and can be closed manually.
 *
 * @param {string} message  Human-readable error text.
 */
function showStorageError(message) {
  // Reuse an existing banner if one is already present.
  let banner = document.getElementById("storage-error-banner");

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "storage-error-banner";
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "assertive");
    banner.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "right:0",
      "z-index:9999",
      "background:#c0392b",
      "color:#fff",
      "padding:0.75rem 1rem",
      "display:flex",
      "align-items:center",
      "justify-content:space-between",
      "font-family:inherit",
      "font-size:0.95rem",
      "box-shadow:0 2px 6px rgba(0,0,0,0.3)",
    ].join(";");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", "Dismiss error");
    closeBtn.style.cssText =
      "background:transparent;border:none;color:#fff;font-size:1.25rem;" +
      "cursor:pointer;margin-left:1rem;line-height:1;";
    closeBtn.addEventListener("click", () => banner.remove());

    const msgSpan = document.createElement("span");
    msgSpan.className = "storage-error-text";
    banner.appendChild(msgSpan);
    banner.appendChild(closeBtn);

    document.body.prepend(banner);
  }

  banner.querySelector(".storage-error-text").textContent = message;

  // Auto-dismiss after 6 s.
  clearTimeout(banner._dismissTimer);
  banner._dismissTimer = setTimeout(() => banner.remove(), 6000);
}

// ── Theme Module ─────────────────────────────────────────────────────────────

/**
 * applyTheme(theme)
 * Adds the "dark" CSS class to <body> when theme is "dark";
 * removes it otherwise.  Applied immediately without a page reload.
 * Requirement 8.2.
 *
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

/**
 * initTheme()
 * Reads the saved preference from localStorage via loadTheme().
 * Defaults to "light" when no preference is stored (Requirement 8.4).
 * Persists the resolved value into state and applies it (Requirement 8.3).
 */
function initTheme() {
  const saved = loadTheme();
  state.theme = saved || "light";
  applyTheme(state.theme);
}

/**
 * toggleTheme()
 * Flips the current theme between "light" and "dark", saves the new
 * preference to localStorage, and applies it immediately.
 * Requirements 8.1, 8.2, 8.3.
 */
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  saveTheme(state.theme);
  applyTheme(state.theme);
}

// ── Validation Module ─────────────────────────────────────────────────────────

/**
 * validateForm({ name, date, amount, category, customCategory })
 * Validates the five form fields against the business rules.
 * Returns { valid: boolean, errors: Map<fieldId, string> }.
 *
 * Field IDs used as Map keys:
 *   "name"     — Item name (must be non-empty / non-whitespace)
 *   "date"     — Date (must be present, must not be in the future)
 *   "amount"   — Amount (must be a number in [0.01, 9999999.99])
 *   "category" — Category (must be non-empty)
 *   "custom"   — Custom category (required when category is "Other")
 *
 * Requirements: 1.3, 1.4
 *
 * @param {{ name: string, date: string, amount: number|string, category: string, customCategory: string }} values
 * @returns {{ valid: boolean, errors: Map<string, string> }}
 */
function validateForm({ name, date, amount, category, customCategory }) {
  const errors = new Map();

  if (!name || name.trim().length === 0)
    errors.set("name", "Item name is required.");

  if (!date)
    errors.set("date", "Date is required.");

  if (!amount || isNaN(amount) || Number(amount) < 0.01 || Number(amount) > 9999999.99)
    errors.set("amount", "Amount must be between 0.01 and 9,999,999.99.");

  if (!category)
    errors.set("category", "Category is required.");

  if (category === "Other" && (!customCategory || customCategory.trim().length === 0))
    errors.set("custom", "Custom category label is required.");

  return { valid: errors.size === 0, errors };
}

// ── Form Module ───────────────────────────────────────────────────────────────

/**
 * getFormValues()
 * Reads all visible form fields and returns their current values.
 * Returns { name, date, amount, category, customCategory }.
 *
 * @returns {{ name: string, date: string, amount: number|string, category: string, customCategory: string }}
 */
function getFormValues() {
  const name           = (document.getElementById("field-name")?.value    ?? "").trim();
  const date           = document.getElementById("field-date")?.value     ?? "";
  const rawAmount      = document.getElementById("field-amount")?.value   ?? "";
  const amount         = rawAmount === "" ? "" : Number(rawAmount);
  const category       = document.getElementById("field-category")?.value ?? "";
  const customCategory = (document.getElementById("field-custom")?.value  ?? "").trim();

  return { name, date, amount, category, customCategory };
}

/**
 * showFieldError(fieldId, message)
 * Populates the inline error span associated with the given field.
 * Expects a <span class="field-error" data-for="fieldId"> element in the DOM.
 *
 * @param {string} fieldId   - The data-for value (e.g. "name", "date", "amount")
 * @param {string} message   - Human-readable error text
 */
function showFieldError(fieldId, message) {
  const span = document.querySelector(`.field-error[data-for="${fieldId}"]`);
  if (span) {
    span.textContent = message;
  }
}

/**
 * clearFieldErrors()
 * Removes all inline error messages by clearing every .field-error span.
 */
function clearFieldErrors() {
  const spans = document.querySelectorAll(".field-error");
  for (const span of spans) {
    span.textContent = "";
  }
}

/**
 * resetForm()
 * Clears all form fields and hides the Custom_Category input.
 * Requirements: 1.6
 */
function resetForm() {
  const form = document.getElementById("input-form");
  if (form) form.reset();

  // Ensure the custom category field is hidden after reset.
  const customField = document.getElementById("field-custom");
  if (customField) {
    customField.classList.add("hidden");
    customField.value = "";
  }

  clearFieldErrors();
}

// ── Transaction Module ────────────────────────────────────────────────────────

/**
 * Monotonically increasing counter used to assign stable insertion order to
 * each Transaction.  Initialised from loaded data in loadFromStorage() so it
 * never collides with persisted records.
 */
let nextInsertionIndex = 0;

/**
 * generateId()
 * Returns a UUID v4 string.  Uses the native crypto.randomUUID() when
 * available; falls back to a manual UUID v4 implementation otherwise.
 *
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Manual UUID v4 fallback for environments without crypto.randomUUID.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * createTransaction(values)
 * Builds a new Transaction object from the supplied form values, appends it
 * to state.transactions, and persists the updated array to localStorage.
 *
 * Requirements: 1.5, 2.1
 *
 * @param {{ name: string, date: string, amount: number|string, category: string, customCategory: string }} values
 * @returns {Transaction}
 */
function createTransaction(values) {
  const tx = {
    id:             generateId(),
    name:           values.name,
    date:           values.date,               // already "YYYY-MM-DD"
    amount:         Number(values.amount),
    category:       values.category,
    customCategory: values.category === "Other" ? (values.customCategory || "") : "",
    insertionIndex: nextInsertionIndex++,
  };

  state.transactions.push(tx);
  saveToStorage();
  return tx;
}

/**
 * deleteTransaction(id)
 * Removes the transaction with the given id from state.transactions and
 * persists the change to localStorage.
 *
 * Requirements: 2.3, 3.3
 *
 * @param {string} id  UUID of the transaction to remove.
 */
function deleteTransaction(id) {
  state.transactions = state.transactions.filter((tx) => tx.id !== id);
  saveToStorage();
}

// ── Compute Module ────────────────────────────────────────────────────────────

/**
 * groupByMonth(transactions)
 * Groups an array of transactions by calendar month and returns a Map whose
 * keys are "YYYY-MM" strings in strictly descending order (most recent first).
 *
 * Requirements: 3.1
 *
 * @param {Transaction[]} transactions
 * @returns {Map<string, Transaction[]>}
 */
function groupByMonth(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const key = tx.date.slice(0, 7); // "YYYY-MM"
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(tx);
  }
  // Sort keys descending so the most recent month appears first.
  return new Map(
    [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  );
}

/**
 * sortTransactions(txList, direction)
 * Returns a new array sorted by amount in the requested direction.
 * Equal amounts are tie-broken by insertionIndex (ascending) for stability.
 * When direction is "none" the original insertion order is preserved.
 *
 * Requirements: 7.2, 7.3
 *
 * @param {Transaction[]} txList
 * @param {"none"|"asc"|"desc"} direction
 * @returns {Transaction[]}
 */
function sortTransactions(txList, direction) {
  if (direction === "none") return [...txList];
  return [...txList].sort((a, b) => {
    const diff = a.amount - b.amount;
    if (diff !== 0) return direction === "asc" ? diff : -diff;
    // Tie-break: lower insertionIndex first (stable, insertion order).
    return a.insertionIndex - b.insertionIndex;
  });
}

/**
 * computeMonthlyTotal(txList)
 * Returns the arithmetic sum of all amounts in the supplied transaction array.
 *
 * Requirements: 4.1
 *
 * @param {Transaction[]} txList
 * @returns {number}
 */
function computeMonthlyTotal(txList) {
  return txList.reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * computeAnnualTotal(transactions)
 * Filters the transaction collection to the current local calendar year and
 * returns the sum of those amounts.  Returns 0 when no current-year records
 * exist.
 *
 * Requirements: 5.1
 *
 * @param {Transaction[]} transactions
 * @returns {number}
 */
function computeAnnualTotal(transactions) {
  const currentYear = new Date().getFullYear();
  return transactions
    .filter(
      (tx) => new Date(tx.date + "T00:00:00").getFullYear() === currentYear
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * computeCategoryTotals(transactions)
 * Builds a Map from category label to total amount.  When a transaction's
 * category is "Other", its customCategory label is used (falling back to
 * "Other" if customCategory is empty).  Entries with a total of exactly zero
 * are removed before the Map is returned.
 *
 * Requirements: 6.1
 *
 * @param {Transaction[]} transactions
 * @returns {Map<string, number>}
 */
function computeCategoryTotals(transactions) {
  const totals = new Map();
  for (const tx of transactions) {
    const label =
      tx.category === "Other"
        ? tx.customCategory || "Other"
        : tx.category;
    totals.set(label, (totals.get(label) ?? 0) + tx.amount);
  }
  // Remove any zero-value entries (defensive; shouldn't occur with valid data).
  for (const [k, v] of totals) {
    if (v === 0) totals.delete(k);
  }
  return totals;
}

// ── Rendering Module ─────────────────────────────────────────────────────────

// ── Format Helpers ──

/**
 * formatAmount(amount)
 * Returns a formatted dollar string with thousands separators and exactly
 * two decimal places.
 * e.g. 1234.5 → "$1,234.50", 4.5 → "$4.50"
 *
 * @param {number} amount
 * @returns {string}
 */
function formatAmount(amount) {
  const symbol = getCurrencySymbol(state.currency);
  return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * formatDate(isoDate)
 * Converts "YYYY-MM-DD" to "D Mon YYYY" (no leading zero on day, 3-letter month).
 * e.g. "2026-06-08" → "8 Jun 2026"
 *
 * @param {string} isoDate  ISO 8601 date string "YYYY-MM-DD"
 * @returns {string}
 */
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = ["Jan","Feb","Mar","Apr","May","Jun",
                     "Jul","Aug","Sep","Oct","Nov","Dec"][month - 1];
  return `${day} ${monthName} ${year}`;
}

/**
 * formatMonthHeader(key)
 * Converts "YYYY-MM" to full month name + year.
 * e.g. "2026-06" → "June 2026"
 *
 * @param {string} key  "YYYY-MM" string
 * @returns {string}
 */
function formatMonthHeader(key) {
  const [year, month] = key.split("-").map(Number);
  const fullMonth = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"][month - 1];
  return `${fullMonth} ${year}`;
}

// ── Transaction List Rendering ──

/**
 * renderMonthGroup(monthKey, txList, sortDirection)
 * Creates and returns a .month-group <div> containing:
 *   - An <h3> header with month name and monthly total
 *   - A <ul> of sorted transaction rows with delete buttons
 *
 * Requirements: 3.2, 3.4, 3.5, 4.1, 4.3
 *
 * @param {string} monthKey        "YYYY-MM"
 * @param {Transaction[]} txList   Transactions belonging to this month
 * @param {"none"|"asc"|"desc"} sortDirection
 * @returns {HTMLDivElement}
 */
function renderMonthGroup(monthKey, txList, sortDirection) {
  const group = document.createElement("div");
  group.className = "month-group";
  group.dataset.month = monthKey;

  // Header: "June 2026  $1,234.56"
  const h3 = document.createElement("h3");
  const monthTotal = computeMonthlyTotal(txList);
  const totalSpan = document.createElement("span");
  totalSpan.className = "monthly-total";
  totalSpan.textContent = formatAmount(monthTotal);
  h3.textContent = formatMonthHeader(monthKey) + "  ";
  h3.appendChild(totalSpan);
  group.appendChild(h3);

  // Transaction rows
  const ul = document.createElement("ul");
  const sorted = sortTransactions(txList, sortDirection);

  for (const tx of sorted) {
    const li = document.createElement("li");
    li.dataset.id = tx.id;

    const nameSpan = document.createElement("span");
    nameSpan.className = "tx-name";
    nameSpan.textContent = tx.name;

    const dateSpan = document.createElement("span");
    dateSpan.className = "tx-date";
    dateSpan.textContent = formatDate(tx.date);

    const amountSpan = document.createElement("span");
    amountSpan.className = "tx-amount";
    amountSpan.textContent = formatAmount(tx.amount);

    const categorySpan = document.createElement("span");
    categorySpan.className = "tx-category";
    categorySpan.textContent =
      tx.category === "Other" ? (tx.customCategory || "Other") : tx.category;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.dataset.id = tx.id;
    deleteBtn.setAttribute(
      "aria-label",
      `Delete ${tx.name} \u2013 ${formatAmount(tx.amount)}`
    );
    deleteBtn.textContent = "Delete";

    li.appendChild(nameSpan);
    li.appendChild(dateSpan);
    li.appendChild(amountSpan);
    li.appendChild(categorySpan);
    li.appendChild(deleteBtn);
    ul.appendChild(li);
  }

  group.appendChild(ul);
  return group;
}

/**
 * renderTransactionList(transactions, sortDirection)
 * Rebuilds the entire #transaction-list DOM from the supplied transactions.
 * Groups by month (most recent first), renders each group, and toggles the
 * #empty-placeholder visibility.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * @param {Transaction[]} transactions
 * @param {"none"|"asc"|"desc"} sortDirection
 */
function renderTransactionList(transactions, sortDirection) {
  const listEl = document.getElementById("transaction-list");
  if (!listEl) return;

  // Remove all children except the #empty-placeholder so we can re-use it.
  const placeholder = document.getElementById("empty-placeholder");
  while (listEl.firstChild) {
    listEl.removeChild(listEl.firstChild);
  }
  // Re-attach the placeholder (it was removed in the loop above).
  if (placeholder) listEl.appendChild(placeholder);

  if (transactions.length === 0) {
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  if (placeholder) placeholder.classList.add("hidden");

  const groups = groupByMonth(transactions);
  for (const [monthKey, txList] of groups) {
    const groupEl = renderMonthGroup(monthKey, txList, sortDirection);
    listEl.appendChild(groupEl);
  }
}

// ── Annual Summary ──

/**
 * updateAnnualSummary(transactions)
 * Updates #annual-amount with the formatted annual total and
 * #current-year with the current calendar year.
 *
 * Requirements: 5.1, 5.2, 5.3
 *
 * @param {Transaction[]} transactions
 */
function updateAnnualSummary(transactions) {
  const amountEl = document.getElementById("annual-amount");
  const yearEl   = document.getElementById("current-year");

  if (amountEl) {
    amountEl.textContent = formatAmount(computeAnnualTotal(transactions));
  }
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

// ── Sort Control ──

/**
 * initSortControl()
 * Reads the persisted sort direction from sessionStorage, restores it into
 * the #sort-select and state, then wires the change event to update state,
 * persist to sessionStorage, and re-render.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
function initSortControl() {
  const SORT_KEY = "expense_tracker_sort";
  const sortSelect = document.getElementById("sort-select");

  const persisted = sessionStorage.getItem(SORT_KEY);
  const validValues = ["none", "asc", "desc"];
  const initial = validValues.includes(persisted) ? persisted : "none";

  state.sortDirection = initial;
  if (sortSelect) {
    sortSelect.value = initial;
    sortSelect.addEventListener("change", () => {
      state.sortDirection = sortSelect.value;
      sessionStorage.setItem(SORT_KEY, sortSelect.value);
      renderAll();
    });
  }
}

// ── Chart Module ─────────────────────────────────────────────────────────────

let chartInstance = null;

/**
 * CHART_COLORS
 * A palette of up to 12 perceptually distinct colors for pie/doughnut slices.
 * Requirements: 6.3
 */
const CHART_COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ac",
  "#d37295",
  "#a0cbe8",
];

/**
 * initChart()
 * Checks whether Chart.js loaded successfully via the CDN.
 * - If Chart.js is unavailable (window.Chart undefined or CDN onerror fired),
 *   reveals #chart-error and returns without creating an instance.
 * - Otherwise creates a Chart.js pie/doughnut instance on the #pie-chart
 *   canvas with legend enabled and a custom tooltip showing the category name,
 *   formatted amount, and percentage.
 *
 * Requirements: 6.4, 10.4
 */
function initChart() {
  if (typeof window.Chart === "undefined" || window.__chartFailed) {
    const errorEl = document.getElementById("chart-error");
    if (errorEl) errorEl.classList.remove("hidden");
    return;
  }

  const canvas = document.getElementById("pie-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  chartInstance = new window.Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            /**
             * Custom tooltip label:
             * Shows "CategoryName: $X.XX (N%)"
             * Requirements: 6.4
             */
            label(context) {
              const label      = context.label ?? "";
              const value      = context.parsed;
              const total      = context.chart.data.datasets[0].data.reduce(
                (sum, v) => sum + v,
                0
              );
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
              return `${label}: ${formatAmount(value)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

/**
 * updateChart(categoryTotals)
 * Updates the pie/doughnut chart with new category data.
 * - If no chart instance exists (Chart.js unavailable), returns immediately.
 * - If categoryTotals is empty, hides the canvas and shows #chart-placeholder.
 * - Otherwise, updates chartInstance.data with labels, values, and distinct
 *   colors from CHART_COLORS (cycling if there are more than 12 categories),
 *   then calls chartInstance.update() to re-render.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.5
 *
 * @param {Map<string, number>} categoryTotals
 */
function updateChart(categoryTotals) {
  if (!chartInstance) return;

  const canvas      = document.getElementById("pie-chart");
  const placeholder = document.getElementById("chart-placeholder");

  if (categoryTotals.size === 0) {
    // No spending data — hide chart canvas, show placeholder message.
    if (canvas)      canvas.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
    return;
  }

  // There is data — show canvas, hide placeholder.
  if (canvas)      canvas.classList.remove("hidden");
  if (placeholder) placeholder.classList.add("hidden");

  const labels = [];
  const values = [];
  const colors = [];

  let colorIndex = 0;
  for (const [category, total] of categoryTotals) {
    labels.push(category);
    values.push(total);
    colors.push(CHART_COLORS[colorIndex % CHART_COLORS.length]);
    colorIndex++;
  }

  chartInstance.data.labels                          = labels;
  chartInstance.data.datasets[0].data               = values;
  chartInstance.data.datasets[0].backgroundColor    = colors;

  chartInstance.update();
}

// ── renderAll ──

/**
 * renderAll()
 * Re-renders all UI components from the current state.
 *
 * Requirements: 2.2, 6.2
 */
function renderAll() {
  renderTransactionList(state.transactions, state.sortDirection);
  updateAnnualSummary(state.transactions);
  updateChart(computeCategoryTotals(state.transactions));
}

// ── Boot ─────────────────────────────────────────────────────────────────────

function init() {
  // Load persisted transactions and initialise the insertion-index counter so
  // new IDs never collide with records that were loaded from storage.
  loadFromStorage();
  if (state.transactions.length > 0) {
    const maxIndex = Math.max(
      ...state.transactions.map((t) => t.insertionIndex ?? -1)
    );
    nextInsertionIndex = maxIndex + 1;
  }

  // Initialise theme (reads saved preference, defaults to "light").
  initTheme();

  // Initialise currency selector.
  initCurrency();

  // Initialise sort control (reads persisted direction from sessionStorage).
  initSortControl();

  // Initialise chart (creates Chart.js instance; shows error if CDN failed).
  initChart();

  // Wire the Theme_Toggle button (Requirement 8.1).
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Wire the Category <select> to show/hide Custom_Category field (Requirement 1.2).
  const categorySelect = document.getElementById("field-category");
  const customField    = document.getElementById("field-custom");
  if (categorySelect && customField) {
    categorySelect.addEventListener("change", () => {
      if (categorySelect.value === "Other") {
        customField.classList.remove("hidden");
      } else {
        customField.classList.add("hidden");
        customField.value = "";
      }
    });
  }

  // ── Form submit — Task 4.1 ─────────────────────────────────────────────────
  // Requirements: 1.3, 1.4, 1.5, 1.6
  const form = document.getElementById("input-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFieldErrors();

      const values = getFormValues();
      const { valid, errors } = validateForm(values);

      if (!valid) {
        // Display a per-field inline error for every violated field.
        for (const [fieldId, message] of errors) {
          showFieldError(fieldId, message);
        }
        // Move focus to the first invalid field for accessibility.
        const firstErrorFieldId = errors.keys().next().value;
        const fieldMap = {
          name:     "field-name",
          date:     "field-date",
          amount:   "field-amount",
          category: "field-category",
          custom:   "field-custom",
        };
        const firstEl = document.getElementById(fieldMap[firstErrorFieldId]);
        if (firstEl) firstEl.focus();
        return;
      }

      createTransaction(values);
      resetForm();
      renderAll();
    });
  }

  // ── Delete button delegation — Task 4.1 ───────────────────────────────────
  // A single listener on the container handles all delete buttons.
  // Requirements: 2.3, 3.3
  const txList = document.getElementById("transaction-list");
  if (txList) {
    txList.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (!btn) return;

      const id = btn.dataset.id;
      if (!id) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this expense?"
      );
      if (!confirmed) return;

      deleteTransaction(id);
      renderAll();
    });
  }

  // Initial render on page load.
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

// ── Exports (for unit / property-based tests) ─────────────────────────────────
// Only pure / near-pure functions that do not depend on the DOM are exported.
export {
  generateId,
  createTransaction,
  deleteTransaction,
  groupByMonth,
  sortTransactions,
  computeMonthlyTotal,
  computeAnnualTotal,
  computeCategoryTotals,
  validateForm,
  formatAmount,
  formatDate,
  formatMonthHeader,
  state,
};
