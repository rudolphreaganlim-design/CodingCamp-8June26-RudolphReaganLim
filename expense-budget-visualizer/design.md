# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a fully client-side single-page application (SPA) built with HTML, CSS, and Vanilla JavaScript (ES Modules). It requires no backend server, no build toolchain, and no package manager — opening `index.html` in a browser is sufficient to run the app. All data lives in the browser's `localStorage`. A CDN-hosted charting library (Chart.js) renders the pie chart.

The design follows a **module-per-concern** pattern: one HTML file, one CSS file, and one JavaScript file (composed of ES Module functions). Global application state is held in a single in-memory object and kept in sync with `localStorage` on every mutation.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      index.html                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  <script src="https://cdn.jsdelivr.net/…chart.js">  │ │
│  │  <script type="module" src="js/app.js">             │ │
│  │  <link rel="stylesheet" href="css/styles.css">      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │  Input_Form  │  │ Annual_Summary │  │Theme_Toggle │  │
│  └──────┬───────┘  └───────┬────────┘  └──────┬──────┘  │
│         │                  │                   │         │
│  ┌──────▼──────────────────▼───────────────────▼──────┐  │
│  │                    app.js (State)                   │  │
│  │   { transactions[], theme, sortDirection }          │  │
│  └──────┬──────────────┬──────────────┬───────────────┘  │
│         │              │              │                   │
│  ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────────────┐  │
│  │Transaction_ │ │ Pie_Chart  │ │   Sort_Control       │  │
│  │    List     │ │ (Chart.js) │ │                      │  │
│  └──────┬──────┘ └─────┬──────┘ └────────────────────┘  │
│         │              │                                  │
│  ┌──────▼──────────────▼──────────────────────────────┐  │
│  │               localStorage                          │  │
│  │  "expense_tracker_transactions"  (JSON array)       │  │
│  │  "expense_tracker_theme"         ("dark"|"light")   │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No framework**: Vanilla JS + DOM manipulation keeps the codebase minimal and avoids build complexity.
- **ES Modules**: Each concern is a named export inside `app.js`; the browser's native module system provides scoping without bundlers.
- **Single source of truth**: All UI rendering is driven from a central `state` object — no DOM is read back for data.
- **Chart.js via CDN**: Loaded as a global script before the ES Module. If the CDN fails the module detects `window.Chart === undefined` and shows a fallback.
- **Event delegation**: A single `click` listener on the Transaction_List container handles delete buttons rather than attaching per-row listeners.

---

## Components and Interfaces

### Input_Form

**Responsibility**: Collect and validate new transaction data; reset after successful submission.

**DOM structure**:
```
<form id="input-form">
  <input id="field-name"   type="text"   maxlength="100" />
  <input id="field-date"   type="date"   />
  <input id="field-amount" type="number" min="0.01" max="9999999.99" step="0.01" />
  <select id="field-category">…Food/Transport/Fun/Other…</select>
  <input id="field-custom" type="text" maxlength="50" class="hidden" />
  <button type="submit">Add Expense</button>
  <!-- Inline error spans per field -->
  <span class="field-error" data-for="name"></span>
  …
</form>
```

**Public interface (JS functions)**:
```js
resetForm()          // clears all fields, hides Custom_Category field
showFieldError(fieldId, message)  // shows inline error for a field
clearFieldErrors()   // removes all inline errors
getFormValues()      // returns { name, date, amount, category, customCategory }
```

---

### Transaction_List

**Responsibility**: Render all stored transactions grouped by calendar month, sorted as requested, with delete controls and Monthly_Totals.

