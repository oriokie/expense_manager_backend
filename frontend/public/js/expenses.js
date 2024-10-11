let monthlyExpenseChart = null;
let categoryExpenseChart = null;
let categoriesMap = {};

async function loadCategories() {
  try {
    const data = await apiRequest('/categories');
    categoriesMap = data.categories.reduce((map, category) => {
      map[category._id] = category.name;
      return map;
    }, {});
    console.log('Categories loaded:', categoriesMap);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function getCategoryName(categoryId) {
  return categoriesMap[categoryId] || 'Uncategorized';
}

async function showExpenses() {
  try {
    const data = await apiRequest('/expenses');
    const content = document.getElementById('content');
    content.innerHTML = `
            <div class="card">
                <h2>Expenses</h2>
                <ul>
                    ${data.expenses
                      .map(
                        (expense) => `
                        <li>
                            ${expense.description}: $${expense.amount}
                            (${new Date(expense.date).toLocaleDateString()})
                        </li>
                    `
                      )
                      .join('')}
                </ul>
            </div>
        `;
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch expenses. Please try again.');
  }
}

function showAddExpenseForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="card">
            <h2>Add Expense</h2>
            <form onsubmit="addExpense(event)">
                <input type="number" id="expenseAmount" placeholder="Amount" required>
                <input type="text" id="expenseDescription" placeholder="Description" required>
                <input type="date" id="expenseDate" required>
                <select id="expenseCategory" required>
                    <option value="">Select Category</option>
                </select>
                <button type="submit">Add Expense</button>
            </form>
        </div>
    `;
  fetchCategories();
}

async function addExpense(event) {
  event.preventDefault();
  const amount = document.getElementById('expenseAmount').value;
  const description = document.getElementById('expenseDescription').value;
  const date = document.getElementById('expenseDate').value;
  const categoryId = document.getElementById('expenseCategory').value;

  try {
    await apiRequest('/expenses', 'POST', { amount, description, date, categoryId });
    alert('Expense added successfully!');
    showDashboard();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add expense. Please try again.');
  }
}

async function showExpenseAnalysis() {
  await loadCategories(); // Make sure categories are loaded
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="card">
            <h2>Expense Analysis</h2>
            <div class="filter-controls">
                <input type="date" id="startDate">
                <input type="date" id="endDate">
                <select id="categoryFilter">
                    <option value="">All Categories</option>
                    ${Object.entries(categoriesMap)
                      .map(
                        ([id, name]) => `
                        <option value="${id}">${name}</option>
                    `
                      )
                      .join('')}
                </select>
                <button onclick="filterExpenses()">Filter</button>
            </div>
            <div id="expenseList"></div>
            <canvas id="monthlyExpenseChart"></canvas>
            <canvas id="categoryExpenseChart"></canvas>
        </div>
    `;
  await filterExpenses();
}

function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    Object.entries(categoriesMap).forEach(([id, name]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      categoryFilter.appendChild(option);
    });
  }
}

async function filterExpenses() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const categoryId = document.getElementById('categoryFilter').value;

  try {
    let url = '/expenses?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (categoryId) url += `categoryId=${categoryId}`;

    const data = await apiRequest(url);
    console.log('Fetched expenses:', data.expenses);
    displayExpenses(data.expenses);
    updateMonthlyExpenseChart(data.expenses);
    updateCategoryExpenseChart(data.expenses);
  } catch (error) {
    console.error('Error filtering expenses:', error);
    alert('Failed to filter expenses. Please try again.');
  }
}

function displayExpenses(expenses) {
  const expenseList = document.getElementById('expenseList');
  expenseList.innerHTML = `
        <h3>Filtered Expenses</h3>
        <ul>
            ${expenses
              .map(
                (expense) => `
                <li>
                    ${expense.description}: $${expense.amount}
                    (${new Date(expense.date).toLocaleDateString()})
                    - ${getCategoryName(expense.categoryId)}
                </li>
            `
              )
              .join('')}
        </ul>
    `;
}

function updateMonthlyExpenseChart(expenses) {
  const monthlyData = {};
  expenses.forEach((expense) => {
    const month = new Date(expense.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
  });

  const ctx = document.getElementById('monthlyExpenseChart').getContext('2d');

  if (monthlyExpenseChart) {
    monthlyExpenseChart.destroy();
  }

  monthlyExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function updateCategoryExpenseChart(expenses) {
  const categoryData = {};
  expenses.forEach((expense) => {
    const category = getCategoryName(expense.categoryId);
    categoryData[category] = (categoryData[category] || 0) + expense.amount;
  });

  const ctx = document.getElementById('categoryExpenseChart').getContext('2d');

  if (categoryExpenseChart) {
    categoryExpenseChart.destroy();
  }

  categoryExpenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Expenses by Category',
        },
      },
    },
  });
}

// Make sure to export or make globally available the functions that are called from HTML
window.filterExpenses = filterExpenses;
window.showExpenseAnalysis = showExpenseAnalysis;
