let selectedDate = new Date().toISOString().split('T')[0];

function checkConflict(date, time, tableNumber, excludeId = null) {
  const reservations = getReservations();
  const newStart = timeToMinutes(time);
  const newEnd = newStart + 90;

  return reservations.some(res => {
    if (res.id === excludeId) return false;
    if (res.date !== date) return false;
    if (parseInt(res.tableNumber) !== parseInt(tableNumber)) return false;
    if (res.status === 'cancelada') return false;

    const existingStart = timeToMinutes(res.time);
    const existingEnd = existingStart + (res.duration || 90);
    return newStart < existingEnd && newEnd > existingStart;
  });
}

function renderMatrix() {
  const tbody = document.getElementById('matrix-body');
  if (!tbody) return;

  const reservations = getReservations();
  const filterTable = document.getElementById('filter-table')?.value || 'all';
  const searchQuery = document.getElementById('search-query')?.value.toLowerCase() || '';

  tbody.innerHTML = '';

  TABLES.filter(t => filterTable === 'all' || t.id === parseInt(filterTable)).forEach(table => {
    const tr = document.createElement('tr');
    
    let html = `
      <td class="font-bold">Mesa ${table.id}</td>
      <td class="text-xs">${table.zone}</td>
      <td class="text-xs font-semibold">${table.capacity} pers.</td>
    `;

    TIME_SLOTS.forEach(slot => {
      const slotMin = timeToMinutes(slot);
      const res = reservations.find(r => {
        if (r.date !== selectedDate || r.tableNumber !== table.id || r.status === 'cancelada') return false;
        const matchesSearch = r.customerName.toLowerCase().includes(searchQuery) || r.phone.includes(searchQuery);
        if (!matchesSearch) return false;
        const start = timeToMinutes(r.time);
        const end = start + (r.duration || 90);
        return slotMin >= start && slotMin < end;
      });

      if (res) {
        const isStart = res.time === slot;
        html += `
          <td>
            <div class="slot-reserved slot-${res.status}" onclick="alert('Cliente: ${res.customerName}\\nTel: ${res.phone}\\nPersonas: ${res.guests}')">
              ${isStart ? `<span>${res.customerName.split(' ')[0]}</span><span>${res.guests}p</span>` : ''}
            </div>
          </td>
        `;
      } else {
        html += `
          <td>
            <button class="slot-free-btn" onclick="goToNewRes('${selectedDate}', '${slot}', ${table.id})">+</button>
          </td>
        `;
      }
    });

    tr.innerHTML = html;
    tbody.appendChild(tr);
  });

  renderDetailedList();
  updateToolbarStats();
}

