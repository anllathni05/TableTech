// Datos Iniciales Estáticos
const TABLES = [
  { id: 1, capacity: 2, zone: 'Interior' },
  { id: 2, capacity: 4, zone: 'Ventana' },
  { id: 3, capacity: 4, zone: 'Interior' },
  { id: 4, capacity: 2, zone: 'Terraza' },
  { id: 5, capacity: 2, zone: 'Terraza' },
  { id: 6, capacity: 6, zone: 'Ventana' },
  { id: 7, capacity: 8, zone: 'VIP' },
  { id: 8, capacity: 6, zone: 'Interior' },
  { id: 9, capacity: 4, zone: 'Terraza' },
  { id: 10, capacity: 10, zone: 'VIP' },
];

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

const INITIAL_RESERVATIONS = [
  {
    id: 'res-1',
    customerName: 'Carlos Mendoza',
    phone: '987654321',
    email: 'carlos@example.com',
    date: new Date().toISOString().split('T')[0],
    time: '13:00',
    duration: 90,
    guests: 4,
    tableNumber: 2,
    status: 'confirmada',
    notes: 'Mesa cerca a la ventana'
  },
  {
    id: 'res-2',
    customerName: 'María Lucía López',
    phone: '912345678',
    email: 'maria.lopez@example.com',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    duration: 90,
    guests: 2,
    tableNumber: 5,
    status: 'confirmada',
    notes: 'Aniversario'
  }
];

// Helper Notificación Toast
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Convertir Horas a Minutos
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Control de Sesión
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('tt_current_user'));
  const userDisplay = document.getElementById('user-display');
  if (userDisplay && user) {
    userDisplay.innerHTML = `
      <span class="user-name">👤 ${user.name}</span>
      <button onclick="logout()" class="btn-logout">Cerrar Sesión</button>
    `;
  } else if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('registro.html')) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('tt_current_user');
  window.location.href = 'login.html';
}

// Inicializar Reservas en LocalStorage
function getReservations() {
  const saved = localStorage.getItem('restaurant_reservations');
  return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
}

function saveReservations(reservations) {
  localStorage.setItem('restaurant_reservations', JSON.stringify(reservations));
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});