**DOM structure**:
```
<section id="transaction-list">
  <div class="month-group" data-month="2026-06">
    <h3>June 2026  <span class="monthly-total">$1,234.56</span></h3>
    <ul>
      <li data-id="uuid-1">
        <span class="tx-name">Coffee</span>
        <span class="tx-date">8 Jun 2026</span>
        <span class="tx-amount">$4.50</span>
        <span class="tx-category">Food</span>
        <button class="btn-delete" data-id="uuid-1">Delete</button>
      </li>
      …
    </ul>
  </div>
  …
  <p id="empty-placeholder" class="hidden">No expenses recorded yet.</p>
</section>
```

**Public interface**:
```js
renderTransactionList(transactions, sortDirection)
// Rebuilds the entire list DOM from the current state.
```

---

### Pie_Chart

**Responsibility**: Render a Chart.js doughnut/pie chart of spending by category; update on data changes; show fallback if Chart.js is unavailable.

**DOM structure**:
```
<section id="chart-section">
  <canvas id="pie-chart"></canvas>
  <p id="chart-placeholder" class="hidden">No spending data available.</p>
  <p id="chart-error"       class="hidden">Chart library failed to load.</p>
</section>
```

**Public interface**:
```js
initChart()                       // creates Chart.js instance; shows error if CDN failed
updateChart(categoryTotals)       // updates chart data and calls chart.update()
// categoryTotals: Map<string, number> — only categories with amount > 0
```

---

### Annual_Summary

**Responsibility**: Display the sum of all transactions in the current calendar year.

**DOM structure**:
```
<header id="annual-summary">
  <h2>Annual Total (<span id="current-year">2026</span>)</h2>
  <p id="annual-amount">$0.00</p>
</header>
```

**Public interface**:
```js
updateAnnualSummary(transactions)
// Filters transactions to current year, sums amounts, updates DOM.
```

---

### Theme_Toggle

**Responsibility**: Switch between dark and light CSS themes; persist preference.

**DOM structure**:
```
<button id="theme-toggle" aria-label="Toggle theme">🌙</button>
```

**Public interface**:
```js
applyTheme(theme)        // adds/removes class "dark" on <body>
initTheme()              // reads localStorage, falls back to "light"
toggleTheme()            // flips theme, saves to localStorage
```

---

### Sort_Control

**Responsibility**: Allow user to select ascending/descending sort by amount; default is insertion order.

**DOM structure**:
```
<div id="sort-control">
  <label>Sort by amount:</label>
  <select id="sort-select">
    <option value="none">Default</option>
    <option value="asc">Low → High</option>
    <option value="desc">High → Low</option>
  </select>
</div>
```

**Public interface**:
```js
getSortDirection()   // returns "none" | "asc" | "desc"
initSortControl()    // reads sessionStorage for persisted sort within tab
```

Sort direction is persisted in `sessionStorage` (not `localStorage`) so it survives in-tab navigation but resets on new sessions.

---

## Data Models

### Transaction Object

```js
/**
 * @typedef {Object} Transaction
 * @property {string}  id          - UUID v4 generated at creation time
 * @property {string}  name        - Item name (1–100 chars)
 * @property {string}  date        - ISO 8601 date string "YYYY-MM-DD"
 * @property {number}  amount      - Positive number, 0.01–9999999.99
 * @property {string}  category    - "Food" | "Transport" | "Fun" | "Other"
 * @property {string}  customCategory - User-defined label (used when category === "Other"); empty string otherwise
 * @property {number}  insertionIndex - Monotonically increasing integer assigned at creation for stable sort tie-breaking
 */
```

Example:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Coffee",
  "date": "2026-06-08",
  "amount": 4.50,
  "category": "Food",
  "customCategory": "",
  "insertionIndex": 42
}
```

### Storage Schema

```
localStorage["expense_tracker_transactions"] = JSON.stringify(Transaction[])
localStorage["expense_tracker_theme"]        = "dark" | "light"
sessionStorage["expense_tracker_sort"]       = "none" | "asc" | "desc"
```

**Constraints enforced at deserialization**:
- If the value is absent or not a valid JSON array, initialize to `[]`.
- If any individual transaction record is missing required fields, discard that record and log a console warning.

---

## Module Structure

```
index.html
css/
  styles.css           ← all styles, CSS custom properties for theming
