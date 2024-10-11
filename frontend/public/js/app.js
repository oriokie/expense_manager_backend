const API_URL = 'http://localhost:8080'; // Update this with your backend URL

function showLoginForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <h2>Login</h2>
        <form onsubmit="login(event)">
            <input type="email" id="loginEmail" placeholder="Email" required>
            <input type="password" id="loginPassword" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `;
}

function showRegisterForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <h2>Register</h2>
        <form onsubmit="register(event)">
            <input type="text" id="registerName" placeholder="Name" required>
            <input type="email" id="registerEmail" placeholder="Email" required>
            <input type="password" id="registerPassword" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
    `;
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      showDashboard();
    } else {
      alert('Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function register(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      showDashboard();
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

function showDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <h2>Dashboard</h2>
        <button onclick="showExpenses()">View Expenses</button>
        <button onclick="showAddExpenseForm()">Add Expense</button>
        <button onclick="logout()">Logout</button>
    `;
}

async function showExpenses() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const content = document.getElementById('content');
      content.innerHTML = `
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
                <button onclick="showDashboard()">Back to Dashboard</button>
            `;
    } else {
      alert('Failed to fetch expenses. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

function showAddExpenseForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
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
        <button onclick="showDashboard()">Back to Dashboard</button>
    `;
  fetchCategories();
}

async function fetchCategories() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const categorySelect = document.getElementById('expenseCategory');
      data.categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } else {
      alert('Failed to fetch categories. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

async function addExpense(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first.');
    return;
  }

  const amount = document.getElementById('expenseAmount').value;
  const description = document.getElementById('expenseDescription').value;
  const date = document.getElementById('expenseDate').value;
  const categoryId = document.getElementById('expenseCategory').value;

  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, description, date, categoryId }),
    });

    if (response.ok) {
      alert('Expense added successfully!');
      showDashboard();
    } else {
      alert('Failed to add expense. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('token');
  const content = document.getElementById('content');
  content.innerHTML = '';
  const auth = document.getElementById('auth');
  auth.style.display = 'block';
}

// Initialize the app
function init() {
  const token = localStorage.getItem('token');
  if (token) {
    showDashboard();
  } else {
    const auth = document.getElementById('auth');
    auth.style.display = 'block';
  }
}

init();
