/* ============================================================
   DDR — Ministère Pages
   Sidebar tabs: Dashboard, Signalements, Carte, Rapports, Alertes
   ============================================================ */

DDR.renderMinistere = function(params) {
  const tab = (params && params.sidebar) || DDR.state.currentSidebarTab || 'dashboard';
  DDR.state.currentSidebarTab = tab;
  const user = DDR.state.currentUser;
  if (!user) { DDR.renderLogin(); return; }

  const sidebar = DDR.buildSidebar(tab, 'ministere');
  const topnav  = DDR.buildTopNav('ministere');

  let content = '';
  switch(tab) {
    case 'dashboard': content = renderMinDashboard(); break;
    case 'reports':   content = renderMinReports(); break;
    case 'map':       content = renderMinMap(); break;
    case 'rapports':  content = renderMinRapports(); break;
    case 'alerts':    content = renderMinAlerts(); break;
    default:          content = renderMinDashboard();
  }

  document.getElementById('app').innerHTML = `
    ${topnav}
    <div class="layout-with-sidebar">
      ${sidebar}
      <div class="main-with-sidebar">
        <div class="page-content">${content}</div>
      </div>
    </div>
  `;

  if (tab === 'map') setTimeout(initMinMap, 100);
  if (tab === 'dashboard') setTimeout(initMinCharts, 100);
  if (tab === 'rapports') setTimeout(initRapportCharts, 100);
};