js/
  app.js               ← single ES Module containing all application logic
```

### `app.js` Internal Organization

```
app.js
├── // ── State ──────────────────────────────────────────
│   let state = { transactions: [], theme: "light", sortDirection: "none" }
│
├── // ── Storage Module ──────────────────────────────────
│   loadFromStorage()
│   saveToStorage()
│   saveTheme(theme)
│   loadTheme()
│
├── // ── Validation Module ───────────────────────────────
│   validateForm(values)   → { valid: boolean, errors: Map<fieldId, string> }
│
├── // ── Transaction Module ──────────────────────────────
│   createTransaction(values)   → Transaction
│   deleteTransaction(id)
│   generateId()                → string (UUID or crypto.randomUUID())
│
├── // ── Compute Module ──────────────────────────────────
│   groupByMonth(transactions)  → Map<"YYYY-MM", Transaction[]>
│   sortTransactions(txList, direction) → Transaction[]
│   computeMonthlyTotal(txList) → number
│   computeAnnualTotal(transactions) → number
│   computeCategoryTotals(transactions) → Map<category, number>
│
├── // ── Rendering Module ────────────────────────────────
│   renderAll()
│   renderTransactionList(transactions, sortDirection)
│   renderMonthGroup(monthKey, txList, sortDirection)
│   updateAnnualSummary(transactions)
│   updateChart(categoryTotals)
│
├── // ── Chart Module ─────────────────────────────────────
│   initChart()
│   chartInstance = null
│
├── // ── Theme Module ─────────────────────────────────────
│   initTheme()
│   applyTheme(theme)
│   toggleTheme()
│
├── // ── Form Module ──────────────────────────────────────
│   resetForm()
│   showFieldError(fieldId, message)
│   clearFieldErrors()
│   getFormValues()
│
├── // ── Sort Module ──────────────────────────────────────
│   initSortControl()
│
└── // ── Boot ─────────────────────────────────────────────
    init()   ← called on DOMContentLoaded
```

---

## Key Algorithms

### 1. Group Transactions by Month

```js
function groupByMonth(transactions) {
  // Returns a Map<"YYYY-MM", Transaction[]> sorted by key descending
  // (most recent month first).
  const map = new Map();
  for (const tx of transactions) {
    const key = tx.date.slice(0, 7);  // "YYYY-MM"
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(tx);
  }
  // Sort keys descending (newest month first)
  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}
