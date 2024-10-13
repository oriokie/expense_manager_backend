function updateNav() {
  const navButtons = document.getElementById('nav-buttons');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  if (token && user) {
    navButtons.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="text-black me-2">Welcome, ${user.name}</span>
        <button onclick="showDashboard()">Dashboard</button>
        <button onclick="showExpenses()">Expenses</button>
        <button onclick="showCategories()">Categories</button>
        <button onclick="showExpenseAnalysis()">Expense Analysis</button>
        <button onclick="logout()">Logout</button>
      </div>
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
