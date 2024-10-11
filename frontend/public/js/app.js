function updateNav() {
  const navButtons = document.getElementById('nav-buttons');
  const token = localStorage.getItem('token');
  if (token) {
    navButtons.innerHTML = `
            <button onclick="showDashboard()">Dashboard</button>
            <button onclick="showExpenses()">Expenses</button>
            <button onclick="showCategories()">Categories</button>
            <button onclick="showExpenseAnalysis()">Expense Analysis</button>
            <button onclick="logout()">Logout</button>
        `;
  } else {
    navButtons.innerHTML = `
            <button onclick="showLoginForm()">Login</button>
            <button onclick="showRegisterForm()">Register</button>
        `;
  }
}

function init() {
  updateNav();
  const token = localStorage.getItem('token');
  if (token) {
    showDashboard();
  } else {
    showLoginForm();
  }
}

init();
