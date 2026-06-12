# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that enables users to track personal expenses, organize them by category and month, and visualize spending patterns through charts. The app runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with all data persisted in the browser's Local Storage. No backend server is required. The app supports both standalone use and as a browser extension, and includes dark/light mode theming.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry consisting of an item name, date, amount, and category
- **Category**: A classification label for a transaction; one of: Food, Transport, Fun, or Other
- **Custom_Category**: A user-defined text label used when the category is set to "Other"
- **Transaction_List**: The scrollable UI component displaying all stored transactions grouped by month
- **Input_Form**: The UI form component used to enter new transaction data
- **Validator**: The input validation logic that checks form fields before submission
- **Storage**: The browser's Local Storage API used to persist all transaction data
- **Pie_Chart**: The visual chart component that displays spending distribution by category
- **Annual_Summary**: The top-level display showing the total spending across all months in the current year
- **Monthly_Total**: The computed total spending for a given calendar month displayed within the Transaction_List
- **Theme_Toggle**: The UI control that switches the App between dark and light visual modes
- **Sort_Control**: The UI control that sorts transactions by amount within a category grouping

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to enter expense details through a form, so that I can record new transactions quickly.

#### Acceptance Criteria

1. THE Input_Form SHALL display the following fields: Item Name (text, max 100 characters), Date (date input, must not be a future date), Amount (numeric, between 0.01 and 9,999,999.99), and Category (select: Food, Transport, Fun, Other).
2. WHERE the Category field is set to "Other", THE Input_Form SHALL display an additional text input field for a Custom_Category label (max 50 characters).
3. WHEN the user submits the Input_Form, THE Validator SHALL verify that all visible fields contain non-empty values and that Amount is within the range 0.01–9,999,999.99 and that Date is not a future date before accepting the submission.
4. IF any visible field is empty, the Amount is out of range, or the Date is in the future at submission time, THEN THE Validator SHALL prevent the Transaction from being saved and SHALL display an inline error message adjacent to each invalid field identifying the specific validation failure.
5. WHEN the Input_Form passes validation, THE App SHALL create a new Transaction and add it to Storage.
6. WHEN a Transaction is successfully added, THE Input_Form SHALL reset all fields to a blank/unselected default state (all text fields empty, date field cleared, category select unselected, Custom_Category field hidden).

---

### Requirement 2: Local Storage Persistence

**User Story:** As a user, I want my expense data to persist across browser sessions, so that I do not lose my records when I close the tab.

#### Acceptance Criteria

1. WHEN a Transaction is created, THE Storage SHALL serialize all transaction records to a JSON string and save the result to the browser's Local Storage under the fixed key `"expense_tracker_transactions"`.
2. WHEN the App is loaded, THE Storage SHALL read the value stored under the key `"expense_tracker_transactions"` from the browser's Local Storage, deserialize it from JSON, and restore the full collection of transactions into the application state.
3. WHEN a Transaction is deleted, THE Storage SHALL remove that transaction from the in-memory collection, serialize the remaining transactions to a JSON string, and overwrite the value stored under `"expense_tracker_transactions"` in the browser's Local Storage.
4. THE Storage SHALL store transaction data as a JSON-serialized string in order to satisfy the browser's Local Storage string value constraint.
5. IF the value read from the browser's Local Storage during App load is absent, malformed, or cannot be deserialized as a valid array, THEN THE Storage SHALL initialize the transaction collection to an empty array and discard the unreadable stored value.
6. IF a write operation to the browser's Local Storage fails due to storage quota being exceeded or any other browser storage error, THEN THE Storage SHALL retain the current in-memory transaction collection unchanged and display an error message indicating that the data could not be saved.

---

### Requirement 3: Transaction List Display

**User Story:** As a user, I want to see all my recorded expenses in a scrollable list organized by month, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored Transactions grouped by calendar month, with each group header showing the full month name and year (e.g., "June 2026"), and with the most recent month shown first.
2. WHEN a Transaction is displayed, THE Transaction_List SHALL show the item name, date formatted as day + abbreviated month name + full year (e.g., "8 Jun 2026"), amount formatted to two decimal places with a currency symbol, and category for that Transaction.
3. WHEN the user clicks the dedicated delete button on a Transaction, THE App SHALL display a confirmation prompt; IF the user confirms, THEN THE App SHALL remove that Transaction from Storage and update the Transaction_List accordingly.
4. THE Transaction_List SHALL be vertically scrollable when the number of Transactions exceeds the visible viewport height of the list container.
5. WHEN the Transaction_List contains no Transactions, THE Transaction_List SHALL display a placeholder message indicating no expenses have been recorded.

---

### Requirement 4: Monthly Total Balance

