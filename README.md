# BasicFinanceTracker

A personal finance management application built with React Native that helps you track income, expenses, budget, and view financial reports.

## Features

### 🏦 Financial Dashboard

- Overview of current balance
- Monthly income and expense summaries
- Quick access to key financial metrics
- Recent transaction history

### 💰 Transaction Management

- Record income and expenses
- Categorize transactions
- Add descriptions and dates
- Edit or delete existing transactions

### 📊 Budget Planning

- Set budgets by category (daily, weekly, or monthly)
- Track spending against budgets
- Visual progress indicators
- Budget alerts for overspending

### 📈 Financial Reports

- Income and expense breakdown by category
- Visual representations with interactive charts
- Spending trends and patterns
- Savings rate calculations

### 🗂️ Category Management

- Pre-defined expense and income categories
- Customizable category colors
- Spending analysis by category

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [React Native development environment](https://reactnative.dev/docs/environment-setup)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/BasicFinanceTracker.git
   cd BasicFinanceTracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **For iOS (Mac only), install CocoaPods dependencies**
   ```bash
   npx pod-install
   ```

### Running the Application

1. **Start Metro bundler**

   ```bash
   npm start
   ```

2. **Run on Android**

   ```bash
   npm run android
   ```

3. **Run on iOS (Mac only)**
   ```bash
   npm run ios
   ```

## How to Use

### Adding a Transaction

1. Tap the **+** button on the Dashboard screen
2. Select transaction type (Income or Expense)
3. Enter the amount
4. Select a category
5. Add a description (optional)
6. Set the date
7. Tap **Save**

### Setting a Budget

1. Navigate to the **Budget** tab
2. Tap **+ Add Budget**
3. Select a category
4. Enter the budget amount
5. Choose a time period (daily, weekly, or monthly)
6. Tap **Save Budget**

### Viewing Reports

1. Navigate to the **Reports** tab
2. Select a time period (day, week, or month)
3. Switch between expense and income views
4. Analyze the pie chart and category breakdown

### Managing Transactions

1. Go to the Dashboard and tap **History**
2. Browse all transactions sorted by date
3. Filter by transaction type if needed
4. Tap on any transaction to edit or delete it

## Project Structure

```
BasicFinanceTracker/
├── android/                  # Android native code
├── ios/                      # iOS native code
├── src/
│   ├── components/           # React components
│   │   ├── common/           # Reusable UI components
│   │   ├── charts/           # Chart components
│   │   ├── navigation/       # Navigation components
│   │   └── screens/          # Screen components
│   ├── context/              # React Context for state management
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
└── App.tsx                   # Application entry point
```

## Upcoming Features

- 📱 Dark mode support
- 🔄 CSV export/import
- 🎯 Financial goals tracking
- 📅 Recurring transactions
- 📊 Advanced analytics
- 🔐 Secure data with biometric authentication
- ☁️ Cloud backup and sync

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native Team
- Claude
- Copilot
- StackOverflow
- Google

---

Made with ❤️ for better financial management
