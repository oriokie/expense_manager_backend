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

async function seedExpenses() {
  try {
    const response = await apiRequest('/expenses/seed', 'POST');
    alert('Expenses seeded successfully!');
    await showExpenses();
  } catch (error) {
    console.error('Error seeding expenses:', error);
    alert('Failed to seed expenses. Please try again.');
  }
}

function showAddExpenseForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Add Expense</h2>
        <form onsubmit="addExpense(event)">
          <div class="mb-3">
            <input type="number" id="expenseAmount" class="form-control" placeholder="Amount" required>
          </div>
          <div class="mb-3">
            <input type="text" id="expenseDescription" class="form-control" placeholder="Description" required>
          </div>
          <div class="mb-3">
            <input type="date" id="expenseDate" class="form-control" required>
          </div>
          <div class="mb-3">
            <select id="expenseCategory" class="form-select" required>
              <option value="">Select Category</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Add Expense</button>
        </form>
      </div>
    </div>
  `;
  populateCategorySelect();
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
    showExpenses();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add expense. Please try again.');
  }
}
async function showExpenseAnalysis() {
  await loadCategories(); // Make sure categories are loaded
  const content = document.getElementById('content');
  if (!content) {
    console.error('Content element not found');
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Expense Analysis</h2>
        <div class="filter-controls mb-3">
          <div class="row g-3">
            <div class="col-md-3">
              <input type="date" id="startDate" class="form-control" placeholder="Start Date">
            </div>
            <div class="col-md-3">
              <input type="date" id="endDate" class="form-control" placeholder="End Date">
            </div>
            <div class="col-md-4">
              <select id="categoryFilter" class="form-select">
                <option value="">All Categories</option>
                ${Object.entries(categoriesMap)
                  .map(([id, name]) => `<option value="${id}">${name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="col-md-2">
              <button id="filterButton" class="btn btn-primary w-100">Filter</button>
            </div>
          </div>
        </div>
        <div id="categoryTotalsTable" class="mb-4"></div>
        <div id="expenseList" class="mb-4"></div>
        <div class="row">
          <div class="col-md-6">
            <canvas id="monthlyExpenseChart"></canvas>
          </div>
          <div class="col-md-6">
            <canvas id="categoryExpenseChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listener to the filter button
  const filterButton = document.getElementById('filterButton');
  if (filterButton) {
    filterButton.addEventListener('click', filterExpenses);
  } else {
    console.error('Filter button not found');
  }

  await filterExpenses();
}

function populateCategorySelect() {
  const categorySelect = document.getElementById('expenseCategory');
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    Object.entries(categoriesMap).forEach(([id, name]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      categorySelect.appendChild(option);
    });
  }
}

async function filterExpenses() {
  const startDate = document.getElementById('startDate')?.value;
  const endDate = document.getElementById('endDate')?.value;
  const categoryId = document.getElementById('categoryFilter')?.value;

  try {
    let url = '/expenses?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (categoryId) url += `categoryId=${categoryId}`;

    const data = await apiRequest(url);
    console.log('Fetched expenses:', data.expenses);

    // Array of update functions and their corresponding element IDs
    const updateFunctions = [
      { id: 'categoryTotalsTable', func: displayCategoryTotals },
      //{ id: 'expenseList', func: displayExpenses },
      { id: 'monthlyExpenseChart', func: updateMonthlyExpenseChart },
      { id: 'categoryExpenseChart', func: updateCategoryExpenseChart },
    ];

    // Filter and execute only the update functions for elements that exist
    const updateResults = updateFunctions
      .filter(({ id }) => document.getElementById(id))
      .map(({ id, func }) => {
        console.log(`Updating ${id}`);
        return func(data.expenses);
      });

    // Check if all updates were successful
    if (updateResults.every((result) => result)) {
      console.log('Expense analysis updated successfully');
    } else {
      console.warn('Some elements could not be updated');
    }
  } catch (error) {
    console.error('Error filtering expenses:', error);
    alert('Failed to filter expenses. Please try again.');
  }
}

