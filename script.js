// Personal Finance Tracker - JavaScript Implementation
class FinanceTracker {
    constructor() {
        this.data = {
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            accounts: JSON.parse(localStorage.getItem('accounts')) || [],
            reminders: JSON.parse(localStorage.getItem('reminders')) || [],
            plannedExpenses: JSON.parse(localStorage.getItem('plannedExpenses')) || [],
            incomeIdeas: JSON.parse(localStorage.getItem('incomeIdeas')) || [],
            transfers: JSON.parse(localStorage.getItem('transfers')) || [],
            budgetCategories: JSON.parse(localStorage.getItem('budgetCategories')) || [],
            frequentItems: JSON.parse(localStorage.getItem('frequentItems')) || {},
            settings: JSON.parse(localStorage.getItem('settings')) || {
                defaultCurrency: 'USD',
                currencyPreferences: {}
            }
        };
        
        // Available currencies with their symbols and locales
        this.currencies = {
            'USD': { symbol: '$', locale: 'en-US', name: 'US Dollar' },
            'EUR': { symbol: '€', locale: 'de-DE', name: 'Euro' },
            'GBP': { symbol: '£', locale: 'en-GB', name: 'British Pound' },
            'JPY': { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
            'CAD': { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
            'AUD': { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
            'CHF': { symbol: 'Fr', locale: 'de-CH', name: 'Swiss Franc' },
            'CNY': { symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
            'INR': { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
            'KRW': { symbol: '₩', locale: 'ko-KR', name: 'Korean Won' },
            'SGD': { symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
            'HKD': { symbol: 'HK$', locale: 'en-HK', name: 'Hong Kong Dollar' },
            'SEK': { symbol: 'kr', locale: 'sv-SE', name: 'Swedish Krona' },
            'NOK': { symbol: 'kr', locale: 'nb-NO', name: 'Norwegian Krone' },
            'MXN': { symbol: '$', locale: 'es-MX', name: 'Mexican Peso' },
            'BRL': { symbol: 'R$', locale: 'pt-BR', name: 'Brazilian Real' },
            'ZAR': { symbol: 'R', locale: 'en-ZA', name: 'South African Rand' }
        };
        
        this.currentFilter = 'all';
        this.selectedBankAccountId = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        
        // Ensure all accounts have proper currency data before rendering
        this.ensureAccountCurrencies();
        
        this.updateDashboard();
        this.renderTransactions();
        this.renderAccounts();
        this.renderReminders();
        this.renderPlannedExpenses();
        this.renderIncomeIdeas();
        this.renderTransferHistoryList();
        this.setDefaultDates();
        this.loadDemoData();
        this.checkReminders();
        this.renderBudgetCategories();
        this.renderInsights();
        this.populateInsightsMonthFilter();
        this.populateIncomeAccountDropdown();
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute('data-tab');
                this.switchTab(targetTab);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    switchTab(tabName) {
        const modules = document.querySelectorAll('.module');
        modules.forEach(module => {
            module.classList.remove('active');
        });
        
        const targetModule = document.getElementById(tabName);
        if (targetModule) {
            targetModule.classList.add('active');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Income form
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        // Expense form
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Account form
        document.getElementById('account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAccount();
        });

        // Reminder form
        document.getElementById('reminder-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReminder();
        });

        // Planned expense form
        document.getElementById('planned-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPlannedExpense();
        });

        // Income idea form
        document.getElementById('income-idea-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncomeIdea();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });

        // Modal triggers
        document.getElementById('add-account').addEventListener('click', () => {
            this.openModal('account-modal');
        });

        document.getElementById('add-reminder').addEventListener('click', () => {
            this.openModal('reminder-modal');
        });

        // CSV import
        document.getElementById('csv-import').addEventListener('change', (e) => {
            this.handleCSVImport(e);
        });

        // Modal overlay click to close
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.closeModal();
            }
        });

        // Edit transaction form
        document.getElementById('edit-transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTransaction();
        });

        // Edit account form
        document.getElementById('edit-account-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAccount();
        });

        // Delete buttons
        document.getElementById('delete-transaction').addEventListener('click', () => {
            this.deleteTransaction();
        });

        document.getElementById('delete-account').addEventListener('click', () => {
            this.deleteAccount();
        });

        // Data management buttons
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.confirmClearAllData();
        });

