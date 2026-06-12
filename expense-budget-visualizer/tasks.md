# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a fully client-side single-page application using HTML, CSS, and Vanilla JavaScript (ES Modules). The app tracks personal expenses, groups them by month, displays a pie chart, and persists all data in `localStorage`. Implementation follows a module-per-concern pattern inside a single `app.js` file.

## Tasks

- [x] 1. Create project file structure and HTML scaffold
  - Create `index.html` with semantic structure: `<header>` for Annual_Summary, `<main>` containing Input_Form, Sort_Control, Transaction_List, and chart section
  - Add `<link>` to `css/styles.css` and `<script>` tags for Chart.js CDN (with `onerror` handler) and `js/app.js` as `type="module"`
  - Create empty `css/styles.css` and `js/app.js` files to satisfy the one-file-per-directory constraint
  - Include all required DOM elements: `#input-form`, `#transaction-list`, `#annual-summary`, `#pie-chart`, `#theme-toggle`, `#sort-control`, and all placeholder/error elements
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. Implement State, Storage Module, and Theme Module
  - [x] 2.1 Implement global state object and Storage module functions in `app.js`
    - Define `state = { transactions: [], theme: "light", sortDirection: "none" }` with constants for storage keys
    - Implement `loadFromStorage()`: reads `localStorage["expense_tracker_transactions"]`, parses JSON, validates array, discards malformed records, falls back to `[]`
    - Implement `saveToStorage()`: wraps `localStorage.setItem()` in try/catch; shows user-visible error banner on quota exceeded, leaves in-memory state unchanged
    - Implement `loadTheme()` / `saveTheme(theme)` for `localStorage["expense_tracker_theme"]`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.2 Write property test for serialization round-trip (Property 1)
    - **Property 1: Serialization Round-Trip**
    - Generates arbitrary `Transaction[]`, asserts `JSON.parse(JSON.stringify(arr))` deeply equals `arr`
    - **Validates: Requirements 2.1, 2.2, 2.4**

  - [x] 2.3 Implement Theme module functions
    - Implement `applyTheme(theme)`: adds/removes `"dark"` class on `<body>`
    - Implement `initTheme()`: calls `loadTheme()`, falls back to `"light"`, calls `applyTheme()`
    - Implement `toggleTheme()`: flips current theme, saves via `saveTheme()`, calls `applyTheme()`
    - Wire `#theme-toggle` click event to `toggleTheme()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Implement Validation and Form Module
  - [x] 3.1 Implement `validateForm()` and Form module functions in `app.js`
    - Implement `validateForm({ name, date, amount, category, customCategory })`: returns `{ valid, errors: Map<fieldId, string> }` covering all five validation rules (name non-empty, date not future, amount in [0.01, 9999999.99], category required, customCategory required when category is "Other")
    - Implement `getFormValues()`: reads all visible form fields and returns the values object
    - Implement `showFieldError(fieldId, message)` and `clearFieldErrors()` using `<span class="field-error">` elements
    - Implement `resetForm()`: clears all fields, hides Custom_Category input
    - Wire category `<select>` change event to show/hide Custom_Category field when value is "Other"
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 3.2 Write property test for invalid input rejection (Property 2)
    - **Property 2: Invalid Form Input is Rejected With a Per-Field Error**
    - Generates form values with at least one invalid field; asserts `validateForm().valid === false` and error map contains an entry for each invalid field
    - **Validates: Requirements 1.3, 1.4**

- [x] 4. Implement Transaction Module and Compute Module
  - [x] 4.1 Implement Transaction module functions in `app.js`
    - Implement `generateId()`: uses `crypto.randomUUID()` with manual UUID v4 fallback
    - Implement `createTransaction(values)`: builds a Transaction object with a generated `id`, ISO date string, numeric amount, and a monotonically incrementing `insertionIndex`; pushes to `state.transactions`; calls `saveToStorage()`
    - Implement `deleteTransaction(id)`: filters `state.transactions`, calls `saveToStorage()`
    - Wire form submit event: call `getFormValues()` → `validateForm()` → if valid, `createTransaction()` → `resetForm()` → `renderAll()`; if invalid, display per-field errors
    - Wire delete button clicks via event delegation on `#transaction-list`: show confirmation prompt, then call `deleteTransaction()` → `renderAll()`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.1, 2.3, 3.3_

  - [x] 4.2 Write property test for delete removes exactly one record (Property 9)
    - **Property 9: Delete Removes Exactly One Record**
    - Generates a transaction collection with a known ID; asserts collection length decreases by one and no element with that ID remains
    - **Validates: Requirements 2.3, 3.3**

  - [x] 4.3 Write property test for add increases collection size by one (Property 10)
    - **Property 10: Adding a Valid Transaction Grows the Collection by One**
    - Generates arbitrary valid form values; asserts collection grows by exactly one and the new element is retrievable by its ID with matching fields
    - **Validates: Requirements 1.5, 2.1**

  - [x] 4.4 Implement Compute module functions in `app.js`
    - Implement `groupByMonth(transactions)`: returns `Map<"YYYY-MM", Transaction[]>` sorted descending by key
    - Implement `sortTransactions(txList, direction)`: sorts by amount (asc/desc) with `insertionIndex` tie-breaking; returns insertion order when direction is `"none"`
    - Implement `computeMonthlyTotal(txList)`: returns sum of amounts in the group
    - Implement `computeAnnualTotal(transactions)`: filters to current calendar year, sums amounts
    - Implement `computeCategoryTotals(transactions)`: builds `Map<label, number>`, using `customCategory` label when category is "Other"; removes zero-value entries
    - _Requirements: 3.1, 4.1, 4.2, 5.1, 6.1, 7.2, 7.3_

  - [x] 4.5 Write property test for month grouping order (Property 4)
    - **Property 4: Month Grouping is Ordered Most-Recent First**
    - Generates `Transaction[]` spanning ≥2 months; asserts keys of `groupByMonth()` are in strictly descending lexicographic order
    - **Validates: Requirements 3.1**

  - [x] 4.6 Write property test for annual total correctness (Property 5)
    - **Property 5: Annual Total Equals Sum of Current-Year Transactions Only**
    - Generates `Transaction[]` with varied years; asserts `computeAnnualTotal()` equals manual filter-and-sum of current-year transactions only
    - **Validates: Requirements 5.1**

  - [x] 4.7 Write property test for monthly total correctness (Property 6)
    - **Property 6: Monthly Total Equals Arithmetic Sum of the Group**
    - Generates `Transaction[]` all belonging to one month; asserts `computeMonthlyTotal()` equals `reduce` sum of all amounts
    - **Validates: Requirements 4.1**

  - [x] 4.8 Write property test for sort order invariant (Property 7)
    - **Property 7: Sort Order Invariant with Tie-Breaking**
    - Generates `Transaction[]` and direction `"asc"` or `"desc"`; asserts every adjacent pair satisfies the ordering invariant and equal-amount pairs appear in ascending `insertionIndex` order
    - **Validates: Requirements 7.2, 7.3**

  - [x] 4.9 Write property test for category totals (Property 8)
    - **Property 8: Category Totals are Positive and Exhaustive**
    - Generates non-empty `Transaction[]`; asserts every value in `computeCategoryTotals()` is > 0 and sum of all values equals sum of all transaction amounts
    - **Validates: Requirements 6.1**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Format Helpers and Rendering Module
  - [x] 6.1 Implement format helper functions in `app.js`
    - Implement `formatAmount(amount)`: returns `"$N.NN"` with thousands separators and exactly two decimal places
    - Implement `formatDate(isoDate)`: converts `"YYYY-MM-DD"` to `"D Mon YYYY"` (no leading zero on day, three-letter abbreviated month)
    - Implement `formatMonthHeader(key)`: converts `"YYYY-MM"` to full month name + year (e.g., `"June 2026"`)
    - _Requirements: 3.2, 4.3_

  - [x] 6.2 Write property test for display formatting invariants (Property 3)
    - **Property 3: Transaction Display Formatting**
    - Generates arbitrary valid `Transaction` objects; asserts `formatDate` output matches pattern `D Mon YYYY` and `formatAmount` matches `$N.NN` (dollar sign, optional thousands separators, exactly two decimal places)
    - **Validates: Requirements 3.2, 4.3**

  - [x] 6.3 Implement Transaction_List rendering functions in `app.js`
    - Implement `renderTransactionList(transactions, sortDirection)`: groups by month, iterates groups, calls `renderMonthGroup()`, shows `#empty-placeholder` when no transactions exist
    - Implement `renderMonthGroup(monthKey, txList, sortDirection)`: creates `.month-group` DOM element with header showing month name + Monthly_Total, renders sorted transaction rows with item name, formatted date, formatted amount, category, and delete button with accessible `aria-label`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.3_

  - [x] 6.4 Implement Annual_Summary and Sort_Control in `app.js`
    - Implement `updateAnnualSummary(transactions)`: updates `#annual-amount` with `formatAmount(computeAnnualTotal(transactions))` and `#current-year` with the current year
    - Implement `initSortControl()`: reads `sessionStorage["expense_tracker_sort"]`, sets `<select>` value, stores in `state.sortDirection`; wires change event to update `state.sortDirection`, save to `sessionStorage`, and call `renderAll()`
    - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4_

  - [x] 6.5 Implement `renderAll()` and `init()` boot function in `app.js`
    - Implement `renderAll()`: calls `renderTransactionList()`, `updateAnnualSummary()`, and `updateChart()` in sequence using current state
    - Implement `init()`: calls `loadFromStorage()`, `initTheme()`, `initSortControl()`, `initChart()`, `renderAll()`, and registers form submit / delete delegation event listeners
    - Register `init()` on `DOMContentLoaded`
    - _Requirements: 2.2, 3.1, 4.2, 5.2, 6.2_