/* ==================== DASHBOARD ==================== */
function renderMinDashboard() {
  const s = DDR.getStats();
  return `
    <div class="page-header">
      <div class="page-title">📊 Tableau de bord</div>
      <div class="page-subtitle">Vue d'ensemble des signalements · Sénégal</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FF6B2B,#FF8C5A);">
        <div class="stat-icon">📋</div>
        <div class="stat-value">${s.totalReports}</div>
        <div class="stat-label">Total signalements</div>
        <div class="stat-change up">↑ +3 cette semaine</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FFD93D,#F0C91A);">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${s.pending}</div>
        <div class="stat-label">En attente</div>
        <div class="stat-change down">Nécessitent action</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#00D4AA,#00B08A);">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${s.validated + s.inProgress}</div>
        <div class="stat-label">Traités</div>
        <div class="stat-change up">↑ +5 ce mois</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#54A0FF,#2980b9);">
        <div class="stat-icon">👥</div>
        <div class="stat-value">${s.totalUsers}</div>
        <div class="stat-label">Citoyens actifs</div>
        <div class="stat-change up">↑ +12 ce mois</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-grid mb-xl">
      <div class="chart-card" style="grid-column:span 2;">
        <div class="chart-title">Signalements par type</div>
        <div class="chart-container"><canvas id="chart-type"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Statuts</div>
        <div class="chart-container"><canvas id="chart-status"></canvas></div>
      </div>
    </div>

    <!-- Recent reports requiring action -->
    <div class="section-header mb-md">
      <div class="section-title">⚡ Signalements urgents — En attente de décision</div>
      <button class="btn btn-outline btn-sm" onclick="DDR.navigate('ministere',{sidebar:'reports'})">Voir tout →</button>
    </div>
    <div class="report-list">
      ${DDR.state.reports.filter(r => r.status === 'en_attente').slice(0, 5).map(r => `
        <div class="report-card pending" style="cursor:default;">
          <div class="report-card-header">
            <div>
              <div class="report-card-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div>
              <div style="font-size:11px;color:var(--text-muted);">${r.zone} · ${DDR.timeAgo(r.date)} · par ${r.reportedByName}</div>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-accent btn-sm" onclick="quickValidate('${r.id}')">✅ Valider</button>
              <button class="btn btn-danger btn-sm" onclick="quickReject('${r.id}')">❌</button>
            </div>
          </div>
          <div class="report-card-body">${r.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function initMinCharts() {
  const s = DDR.getStats();
  const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9898B8', font: { family: 'Outfit', size: 11 } } } } };

  // Type chart
  const typeCtx = document.getElementById('chart-type');
  if (typeCtx && !DDR.state.charts['type']) {
    DDR.state.charts['type'] = new Chart(typeCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(s.byType),
        datasets: [{ label: 'Signalements', data: Object.values(s.byType), backgroundColor: ['#FF6B2B','#FFD93D','#00D4AA','#54A0FF','#FF4757','#9898B8'], borderRadius: 6, borderSkipped: false }]
      },
      options: { ...chartDefaults, scales: { x: { ticks: { color: '#9898B8', font: { family: 'Outfit', size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#9898B8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
    });
  }

  // Status donut
  const statusCtx = document.getElementById('chart-status');
  if (statusCtx && !DDR.state.charts['status']) {
    DDR.state.charts['status'] = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Validé', 'Rejeté', 'En cours', 'Terminé'],
        datasets: [{ data: [s.pending, s.validated, s.rejected, s.inProgress, s.done], backgroundColor: ['#FFD93D','#00D4AA','#FF4757','#FF6B2B','#8888AA'], borderColor: '#0A0A16', borderWidth: 3, hoverOffset: 8 }]
      },
      options: { ...chartDefaults, cutout: '65%' }
    });
  }
}

/* ==================== REPORTS TABLE ==================== */
function renderMinReports(filterArg) {
  const filter = filterArg || 'all';
  const reports = filter === 'all' ? DDR.state.reports : DDR.state.reports.filter(r => r.status === filter);

  return `
    <div class="page-header">
      <div class="page-title">📋 Signalements</div>
      <div class="page-subtitle">${DDR.state.reports.length} signalements au total</div>
    </div>

    <div class="filters-bar mb-md">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" class="form-input" placeholder="Rechercher..." id="report-search" oninput="filterReportsTable()" />
      </div>
      ${['all','en_attente','validé','rejeté','en_cours','terminé'].map(f => `
        <button class="filter-btn ${filter === f ? 'active' : ''}" onclick="applyReportFilter('${f}')">${{all:'Tous',en_attente:'⏳ En attente',validé:'✅ Validé',rejeté:'❌ Rejeté',en_cours:'🔧 En cours',terminé:'✔ Terminé'}[f]}</button>
      `).join('')}
    </div>

    <div class="data-table-wrapper card">
      <table class="data-table" id="reports-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Zone</th>
            <th>Description</th>
            <th>Citoyen</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="reports-tbody">
          ${reports.map(r => `
            <tr data-id="${r.id}">
              <td style="white-space:nowrap;font-weight:600;">${DDR.getTypeEmoji(r.type)} ${r.type}</td>
              <td><span class="badge badge-muted">${r.zone}</span></td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.description}">${r.description}</td>
              <td>👤 ${r.reportedByName}</td>
              <td style="white-space:nowrap;">${DDR.formatDate(r.date)}</td>
              <td>${DDR.getStatusBadge(r.status)}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-ghost btn-sm" onclick="viewReportModal('${r.id}')" title="Voir détails">👁️</button>
                  ${r.status === 'en_attente' ? `
                    <button class="btn btn-accent btn-sm" onclick="quickValidate('${r.id}')" title="Valider">✅</button>
                    <button class="btn btn-danger btn-sm" onclick="quickReject('${r.id}')" title="Rejeter">❌</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.applyReportFilter = function(filter) {
  const mainEl = document.querySelector('.main-with-sidebar .page-content');
  if (mainEl) { mainEl.innerHTML = renderMinReports(filter); }
};

window.filterReportsTable = function() {
  const q = document.getElementById('report-search') ? document.getElementById('report-search').value.toLowerCase() : '';
  const rows = document.querySelectorAll('#reports-tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
};

window.quickValidate = function(id) {
  const user = DDR.state.currentUser;
  DDR.validateReport(id, user);
  DDR.showToast('✅ Signalement validé ! Points attribués au citoyen.', 'success');
  DDR.renderMinistere({ sidebar: DDR.state.currentSidebarTab });
};

window.quickReject = function(id) {
  DDR.showModal(`
    <div class="form-group mb-lg">
      <div class="form-label">Motif de rejet</div>
      <textarea class="form-input" id="reject-reason" rows="3" placeholder="Précisez la raison du rejet..."></textarea>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-danger btn-lg flex-1" onclick="confirmReject('${id}')">Confirmer le rejet</button>
      <button class="btn btn-ghost btn-lg" onclick="DDR.hideModal()">Annuler</button>
    </div>
  `, 'Rejeter le signalement');
};

window.confirmReject = function(id) {
  const reason = document.getElementById('reject-reason') ? document.getElementById('reject-reason').value : 'Non conforme.';
  const user = DDR.state.currentUser;
  DDR.rejectReport(id, reason, user);
  DDR.hideModal();
  DDR.showToast('❌ Signalement rejeté.', 'warning');
  DDR.renderMinistere({ sidebar: DDR.state.currentSidebarTab });
};

window.viewReportModal = function(id) {
  const r = DDR.state.reports.find(rep => rep.id === id);
  if (!r) return;
  DDR.showModal(`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span style="font-size:36px;">${DDR.getTypeEmoji(r.type)}</span>
      <div>
        <div style="font-size:16px;font-weight:700;">${r.type}</div>
        ${DDR.getStatusBadge(r.status)}
      </div>
    </div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6;">${r.description}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
      <div style="background:var(--glass);border-radius:8px;padding:10px;"><div style="font-size:10px;color:var(--text-muted);">ZONE</div><div style="font-size:13px;font-weight:600;">${r.zone}</div></div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;"><div style="font-size:10px;color:var(--text-muted);">DATE</div><div style="font-size:13px;font-weight:600;">${DDR.formatDate(r.date)}</div></div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;"><div style="font-size:10px;color:var(--text-muted);">CITOYEN</div><div style="font-size:13px;font-weight:600;">${r.reportedByName}</div></div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;"><div style="font-size:10px;color:var(--text-muted);">VOTES</div><div style="font-size:13px;font-weight:600;">👍 ${r.upvotes}</div></div>
    </div>
    ${r.status === 'en_attente' ? `
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <button class="btn btn-accent btn-lg flex-1" onclick="quickValidate('${r.id}');DDR.hideModal();">✅ Valider</button>
        <button class="btn btn-danger btn-lg flex-1" onclick="DDR.hideModal();quickReject('${r.id}')">❌ Rejeter</button>
      </div>
    ` : ''}
    <button class="btn btn-ghost w-full" onclick="DDR.hideModal()">Fermer</button>
  `, 'Détail du signalement');
};

/* ==================== MAP ==================== */
function renderMinMap() {
  return `
    <div class="page-header">
      <div class="page-title">🗺️ Carte nationale</div>
      <div class="page-subtitle">Vue géographique de tous les signalements</div>
    </div>
    <div id="min-map" style="height:calc(100vh - 200px);border-radius:var(--radius);overflow:hidden;"></div>
  `;
}

function initMinMap() {
  if (DDR.state.leafletMap) { DDR.state.leafletMap.remove(); DDR.state.leafletMap = null; }
  const mapEl = document.getElementById('min-map');
  if (!mapEl) return;
  const map = L.map('min-map').setView([14.6928, -17.4467], 12);
  DDR.state.leafletMap = map;
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© DDR Sénégal', maxZoom: 19 }).addTo(map);
  const colors = { en_attente: '#FFD93D', validé: '#00D4AA', rejeté: '#FF4757', en_cours: '#FF6B2B', terminé: '#8888AA' };
  DDR.state.reports.forEach(function(r) {
    const color = colors[r.status] || '#FF6B2B';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid rgba(255,255,255,0.4);box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;">${DDR.getTypeEmoji(r.type)}</span></div>`,
      iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -35]
    });
    L.marker([r.lat, r.lng], { icon }).addTo(map).bindPopup(`
      <div class="map-popup">
        <div class="map-popup-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div>
        <div class="map-popup-desc">${r.description}</div>
        <div class="map-popup-meta">${DDR.getStatusBadge(r.status)}<span class="badge badge-muted">${r.zone}</span></div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Par ${r.reportedByName} · ${DDR.formatDate(r.date)}</div>
        ${r.status === 'en_attente' ? `<div style="margin-top:10px;display:flex;gap:6px;"><button class="btn btn-accent btn-sm" onclick="quickValidate('${r.id}')">✅ Valider</button><button class="btn btn-danger btn-sm" onclick="quickReject('${r.id}')">❌</button></div>` : ''}
      </div>
    `);
  });
}