async function filterExpenses1() {
  const startDate = document.getElementById('startDate')?.value;
  const endDate = document.getElementById('endDate')?.value;
  const categoryId = document.getElementById('categoryFilter')?.value;

  try {
    let url = '/expenses?';
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (categoryId) url += `categoryId=${categoryId}`;

    const data = await apiRequest(url);
    console.log('Fetched filtered expenses:', data.expenses);

    const expenseTableBody = document.getElementById('expenseTableBody');
    if (expenseTableBody) {
      if (data.expenses.length === 0) {
        expenseTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center">No expenses found for the selected filters.</td>
          </tr>
        `;
      } else {
        expenseTableBody.innerHTML = generateExpenseTableRows(data.expenses);
      }
    } else {
      console.error('Expense table body not found');
    }

    // Update or hide the "No expenses found" message
    const noExpensesMessage = document.querySelector('.alert-info');
    if (noExpensesMessage) {
      if (data.expenses.length === 0) {
        noExpensesMessage.style.display = 'block';
      } else {
        noExpensesMessage.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error filtering expenses:', error);
    alert('Failed to filter expenses. Please try again.');
  }
}

function displayExpenses(expenses) {
  const expenseList = document.getElementById('expenseList');
  if (!expenseList) return false;
  if (expenseList) {
    expenseList.innerHTML = `
      <h3>Filtered Expenses</h3>
      <ul class="list-group">
        ${expenses
          .map(
            (expense) => `
            <li class="list-group-item">
              ${expense.description}: $${expense.amount.toFixed(2)}
              (${new Date(expense.date).toLocaleDateString()})
              - ${getCategoryName(expense.categoryId)}
            </li>
          `
          )
          .join('')}
      </ul>
    `;
  }
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
async function showExpenses() {
  try {
    await loadCategories();
    const data = await apiRequest('/expenses');
    const content = document.getElementById('content');

    // Create filter inputs
    const filterHtml = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">Filter Expenses</h5>
          <div class="row g-3">
            <div class="col-md-3">
              <input type="date" id="startDate" class="form-control" placeholder="Start Date">
            </div>
            <div class="col-md-3">
              <input type="date" id="endDate" class="form-control" placeholder="End Date">
            </div>
            <div class="col-md-4">
              <select id="categoryFilter" class="form-select">
                <option value="">All Categories</option>
                ${Object.entries(categoriesMap)
                  .map(([id, name]) => `<option value="${id}">${name}</option>`)
                  .join('')}
              </select>
            </div>
            <div class="col-md-2">
              <button onclick="filterExpenses1()" class="btn btn-primary w-100">Filter</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Create expenses table or seed button
    let expensesHtml;
    if (data.expenses.length === 0) {
      expensesHtml = `
        <div class="alert alert-info" role="alert">
          No expenses found.
          <button onclick="seedExpenses()" class="btn btn-primary btn-sm ms-2">Seed Expenses</button>
        </div>
      `;
    } else {
      expensesHtml = `
        <div id="expenseList"></div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="expenseTableBody">
              ${generateExpenseTableRows(data.expenses)}
            </tbody>
          </table>
        </div>
      `;
    }

    content.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Expenses</h2>
          ${filterHtml}
          ${expensesHtml}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch expenses. Please try again.');
  }

  async function fetchExpenseSummary() {
    try {
      const response = await apiRequest('/expenses/summary');
      return response;
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      return null;
    }
  }
}

// Helper functions

function generateExpenseTableRows(expenses) {
  return expenses
    .map(
      (expense, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${new Date(expense.date).toLocaleDateString()}</td>
        <td>${expense.description}</td>
        <td>$${expense.amount.toFixed(2)}</td>
        <td>${getCategoryName(expense.categoryId)}</td>
        <td>
          <button onclick="deleteExpense('${
            expense._id
          }')" class="btn btn-danger btn-sm">Delete</button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function deleteExpense(expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  try {
    await apiRequest(`/expenses/${expenseId}`, 'DELETE');
    alert('Expense deleted successfully!');
    await showExpenses();
  } catch (error) {
    console.error('Error deleting expense:', error);
    alert('Failed to delete expense. Please try again.');
  }
}

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue === 0 ? 0 : 100; // Handle division by zero
  return;
  ((newValue - oldValue) / oldValue) * 100;
}
function displayCategoryTotals(expenses) {
  const categoryTotalsTable = document.getElementById('categoryTotalsTable');
  if (!categoryTotalsTable) {
    console.error('Category totals table element not found');
    return false;
  }

  const categoryTotals = {};
  let grandTotal = 0;

  expenses.forEach((expense) => {
    const categoryName = getCategoryName(expense.categoryId);
    if (!categoryTotals[categoryName]) {
      categoryTotals[categoryName] = 0;
    }
    categoryTotals[categoryName] += expense.amount;
    grandTotal += expense.amount;
  });

  categoryTotalsTable.innerHTML = `
    <h3>Category Totals</h3>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Category</th>
          <th>Total</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(categoryTotals)
          .map(
            ([category, total]) => `
          <tr>
            <td>${category}</td>
            <td>$${total.toFixed(2)}</td>
            <td>${((total / grandTotal) * 100).toFixed(2)}%</td>
          </tr>
        `
          )
          .join('')}
        <tr class="table-primary">
          <td><strong>Grand Total</strong></td>
          <td><strong>$${grandTotal.toFixed(2)}</strong></td>
          <td><strong>100%</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  return true;
}

function displayExpenses(expenses) {
  const expenseList = document.getElementById('expenseList');
  if (!expenseList) {
    console.error('Expense list element not found');
    return false;
  }

  expenseList.innerHTML = `
    <h3>Filtered Expenses</h3>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses
            .map(
              (expense) => `
            <tr>
              <td>${new Date(expense.date).toLocaleDateString()}</td>
              <td>${expense.description}</td>
              <td>${getCategoryName(expense.categoryId)}</td>
              <td>$${expense.amount.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  return true;
}

// Make sure to export or make globally available the functions that are called from HTML
window.filterExpenses = filterExpenses;
window.filterExpenses1 = filterExpenses1;
window.showExpenseAnalysis = showExpenseAnalysis;
window.showExpenses = showExpenses;
window.seedExpenses = seedExpenses;
window.showAddExpenseForm = showAddExpenseForm;
window.addExpense = addExpense;
