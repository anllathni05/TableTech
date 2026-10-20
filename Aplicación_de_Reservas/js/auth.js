document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Inicializar Usuario Demo
  if (!localStorage.getItem('tt_users')) {
    localStorage.setItem('tt_users', JSON.stringify([
      { name: 'Administrador', email: 'admin@tabletech.com', password: 'admin' }
    ]));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-pass').value.trim();
      const users = JSON.parse(localStorage.getItem('tt_users')) || [];

      const found = users.find(u => u.email === email && u.password === pass);
      if (found) {
        localStorage.setItem('tt_current_user', JSON.stringify(found));
        window.location.href = 'index.html';
      } else {
        showToast('Credenciales incorrectas', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-pass').value.trim();
      const users = JSON.parse(localStorage.getItem('tt_users')) || [];

      if (users.some(u => u.email === email)) {
        showToast('El correo ya está registrado', 'error');
        return;
      }

      users.push({ name, email, password: pass });
      localStorage.setItem('tt_users', JSON.stringify(users));
      localStorage.setItem('tt_current_user', JSON.stringify({ name, email }));
      window.location.href = 'index.html';
    });
  }
});