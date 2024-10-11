// File: frontend/public/js/dashboard.js

async function showDashboard() {
  updateNav();
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="grid">
            <div class="card">
                <h2>Quick Actions</h2>
                <button onclick="showAddExpenseForm()">Add Expense</button>
                <button onclick="showAddCategoryForm()">Add Category</button>
                <button onclick="showExpenseAnalysis()">Expense Analysis</button>
            </div>
            <div class="card">
                <h2>Expense Summary</h2>
                <canvas id="expenseChart"></canvas>
            </div>
            <div class="card">
                <h2>Category Breakdown</h2>
                <canvas id="categoryChart"></canvas>
            </div>
        </div>
    `;
  await loadCategories();
  await loadExpenseChart();
  await loadCategoryChart();
}

async function loadExpenseChart() {
  try {
    const data = await apiRequest('/expenses/monthly');
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
  } catch (error) {
    console.error('Error loading expense chart:', error);
  }
}

async function loadCategoryChart() {
  try {
    const data = await apiRequest('/expenses');
    const categoryData = {};
    data.expenses.forEach((expense) => {
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
  } catch (error) {
    console.error('Error loading category chart:', error);
  }
}
