function showLoginForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="card">
            <h2>Login</h2>
            <form onsubmit="login(event)">
                <input type="email" id="loginEmail" placeholder="Email" required>
                <input type="password" id="loginPassword" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    `;
}

function showRegisterForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
        <div class="card">
            <h2>Register</h2>
            <form onsubmit="register(event)">
                <input type="text" id="registerName" placeholder="Name" required>
                <input type="email" id="registerEmail" placeholder="Email" required>
                <input type="password" id="registerPassword" placeholder="Password" required>
                <button type="submit">Register</button>
            </form>
        </div>
    `;
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await apiRequest('/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNav();
    showDashboard();
  } catch (error) {
    console.error('Error:', error);
    alert('Login failed. Please check your credentials.');
  }
}

async function register(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const data = await apiRequest('/register', 'POST', { name, email, password });
    localStorage.setItem('token', data.token);
    showDashboard();
  } catch (error) {
    console.error('Error:', error);
    alert('Registration failed. Please try again.');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateNav();
  showLoginForm();
}