/* ==================== RAPPORTS ==================== */
function renderMinRapports() {
  const s = DDR.getStats();
  const validationRate = Math.round((s.validated / Math.max(s.totalReports,1)) * 100);
  return `
    <div class="page-header">
      <div class="page-title">📄 Rapports & Statistiques</div>
      <div class="page-subtitle">Analyse des signalements — ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
    </div>

    <!-- KPIs -->
    <div class="stats-grid mb-xl">
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#00D4AA,#00B08A);">
        <div class="stat-icon">📊</div>
        <div class="stat-value">${validationRate}%</div>
        <div class="stat-label">Taux de validation</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FF6B2B,#FF8C5A);">
        <div class="stat-icon">⚡</div>
        <div class="stat-value">2.4j</div>
        <div class="stat-label">Délai moyen traitement</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#54A0FF,#2980b9);">
        <div class="stat-icon">🏙️</div>
        <div class="stat-value">12</div>
        <div class="stat-label">Zones couvertes</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FFD93D,#F0C91A);">
        <div class="stat-icon">🌍</div>
        <div class="stat-value">${s.totalUsers}</div>
        <div class="stat-label">Citoyens participants</div>
      </div>
    </div>

    <div class="charts-grid mb-xl">
      <div class="chart-card" style="grid-column:span 2;">
        <div class="chart-title">Evolution mensuelle des signalements (2026)</div>
        <div class="chart-container"><canvas id="chart-monthly"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Répartition par type</div>
        <div class="chart-container"><canvas id="chart-type-pie"></canvas></div>
      </div>
    </div>

    <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-xl);">
      <button class="btn btn-primary flex-1" onclick="DDR.showToast('Export PDF en cours de génération...','info')">📑 Exporter PDF</button>
      <button class="btn btn-ghost flex-1" onclick="DDR.showToast('Export Excel en cours de génération...','info')">📊 Exporter Excel</button>
    </div>
  `;
}

