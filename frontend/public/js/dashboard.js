async function showDashboard() {
  updateNav();
  await loadCategories();
  const content = document.getElementById('content');

  try {
    const expensesData = await apiRequest('/expenses');
    const monthlyData = await apiRequest('/expenses/monthly');
    const summaryData = await apiRequest('/expenses/summary');
    const categoriesData = await apiRequest('/categories');

    await loadCategories();
    const recommendationsData = calculateRecommendedBudget(
      expensesData.expenses,
      categoriesData.categories
    );
    const recommendationsHtml = generateRecommendationsCard(recommendationsData);
    const summaryHtml = generateExpenseSummaryHtml(summaryData);

    content.innerHTML = `
      <div class="row">
        <div class="col-md-8">
          <!-- Quick Actions Card -->
          <div class="card mb-3">
            <div class="card-body">
              <h2 class="card-title">Quick Actions</h2>
              <button onclick="showAddExpenseForm()" class="btn btn-primary me-2">Add Expense</button>
              <button onclick="showAddCategoryForm()" class="btn btn-secondary me-2">Add Category</button>
              <button onclick="showExpenseAnalysis()" class="btn btn-info">Expense Analysis</button>
            </div>
          </div>
          
          <!-- Expense Summary Card -->
          ${summaryHtml}

          <!-- Monthly Expenses Chart -->
          <div class="card mb-3">
            <div class="card-body">
              <h2 class="card-title">Monthly Expenses</h2>
              <canvas id="expenseChart"></canvas>
            </div>
          </div>

          <!-- Category Breakdown Chart -->
          <div class="card mb-3">
            <div class="card-body">
              <h2 class="card-title">Category Breakdown</h2>
              <canvas id="categoryChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recommendations Card -->
        <div class="col-md-4">
          ${recommendationsHtml}
        </div>
      </div>

      <!-- Insights Section -->
      <div class="row mt-4">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Top Spending Categories</h5>
              <ul class="list-group" id="topSpendingList">
                <!-- Populated by JavaScript -->
              </ul>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Unusual Spending Alert</h5>
              <div id="unusualSpendingAlert">
                <!-- Populated by JavaScript -->
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Next Month Forecast</h5>
              <p class="h3 text-center" id="expenseForecast"></p>
              <p class="text-muted text-center">Based on last 3 months average</p>
            </div>
          </div>
        </div>
      </div>
    `;

    await loadExpenseChart(monthlyData);
    await loadCategoryChart(expensesData.expenses);
    populateTopSpendingCategories(expensesData.expenses, categoriesData.categories);
    detectUnusualSpending(
      expensesData.expenses,
      categoriesData.categories,
      recommendationsData.recommendations
    );
    calculateExpenseForecast(expensesData.expenses);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    content.innerHTML =
      '<div class="alert alert-danger">Failed to load dashboard. Please try again later.</div>';
  }
}