```

### 2. Sort Transactions within a Group

```js
function sortTransactions(txList, direction) {
  if (direction === "none") return [...txList];  // preserve insertion order
  return [...txList].sort((a, b) => {
    const diff = a.amount - b.amount;
    if (diff !== 0) return direction === "asc" ? diff : -diff;
    // Tie-break by insertionIndex (stable, ascending)
    return a.insertionIndex - b.insertionIndex;
  });
}
```

### 3. Compute Category Totals for Pie Chart

```js
function computeCategoryTotals(transactions) {
  const totals = new Map();
  for (const tx of transactions) {
    const label = tx.category === "Other" ? (tx.customCategory || "Other") : tx.category;
    totals.set(label, (totals.get(label) ?? 0) + tx.amount);
  }
  // Remove any categories with total === 0 (shouldn't occur but defensive)
  for (const [k, v] of totals) { if (v === 0) totals.delete(k); }
  return totals;
}
```

### 4. Compute Annual Total

```js
function computeAnnualTotal(transactions) {
  const currentYear = new Date().getFullYear();
  return transactions
    .filter(tx => new Date(tx.date + "T00:00:00").getFullYear() === currentYear)
    .reduce((sum, tx) => sum + tx.amount, 0);
}
```

### 5. Input Validation

```js
function validateForm({ name, date, amount, category, customCategory }) {
  const errors = new Map();
  const today = new Date().toISOString().slice(0, 10);

  if (!name || name.trim().length === 0)
    errors.set("name", "Item name is required.");
  if (!date)
    errors.set("date", "Date is required.");
  else if (date > today)
    errors.set("date", "Date cannot be in the future.");
  if (!amount || isNaN(amount) || amount < 0.01 || amount > 9999999.99)
    errors.set("amount", "Amount must be between 0.01 and 9,999,999.99.");
  if (!category)
    errors.set("category", "Category is required.");
  if (category === "Other" && (!customCategory || customCategory.trim().length === 0))
    errors.set("custom", "Custom category label is required.");

  return { valid: errors.size === 0, errors };
}
```

### 6. UUID Generation

```js
function generateId() {
  // Use native crypto.randomUUID() if available (all modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: manual UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
```

### 7. Format Helpers

```js
function formatAmount(amount) {
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(isoDate) {
  // "2026-06-08" → "8 Jun 2026"
  const [year, month, day] = isoDate.split("-").map(Number);
  const monthName = ["Jan","Feb","Mar","Apr","May","Jun",
                     "Jul","Aug","Sep","Oct","Nov","Dec"][month - 1];
  return `${day} ${monthName} ${year}`;
}

function formatMonthHeader(key) {
  // "2026-06" → "June 2026"
  const [year, month] = key.split("-").map(Number);
  const fullMonth = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"][month - 1];
  return `${fullMonth} ${year}`;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Prework reflection notes:**
- Criteria 1.3 and 1.4 both concern validation rejection; combined into Property 2 (any invalid field → rejected + error present).
- Criteria 2.1, 2.2, and 2.4 all describe JSON serialization and loading; combined into Property 1.
- Criteria 4.3 (formatAmount pattern) is subsumed by Property 3 (display formatting) which covers both date and amount format invariants.
- Criteria 7.2 and 7.3 (sort with tie-breaking) are a single sort invariant; combined into Property 7.
- Criteria classified as EXAMPLE, EDGE_CASE, SMOKE, or INTEGRATION are covered in the Testing Strategy rather than as correctness properties.

---

### Property 1: Serialization Round-Trip

*For any* array of valid Transaction objects, serializing the array to a JSON string and then parsing that JSON string back should produce an array that is deeply equal to the original — every field of every transaction must be preserved without loss or mutation.

**Validates: Requirements 2.1, 2.2, 2.4**

---

### Property 2: Invalid Form Input is Rejected With a Per-Field Error

*For any* form submission that contains at least one violation — an amount outside [0.01, 9,999,999.99], a date that is in the future, a whitespace-only or empty item name, a missing category, or a missing custom category when category is "Other" — `validateForm()` SHALL return `valid: false` and the returned error map SHALL contain a non-empty error message keyed to every field that violated a rule.

**Validates: Requirements 1.3, 1.4**

---

### Property 3: Transaction Display Formatting

*For any* valid Transaction object, `formatDate(tx.date)` SHALL produce a string matching the pattern `D Mon YYYY` (day without leading zero, abbreviated three-letter month, full four-digit year), and `formatAmount(tx.amount)` SHALL produce a string matching the pattern `$N.NN` (dollar sign, optional thousands separators, exactly two decimal places).

**Validates: Requirements 3.2, 4.3**

---

### Property 4: Month Grouping is Ordered Most-Recent First

*For any* non-empty array of transactions spanning two or more distinct calendar months, the keys produced by `groupByMonth()` SHALL be in strictly descending lexicographic order (equivalent to descending chronological order for `YYYY-MM` keys), so the most recent month appears first.

**Validates: Requirements 3.1**

---

### Property 5: Annual Total Equals Sum of Current-Year Transactions Only

*For any* collection of transactions that includes records from multiple calendar years, `computeAnnualTotal()` SHALL return a value equal to the exact arithmetic sum of amounts whose `date` field falls within January 1 to December 31 of the current local calendar year; transactions from any other year SHALL contribute zero to the total. When no current-year transactions exist, the result SHALL be `0`.

**Validates: Requirements 5.1**

---

### Property 6: Monthly Total Equals Arithmetic Sum of the Group

*For any* array of transactions all belonging to the same calendar month, `computeMonthlyTotal()` SHALL return a value equal to the exact arithmetic sum of all their `amount` fields.

**Validates: Requirements 4.1**

---

### Property 7: Sort Order Invariant with Tie-Breaking

*For any* array of transactions and a sort direction of `"asc"` or `"desc"`, the result of `sortTransactions(txList, direction)` SHALL satisfy: for every adjacent pair of elements `(a, b)`, `a.amount <= b.amount` (ascending) or `a.amount >= b.amount` (descending). When two transactions have equal amounts, they SHALL appear in ascending `insertionIndex` order regardless of the chosen sort direction.

**Validates: Requirements 7.2, 7.3**

---

### Property 8: Category Totals are Positive and Exhaustive

*For any* non-empty collection of transactions, the map produced by `computeCategoryTotals()` SHALL satisfy two invariants simultaneously: (1) every entry in the map has a value strictly greater than zero (no zero-total categories are present), and (2) the arithmetic sum of all values in the map equals the arithmetic sum of all transaction amounts in the input collection.

**Validates: Requirements 6.1**

---

### Property 9: Delete Removes Exactly One Record

*For any* transaction collection containing at least one transaction with a specific `id`, after calling `deleteTransaction(id)` the resulting collection SHALL have exactly one fewer element than before, and no element with that `id` SHALL remain anywhere in the collection.

**Validates: Requirements 2.3, 3.3**

---

### Property 10: Adding a Valid Transaction Grows the Collection by One

*For any* valid set of form field values, after a successful call to `createTransaction()` the transaction collection SHALL contain exactly one more element than it did before the call, and that element SHALL be retrievable by its newly assigned `id` with all field values matching the submitted input.

**Validates: Requirements 1.5, 2.1**

---

## Error Handling

### Local Storage Quota Exceeded

- **Detection**: Wrap every `localStorage.setItem()` in a `try/catch`.
- **Behavior**: On catch, the in-memory `state.transactions` array is left unchanged (the failed write is discarded). A non-blocking toast/banner message is shown: *"Could not save data: storage quota exceeded."*
- **No data loss**: The user's current session data stays in memory; they can continue using the app but data won't persist.

```js
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  } catch (e) {
    showStorageError("Could not save data: " + (e.message || "storage error."));
  }
}
```

### CDN Failure Fallback

- **Detection**: The Chart.js `<script>` tag uses `onerror`. Additionally, `initChart()` checks `typeof window.Chart === "undefined"`.
- **Behavior**: If Chart.js is unavailable, `initChart()` hides the `<canvas>` and shows `#chart-error` with the message: *"Chart library failed to load. Please check your internet connection."*
- **No uncaught errors**: All charting calls are gated behind a `chartInstance !== null` guard.

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"
        onerror="window.__chartFailed=true"></script>
```

```js
function initChart() {
  if (typeof window.Chart === "undefined" || window.__chartFailed) {
    document.getElementById("chart-error").classList.remove("hidden");
    return;
  }
  // … create Chart.js instance
}
```

### Malformed Local Storage Data

- **Detection**: `JSON.parse()` in a `try/catch`; also validate that the result is an Array.
- **Behavior**: If absent, null, non-JSON, or not an Array → initialize to `[]`. A console warning is emitted (no user-visible error since data was already lost).

```js
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    state.transactions = Array.isArray(parsed) ? parsed : [];
  } catch {
    state.transactions = [];
    console.warn("expense-tracker: could not parse stored transactions, resetting.");
  }
}
```

### Validation Errors

- Each invalid field gets an inline `<span class="field-error">` message populated next to it.
- The form is not submitted; focus is moved to the first invalid field for accessibility.
- All error spans are cleared before re-validating on each submit attempt.

### Missing / Partial Transaction Records

- During deserialization, each object is checked for required fields (`id`, `name`, `date`, `amount`, `category`). Objects missing required fields are silently discarded (with a `console.warn`), preventing corrupted data from crashing the render.

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and pure-function correctness using a test runner such as [Vitest](https://vitest.dev/) (compatible with ES Modules, zero-config).

Key unit test targets:
- `validateForm()` — each validation rule with valid and boundary-invalid inputs
- `formatAmount()` / `formatDate()` / `formatMonthHeader()` — formatting with various inputs
- `groupByMonth()` — correct grouping and descending month ordering
- `computeAnnualTotal()` — cross-year filtering, empty collection, single transaction
- `computeMonthlyTotal()` — correct sum per group
- `computeCategoryTotals()` — custom categories under "Other", zero exclusion
- `loadFromStorage()` — null input, invalid JSON, valid array, partial records
- `sortTransactions()` — ascending, descending, ties broken by insertionIndex, "none" preserves order

### Property-Based Tests

Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) (works in browser and Node, CDN-available). Each test runs a **minimum of 100 iterations** with generated inputs.

| Property | Generator inputs | Assertion |
|----------|-----------------|-----------|
| **P1**: Serialization round-trip | Arbitrary `Transaction[]` | `JSON.parse(JSON.stringify(arr))` deep-equals `arr` |
| **P2**: Invalid input rejected with error | Form values with at least one invalid field (arbitrary combination) | `validateForm(…).valid === false` AND error map has entry for each invalid field |
| **P3**: Display formatting invariants | Arbitrary valid `Transaction` objects | `formatDate` matches `D Mon YYYY`; `formatAmount` matches `$N.NN` |
| **P4**: Month grouping most-recent first | Arbitrary `Transaction[]` spanning ≥2 months | Keys of `groupByMonth()` are in strictly descending order |
| **P5**: Annual total correctness | Arbitrary `Transaction[]` with varied years | `computeAnnualTotal(txs)` equals manual filter+sum of current-year only |
| **P6**: Monthly total correctness | Arbitrary `Transaction[]` for one month | `computeMonthlyTotal(txs)` equals `txs.reduce((s,t) => s+t.amount, 0)` |
| **P7**: Sort order invariant + tie-breaking | Arbitrary `Transaction[]`, direction `"asc"`/`"desc"` | Adjacent pairs satisfy ordering; equal-amount pairs ordered by `insertionIndex` asc |
| **P8**: Category totals positive and exhaustive | Arbitrary `Transaction[]` | Every value in `computeCategoryTotals()` > 0; sum of values equals sum of all amounts |
| **P9**: Delete removes exactly one | Arbitrary `Transaction[]` with known ID | `length - 1`; no element with that ID remains |
| **P10**: Add increases size by one | Arbitrary valid form values | `length + 1`; new element retrievable by ID with matching fields |

**Tag format** for each property test:
```js
// Feature: expense-budget-visualizer, Property 1: Serialization round-trip
```

### Integration / Smoke Tests

- Load `index.html` in a headless browser (Playwright) and verify:
  - No uncaught JS errors on load (Req 9.1)
  - Annual Summary is visible on ≥1024×768 viewport without scrolling (Req 5.3)
  - All features operable in Chrome, Firefox, Edge, Safari latest (Req 9.1)
  - CDN failure scenario: mock Chart.js to undefined → fallback message shown (Req 10.4)

### Accessibility

- All form inputs have associated `<label>` elements.
- Error messages are linked via `aria-describedby`.
- Theme toggle has a descriptive `aria-label`.
- Delete buttons include a visually-hidden transaction name for screen readers (e.g., `<button aria-label="Delete Coffee – $4.50">`).