function initRapportCharts() {
  const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9898B8', font: { family: 'Outfit', size: 11 } } } } };
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];

  const monthlyCtx = document.getElementById('chart-monthly');
  if (monthlyCtx) {
    new Chart(monthlyCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Signalements', data: [8, 14, 11, 19, 15, DDR.state.reports.length], borderColor: '#FF6B2B', backgroundColor: 'rgba(255,107,43,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#FF6B2B', pointRadius: 5 },
          { label: 'Validés', data: [5, 9, 8, 13, 11, DDR.getStats().validated], borderColor: '#00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#00D4AA', pointRadius: 5 },
        ]
      },
      options: { ...chartDefaults, scales: { x: { ticks: { color: '#9898B8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#9898B8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
    });
  }

  const s = DDR.getStats();
  const pieCtx = document.getElementById('chart-type-pie');
  if (pieCtx) {
    new Chart(pieCtx, {
      type: 'polarArea',
      data: {
        labels: Object.keys(s.byType),
        datasets: [{ data: Object.values(s.byType), backgroundColor: ['rgba(255,107,43,0.7)','rgba(255,217,61,0.7)','rgba(0,212,170,0.7)','rgba(84,160,255,0.7)','rgba(255,71,87,0.7)','rgba(136,136,170,0.7)'] }]
      },
      options: { ...chartDefaults }
    });
  }
}