function generateExpenseSummaryHtml(data) {
  const currentMonthChange = calculatePercentageChange(
    data.previousMonthTotal,
    data.currentMonthTotal
  );
  const currentYearChange = calculatePercentageChange(
    data.previousYearTotal,
    data.currentYearTotal
  );

  return `
    <div class="card mb-3">
      <div class="card-body">
        <h2 class="card-title">Expense Summary</h2>
        <div class="row">
          <div class="col-md-6 mb-3">
            <h3>Current Month</h3>
            <p class="h4">$${data.currentMonthTotal.toFixed(2)}</p>
            <p class="text-${currentMonthChange >= 0 ? 'danger' : 'success'}">
              ${Math.abs(currentMonthChange).toFixed(2)}% ${
    currentMonthChange >= 0 ? 'increase' : 'decrease'
  }
              from last month
            </p>
          </div>
          <div class="col-md-6 mb-3">
            <h3>Current Year</h3>
            <p class="h4">$${data.currentYearTotal.toFixed(2)}</p>
            <p class="text-${currentYearChange >= 0 ? 'danger' : 'success'}">
              ${Math.abs(currentYearChange).toFixed(2)}% ${
    currentYearChange >= 0 ? 'increase' : 'decrease'
  }
              from last year
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

function calculateRecommendedBudget(expenses, categories) {
  const categoryData = {};
  const monthlyData = {};

  categories.forEach((category) => {
    categoryData[category._id] = {
      name: category.name,
      total: 0,
      count: 0,
      monthly: {},
    };
  });

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    categoryData[expense.categoryId].total += expense.amount;
    categoryData[expense.categoryId].count += 1;

    if (!categoryData[expense.categoryId].monthly[monthKey]) {
      categoryData[expense.categoryId].monthly[monthKey] = 0;
    }
    categoryData[expense.categoryId].monthly[monthKey] += expense.amount;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey] += expense.amount;
  });

  const recommendations = [];
  let totalRecommended = 0;

  Object.entries(categoryData).forEach(([categoryId, data]) => {
    const monthlyAvg = data.total / Object.keys(data.monthly).length || 0;
    const trend = calculateTrend(data.monthly);
    let recommended = monthlyAvg * (1 + trend);

    recommended = Math.ceil(recommended);
    totalRecommended += recommended;

    recommendations.push({
      categoryId,
      name: data.name,
      recommended,
      trend: trend * 100,
    });
  });

  return { recommendations, totalRecommended };
}

function calculateTrend(monthlyData) {
  const months = Object.keys(monthlyData).sort();
  if (months.length < 2) return 0;

  const values = months.map((month) => monthlyData[month]);
  const n = values.length;

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const averageY = sumY / n;

  return slope / averageY; // Normalized trend
}

function generateRecommendationsCard(data) {
  const recommendationsHtml = data.recommendations
    .map(
      (rec) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      ${rec.name}
      <span class="badge bg-primary rounded-pill">$${rec.recommended.toFixed(2)}</span>
    </li>
  `
    )
    .join('');

  return `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Recommended Monthly Budget</h5>
        <p class="card-text">Based on your average expenses:</p>
        <h3 class="text-center text-success mb-3">Total: $${data.totalRecommended.toFixed(2)}</h3>
        <ul class="list-group">
          ${recommendationsHtml}
        </ul>
      </div>
    </div>
  `;
}

async function loadExpenseChart(data) {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.monthlyExpenses.map((item) => item.month),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: data.monthlyExpenses.map((item) => item.totalAmount),
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

async function loadCategoryChart(expenses) {
  const categoryData = {};
  expenses.forEach((expense) => {
    const category = getCategoryName(expense.categoryId);
    categoryData[category] = (categoryData[category] || 0) + expense.amount;
  });

  const ctx = document.getElementById('categoryChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
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

function populateTopSpendingCategories(expenses, categories) {
  const categoryTotals = {};
  expenses.forEach((expense) => {
    if (!categoryTotals[expense.categoryId]) {
      categoryTotals[expense.categoryId] = 0;
    }
    categoryTotals[expense.categoryId] += expense.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topSpendingList = document.getElementById('topSpendingList');
  topSpendingList.innerHTML = topCategories
    .map(([categoryId, total]) => {
      const category = categories.find((c) => c._id === categoryId);
      return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${category.name}
        <span class="badge bg-primary rounded-pill">$${total.toFixed(2)}</span>
      </li>
    `;
    })
    .join('');
}

function detectUnusualSpending(expenses, categories, recommendations) {
  const unusualCategories = recommendations.filter((rec) => {
    const categoryExpenses = expenses.filter((e) => e.categoryId === rec.categoryId);
    const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    return categoryTotal > rec.recommended * 1.2; // 20% over budget
  });

  const unusualSpendingAlert = document.getElementById('unusualSpendingAlert');
  if (unusualCategories.length > 0) {
    unusualSpendingAlert.innerHTML = `
      <ul class="list-group">
        ${unusualCategories
          .map(
            (category) => `
          <li class="list-group-item text-danger">
            ${category.name}: Over budget
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  } else {
    unusualSpendingAlert.innerHTML = '<p class="text-success">No unusual spending detected.</p>';
  }
}

function calculateExpenseForecast(expenses) {
  const sortedExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastThreeMonths = sortedExpenses.slice(0, 3);
  const averageExpense = lastThreeMonths.reduce((sum, exp) => sum + exp.amount, 0) / 3;

  const expenseForecast = document.getElementById('expenseForecast');
  expenseForecast.textContent = `$${averageExpense.toFixed(2)}`;
}

// Make sure these functions are available globally
window.showDashboard = showDashboard;
window.showAddExpenseForm = showAddExpenseForm;
window.showAddCategoryForm = showAddCategoryForm;
window.showExpenseAnalysis = showExpenseAnalysis;
