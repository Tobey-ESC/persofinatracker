# FinanceOS 📈

**FinanceOS** is a robust, cross-platform personal finance operating system designed to track net worth, manage debts, and analyze spending habits in real-time.

Built with a "Desktop-First, Mobile-Companion" philosophy, it offers a powerful keyboard-driven experience on Windows and a responsive, touch-friendly interface on mobile devices.

![FinanceOS Dashboard](https://via.placeholder.com/1200x600?text=Dashboard+Screenshot+Here)
## 🚀 Features

### 📊 Comprehensive Dashboard
* **Net Worth Tracker:** Real-time calculation of total assets vs. liabilities.
* **Financial Runway:** Calculates how long you can survive on current savings based on monthly burn rate.
* **Savings Rate:** Visualizes the percentage of income saved vs. spent.
* **Income Stability Score:** Analyzes income consistency to generate a stability rating (0-100).

### 💸 Transaction Management
* **Unified Feed:** Track Income and Expenses with categorization.
* **Multi-User Support:** Tag transactions by owner (e.g., John, Hannah, or Both).
* **Smart Filtering:** Filter view by person or search by keyword/category.

### 🏦 Loan & Debt Tracker
* **Payoff Progress:** Visual progress bars for every active loan.
* **Smart Dates:** Tracks both *Next Payment Date* (operational) and *Target Payoff Date* (strategic).
* **Total Debt Overview:** Aggregated view of all outstanding liabilities.

### 🔐 Security & Privacy
* **PIN Protection:** System locks automatically after 5 minutes of inactivity.
* **Intruder Lockout:** Locks the system for 5 minutes after 3 incorrect PIN attempts.
* **Default PIN:** `1022` (Changeable in code).

### 📱 Cross-Platform
* **Windows (.exe):** Full desktop application with hotkeys.
* **Mobile (Web):** Responsive web build with Floating Action Buttons (FAB) for quick entry on the go.

---

## 🛠 Tech Stack

* **Core:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
* **Desktop Engine:** [Electron](https://www.electronjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Realtime:** [Supabase](https://supabase.com/)
* **Charts:** [Recharts](https://recharts.org/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## ⚡ Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Supabase account

### 1. Clone & Install
```bash
git clone [https://github.com/Tobey-ESC/persofinatracker.git](https://github.com/Tobey-ESC/persofinatracker.git)
cd finance-tracker
npm install