        // Confirm action button
        document.getElementById('confirm-action').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.closeModal();
                this.confirmCallback = null;
            }
        });

        // Transfer money functionality
        document.getElementById('transfer-money').addEventListener('click', () => {
            this.openTransferModal();
        });

        document.getElementById('transfer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.transferMoney();
        });

        // Update transfer info when accounts change
        document.getElementById('transfer-from').addEventListener('change', () => {
            this.updateTransferInfo();
        });

        document.getElementById('transfer-to').addEventListener('change', () => {
            this.updateTransferInfo();
        });

        document.getElementById('transfer-amount').addEventListener('input', () => {
            this.updateTransferInfo();
        });

        // Payment method change listener for bank account selection
        document.getElementById('bank-accounts-list').addEventListener('click', (e) => {
            const bankOption = e.target.closest('.bank-account-option');
            if (bankOption && !bankOption.classList.contains('insufficient-funds')) {
                const accountId = parseInt(bankOption.dataset.accountId);
                if (accountId) {
                    console.log('Bank account clicked via delegation:', accountId);
                    this.selectBankAccount(accountId);
                }
            }
        });

        // Budget management
        document.getElementById('add-budget-category').addEventListener('click', () => {
            this.openModal('budget-category-modal');
        });

        document.getElementById('budget-category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBudgetCategory();
        });

        // Insights month filter
        document.getElementById('insights-month').addEventListener('change', (e) => {
            this.updateInsights(e.target.value);
        });

        // Expense amount change listener to update bank account availability
        document.getElementById('expense-amount').addEventListener('input', () => {
            const paymentMethod = document.getElementById('payment-method').value;
            if (paymentMethod === 'online') {
                this.renderBankAccountSelection();
            }
        });

        // Payment method change listener for bank account selection
        document.getElementById('payment-method').addEventListener('change', (e) => {
            this.handlePaymentMethodChange(e.target.value);
        });

        // Recurring reminder checkbox
        document.getElementById('reminder-recurring').addEventListener('change', (e) => {
            const recurringOptions = document.getElementById('recurring-options');
            if (e.target.checked) {
                recurringOptions.style.display = 'block';
            } else {
                recurringOptions.style.display = 'none';
            }
        });

        // Recurring income checkbox
        document.getElementById('income-recurring').addEventListener('change', (e) => {
            const recurringOptions = document.getElementById('income-recurring-options');
            if (e.target.checked) {
                recurringOptions.style.display = 'block';
            } else {
                recurringOptions.style.display = 'none';
            }
        });
    }

    // Set default dates to today
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('income-date').value = today;
        document.getElementById('expense-date').value = today;
    }

    // Income Management
    addIncome() {
        const source = document.getElementById('income-source').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const date = document.getElementById('income-date').value;
        const accountId = parseInt(document.getElementById('income-account').value);

        if (!source || !amount || !date || !accountId) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Find the selected account
        const selectedAccount = this.data.accounts.find(acc => acc.id === accountId);
        if (!selectedAccount) {
            this.showMessage('Selected account not found', 'error');
            return;
        }

        // Add amount to the selected account
        selectedAccount.balance += amount;
        selectedAccount.lastModified = new Date().toISOString();

        const income = {
            id: Date.now(),
            type: 'income',
            source,
            amount,
            date,
            accountId: accountId,
            accountName: selectedAccount.name,
            currency: selectedAccount.currency,
            timestamp: new Date().toISOString()
        };

        this.data.transactions.push(income);
        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.renderAccounts(); // Update accounts display to show new balances
        this.populateIncomeAccountDropdown(); // Refresh dropdown with updated balances
        this.clearForm('income-form');
        this.showMessage('Income added successfully!', 'success');
    }

    // Expense Management
    addExpense() {
        const category = document.getElementById('expense-category').value;
        const item = document.getElementById('expense-item').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const date = document.getElementById('expense-date').value;
        const paymentMethod = document.getElementById('payment-method').value;

        if (!category || !item || !amount || !date || !paymentMethod) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Check if online payment and bank account is selected
        if (paymentMethod === 'online') {
            if (!this.selectedBankAccountId) {
                this.showMessage('Please select a bank account for online payment', 'error');
                return;
            }

            const selectedAccount = this.data.accounts.find(acc => acc.id === this.selectedBankAccountId);
            if (!selectedAccount) {
                this.showMessage('Selected bank account not found', 'error');
                return;
            }

            if (amount > selectedAccount.balance) {
                this.showMessage('Insufficient funds in selected bank account', 'error');
                return;
            }

            // Deduct amount from bank account
            selectedAccount.balance -= amount;
            selectedAccount.lastModified = new Date().toISOString();
        }

        const expense = {
            id: Date.now(),
            type: 'expense',
            category,
            item,
            amount,
            date,
            paymentMethod,
            bankAccountId: paymentMethod === 'online' ? this.selectedBankAccountId : null,
            bankAccountName: paymentMethod === 'online' ? this.data.accounts.find(acc => acc.id === this.selectedBankAccountId).name : null,
            timestamp: new Date().toISOString()
        };

        this.data.transactions.push(expense);
        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.renderAccounts(); // Update accounts display to show new balances
        this.clearForm('expense-form');
        
        // Reset bank selection
        this.selectedBankAccountId = null;
        document.getElementById('bank-selection-row').style.display = 'none';
        
        this.showMessage('Expense added successfully!', 'success');
    }

    // Dashboard Updates
    updateDashboard() {
        const totalIncome = this.calculateTotalIncome();
        const totalExpenses = this.calculateTotalExpenses();
        
        // Current balance is now the sum of all account balances
        const currentBalance = this.calculateTotalAccountBalance();

        document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('total-spending').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('current-balance').textContent = this.formatCurrency(currentBalance);

        // Update progress bar (using account balance for budget calculation)
        const monthlyBudget = currentBalance > 0 ? currentBalance : 1000; // Use account balance or default
        const spentPercentage = Math.min((totalExpenses / monthlyBudget) * 100, 100);
        
        document.getElementById('progress-fill').style.width = `${spentPercentage}%`;
        document.getElementById('progress-text').textContent = `${spentPercentage.toFixed(1)}% of available funds used`;

        // Update net worth (same as current balance since accounts are the source of truth)
        document.getElementById('net-worth').textContent = this.formatCurrency(currentBalance);
    }

    calculateTotalIncome() {
        return this.data.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculateTotalExpenses() {
        return this.data.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    calculateTotalAccountBalance() {
        return this.data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    }

    // Transactions Rendering
    renderTransactions() {
        const container = document.getElementById('transactions-list');
        let transactions = [...this.data.transactions];

        // Apply filter
        if (this.currentFilter !== 'all') {
            transactions = transactions.filter(t => t.type === this.currentFilter);
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No transactions found. Add your first transaction above!</p>';
            return;
        }

        container.innerHTML = transactions.map(transaction => this.createTransactionHTML(transaction)).join('');
    }

    createTransactionHTML(transaction) {
        const isIncome = transaction.type === 'income';
        const icon = isIncome ? '💰' : this.getCategoryIcon(transaction.category);
        const amountClass = isIncome ? 'income' : 'expense';
        const amountPrefix = isIncome ? '+' : '-';

        // Build payment method display
        let paymentMethodDisplay = transaction.paymentMethod || 'N/A';
        if (transaction.paymentMethod === 'online' && transaction.bankAccountName) {
            paymentMethodDisplay = `Online Payment (${transaction.bankAccountName})`;
        } else if (isIncome && transaction.accountName) {
            paymentMethodDisplay = `Added to ${transaction.accountName}`;
        }

        // Use transaction currency if available, otherwise default
        const currency = transaction.currency || null;

        return `
            <div class="transaction-item ${transaction.type} slide-in">
                <div class="transaction-info">
                    <div class="transaction-title">
                        ${icon} ${isIncome ? transaction.source : transaction.item}
                    </div>
                    <div class="transaction-details">
                        ${isIncome ? 'Income' : transaction.category} • ${this.formatDate(transaction.date)} • ${paymentMethodDisplay}
                    </div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}${this.formatCurrency(transaction.amount, currency)}
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" onclick="financeTracker.editTransaction(${transaction.id})" title="Edit Transaction">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getCategoryIcon(category) {
        const icons = {
            rent: '🏠',
            groceries: '🛒',
            'dining-out': '🍕',
            transport: '🚗',
            utilities: '⚡',
            subscriptions: '📱',
            education: '📚',
            entertainment: '🎬',
            shopping: '🛍️',
            health: '🏥',
            fitness: '💪',
            insurance: '🛡️',
            // Legacy categories for backward compatibility
            food: '🍕',
            other: '💸'
        };
        return icons[category] || '💸';
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTransactions();
    }

    // Account Management
    addAccount() {
        const name = document.getElementById('account-name').value;
        const type = document.getElementById('account-type').value;
        const currency = document.getElementById('account-currency').value;
        const balance = parseFloat(document.getElementById('account-balance').value);

        if (!name || !type || !currency || isNaN(balance)) {
            this.showMessage('Please fill in all fields correctly', 'error');
            return;
        }

        const account = {
            id: Date.now(),
            name,
            type,
            currency,
            balance,
            createdAt: new Date().toISOString()
        };

        this.data.accounts.push(account);
        this.saveData();
        this.renderAccounts();
        this.updateDashboard();
        this.clearForm('account-form');
        this.closeModal();
        this.showMessage('Account added successfully!', 'success');
    }

    renderAccounts() {
        const container = document.getElementById('accounts-grid');
        
        if (this.data.accounts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1/-1;">No accounts added yet. Click "Add Account" to get started!</p>';
            return;
        }

        container.innerHTML = this.data.accounts.map(account => this.createAccountHTML(account)).join('');
        
        // Refresh income account dropdown when accounts change
        this.populateIncomeAccountDropdown();
    }

    createAccountHTML(account) {
        const typeIcons = {
            checking: '🏦',
            savings: '💰',
            cash: '💵',
            crypto: '₿',
            investment: '📈'
        };

        // Ensure account has currency, fallback to USD if not set
        const accountCurrency = account.currency || 'USD';
        
        // Get currency info for display
        const currencyInfo = this.currencies[accountCurrency] || this.currencies['USD'];
        const currencyDisplay = `${currencyInfo.symbol} ${accountCurrency}`;

        // Ensure balance is a number
        const balance = isNaN(account.balance) ? 0 : account.balance;

        return `
            <div class="account-card slide-in">
                <div class="account-header">
                    <div class="account-name">${typeIcons[account.type] || '🏦'} ${account.name}</div>
                    <span class="account-type">${account.type}</span>
                </div>
                <div class="account-currency">${currencyDisplay}</div>
                <div class="account-balance">${this.formatCurrency(balance, accountCurrency)}</div>
                <div class="account-actions">
                    <button class="btn btn-sm btn-secondary" onclick="financeTracker.editAccount(${account.id})" title="Edit Account">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="financeTracker.deleteAccountDirect(${account.id})" title="Delete Account">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Reminders Management
    addReminder() {
        const title = document.getElementById('reminder-title').value;
        const amount = parseFloat(document.getElementById('reminder-amount').value);
        const date = document.getElementById('reminder-date').value;
        const priority = document.getElementById('reminder-priority').value;
        const currency = document.getElementById('reminder-currency').value;
        const isRecurring = document.getElementById('reminder-recurring').checked;
        const frequency = document.getElementById('reminder-frequency').value;

        if (!title || !amount || !date || !priority || !currency) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const reminder = {
            id: Date.now(),
            title,
            amount,
            date,
            priority,
            currency,
            isRecurring,
            frequency: isRecurring ? frequency : null,
            createdAt: new Date().toISOString()
        };

        this.data.reminders.push(reminder);

        // If recurring, create next few reminders
        if (isRecurring) {
            this.createRecurringReminders(reminder, 3); // Create next 3 occurrences
        }

        this.saveData();
        this.renderReminders();
        this.clearForm('reminder-form');
        this.closeModal();
        
        const recurringText = isRecurring ? ` (${frequency} recurring)` : '';
        this.showMessage(`Reminder added successfully${recurringText}!`, 'success');
    }

    createRecurringReminders(baseReminder, count) {
        const baseDate = new Date(baseReminder.date);
        
        for (let i = 1; i <= count; i++) {
            const nextDate = new Date(baseDate);
            
            switch (baseReminder.frequency) {
                case 'weekly':
                    nextDate.setDate(baseDate.getDate() + (i * 7));
                    break;
                case 'monthly':
                    nextDate.setMonth(baseDate.getMonth() + i);
                    break;
                case 'yearly':
                    nextDate.setFullYear(baseDate.getFullYear() + i);
                    break;
            }

            const nextReminder = {
                ...baseReminder,
                id: Date.now() + i,
                date: nextDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };

            this.data.reminders.push(nextReminder);
        }
    }

    renderReminders() {
        const container = document.getElementById('reminders-list');
        
        if (this.data.reminders.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No reminders set. Click "Add Reminder" to create one!</p>';
            return;
        }

        // Sort by date and priority
        const sortedReminders = [...this.data.reminders].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        container.innerHTML = sortedReminders.map(reminder => this.createReminderHTML(reminder)).join('');
    }

    createReminderHTML(reminder) {
        const priorityIcons = {
            low: '🔵',
            medium: '🟡',
            high: '🔴'
        };

        const daysUntil = this.getDaysUntilDate(reminder.date);
        const urgencyText = daysUntil <= 0 ? 'Due now!' : daysUntil <= 3 ? `Due in ${daysUntil} days` : this.formatDate(reminder.date);
        
        const recurringIndicator = reminder.isRecurring ? ` 🔄 ${reminder.frequency}` : '';

        return `
            <div class="reminder-item ${reminder.priority} slide-in">
                <div class="reminder-header">
                    <div class="reminder-title">${priorityIcons[reminder.priority]} ${reminder.title}${recurringIndicator}</div>
                    <div class="reminder-amount">${this.formatCurrency(reminder.amount, reminder.currency)}</div>
                </div>
                <div class="reminder-date">${urgencyText}</div>
            </div>
        `;
    }

    // Planning Management
    addPlannedExpense() {
        const item = document.getElementById('planned-item').value;
        const cost = parseFloat(document.getElementById('planned-cost').value);
        const date = document.getElementById('planned-date').value;
        const category = document.getElementById('planned-category').value;
        const currency = document.getElementById('planned-currency').value;

        if (!item || !cost || !date || !category || !currency) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const plannedExpense = {
            id: Date.now(),
            item,
            cost,
            date,
            category,
            currency,
            createdAt: new Date().toISOString()
        };

        this.data.plannedExpenses.push(plannedExpense);
        this.saveData();
        this.renderPlannedExpenses();
        this.clearForm('planned-expense-form');
        this.showMessage('Planned expense added successfully!', 'success');
    }

    renderPlannedExpenses() {
        const container = document.getElementById('planned-expenses-list');
        
        if (this.data.plannedExpenses.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No planned expenses yet. Add one above!</p>';
            return;
        }

        // Sort by date
        const sortedExpenses = [...this.data.plannedExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));

        container.innerHTML = sortedExpenses.map(expense => this.createPlannedExpenseHTML(expense)).join('');
    }

    createPlannedExpenseHTML(expense) {
        const categoryIcons = {
            travel: '✈️',
            gadgets: '📱',
            education: '🎓',
            clothing: '👕',
            other: '📦'
        };

        return `
            <div class="planned-item slide-in">
                <div class="item-header">
                    <div class="item-title">${categoryIcons[expense.category]} ${expense.item}</div>
                    <div class="item-amount">${this.formatCurrency(expense.cost, expense.currency)}</div>
                </div>
                <div class="item-details">
                    <span>${expense.category}</span>
                    <span>${this.formatDate(expense.date)}</span>
                </div>
            </div>
        `;
    }

    addIncomeIdea() {
        const idea = document.getElementById('income-idea').value;
        const amount = parseFloat(document.getElementById('expected-amount').value);
        const date = document.getElementById('expected-date').value;
        const confidence = document.getElementById('confidence-level').value;
        const currency = document.getElementById('income-idea-currency').value;
        const isRecurring = document.getElementById('income-recurring').checked;
        const frequency = document.getElementById('income-frequency').value;
        const dayOfReceipt = document.getElementById('income-day').value;

        if (!idea || !amount || !date || !confidence || !currency) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        const incomeIdea = {
            id: Date.now(),
            idea,
            amount,
            date,
            confidence: parseInt(confidence),
            currency,
            isRecurring,
            frequency: isRecurring ? frequency : null,
            dayOfReceipt: isRecurring ? dayOfReceipt : null,
            createdAt: new Date().toISOString()
        };

        this.data.incomeIdeas.push(incomeIdea);

        // If recurring, create next few income opportunities
        if (isRecurring) {
            this.createRecurringIncomeIdeas(incomeIdea, 3); // Create next 3 occurrences
        }

        this.saveData();
        this.renderIncomeIdeas();
        this.clearForm('income-idea-form');
        
        const recurringText = isRecurring ? ` (${frequency} recurring)` : '';
        this.showMessage(`Income idea added successfully${recurringText}!`, 'success');
    }

    renderIncomeIdeas() {
        const container = document.getElementById('income-ideas-list');
        
        if (this.data.incomeIdeas.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No income ideas yet. Add one above!</p>';
            return;
        }

        // Sort by confidence and date
        const sortedIdeas = [...this.data.incomeIdeas].sort((a, b) => {
            return b.confidence - a.confidence || new Date(a.date) - new Date(b.date);
        });

        container.innerHTML = sortedIdeas.map(idea => this.createIncomeIdeaHTML(idea)).join('');
    }

    createIncomeIdeaHTML(idea) {
        const recurringIndicator = idea.isRecurring ? ` <span class="recurring-indicator">🔄 ${idea.frequency}</span>` : '';
        const dayInfo = idea.isRecurring && idea.dayOfReceipt ? this.formatDayOfReceipt(idea.dayOfReceipt) : '';
        
        return `
            <div class="income-idea-item ${idea.isRecurring ? 'recurring' : ''} slide-in">
                <div class="item-header">
                    <div class="item-title">💡 ${idea.idea}${recurringIndicator}</div>
                    <div class="item-amount">${this.formatCurrency(idea.amount, idea.currency)}</div>
                </div>
                <div class="item-details">
                    <span>${this.formatDate(idea.date)}</span>
                    <span class="confidence-badge confidence-${idea.confidence}">${idea.confidence}% confident</span>
                    ${dayInfo ? `<span class="frequency-info">${dayInfo}</span>` : ''}
                </div>
            </div>
        `;
    }

    formatDayOfReceipt(dayOfReceipt) {
        if (!dayOfReceipt) return '';
        
        // Handle numeric days (1-30)
        if (!isNaN(dayOfReceipt)) {
            const day = parseInt(dayOfReceipt);
            if (day === 30) return 'Last day of month';
            return `${day}${this.getOrdinalSuffix(day)} of month`;
        }
        
        // Handle weekdays
        const weekdays = {
            'monday': 'Every Monday',
            'tuesday': 'Every Tuesday', 
            'wednesday': 'Every Wednesday',
            'thursday': 'Every Thursday',
            'friday': 'Every Friday'
        };
        
        return weekdays[dayOfReceipt] || '';
    }

    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }

    // Modal Management
    openModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        // Hide all modals first
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        
        // Show target modal
        modal.style.display = 'block';
        overlay.classList.add('active');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        
        // Reset budget category modal if it was being edited
        if (this.editingBudgetId) {
            this.resetBudgetCategoryModal();
        }
    }

    // CSV Import
    handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                
                let imported = 0;
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',');
                    if (values.length < 3) continue;

                    // Simple CSV format: date, description, amount, type
                    const date = values[0]?.trim();
                    const description = values[1]?.trim();
                    const amount = parseFloat(values[2]?.trim());
                    const type = values[3]?.trim().toLowerCase();

                    if (date && description && amount && (type === 'income' || type === 'expense')) {
                        const transaction = {
                            id: Date.now() + i,
                            type,
                            [type === 'income' ? 'source' : 'item']: description,
                            amount: Math.abs(amount),
                            date,
                            category: type === 'expense' ? 'other' : undefined,
                            paymentMethod: type === 'expense' ? 'imported' : undefined,
                            timestamp: new Date().toISOString()
                        };

                        this.data.transactions.push(transaction);
                        imported++;
                    }
                }

                this.saveData();
                this.updateDashboard();
                this.renderTransactions();
                this.showMessage(`Successfully imported ${imported} transactions!`, 'success');
            } catch (error) {
                this.showMessage('Error importing CSV file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Utility Functions
    formatCurrency(amount, currency = null, accountId = null) {
        // Handle undefined or null amounts
        if (amount === undefined || amount === null || isNaN(amount)) {
            amount = 0;
        }
        
        // Determine which currency to use
        let currencyCode = currency;
        
        // If accountId is provided, use account's currency
        if (accountId && !currency) {
            const account = this.data.accounts.find(acc => acc.id === accountId);
            currencyCode = account?.currency || this.data.settings.defaultCurrency;
        }
        
        // If no currency specified, use default
        if (!currencyCode) {
            currencyCode = this.data.settings.defaultCurrency;
        }
        
        // Ensure currency code is valid
        if (!this.currencies[currencyCode]) {
            currencyCode = 'USD'; // Fallback to USD
        }
        
        try {
            return new Intl.NumberFormat(this.currencies[currencyCode].locale, {
            style: 'currency',
                currency: currencyCode
        }).format(amount);
        } catch (error) {
            // Fallback formatting if Intl fails
            const symbol = this.currencies[currencyCode]?.symbol || '$';
            return `${symbol}${amount.toFixed(2)}`;
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDaysUntilDate(dateString) {
        const today = new Date();
        const targetDate = new Date(dateString);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    clearForm(formId) {
        document.getElementById(formId).reset();
        this.setDefaultDates();
        
        // Reset expense button text if clearing expense form
        if (formId === 'expense-form') {
            const expenseButton = document.querySelector('#expense-form .btn-expense');
            expenseButton.innerHTML = '<i class="fas fa-plus"></i> Add Expense';
            expenseButton.style.background = '';
            expenseButton.style.transform = '';
            this.selectedBankAccountId = null;
        }

        // Reset recurring reminder options if clearing reminder form
        if (formId === 'reminder-form') {
            document.getElementById('recurring-options').style.display = 'none';
        }

        // Reset recurring income options if clearing income idea form
        if (formId === 'income-idea-form') {
            document.getElementById('income-recurring-options').style.display = 'none';
        }
    }

    showMessage(text, type) {
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(message, mainContent.firstChild);

        // Remove after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    saveData() {
        localStorage.setItem('transactions', JSON.stringify(this.data.transactions));
        localStorage.setItem('accounts', JSON.stringify(this.data.accounts));
        localStorage.setItem('reminders', JSON.stringify(this.data.reminders));
        localStorage.setItem('plannedExpenses', JSON.stringify(this.data.plannedExpenses));
        localStorage.setItem('incomeIdeas', JSON.stringify(this.data.incomeIdeas));
        localStorage.setItem('transfers', JSON.stringify(this.data.transfers));
        localStorage.setItem('budgetCategories', JSON.stringify(this.data.budgetCategories));
        localStorage.setItem('frequentItems', JSON.stringify(this.data.frequentItems));
        localStorage.setItem('settings', JSON.stringify(this.data.settings));
    }

    // Load demo data for first-time users
    loadDemoData() {
        // Only load demo data if there's absolutely no data
        if (this.data.transactions.length === 0 && this.data.accounts.length === 0 && 
            this.data.reminders.length === 0 && this.data.plannedExpenses.length === 0) {
            
            // Demo Accounts with different currencies
            const demoAccounts = [
                {
                    id: 1,
                    name: 'Student Checking',
                    type: 'checking',
                    currency: 'USD',
                    balance: 1250.75,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    lastModified: '2024-06-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'Emergency Savings',
                    type: 'savings',
                    currency: 'USD',
                    balance: 850.00,
                    createdAt: '2024-01-15T00:00:00.000Z',
                    lastModified: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 3,
                    name: 'Travel Fund',
                    type: 'savings',
                    currency: 'EUR',
                    balance: 420.50,
                    createdAt: '2024-02-01T00:00:00.000Z',
                    lastModified: '2024-05-15T00:00:00.000Z'
                },
                {
                    id: 4,
                    name: 'Crypto Wallet',
                    type: 'crypto',
                    currency: 'USD',
                    balance: 175.25,
                    createdAt: '2024-03-01T00:00:00.000Z',
                    lastModified: '2024-06-01T00:00:00.000Z'
                },
                {
                    id: 5,
                    name: 'Cash Wallet',
                    type: 'cash',
                    currency: 'USD',
                    balance: 45.00,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    lastModified: '2024-06-05T00:00:00.000Z'
                }
            ];

            // Demo Transactions (mix of income and expenses over several months)
            const demoTransactions = [
                // Income transactions
                {
                    id: 1,
                    type: 'income',
                    source: 'Part-time Job - Campus Library',
                    amount: 450.00,
                    date: '2024-06-01',
                    accountId: 1,
                    accountName: 'Student Checking',
                    currency: 'USD',
                    timestamp: '2024-06-01T09:00:00.000Z'
                },
                {
                    id: 2,
                    type: 'income',
                    source: 'Freelance Web Design',
                    amount: 275.50,
                    date: '2024-05-28',
                    accountId: 1,
                    accountName: 'Student Checking',
                    currency: 'USD',
                    timestamp: '2024-05-28T14:30:00.000Z'
                },
                {
                    id: 3,
                    type: 'income',
                    source: 'Tutoring Session',
                    amount: 80.00,
                    date: '2024-05-25',
                    accountId: 1,
                    accountName: 'Student Checking',
                    currency: 'USD',
                    timestamp: '2024-05-25T16:00:00.000Z'
                },
                {
                    id: 4,
                    type: 'income',
                    source: 'Birthday Money from Grandma',
                    amount: 100.00,
                    date: '2024-05-20',
                    accountId: 2,
                    accountName: 'Emergency Savings',
                    currency: 'USD',
                    timestamp: '2024-05-20T12:00:00.000Z'
                },
                {
                    id: 5,
                    type: 'income',
                    source: 'Sold Old Textbooks',
                    amount: 125.25,
                    date: '2024-05-15',
                    accountId: 1,
                    accountName: 'Student Checking',
                    currency: 'USD',
                    timestamp: '2024-05-15T10:30:00.000Z'
                },
                
                // Expense transactions
                {
                    id: 6,
                    type: 'expense',
                    category: 'groceries',
                    item: 'Weekly Groceries - Whole Foods',
                    amount: 85.40,
                    date: '2024-06-05',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-06-05T11:15:00.000Z'
                },
                {
                    id: 7,
                    type: 'expense',
                    category: 'transport',
                    item: 'Bus Pass - Monthly',
                    amount: 65.00,
                    date: '2024-06-01',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-06-01T08:00:00.000Z'
                },
                {
                    id: 8,
                    type: 'expense',
                    category: 'education',
                    item: 'Chemistry Lab Manual',
                    amount: 45.99,
                    date: '2024-05-30',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-30T15:45:00.000Z'
                },
                {
                    id: 9,
                    type: 'expense',
                    category: 'entertainment',
                    item: 'Movie Night with Friends',
                    amount: 28.50,
                    date: '2024-05-28',
                    paymentMethod: 'card',
                    timestamp: '2024-05-28T20:00:00.000Z'
                },
                {
                    id: 10,
                    type: 'expense',
                    category: 'dining-out',
                    item: 'Coffee & Study Snacks',
                    amount: 12.75,
                    date: '2024-05-27',
                    paymentMethod: 'cash',
                    timestamp: '2024-05-27T14:30:00.000Z'
                },
                {
                    id: 11,
                    type: 'expense',
                    category: 'shopping',
                    item: 'Summer Clothes - H&M',
                    amount: 89.99,
                    date: '2024-05-25',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-25T13:20:00.000Z'
                },
                {
                    id: 12,
                    type: 'expense',
                    category: 'utilities',
                    item: 'Phone Bill - Verizon',
                    amount: 35.00,
                    date: '2024-05-23',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-23T09:00:00.000Z'
                },
                {
                    id: 13,
                    type: 'expense',
                    category: 'dining-out',
                    item: 'Lunch at Campus Cafeteria',
                    amount: 8.50,
                    date: '2024-05-22',
                    paymentMethod: 'card',
                    timestamp: '2024-05-22T12:30:00.000Z'
                },
                {
                    id: 14,
                    type: 'expense',
                    category: 'transport',
                    item: 'Uber to Airport',
                    amount: 22.80,
                    date: '2024-05-20',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-20T06:00:00.000Z'
                },
                {
                    id: 15,
                    type: 'expense',
                    category: 'subscriptions',
                    item: 'Netflix Subscription',
                    amount: 15.99,
                    date: '2024-05-19',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-19T00:00:00.000Z'
                },
                {
                    id: 16,
                    type: 'expense',
                    category: 'dining-out',
                    item: 'Pizza Night with Roommates',
                    amount: 18.75,
                    date: '2024-05-18',
                    paymentMethod: 'cash',
                    timestamp: '2024-05-18T19:00:00.000Z'
                },
                {
                    id: 17,
                    type: 'expense',
                    category: 'education',
                    item: 'Online Course - Coursera',
                    amount: 49.00,
                    date: '2024-05-15',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-05-15T16:00:00.000Z'
                },
                {
                    id: 18,
                    type: 'expense',
                    category: 'other',
                    item: 'Laundry - Coin Machine',
                    amount: 6.50,
                    date: '2024-05-14',
                    paymentMethod: 'cash',
                    timestamp: '2024-05-14T15:00:00.000Z'
                },
                {
                    id: 19,
                    type: 'expense',
                    category: 'rent',
                    item: 'Monthly Rent Payment',
                    amount: 650.00,
                    date: '2024-06-01',
                    paymentMethod: 'online',
                    bankAccountId: 1,
                    bankAccountName: 'Student Checking',
                    timestamp: '2024-06-01T08:00:00.000Z'
                }
            ];

            // Demo Reminders (mix of priorities and recurring)
            const demoReminders = [
                {
                    id: 1,
                    title: 'Rent Payment',
                    amount: 650.00,
                    date: '2024-07-01',
                    priority: 'high',
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    title: 'Rent Payment',
                    amount: 650.00,
                    date: '2024-08-01',
                    priority: 'high',
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 3,
                    title: 'Rent Payment',
                    amount: 650.00,
                    date: '2024-09-01',
                    priority: 'high',
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 4,
                    title: 'Student Loan Payment',
                    amount: 120.00,
                    date: '2024-06-15',
                    priority: 'high',
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 5,
                    title: 'Car Insurance',
                    amount: 85.50,
                    date: '2024-06-20',
                    priority: 'medium',
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    createdAt: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 6,
                    title: 'Mom\'s Birthday Gift',
                    amount: 50.00,
                    date: '2024-06-12',
                    priority: 'medium',
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    createdAt: '2024-05-25T00:00:00.000Z'
                },
                {
                    id: 7,
                    title: 'Gym Membership',
                    amount: 29.99,
                    date: '2024-06-10',
                    priority: 'low',
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    createdAt: '2024-05-10T00:00:00.000Z'
                },
                {
                    id: 8,
                    title: 'Dentist Appointment',
                    amount: 150.00,
                    date: '2024-06-25',
                    priority: 'medium',
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    createdAt: '2024-06-01T00:00:00.000Z'
                }
            ];

            // Demo Planned Expenses
            const demoPlannedExpenses = [
                {
                    id: 1,
                    item: 'MacBook Pro for College',
                    cost: 1299.00,
                    date: '2024-08-15',
                    category: 'gadgets',
                    currency: 'USD',
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    item: 'Summer Trip to Europe',
                    cost: 850.00,
                    date: '2024-07-20',
                    category: 'travel',
                    currency: 'EUR',
                    createdAt: '2024-05-15T00:00:00.000Z'
                },
                {
                    id: 3,
                    item: 'Fall Semester Textbooks',
                    cost: 320.00,
                    date: '2024-08-25',
                    category: 'education',
                    currency: 'USD',
                    createdAt: '2024-06-01T00:00:00.000Z'
                },
                {
                    id: 4,
                    item: 'Winter Coat - Canada Goose',
                    cost: 450.00,
                    date: '2024-10-01',
                    category: 'clothing',
                    currency: 'USD',
                    createdAt: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 5,
                    item: 'Concert Tickets - Taylor Swift',
                    cost: 180.00,
                    date: '2024-09-15',
                    category: 'other',
                    currency: 'USD',
                    createdAt: '2024-06-02T00:00:00.000Z'
                },
                {
                    id: 6,
                    item: 'Bike for Campus',
                    cost: 280.00,
                    date: '2024-08-01',
                    category: 'other',
                    currency: 'USD',
                    createdAt: '2024-05-30T00:00:00.000Z'
                }
            ];

            // Demo Income Ideas
            const demoIncomeIdeas = [
                {
                    id: 1,
                    idea: 'Summer Internship at Tech Company',
                    amount: 2500.00,
                    date: '2024-07-01',
                    confidence: 75,
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    dayOfReceipt: null,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    idea: 'Freelance Web Design Projects',
                    amount: 800.00,
                    date: '2024-06-15',
                    confidence: 70,
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    dayOfReceipt: '15',
                    createdAt: '2024-06-01T00:00:00.000Z'
                },
                {
                    id: 3,
                    idea: 'Freelance Web Design Projects',
                    amount: 800.00,
                    date: '2024-07-15',
                    confidence: 70,
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    dayOfReceipt: '15',
                    createdAt: '2024-06-01T00:00:00.000Z'
                },
                {
                    id: 4,
                    idea: 'Part-time Tutoring Sessions',
                    amount: 120.00,
                    date: '2024-06-14',
                    confidence: 85,
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'weekly',
                    dayOfReceipt: 'friday',
                    createdAt: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 5,
                    idea: 'Part-time Tutoring Sessions',
                    amount: 120.00,
                    date: '2024-06-21',
                    confidence: 85,
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'weekly',
                    dayOfReceipt: 'friday',
                    createdAt: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 6,
                    idea: 'Pet Sitting During Summer Break',
                    amount: 450.00,
                    date: '2024-08-31',
                    confidence: 85,
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    dayOfReceipt: null,
                    createdAt: '2024-05-20T00:00:00.000Z'
                },
                {
                    id: 7,
                    idea: 'YouTube Channel Monetization',
                    amount: 150.00,
                    date: '2024-07-01',
                    confidence: 40,
                    currency: 'USD',
                    isRecurring: true,
                    frequency: 'monthly',
                    dayOfReceipt: '1',
                    createdAt: '2024-05-25T00:00:00.000Z'
                },
                {
                    id: 8,
                    idea: 'Campus Tour Guide Job',
                    amount: 200.00,
                    date: '2024-08-15',
                    confidence: 90,
                    currency: 'USD',
                    isRecurring: false,
                    frequency: null,
                    dayOfReceipt: null,
                    createdAt: '2024-05-28T00:00:00.000Z'
                }
            ];

            // Demo Budget Categories
            const demoBudgetCategories = [
                {
                    id: 1,
                    name: 'Monthly Rent',
                    type: 'rent',
                    amount: 650.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'Monthly Groceries',
                    type: 'groceries',
                    amount: 300.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 3,
                    name: 'Transportation',
                    type: 'transport',
                    amount: 120.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 4,
                    name: 'Dining Out & Fun',
                    type: 'eating-out',
                    amount: 150.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 5,
                    name: 'Phone & Subscriptions',
                    type: 'subscriptions',
                    amount: 75.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 6,
                    name: 'Education & Learning',
                    type: 'education',
                    amount: 100.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                },
                {
                    id: 7,
                    name: 'Miscellaneous',
                    type: 'miscellaneous',
                    amount: 80.00,
                    createdAt: '2024-05-01T00:00:00.000Z'
                }
            ];

            // Demo Transfer History
            const demoTransfers = [
                {
                    id: 1,
                    fromAccountId: 1,
                    toAccountId: 2,
                    fromAccountName: 'Student Checking',
                    toAccountName: 'Emergency Savings',
                    amount: 200.00,
                    description: 'Monthly Emergency Fund Contribution',
                    date: '2024-06-01',
                    timestamp: '2024-06-01T10:00:00.000Z'
                },
                {
                    id: 2,
                    fromAccountId: 1,
                    toAccountId: 3,
                    fromAccountName: 'Student Checking',
                    toAccountName: 'Travel Fund',
                    amount: 100.00,
                    description: 'Saving for Europe Trip',
                    date: '2024-05-28',
                    timestamp: '2024-05-28T15:30:00.000Z'
                },
                {
                    id: 3,
                    fromAccountId: 2,
                    toAccountId: 1,
                    fromAccountName: 'Emergency Savings',
                    toAccountName: 'Student Checking',
                    amount: 150.00,
                    description: 'Textbook Emergency Fund',
                    date: '2024-05-20',
                    timestamp: '2024-05-20T14:00:00.000Z'
                }
            ];

            // Set all demo data
            this.data.transactions = demoTransactions;
            this.data.accounts = demoAccounts;
            this.data.reminders = demoReminders;
            this.data.plannedExpenses = demoPlannedExpenses;
            this.data.incomeIdeas = demoIncomeIdeas;
            this.data.budgetCategories = demoBudgetCategories;
            this.data.transfers = demoTransfers;
            
            // Set settings with default currency
            this.data.settings = {
                defaultCurrency: 'USD',
                currencyPreferences: {
                    'USD': 'USD',
                    'EUR': 'EUR'
                }
            };
            
            this.saveData();
            this.updateDashboard();
            this.renderTransactions();
            this.renderAccounts();
            this.renderReminders();
            this.renderPlannedExpenses();
            this.renderIncomeIdeas();
            this.renderBudgetCategories();
            this.renderTransferHistoryList();
            this.renderInsights();
        } else {
            // Ensure existing accounts have proper currency data
            this.ensureAccountCurrencies();
        }
    }

    // Ensure all accounts have proper currency data
    ensureAccountCurrencies() {
        let dataUpdated = false;
        
        this.data.accounts.forEach(account => {
            if (!account.currency) {
                account.currency = 'USD'; // Default to USD
                dataUpdated = true;
            }
            if (isNaN(account.balance)) {
                account.balance = 0; // Default to 0
                dataUpdated = true;
            }
        });
        
        if (dataUpdated) {
            this.saveData();
            this.renderAccounts();
            this.populateIncomeAccountDropdown();
        }
    }

    // Edit Transaction Functions
    editTransaction(id) {
        const transaction = this.data.transactions.find(t => t.id === id);
        if (!transaction) return;

        // Populate edit form
        document.getElementById('edit-transaction-id').value = transaction.id;
        document.getElementById('edit-transaction-title').value = 
            transaction.type === 'income' ? transaction.source : transaction.item;
        document.getElementById('edit-transaction-amount').value = transaction.amount;
        document.getElementById('edit-transaction-date').value = transaction.date;
        
        // Show/hide category based on transaction type
        const categorySelect = document.getElementById('edit-transaction-category');
        if (transaction.type === 'expense') {
            categorySelect.value = transaction.category;
            categorySelect.style.display = 'block';
        } else {
            categorySelect.style.display = 'none';
        }

        this.openModal('edit-transaction-modal');
    }

    updateTransaction() {
        const id = parseInt(document.getElementById('edit-transaction-id').value);
        const title = document.getElementById('edit-transaction-title').value;
        const amount = parseFloat(document.getElementById('edit-transaction-amount').value);
        const date = document.getElementById('edit-transaction-date').value;
        const category = document.getElementById('edit-transaction-category').value;

        if (!title || !amount || !date) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        const transactionIndex = this.data.transactions.findIndex(t => t.id === id);
        if (transactionIndex === -1) return;

        const transaction = this.data.transactions[transactionIndex];
        
        // Update transaction
        if (transaction.type === 'income') {
            transaction.source = title;
        } else {
            transaction.item = title;
            transaction.category = category || 'other';
        }
        
        transaction.amount = amount;
        transaction.date = date;
        transaction.lastModified = new Date().toISOString();

        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.closeModal();
        this.showMessage('Transaction updated successfully!', 'success');
    }

    deleteTransaction() {
        const id = parseInt(document.getElementById('edit-transaction-id').value);
        this.confirmAction(
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            () => {
                this.data.transactions = this.data.transactions.filter(t => t.id !== id);
                this.saveData();
                this.updateDashboard();
                this.renderTransactions();
                this.showMessage('Transaction deleted successfully!', 'success');
            }
        );
    }

    // Edit Account Functions
    editAccount(id) {
        const account = this.data.accounts.find(a => a.id === id);
        if (!account) return;

        // Populate edit form
        document.getElementById('edit-account-id').value = account.id;
        document.getElementById('edit-account-name').value = account.name;
        document.getElementById('edit-account-type').value = account.type;
        document.getElementById('edit-account-currency').value = account.currency || 'USD';
        document.getElementById('edit-account-balance').value = account.balance;

        this.openModal('edit-account-modal');
    }

    updateAccount() {
        const id = parseInt(document.getElementById('edit-account-id').value);
        const name = document.getElementById('edit-account-name').value;
        const type = document.getElementById('edit-account-type').value;
        const currency = document.getElementById('edit-account-currency').value;
        const balance = parseFloat(document.getElementById('edit-account-balance').value);

        if (!name || !type || !currency || isNaN(balance)) {
            this.showMessage('Please fill in all fields correctly', 'error');
            return;
        }

        const accountIndex = this.data.accounts.findIndex(a => a.id === id);
        if (accountIndex === -1) return;

        // Update account
        this.data.accounts[accountIndex] = {
            ...this.data.accounts[accountIndex],
            name,
            type,
            currency,
            balance,
            lastModified: new Date().toISOString()
        };

        this.saveData();
        this.renderAccounts();
        this.updateDashboard();
        this.closeModal();
        this.showMessage('Account updated successfully!', 'success');
    }

    deleteAccount() {
        const id = parseInt(document.getElementById('edit-account-id').value);
        const account = this.data.accounts.find(a => a.id === id);
        
        this.confirmAction(
            `Are you sure you want to delete the account "${account.name}"? This action cannot be undone.`,
            () => {
                this.data.accounts = this.data.accounts.filter(a => a.id !== id);
                this.saveData();
                this.renderAccounts();
                this.updateDashboard();
                this.showMessage('Account deleted successfully!', 'success');
            }
        );
    }

    deleteAccountDirect(id) {
        const account = this.data.accounts.find(a => a.id === id);
        if (!account) return;
        
        this.confirmAction(
            `Are you sure you want to delete the account "${account.name}"? This action cannot be undone.`,
            () => {
                this.data.accounts = this.data.accounts.filter(a => a.id !== id);
                this.saveData();
                this.renderAccounts();
                this.updateDashboard();
                this.showMessage('Account deleted successfully!', 'success');
            }
        );
    }

    // Data Management Functions
    exportData() {
        const dataToExport = {
            exported: new Date().toISOString(),
            version: '1.0',
            data: this.data
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    confirmClearAllData() {
        // Show the clear options interface
        document.getElementById('confirm-message').textContent = 'Select what data you want to clear:';
        document.getElementById('clear-options').style.display = 'block';
        
        // Update callback to handle selective clearing
        this.confirmCallback = () => {
            this.clearSelectedData();
        };
        
        this.openModal('confirm-modal');
    }

    clearSelectedData() {
        const selectedOptions = {
            transactions: document.getElementById('clear-transactions').checked,
            accounts: document.getElementById('clear-accounts').checked,
            accountBalances: document.getElementById('clear-account-balances').checked,
            reminders: document.getElementById('clear-reminders').checked,
            plannedExpenses: document.getElementById('clear-planned-expenses').checked,
            incomeIdeas: document.getElementById('clear-income-ideas').checked,
            transfers: document.getElementById('clear-transfers').checked,
            budgets: document.getElementById('clear-budgets').checked
        };

        let clearedItems = [];

        // Clear transactions
        if (selectedOptions.transactions) {
            this.data.transactions = [];
        localStorage.removeItem('transactions');
            clearedItems.push('transactions');
        }

        // Clear or reset accounts
        if (selectedOptions.accounts) {
            this.data.accounts = [];
        localStorage.removeItem('accounts');
            clearedItems.push('accounts');
        } else if (selectedOptions.accountBalances) {
            // Reset balances to 0 but keep accounts
            this.data.accounts.forEach(account => {
                account.balance = 0;
                account.lastModified = new Date().toISOString();
            });
            this.saveData();
            clearedItems.push('account balances');
        }

        // Clear reminders
        if (selectedOptions.reminders) {
            this.data.reminders = [];
        localStorage.removeItem('reminders');
            clearedItems.push('reminders');
        }

        // Clear planned expenses
        if (selectedOptions.plannedExpenses) {
            this.data.plannedExpenses = [];
        localStorage.removeItem('plannedExpenses');
            clearedItems.push('planned expenses');
        }

        // Clear income ideas
        if (selectedOptions.incomeIdeas) {
            this.data.incomeIdeas = [];
        localStorage.removeItem('incomeIdeas');
            clearedItems.push('income ideas');
        }

        // Clear transfers
        if (selectedOptions.transfers) {
            this.data.transfers = [];
        localStorage.removeItem('transfers');
            clearedItems.push('transfer history');
        }

        // Clear budget categories
        if (selectedOptions.budgets) {
            this.data.budgetCategories = [];
        localStorage.removeItem('budgetCategories');
            clearedItems.push('budget categories');
        }

        // Reset selected bank account if accounts were cleared
        if (selectedOptions.accounts) {
            this.selectedBankAccountId = null;
        }

        // Save any remaining data
        this.saveData();

        // Re-render everything
        this.updateDashboard();
        this.renderTransactions();
        this.renderAccounts();
        this.renderReminders();
        this.renderPlannedExpenses();
        this.renderIncomeIdeas();
        this.renderTransferHistoryList();
        this.renderBudgetCategories();
        this.renderInsights();

        // Show success message
        if (clearedItems.length > 0) {
            this.showMessage(`Successfully cleared: ${clearedItems.join(', ')}`, 'success');
        } else {
            this.showMessage('No data was selected for clearing', 'warning');
        }

        // Hide clear options for next time
        document.getElementById('clear-options').style.display = 'none';
    }

    // Enhanced Data Display
    getDataStorageInfo() {
        const storageUsed = JSON.stringify(this.data).length;
        const storageUsedKB = (storageUsed / 1024).toFixed(2);
        
        return {
            transactions: this.data.transactions.length,
            accounts: this.data.accounts.length,
            reminders: this.data.reminders.length,
            plannedExpenses: this.data.plannedExpenses.length,
            incomeIdeas: this.data.incomeIdeas.length,
            transfers: this.data.transfers.length,
            storageUsed: `${storageUsedKB} KB`,
            location: 'Browser localStorage'
        };
    }

    // Transfer Money Functions
    openTransferModal() {
        if (this.data.accounts.length < 2) {
            this.showMessage('You need at least 2 accounts to make transfers', 'error');
            return;
        }

        // Populate account dropdowns
        this.populateAccountDropdowns();
        
        // Clear form
        document.getElementById('transfer-form').reset();
        document.getElementById('transfer-info').style.display = 'none';
        
        this.openModal('transfer-modal');
    }

    populateAccountDropdowns() {
        const fromSelect = document.getElementById('transfer-from');
        const toSelect = document.getElementById('transfer-to');
        
        // Clear existing options (except first)
        fromSelect.innerHTML = '<option value="">Select source account</option>';
        toSelect.innerHTML = '<option value="">Select destination account</option>';
        
        // Add accounts to dropdowns
        this.data.accounts.forEach(account => {
            const currencyInfo = this.currencies[account.currency] || this.currencies['USD'];
            const option = `<option value="${account.id}">${account.name} (${this.formatCurrency(account.balance, account.currency)}) - ${currencyInfo.symbol} ${account.currency}</option>`;
            fromSelect.innerHTML += option;
            toSelect.innerHTML += option;
        });
    }

    updateTransferInfo() {
        const fromId = parseInt(document.getElementById('transfer-from').value);
        const toId = parseInt(document.getElementById('transfer-to').value);
        const amount = parseFloat(document.getElementById('transfer-amount').value) || 0;
        
        const transferInfo = document.getElementById('transfer-info');
        
        if (!fromId || !toId) {
            transferInfo.style.display = 'none';
            return;
        }

        if (fromId === toId) {
            transferInfo.style.display = 'none';
            this.showMessage('Cannot transfer to the same account', 'error');
            return;
        }

        const fromAccount = this.data.accounts.find(a => a.id === fromId);
        const toAccount = this.data.accounts.find(a => a.id === toId);
        
        if (!fromAccount || !toAccount) {
            transferInfo.style.display = 'none';
            return;
        }

        // Update info display
        document.getElementById('from-account-info').textContent = `${fromAccount.name} (${fromAccount.type})`;
        document.getElementById('to-account-info').textContent = `${toAccount.name} (${toAccount.type})`;
        
        const availableBalance = document.getElementById('available-balance');
        availableBalance.textContent = this.formatCurrency(fromAccount.balance);
        
        // Check if sufficient funds
        if (amount > fromAccount.balance) {
            availableBalance.classList.add('insufficient-funds');
        } else {
            availableBalance.classList.remove('insufficient-funds');
        }
        
        transferInfo.style.display = 'block';
    }

    transferMoney() {
        const fromId = parseInt(document.getElementById('transfer-from').value);
        const toId = parseInt(document.getElementById('transfer-to').value);
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const description = document.getElementById('transfer-description').value || 'Transfer';

        // Validation
        if (!fromId || !toId || !amount) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (fromId === toId) {
            this.showMessage('Cannot transfer to the same account', 'error');
            return;
        }

        if (amount <= 0) {
            this.showMessage('Transfer amount must be greater than 0', 'error');
            return;
        }

        const fromAccount = this.data.accounts.find(a => a.id === fromId);
        const toAccount = this.data.accounts.find(a => a.id === toId);

        if (!fromAccount || !toAccount) {
            this.showMessage('Invalid account selection', 'error');
            return;
        }

        if (amount > fromAccount.balance) {
            this.showMessage('Insufficient funds in source account', 'error');
            return;
        }

        // Execute transfer
        this.confirmAction(
            `Transfer ${this.formatCurrency(amount)} from ${fromAccount.name} to ${toAccount.name}?`,
            () => {
                this.executeTransfer(fromAccount, toAccount, amount, description);
            }
        );
    }

    executeTransfer(fromAccount, toAccount, amount, description) {
        // Update account balances
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        fromAccount.lastModified = new Date().toISOString();
        toAccount.lastModified = new Date().toISOString();

        // Create transfer record
        const transfer = {
            id: Date.now(),
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            fromAccountName: fromAccount.name,
            toAccountName: toAccount.name,
            amount: amount,
            description: description,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        this.data.transfers.push(transfer);

        // Save data and update UI
        this.saveData();
        this.renderAccounts();
        this.updateDashboard();
        this.closeModal();
        
        this.showMessage(
            `Successfully transferred ${this.formatCurrency(amount)} from ${fromAccount.name} to ${toAccount.name}`,
            'success'
        );

        // Update transfer history display
        this.renderTransferHistoryList();
    }

    // Get transfer history for display
    getTransferHistory() {
        return this.data.transfers
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10); // Show last 10 transfers
    }

    renderTransferHistoryList() {
        const container = document.getElementById('transfer-history-list');
        const transferHistoryHtml = this.renderTransferHistory();
        container.innerHTML = transferHistoryHtml;
    }

    renderTransferHistory() {
        const transfers = this.getTransferHistory();
        if (transfers.length === 0) {
            return '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No transfers yet</p>';
        }

        return transfers.map(transfer => `
            <div class="transfer-item slide-in">
                <div class="transfer-header">
                    <div class="transfer-accounts">
                        🔄 ${transfer.fromAccountName} → ${transfer.toAccountName}
                    </div>
                    <div class="transfer-amount">${this.formatCurrency(transfer.amount)}</div>
                </div>
                <div class="transfer-details">
                    <span>${transfer.description}</span>
                    <span>${this.formatDate(transfer.date)}</span>
                </div>
            </div>
        `).join('');
    }

    // Payment method change handler
    handlePaymentMethodChange(value) {
        console.log('Payment method changed to:', value);
        const bankSelectionRow = document.getElementById('bank-selection-row');
        const bankAccountsDisplay = document.getElementById('bank-accounts-display');
        const expenseBankAccount = document.getElementById('expense-bank-account');
        const expenseButton = document.querySelector('#expense-form .btn-expense');
        
        if (value === 'online') {
            console.log('Showing bank selection interface');
            // Show bank selection interface
            bankSelectionRow.style.display = 'block';
            bankAccountsDisplay.style.display = 'block';
            expenseBankAccount.style.display = 'none';
            expenseBankAccount.required = false;
            
            // Fetch and display bank accounts
            this.renderBankAccountSelection();
        } else {
            console.log('Hiding bank selection interface');
            // Hide bank selection interface
            bankSelectionRow.style.display = 'none';
            bankAccountsDisplay.style.display = 'none';
            expenseBankAccount.style.display = 'none';
            expenseBankAccount.required = false;
            this.selectedBankAccountId = null;
            
            // Reset button text and styling
            expenseButton.innerHTML = '<i class="fas fa-plus"></i> Add Expense';
            expenseButton.style.background = '';
            expenseButton.style.transform = '';
        }
    }

    // Render bank accounts for selection
    renderBankAccountSelection() {
        const bankAccountsList = document.getElementById('bank-accounts-list');
        
        if (this.data.accounts.length === 0) {
            bankAccountsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No bank accounts found. Please add a bank account first.</p>';
            return;
        }

        const bankAccounts = this.data.accounts.filter(account => 
            account.type === 'checking' || account.type === 'savings'
        );

        if (bankAccounts.length === 0) {
            bankAccountsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No checking or savings accounts found. Please add a bank account first.</p>';
            return;
        }

        bankAccountsList.innerHTML = bankAccounts.map(account => {
            const expenseAmount = parseFloat(document.getElementById('expense-amount').value) || 0;
            const isInsufficientFunds = expenseAmount > account.balance;
            
            return `
                <div class="bank-account-option ${isInsufficientFunds ? 'insufficient-funds' : ''}" 
                     data-account-id="${account.id}"
                     id="bank-account-${account.id}">
                    <div class="bank-account-name">${account.name}</div>
                    <div class="bank-account-type">${account.type}</div>
                    <div class="bank-account-balance">${this.formatCurrency(account.balance)}</div>
                    ${isInsufficientFunds ? '<small style="color: var(--danger-color);">Insufficient funds</small>' : ''}
                </div>
            `;
        }).join('');

        // Add click event listeners after rendering
        bankAccounts.forEach(account => {
            const element = document.getElementById(`bank-account-${account.id}`);
            if (element && !element.classList.contains('insufficient-funds')) {
                element.addEventListener('click', () => {
                    this.selectBankAccount(account.id);
                });
                element.style.cursor = 'pointer';
            }
        });
    }

    // Select bank account
    selectBankAccount(accountId) {
        console.log('selectBankAccount called with ID:', accountId);
        
        const account = this.data.accounts.find(acc => acc.id === accountId);
        if (!account) {
            console.error('Account not found for ID:', accountId);
            return;
        }
        
        const expenseAmount = parseFloat(document.getElementById('expense-amount').value) || 0;
        console.log('Expense amount:', expenseAmount, 'Account balance:', account.balance);
        
        if (expenseAmount > account.balance) {
            this.showMessage('Insufficient funds in selected account', 'error');
            return;
        }

        // Remove previous selection with animation
        document.querySelectorAll('.bank-account-option').forEach(option => {
            option.classList.remove('selected');
            option.style.animation = '';
        });

        // Add selection to clicked account with emphasis
        const selectedOption = document.getElementById(`bank-account-${accountId}`);
        if (!selectedOption) {
            console.error('Selected option element not found for ID:', accountId);
            return;
        }
        
        selectedOption.classList.add('selected');
        
        // Add a pulse animation to make selection obvious
        selectedOption.style.animation = 'selectionPulse 0.6s ease-out';
        
        this.selectedBankAccountId = accountId;
        console.log('Selected bank account ID set to:', this.selectedBankAccountId);
        
        // Show confirmation message with account details
        this.showMessage(`✓ Selected ${account.name} (${this.formatCurrency(account.balance)} available)`, 'success');
        
        // Update the expense form button to show selected account
        const expenseButton = document.querySelector('#expense-form .btn-expense');
        if (expenseButton) {
            expenseButton.innerHTML = `<i class="fas fa-check"></i> Add Expense from ${account.name}`;
            expenseButton.style.background = 'var(--success-color)';
            expenseButton.style.transform = 'scale(1.02)';
            
            // Reset button animation after a moment
            setTimeout(() => {
                expenseButton.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Budget management
    renderBudgetCategories() {
        const container = document.getElementById('budget-categories-grid');
        
        if (this.data.budgetCategories.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem; grid-column: 1/-1;">No budget categories set. Click "Add Category" to create your first budget!</p>';
            this.updateBudgetSummary();
            return;
        }

        container.innerHTML = this.data.budgetCategories.map(category => this.createBudgetCategoryHTML(category)).join('');
        this.updateBudgetSummary();
    }

    createBudgetCategoryHTML(category) {
        const typeIcons = {
            rent: '🏠',
            groceries: '🛒',
            'eating-out': '🍕',
            utilities: '⚡',
            transport: '🚗',
            subscriptions: '📱',
            education: '📚',
            entertainment: '🎬',
            shopping: '🛍️',
            health: '🏥',
            fitness: '💪',
            insurance: '🛡️',
            miscellaneous: '📦',
            custom: '✏️'
        };

        // Calculate spent amount for this category
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const categorySpent = this.calculateCategorySpent(category.type, currentMonth);
        const percentage = category.amount > 0 ? Math.min((categorySpent / category.amount) * 100, 100) : 0;
        const remaining = category.amount - categorySpent;
        const isOverBudget = categorySpent > category.amount;
        const isNearLimit = percentage >= 80 && !isOverBudget;
        
        // Determine status class
        let statusClass = '';
        let statusIcon = '';
        let statusText = '';
        
        if (isOverBudget) {
            statusClass = 'over-budget';
            statusIcon = '⚠️';
            statusText = `Over by ${this.formatCurrency(Math.abs(remaining))}`;
        } else if (isNearLimit) {
            statusClass = 'near-limit';
            statusIcon = '🟡';
            statusText = `Near limit (${percentage.toFixed(1)}%)`;
        } else if (percentage >= 50) {
            statusClass = 'halfway';
            statusIcon = '🔵';
            statusText = `${percentage.toFixed(1)}% used`;
        } else {
            statusClass = 'on-track';
            statusIcon = '✅';
            statusText = `On track (${percentage.toFixed(1)}%)`;
        }

        return `
            <div class="budget-category-card ${statusClass} slide-in">
                <div class="budget-category-header">
                    <div class="budget-category-name">
                        ${typeIcons[category.type] || '📦'} ${category.name}
                    </div>
                    <div class="budget-category-amount">${this.formatCurrency(category.amount)}</div>
                </div>
                
                <div class="budget-status">
                    <span class="status-indicator">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                </div>
                
                <div class="budget-progress">
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${statusClass}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-progress-text">
                        ${this.formatCurrency(categorySpent)} / ${this.formatCurrency(category.amount)}
                    </div>
                </div>
                
                    <div class="budget-stats">
                    <div class="stat">
                        <span class="stat-label">Spent</span>
                        <span class="stat-value">${this.formatCurrency(categorySpent)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${remaining < 0 ? 'Over' : 'Remaining'}</span>
                        <span class="stat-value ${remaining < 0 ? 'negative' : 'positive'}">${this.formatCurrency(Math.abs(remaining))}</span>
                </div>
                    <div class="stat">
                        <span class="stat-label">Progress</span>
                        <span class="stat-value">${percentage.toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="budget-actions">
                    <button class="btn btn-secondary btn-sm" onclick="financeTracker.editBudgetCategory(${category.id})" title="Edit budget category">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-info btn-sm" onclick="financeTracker.viewCategoryTransactions('${category.type}')" title="View related transactions">
                        <i class="fas fa-list"></i> Transactions
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="financeTracker.deleteBudgetCategory(${category.id})" title="Delete budget category">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    calculateCategorySpent(categoryType, month) {
        // Improved mapping logic: each budget category maps to specific expense categories
        const categoryMapping = {
            'rent': ['rent'],
            'groceries': ['groceries'],
            'utilities': ['utilities'],
            'transport': ['transport'],
            'subscriptions': ['subscriptions'],
            'eating-out': ['dining-out'],
            'health': ['health'],
            'fitness': ['fitness'],
            'insurance': ['insurance'],
            'education': ['education'],
            'entertainment': ['entertainment'],
            'shopping': ['shopping'],
            'miscellaneous': ['other'],
            'custom': ['other']
        };

        const expenseCategories = categoryMapping[categoryType] || [categoryType];
        
        return this.data.transactions
            .filter(t => 
                t.type === 'expense' && 
                t.date.startsWith(month) &&
                expenseCategories.includes(t.category)
            )
            .reduce((sum, t) => sum + t.amount, 0);
    }

    updateBudgetSummary() {
        const totalBudget = this.data.budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const totalSpent = this.data.budgetCategories.reduce((sum, cat) => 
            sum + this.calculateCategorySpent(cat.type, currentMonth), 0);
        const remaining = totalBudget - totalSpent;
        const percentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

        // Update budget totals
        document.getElementById('total-budget').textContent = this.formatCurrency(totalBudget);
        document.getElementById('total-spent-budget').textContent = this.formatCurrency(totalSpent);
        document.getElementById('budget-remaining').textContent = this.formatCurrency(remaining);
        
        const progressFill = document.getElementById('overall-budget-progress');
        const progressText = document.getElementById('overall-budget-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${Math.min(percentage, 100)}%`;
            
            // Update progress text with status
            let statusText = `${percentage.toFixed(1)}% of budget used`;
            if (percentage > 100) {
                statusText = `⚠️ Over budget by ${(percentage - 100).toFixed(1)}%`;
                progressFill.classList.add('over-budget');
            } else if (percentage >= 80) {
                statusText = `🟡 ${statusText} - Near limit!`;
                progressFill.classList.remove('over-budget');
                progressFill.classList.add('near-limit');
            } else {
                progressFill.classList.remove('over-budget', 'near-limit');
            }
            
            progressText.textContent = statusText;
        }

        // Add budget insights
        this.generateBudgetInsights(totalBudget, totalSpent, remaining);
    }

    generateBudgetInsights(totalBudget, totalSpent, remaining) {
        const insights = [];
        const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        
        if (totalBudget === 0) {
            insights.push({
                type: 'info',
                message: '💡 Set up budget categories to track your spending effectively!'
            });
        } else if (percentage > 100) {
            insights.push({
                type: 'warning',
                message: `⚠️ You're ${(percentage - 100).toFixed(1)}% over budget this month!`
            });
        } else if (percentage >= 80) {
            insights.push({
                type: 'warning',
                message: `🟡 You've used ${percentage.toFixed(1)}% of your budget - consider reducing spending.`
            });
        } else if (percentage < 50) {
            insights.push({
                type: 'success',
                message: `✅ Great job! You're only using ${percentage.toFixed(1)}% of your budget.`
            });
        }

        // Find categories that are over budget
        const currentMonth = new Date().toISOString().slice(0, 7);
        const overBudgetCategories = this.data.budgetCategories.filter(cat => {
            const spent = this.calculateCategorySpent(cat.type, currentMonth);
            return spent > cat.amount;
        });

        if (overBudgetCategories.length > 0) {
            insights.push({
                type: 'warning',
                message: `📊 ${overBudgetCategories.length} categories are over budget: ${overBudgetCategories.map(c => c.name).join(', ')}`
            });
        }

        // Display insights (you can add a UI element for this)
        this.currentBudgetInsights = insights;
    }

    addBudgetCategory() {
        const name = document.getElementById('budget-category-name').value.trim();
        const type = document.getElementById('budget-category-type').value;
        const amount = parseFloat(document.getElementById('budget-category-amount').value);

        if (!name || !type || isNaN(amount) || amount <= 0) {
            this.showMessage('Please fill in all fields correctly with positive amounts', 'error');
            return;
        }

        // Check for duplicate names
        const existingCategory = this.data.budgetCategories.find(cat => 
            cat.name.toLowerCase() === name.toLowerCase() && cat.type === type
        );
        
        if (existingCategory) {
            this.showMessage('A budget category with this name and type already exists', 'error');
            return;
        }

        const category = {
            id: Date.now(),
            name,
            type,
            amount,
            createdAt: new Date().toISOString()
        };

        this.data.budgetCategories.push(category);
        this.saveData();
        this.renderBudgetCategories();
        this.clearForm('budget-category-form');
        this.closeModal();
        this.showMessage('Budget category added successfully!', 'success');
    }

    editBudgetCategory(id) {
        const category = this.data.budgetCategories.find(c => c.id === id);
        if (!category) return;

        // Clear any existing form state
        this.clearForm('budget-category-form');

        // Pre-fill form
        document.getElementById('budget-category-name').value = category.name;
        document.getElementById('budget-category-type').value = category.type;
        document.getElementById('budget-category-amount').value = category.amount;

        // Store ID for updating
        this.editingBudgetId = id;
        
        // Update modal title
        document.querySelector('#budget-category-modal .modal-header h3').textContent = 'Edit Budget Category';
        document.querySelector('#budget-category-modal button[type="submit"]').textContent = 'Update Budget Category';
        
        this.openModal('budget-category-modal');
        
        // Change form submit to update - properly remove existing listener
        const form = document.getElementById('budget-category-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBudgetCategory();
        });
    }

    updateBudgetCategory() {
        const name = document.getElementById('budget-category-name').value;
        const type = document.getElementById('budget-category-type').value;
        const amount = parseFloat(document.getElementById('budget-category-amount').value);

        if (!name || !type || isNaN(amount) || amount <= 0) {
            this.showMessage('Please fill in all fields correctly with positive amounts', 'error');
            return;
        }

        const categoryIndex = this.data.budgetCategories.findIndex(c => c.id === this.editingBudgetId);
        if (categoryIndex === -1) {
            this.showMessage('Budget category not found', 'error');
            return;
        }

        this.data.budgetCategories[categoryIndex] = {
            ...this.data.budgetCategories[categoryIndex],
            name,
            type,
            amount,
            lastModified: new Date().toISOString()
        };

        this.saveData();
        this.renderBudgetCategories();
        this.closeModal();
        this.showMessage('Budget category updated successfully!', 'success');
        
        // Reset form handler and modal state
        this.resetBudgetCategoryModal();
    }
    
    resetBudgetCategoryModal() {
        // Reset modal title and button
        document.querySelector('#budget-category-modal .modal-header h3').textContent = 'Add Budget Category';
        document.querySelector('#budget-category-modal button[type="submit"]').textContent = 'Add Budget Category';
        
        // Reset form handler to original
        const form = document.getElementById('budget-category-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBudgetCategory();
        });
        
        this.editingBudgetId = null;
    }

    deleteBudgetCategory(id) {
        const category = this.data.budgetCategories.find(c => c.id === id);
        if (!category) return;

        this.confirmAction(
            `Are you sure you want to delete the budget category "${category.name}"? This action cannot be undone.`,
            () => {
                this.data.budgetCategories = this.data.budgetCategories.filter(c => c.id !== id);
                this.saveData();
                this.renderBudgetCategories();
                this.showMessage('Budget category deleted successfully!', 'success');
            }
        );
    }

    // Insights month filter
    updateInsights(selectedMonth) {
        this.updateInsightsMetrics(selectedMonth);
        this.createSpendingChart();
        this.createTrendChart();
    }

    renderInsights() {
        this.updateInsightsMetrics();
        this.createSpendingChart();
        this.createTrendChart();
        this.renderUpcomingItems();
        this.renderSmartSuggestions();
    }

    populateInsightsMonthFilter() {
        const select = document.getElementById('insights-month');
        const months = this.getAvailableMonths();
        
        select.innerHTML = '<option value="current">Current Month</option>';
        months.forEach(month => {
            if (month !== new Date().toISOString().slice(0, 7)) {
                const date = new Date(month + '-01');
                const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                select.innerHTML += `<option value="${month}">${monthName}</option>`;
            }
        });
    }

    getAvailableMonths() {
        const months = new Set();
        this.data.transactions.forEach(t => {
            months.add(t.date.slice(0, 7));
        });
        return Array.from(months).sort().reverse();
    }

    updateInsightsMetrics(selectedMonth = 'current') {
        const month = selectedMonth === 'current' ? new Date().toISOString().slice(0, 7) : selectedMonth;
        
        const monthlyTransactions = this.data.transactions.filter(t => t.date.startsWith(month));
        const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const savings = income - expenses;
        
        const totalBudget = this.data.budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
        const budgetUtilization = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;

        document.getElementById('insights-income').textContent = this.formatCurrency(income);
        document.getElementById('insights-expenses').textContent = this.formatCurrency(expenses);
        document.getElementById('insights-savings').textContent = this.formatCurrency(savings);
        document.getElementById('insights-budget-util').textContent = `${budgetUtilization.toFixed(1)}%`;
        
        // Update metric card colors based on values
        const savingsCard = document.querySelector('.savings-metric .metric-value');
        if (savingsCard) {
            savingsCard.style.color = savings >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }
        
        const budgetCard = document.querySelector('.budget-metric .metric-value');
        if (budgetCard) {
            budgetCard.style.color = budgetUtilization <= 100 ? 'var(--success-color)' : 'var(--danger-color)';
        }
    }

    createSpendingChart() {
        const ctx = document.getElementById('spending-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.spending) {
            this.charts.spending.destroy();
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = this.data.transactions.filter(t => 
            t.type === 'expense' && t.date.startsWith(currentMonth)
        );

        const categorySpending = {};
        monthlyExpenses.forEach(t => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });

        const categoryIcons = {
            food: '🍕 Food',
            transport: '🚗 Transport',
            education: '📚 Education',
            entertainment: '🎬 Entertainment',
            shopping: '🛍️ Shopping',
            utilities: '⚡ Utilities',
            other: '💸 Other'
        };

        const labels = Object.keys(categorySpending).map(cat => categoryIcons[cat] || cat);
        const data = Object.values(categorySpending);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        this.charts.spending = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.raw);
                                const percentage = ((context.raw / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        const months = this.getAvailableMonths().slice(0, 6).reverse(); // Last 6 months
        const incomeData = [];
        const expenseData = [];

        months.forEach(month => {
            const monthlyTransactions = this.data.transactions.filter(t => t.date.startsWith(month));
            const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(income);
            expenseData.push(expenses);
        });

        const labels = months.map(month => {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderUpcomingItems() {
        const container = document.getElementById('upcoming-items');
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcomingReminders = this.data.reminders.filter(r => {
            const reminderDate = new Date(r.date);
            return reminderDate >= now && reminderDate <= nextWeek;
        });

        const upcomingPlanned = this.data.plannedExpenses.filter(p => {
            const plannedDate = new Date(p.date);
            return plannedDate >= now && plannedDate <= nextWeek;
        });

        const allUpcoming = [
            ...upcomingReminders.map(r => ({ ...r, type: 'reminder' })),
            ...upcomingPlanned.map(p => ({ ...p, type: 'planned', amount: p.cost }))
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        if (allUpcoming.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No upcoming items in the next 7 days.</p>';
            return;
        }

        container.innerHTML = allUpcoming.map(item => {
            const daysUntil = Math.ceil((new Date(item.date) - now) / (1000 * 60 * 60 * 24));
            const urgencyClass = daysUntil <= 1 ? 'urgent' : daysUntil <= 3 ? 'warning' : '';
            const icon = item.type === 'reminder' ? '⏰' : '📅';
            const title = item.type === 'reminder' ? item.title : item.item;

            return `
                <div class="upcoming-item ${urgencyClass}">
                    <div class="item-header">
                        <div class="item-title">${icon} ${title}</div>
                        <div class="item-amount">${this.formatCurrency(item.amount)}</div>
                    </div>
                    <div class="item-details">
                        ${daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`} • ${this.formatDate(item.date)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSmartSuggestions() {
        const container = document.getElementById('smart-suggestions');
        const suggestions = this.generateSmartSuggestions();

        if (suggestions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No suggestions available yet. Add more transactions to get personalized insights!</p>';
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="item-header">
                    <div class="item-title">${suggestion.icon} ${suggestion.title}</div>
                </div>
                <div class="item-details">${suggestion.description}</div>
            </div>
        `).join('');
    }

    generateSmartSuggestions() {
        const suggestions = [];
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = this.data.transactions.filter(t => 
            t.type === 'expense' && t.date.startsWith(currentMonth)
        );

        // Frequent categories
        const categoryFrequency = {};
        this.data.transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryFrequency[t.category] = (categoryFrequency[t.category] || 0) + 1;
        });

        const topCategories = Object.entries(categoryFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        if (topCategories.length > 0) {
            suggestions.push({
                icon: '📊',
                title: 'Top Spending Categories',
                description: `You spend most on: ${topCategories.join(', ')}. Consider setting budgets for these categories.`
            });
        }

        // Budget warnings
        this.data.budgetCategories.forEach(category => {
            const spent = this.calculateCategorySpent(category.type, currentMonth);
            const percentage = (spent / category.amount) * 100;
            
            if (percentage > 80) {
                suggestions.push({
                    icon: '⚠️',
                    title: `${category.name} Budget Alert`,
                    description: `You've used ${percentage.toFixed(0)}% of your ${category.name} budget. Consider reducing spending in this category.`
                });
            }
        });

        // Savings opportunity
        const totalIncome = this.data.transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        if (savingsRate < 20 && totalIncome > 0) {
            suggestions.push({
                icon: '💰',
                title: 'Improve Savings Rate',
                description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income for better financial health.`
            });
        }

        return suggestions;
    }

    // Populate income account dropdown
    populateIncomeAccountDropdown() {
        const incomeAccountSelect = document.getElementById('income-account');
        if (!incomeAccountSelect) return;
        
        // Clear existing options (except first)
        incomeAccountSelect.innerHTML = '<option value="">Select Account to Credit</option>';
        
        // Add accounts to dropdown
        this.data.accounts.forEach(account => {
            // Ensure account has currency and balance
            const accountCurrency = account.currency || 'USD';
            const balance = isNaN(account.balance) ? 0 : account.balance;
            
            const currencyInfo = this.currencies[accountCurrency] || this.currencies['USD'];
            const option = `<option value="${account.id}">${account.name} (${this.formatCurrency(balance, accountCurrency)}) - ${currencyInfo.symbol} ${accountCurrency}</option>`;
            incomeAccountSelect.innerHTML += option;
        });
    }

    // Confirmation Modal Helper (for simple confirmations)
    confirmAction(message, callback) {
        // Hide clear options and show simple confirmation
        document.getElementById('clear-options').style.display = 'none';
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-action').textContent = 'Confirm';
        this.confirmCallback = callback;
        this.openModal('confirm-modal');
    }

    createRecurringIncomeIdeas(baseIncomeIdea, count) {
        const baseDate = new Date(baseIncomeIdea.date);
        
        for (let i = 1; i <= count; i++) {
            const nextDate = new Date(baseDate);
            
            switch (baseIncomeIdea.frequency) {
                case 'weekly':
                    if (baseIncomeIdea.dayOfReceipt && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(baseIncomeIdea.dayOfReceipt)) {
                        // For weekly with specific day, advance by weeks
                        nextDate.setDate(baseDate.getDate() + (i * 7));
                    } else {
                        // Default weekly advancement
                        nextDate.setDate(baseDate.getDate() + (i * 7));
                    }
                    break;
                case 'monthly':
                    nextDate.setMonth(baseDate.getMonth() + i);
                    
                    // Adjust for specific day of month if specified
                    if (baseIncomeIdea.dayOfReceipt && !isNaN(baseIncomeIdea.dayOfReceipt)) {
                        const targetDay = parseInt(baseIncomeIdea.dayOfReceipt);
                        if (targetDay === 30) {
                            // Last day of month
                            nextDate.setMonth(nextDate.getMonth() + 1, 0);
                        } else {
                            nextDate.setDate(targetDay);
                        }
                    }
                    break;
                case 'quarterly':
                    nextDate.setMonth(baseDate.getMonth() + (i * 3));
                    
                    // Adjust for specific day if specified
                    if (baseIncomeIdea.dayOfReceipt && !isNaN(baseIncomeIdea.dayOfReceipt)) {
                        const targetDay = parseInt(baseIncomeIdea.dayOfReceipt);
                        if (targetDay === 30) {
                            nextDate.setMonth(nextDate.getMonth() + 1, 0);
                        } else {
                            nextDate.setDate(targetDay);
                        }
                    }
                    break;
                case 'yearly':
                    nextDate.setFullYear(baseDate.getFullYear() + i);
                    break;
            }

            const nextIncomeIdea = {
                ...baseIncomeIdea,
                id: Date.now() + i,
                date: nextDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            };

            this.data.incomeIdeas.push(nextIncomeIdea);
        }
    }

    viewCategoryTransactions(categoryType) {
        // Map budget category type to expense categories
        const categoryMapping = {
            'rent': ['rent'],
            'groceries': ['groceries'],
            'utilities': ['utilities'],
            'transport': ['transport'],
            'subscriptions': ['subscriptions'],
            'eating-out': ['dining-out'],
            'health': ['health'],
            'fitness': ['fitness'],
            'insurance': ['insurance'],
            'education': ['education'],
            'entertainment': ['entertainment'],
            'shopping': ['shopping'],
            'miscellaneous': ['other'],
            'custom': ['other']
        };

        const expenseCategories = categoryMapping[categoryType] || [categoryType];
        
        // Filter transactions for current month and category
        const currentMonth = new Date().toISOString().slice(0, 7);
        const categoryTransactions = this.data.transactions.filter(t => 
            t.type === 'expense' && 
            t.date.startsWith(currentMonth) &&
            expenseCategories.includes(t.category)
        );

        if (categoryTransactions.length === 0) {
            this.showMessage(`No transactions found for ${categoryType} category this month`, 'info');
            return;
        }

        // Switch to monthly tracker and filter by expense
        this.switchTab('monthly');
        document.querySelector('[data-tab="monthly"]').click();
        
        // Set filter to expenses
        this.setFilter('expense');
        
        // Show message about filtered view
        this.showMessage(`Showing ${categoryTransactions.length} transactions for ${categoryType} category`, 'success');
    }
}

// Global modal close function
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.financeTracker = new FinanceTracker();
});

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Quick navigation with number keys
    if (e.altKey) {
        switch(e.key) {
            case '1':
                document.querySelector('[data-tab="monthly"]').click();
                break;
            case '2':
                document.querySelector('[data-tab="accounts"]').click();
                break;
            case '3':
                document.querySelector('[data-tab="planning"]').click();
                break;
        }
    }
}); 