function renderDetailedList() {
  const container = document.getElementById('reservations-list');
  if (!container) return;

  const reservations = getReservations().filter(r => r.date === selectedDate);
  container.innerHTML = '';

  if (reservations.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 2rem;">No hay reservas para esta fecha.</div>`;
    return;
  }

  reservations.forEach(res => {
    const card = document.createElement('div');
    card.className = 'res-card';
    card.innerHTML = `
      <div>
        <div class="res-header">
          <span class="table-badge">Mesa ${res.tableNumber}</span>
          <span class="status-badge slot-${res.status}">${res.status}</span>
        </div>
        <div class="res-name">${res.customerName}</div>
        <div class="res-contact">Tel: ${res.phone} ${res.email ? '| ' + res.email : ''}</div>
        <div class="res-meta">
          <span>🕒 ${res.time} hrs</span>
          <span>👥 ${res.guests} personas</span>
        </div>
        ${res.notes ? `<div class="res-notes">"${res.notes}"</div>` : ''}
      </div>
      <div class="res-actions">
        <select onchange="changeStatus('${res.id}', this.value)" class="select-filter">
          <option value="confirmada" ${res.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
          <option value="pendiente" ${res.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="cancelada" ${res.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
        </select>
        <button onclick="deleteRes('${res.id}')" style="color: #dc2626; background: none; border: none; cursor: pointer; font-weight: bold;">Eliminar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateToolbarStats() {
  const reservations = getReservations().filter(r => r.date === selectedDate && r.status !== 'cancelada');
  const countElem = document.getElementById('stat-count');
  const freeElem = document.getElementById('stat-free');

  if (countElem) countElem.textContent = reservations.length;
  if (freeElem) {
    const occupiedTables = new Set(reservations.map(r => r.tableNumber)).size;
    freeElem.textContent = TABLES.length - occupiedTables;
  }
}

function goToNewRes(date, time, tableId) {
  window.location.href = `nueva-reserva.html?date=${date}&time=${time}&table=${tableId}`;
}

function changeStatus(id, newStatus) {
  const reservations = getReservations().map(r => r.id === id ? { ...r, status: newStatus } : r);
  saveReservations(reservations);
  renderMatrix();
  showToast('Estado actualizado');
}

function deleteRes(id) {
  if (confirm('¿Eliminar reserva?')) {
    const reservations = getReservations().filter(r => r.id !== id);
    saveReservations(reservations);
    renderMatrix();
    showToast('Reserva eliminada');
  }
}

// Inicialización de Eventos para Páginas
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('selected-date');
  if (dateInput) {
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      renderMatrix();
    });
    renderMatrix();
  }

  // Lógica de Formulario de Nueva Reserva
  const newResForm = document.getElementById('new-reservation-form');
  if (newResForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    const timeParam = urlParams.get('time');
    const tableParam = urlParams.get('table');

    if (dateParam) document.getElementById('res-date').value = dateParam;
    else document.getElementById('res-date').value = selectedDate;
    
    if (timeParam) document.getElementById('res-time').value = timeParam;
    
    renderTablePicker(tableParam);

    document.getElementById('res-date').addEventListener('change', () => renderTablePicker());
    document.getElementById('res-time').addEventListener('change', () => renderTablePicker());

    newResForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customerName = document.getElementById('res-name').value.trim();
      const phone = document.getElementById('res-phone').value.trim();
      const email = document.getElementById('res-email').value.trim();
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const guests = parseInt(document.getElementById('res-guests').value);
      const tableNumber = parseInt(document.getElementById('selected-table-id').value);
      const notes = document.getElementById('res-notes').value.trim();

      if (!tableNumber) {
        showToast('Selecciona una mesa disponible', 'error');
        return;
      }

      if (checkConflict(date, time, tableNumber)) {
        showToast(`Mesa ${tableNumber} ocupada el ${date} a las ${time}`, 'error');
        return;
      }

      const newRes = {
        id: 'res-' + Date.now(),
        customerName, phone, email, date, time, guests, tableNumber, notes,
        duration: 90,
        status: 'confirmada'
      };

      const reservations = getReservations();
      reservations.unshift(newRes);
      saveReservations(reservations);
      showToast('¡Reserva registrada con éxito!');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });
  }
});

function renderTablePicker(preselectedTable = null) {
  const container = document.getElementById('table-picker-container');
  if (!container) return;

  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const tableInput = document.getElementById('selected-table-id');

  container.innerHTML = '';

  TABLES.forEach(table => {
    const isConflicted = checkConflict(date, time, table.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `table-select-btn ${isConflicted ? 'disabled' : ''}`;
    
    if (preselectedTable && parseInt(preselectedTable) === table.id && !isConflicted) {
      btn.classList.add('selected');
      tableInput.value = table.id;
    }

    btn.innerHTML = `
      <span style="font-weight: bold; font-size: 0.875rem;">Mesa ${table.id}</span>
      <span style="font-size: 0.65rem; opacity: 0.8;">${table.capacity}p | ${table.zone}</span>
      ${isConflicted ? '<span style="color: #dc2626; font-size: 0.65rem; font-weight: bold;">Ocupada</span>' : ''}
    `;

    if (!isConflicted) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.table-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        tableInput.value = table.id;
      });
    } else {
      btn.disabled = true;
    }

    container.appendChild(btn);
  });
}