- [x] 7. Implement Chart Module and CSS Theming
  - [x] 7.1 Implement Chart module functions in `app.js`
    - Implement `initChart()`: checks `typeof window.Chart === "undefined"` or `window.__chartFailed`; if unavailable, shows `#chart-error` and returns; otherwise creates Chart.js pie/doughnut instance on `#pie-chart` canvas with legend enabled and tooltip showing category name, formatted amount, and percentage
    - Implement `updateChart(categoryTotals)`: if `chartInstance` is null, return; if `categoryTotals` is empty, hide canvas and show `#chart-placeholder`; otherwise update `chartInstance.data` with labels, values, and distinct colors (up to 12 distinguishable colors), then call `chart.update()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.4_

  - [x] 7.2 Write all CSS in `css/styles.css`
    - Define CSS custom properties for dark and light themes (`body.dark` selector overrides)
    - Style all components: Input_Form with field layout and inline error spans, Transaction_List with scrollable container and month-group headers, Annual_Summary header visible at top, Sort_Control, Pie_Chart section, Theme_Toggle button
    - Implement `.hidden` utility class
    - Ensure layout renders without overlap or clipping at viewport widths ≥ 768px and Annual_Summary is visible without scrolling at ≥ 1024×768
    - _Requirements: 3.4, 5.3, 8.2, 9.3, 10.1_



## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- All code lives in exactly two files: `css/styles.css` and `js/app.js` (plus `index.html`)
- Property tests use [fast-check](https://github.com/dubzzz/fast-check); unit tests use [Vitest](https://vitest.dev/) — both compatible with ES Modules
- Each property test task references a specific property number from the design document's Correctness Properties section
- Sort direction is persisted in `sessionStorage` (not `localStorage`) to survive in-tab navigation but reset on new sessions
- The `insertionIndex` field on each Transaction ensures stable tie-breaking across all sort operations

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.3", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 4, "tasks": ["4.5", "4.6", "4.7", "4.8", "4.9"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3", "6.4"] },
    { "id": 7, "tasks": ["6.5"] },
    { "id": 8, "tasks": ["7.1", "7.2"] }
  ]
}
```