**User Story:** As a user, I want to see the total spending for each month within the list, so that I can understand my monthly budget at a glance.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a Monthly_Total for each calendar month grouping, showing the sum of all Transaction amounts within that month, expressed as a positive total of expenses.
2. WHEN a Transaction is added, edited, or deleted, THE App SHALL recalculate and update the affected Monthly_Total without requiring a page reload.
3. THE Monthly_Total SHALL be displayed with a currency symbol and two decimal places (e.g., "$1,234.56").
4. WHEN a calendar month grouping contains no Transactions, THE Transaction_List SHALL not display a Monthly_Total row for that month.

---

### Requirement 5: Annual Summary

**User Story:** As a user, I want to see my total spending for the current year at the top of the page, so that I have an immediate overview of my annual budget status.

#### Acceptance Criteria

1. THE Annual_Summary SHALL be displayed at the top of the main page, showing the sum of all Transaction amounts whose date falls within January 1 to December 31 of the user's current local calendar year; if no such Transactions exist, the displayed value SHALL be 0.00.
2. WHEN a Transaction is added, edited, or deleted, THE App SHALL recalculate and update the Annual_Summary within 1 second without requiring a page reload.
3. WHEN the App is first loaded on a viewport of at least 1024px width and 768px height, THE Annual_Summary SHALL be visible without scrolling.

---

### Requirement 6: Category Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can visually understand where my money is going.

#### Acceptance Criteria

1. THE Pie_Chart SHALL display a slice for each distinct category that has a total Transaction amount greater than zero; categories with a total of zero or no transactions SHALL NOT appear as slices.
2. WHEN a Transaction is added or deleted, THE App SHALL update the Pie_Chart to reflect the current category totals without requiring a page reload.
3. THE Pie_Chart SHALL assign a distinct color to each category slice; when the number of categories does not exceed 12, each slice SHALL have a visually distinguishable color from all other slices.
4. THE Pie_Chart SHALL display both a legend and a tooltip per slice; the legend SHALL identify each category by name; the tooltip SHALL show the category name, total amount formatted to two decimal places with currency symbol, and the percentage of total spending that category represents.
5. WHEN no Transactions are stored, THE Pie_Chart SHALL display a visible placeholder message in place of the chart indicating that no spending data is available.

---

### Requirement 7: Sort Transactions by Amount

**User Story:** As a user, I want to sort transactions by amount within each category grouping, so that I can quickly identify my largest expenses.

#### Acceptance Criteria

1. THE Sort_Control SHALL allow the user to select a sort direction (ascending or descending by amount) for Transactions within each category grouping; the default state SHALL be no active sort (original insertion order).
2. WHEN the user selects a sort direction via the Sort_Control, THE Transaction_List SHALL display the Transactions within each category grouping ordered by amount in the selected direction.
3. WHEN a new Transaction is added while a sort direction is active, THE Transaction_List SHALL display the new Transaction in the position dictated by the active sort order within its category grouping; ties in amount SHALL be broken by insertion order (most recently added last).
4. THE Sort_Control's selected sort direction SHALL persist for the duration of the browser session; navigating away and returning within the same tab SHALL retain the last selected sort direction.

---

### Requirement 8: Dark/Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL allow the user to switch between a dark theme and a light theme at any time during an active session.
2. WHEN the user activates the Theme_Toggle, THE App SHALL apply the selected theme to all visible UI components immediately without a page reload.
3. THE App SHALL persist the user's last selected theme preference in Local Storage under a fixed key and apply it automatically when the App is loaded.
4. THE App SHALL default to the light theme when no previously saved theme preference is found in Local Storage.

---

### Requirement 9: Browser Compatibility

**User Story:** As a user, I want the app to work reliably in any modern browser, so that I am not restricted to a specific browser or device.

#### Acceptance Criteria

1. THE App SHALL produce no uncaught JavaScript errors and all features SHALL be accessible and operable in the latest stable releases of Chrome, Firefox, Edge, and Safari.
2. THE App SHALL use only the DOM API, Local Storage API, and ES Modules — all of which are available natively in the four target browsers — without requiring any polyfills.
3. WHEN the App is loaded on a viewport width of 768px or greater, THE App SHALL render all content without overlapping or clipped elements and all text SHALL remain readable.

---

### Requirement 10: File and Code Structure

**User Story:** As a developer, I want the codebase to follow a clean, minimal file structure, so that the project is easy to understand and maintain.

#### Acceptance Criteria

1. THE App SHALL contain exactly one CSS file located in a directory named `css/`.
2. THE App SHALL contain exactly one JavaScript file located in a directory named `js/`.
3. WHEN `index.html` is opened directly in a browser without a local server, THE App SHALL render all UI elements and charts without errors.
4. THE App SHALL load a charting library capable of rendering pie charts via a CDN `<script>` tag in `index.html`; IF the CDN request fails to load, THE App SHALL display a fallback message in place of the chart rather than an uncaught error.