/* ==================== ALERTES ==================== */
function renderMinAlerts() {
  return `
    <div class="page-header">
      <div class="page-title">🔔 Gestion des Alertes</div>
      <div class="page-subtitle">Envoyez des alertes aux usagers de la route</div>
    </div>

    <!-- Create alert -->
    <div class="card mb-xl">
      <div class="section-title mb-md">➕ Créer une nouvelle alerte</div>
      <div style="display:flex;flex-direction:column;gap:var(--space-md);">
        <div class="form-group">
          <div class="form-label">Message d'alerte</div>
          <textarea class="form-input" id="new-alert-msg" rows="3" placeholder="Ex: Travaux d'urgence sur l'axe Corniche — Déviation obligatoire par Avenue Blaise Diagne..."></textarea>
        </div>
        <div style="display:flex;gap:var(--space-md);">
          <div class="form-group flex-1">
            <div class="form-label">Zone concernée</div>
            <select class="form-input form-select" id="new-alert-zone">
              ${['Toutes les zones','Plateau','Médina','Fann','Almadies','Ouakam','Yoff','Pikine','Liberté'].map(z => `<option>${z}</option>`).join('')}
            </select>
          </div>
          <div class="form-group flex-1">
            <div class="form-label">Niveau d'urgence</div>
            <select class="form-input form-select" id="new-alert-type">
              <option value="info">💡 Information</option>
              <option value="warning">⚠️ Avertissement</option>
              <option value="danger">🚨 Danger</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="sendNewAlert()">🚀 Envoyer à tous les usagers</button>
      </div>
    </div>

    <!-- Active alerts -->
    <div class="section-header mb-md">
      <div class="section-title">📍 Alertes actives</div>
      <span class="badge badge-danger">${DDR.state.alerts.filter(a => a.active).length} actives</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
      ${DDR.state.alerts.map(a => `
        <div class="alert-card ${a.type === 'danger' ? 'urgent' : a.type === 'warning' ? 'warn' : 'info'}">
          <span style="font-size:28px;">${a.icon}</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:700;">${a.title}</div>
            <div style="font-size:12px;opacity:0.8;margin-top:3px;">${a.message}</div>
            <div style="font-size:10px;opacity:0.6;margin-top:4px;">${DDR.timeAgo(a.time)} — ${a.zone}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${a.active ? '<span class="badge badge-accent" style="font-size:9px;">ACTIVE</span>' : '<span class="badge badge-muted" style="font-size:9px;">INACTIVE</span>'}
            <button class="btn btn-ghost btn-sm" onclick="toggleAlert('${a.id}')" style="font-size:10px;">${a.active ? 'Désactiver' : 'Activer'}</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

window.sendNewAlert = function() {
  const msg = document.getElementById('new-alert-msg') ? document.getElementById('new-alert-msg').value.trim() : '';
  if (!msg) { DDR.showToast('Veuillez entrer un message', 'warning'); return; }
  const zone = document.getElementById('new-alert-zone') ? document.getElementById('new-alert-zone').value : 'Toutes les zones';
  const type = document.getElementById('new-alert-type') ? document.getElementById('new-alert-type').value : 'info';
  const icons = { info: '💡', warning: '⚠️', danger: '🚨' };
  DDR.state.alerts.unshift({
    id: 'a' + Date.now(), type, icon: icons[type],
    title: 'Alerte Ministère', message: msg,
    lat: 14.6928, lng: -17.4467, zone, time: new Date().toISOString(), active: true
  });
  DDR.showToast('🚀 Alerte envoyée à tous les usagers !', 'success');
  DDR.renderMinistere({ sidebar: 'alerts' });
};

window.toggleAlert = function(id) {
  const idx = DDR.state.alerts.findIndex(a => a.id === id);
  if (idx !== -1) {
    DDR.state.alerts[idx].active = !DDR.state.alerts[idx].active;
    DDR.renderMinistere({ sidebar: 'alerts' });
  }
};
