/* ============================================================
   DDR — Super Admin Pages
   Sidebar: Vue globale, Utilisateurs, Carte & IA, Analytics, Caméras, Logs, Paramètres
   ============================================================ */

DDR.renderAdmin = function(params) {
  const tab = (params && params.sidebar) || DDR.state.currentSidebarTab || 'dashboard';
  DDR.state.currentSidebarTab = tab;
  const user = DDR.state.currentUser;
  if (!user) { DDR.renderLogin(); return; }

  const sidebar = DDR.buildSidebar(tab, 'admin');
  const topnav  = DDR.buildTopNav('admin');

  let content = '';
  switch(tab) {
    case 'dashboard':  content = renderAdminDashboard(); break;
    case 'users':      content = renderAdminUsers(); break;
    case 'map':        content = renderAdminMap(); break;
    case 'analytics':  content = renderAdminAnalytics(); break;
    case 'cameras':    content = renderAdminCameras(); break;
    case 'logs':       content = renderAdminLogs(); break;
    case 'settings':   content = renderAdminSettings(); break;
    default:           content = renderAdminDashboard();
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

  if (tab === 'dashboard') setTimeout(initAdminCharts, 100);
  if (tab === 'map') setTimeout(initAdminMap, 100);
  if (tab === 'analytics') setTimeout(initAnalyticsCharts, 100);
};

/* ==================== DASHBOARD ==================== */
function renderAdminDashboard() {
  const s = DDR.getStats();
  const reports = DDR.state.reports;
  return `
    <div class="page-header">
      <div class="page-title">📊 Vue Globale — Super Admin</div>
      <div class="page-subtitle">Supervision complète de l'application DDR · ${new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
    </div>

    <!-- KPI Grid -->
    <div class="stats-grid mb-xl">
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FF6B2B,#FF8C5A);">
        <div class="stat-icon">📋</div>
        <div class="stat-value">${s.totalReports}</div>
        <div class="stat-label">Signalements totaux</div>
        <div class="stat-change up">↑ +3 cette semaine</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#00D4AA,#00B08A);">
        <div class="stat-icon">👥</div>
        <div class="stat-value">${s.totalUsers}</div>
        <div class="stat-label">Citoyens inscrits</div>
        <div class="stat-change up">↑ +2 aujourd'hui</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#FFD93D,#F0C91A);">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${s.pending}</div>
        <div class="stat-label">En attente validation</div>
        <div class="stat-change down">Action requise</div>
      </div>
      <div class="stat-card" style="--gradient:linear-gradient(90deg,#54A0FF,#2980b9);">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${Math.round((s.validated / Math.max(s.totalReports,1)) * 100)}%</div>
        <div class="stat-label">Taux de validation</div>
        <div class="stat-change up">↑ Excellent</div>
      </div>
    </div>

    <!-- System health -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-xl);">
      <div class="card ai-panel">
        <div class="ai-header">
          <span class="ai-icon">🤖</span>
          <div>
            <div class="ai-title">IA Prédictive</div>
            <div class="ai-subtitle">Modèle v2.3 — Actif</div>
          </div>
          <div class="ai-confidence">Confiance: 87%</div>
        </div>
        <div class="risk-zones">
          <div class="risk-zone"><div class="risk-level risk-high">ÉLEVÉ</div><div class="risk-name">Pikine Est</div><div class="risk-prob">91%</div></div>
          <div class="risk-zone"><div class="risk-level risk-med">MOYEN</div><div class="risk-name">Guédiawaye</div><div class="risk-prob">67%</div></div>
          <div class="risk-zone"><div class="risk-level risk-low">FAIBLE</div><div class="risk-name">Plateau</div><div class="risk-prob">23%</div></div>
        </div>
      </div>
      <div class="card" style="display:flex;flex-direction:column;gap:var(--space-md);">
        <div class="section-title">🖥️ État du système</div>
        ${[
          ['Serveur principal', true, '99.9%'],
          ['Base de données', true, '98.1%'],
          ['Module IA', true, '100%'],
          ['Caméras IP', false, '87.5%'],
        ].map(([name, ok, uptime]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--glass);border-radius:8px;">
            <div class="status-dot ${ok ? 'online' : 'offline'}"></div>
            <span style="flex:1;font-size:13px;">${name}</span>
            <span style="font-size:12px;color:${ok? 'var(--accent)':'var(--danger)'};font-weight:700;">${uptime} uptime</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid mb-xl">
      <div class="chart-card" style="grid-column:span 2;">
        <div class="chart-title">Activité hebdomadaire — Signalements & Validations</div>
        <div class="chart-container"><canvas id="admin-chart-week"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Distribution par statut</div>
        <div class="chart-container"><canvas id="admin-chart-status"></canvas></div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="section-header mb-md">
      <div class="section-title">🕐 Activité récente</div>
      <button class="btn btn-ghost btn-sm" onclick="DDR.navigate('admin',{sidebar:'logs'})">Voir logs →</button>
    </div>
    <div class="log-list">
      ${DDR.state.logs.slice(0, 8).map(l => `
        <div class="log-item">
          <span class="log-time">${l.time}</span>
          <span class="log-type log-${l.type}">${l.type}</span>
          <span class="log-msg">${l.msg}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function initAdminCharts() {
  const s = DDR.getStats();
  const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9898B8', font: { family: 'Outfit', size: 11 } } } } };

  const weekCtx = document.getElementById('admin-chart-week');
  if (weekCtx && !DDR.state.charts['admin-week']) {
    DDR.state.charts['admin-week'] = new Chart(weekCtx, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          { label: 'Signalements', data: [3, 5, 2, 7, 4, 6, 3], backgroundColor: 'rgba(255,107,43,0.7)', borderRadius: 6, borderSkipped: false },
          { label: 'Validations', data: [2, 3, 2, 5, 3, 4, 2], backgroundColor: 'rgba(0,212,170,0.7)', borderRadius: 6, borderSkipped: false },
        ]
      },
      options: { ...chartDefaults, scales: { x: { ticks: { color: '#9898B8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#9898B8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255,255,255,0.04)' } } } }
    });
  }

  const statusCtx = document.getElementById('admin-chart-status');
  if (statusCtx && !DDR.state.charts['admin-status']) {
    DDR.state.charts['admin-status'] = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['En attente', 'Validé', 'Rejeté', 'En cours', 'Terminé'],
        datasets: [{ data: [s.pending, s.validated, s.rejected, s.inProgress, s.done], backgroundColor: ['#FFD93D','#00D4AA','#FF4757','#FF6B2B','#8888AA'], borderColor: '#0A0A16', borderWidth: 3 }]
      },
      options: { ...chartDefaults, cutout: '65%' }
    });
  }
}

/* ==================== USERS ==================== */
function renderAdminUsers() {
  const users = DDR.state.users;
  const roleColors = { citoyen: 'badge-primary', ministere: 'badge-accent', admin: 'badge-info' };
  return `
    <div class="page-header">
      <div class="page-title">👥 Gestion des utilisateurs</div>
      <div class="page-subtitle">${users.length} utilisateurs enregistrés</div>
    </div>

    <div style="display:flex;gap:var(--space-md);margin-bottom:var(--space-lg);">
      <button class="btn btn-primary" onclick="showAddUserModal()">➕ Ajouter utilisateur</button>
      <div class="search-input-wrapper" style="flex:1;position:relative;">
        <span class="search-icon">🔍</span>
        <input type="text" class="form-input" placeholder="Rechercher..." id="user-search" oninput="filterUsersTable()" style="padding-left:40px;" />
      </div>
    </div>

    <div class="data-table-wrapper card">
      <table class="data-table" id="users-table">
        <thead>
          <tr><th>Avatar</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Zone</th><th>Points</th><th>Signalements</th><th>Inscription</th><th>Actions</th></tr>
        </thead>
        <tbody id="users-tbody">
          ${users.map(u => `
            <tr data-id="${u.id}">
              <td><div class="avatar ${u.role === 'admin' ? 'avatar-info' : u.role === 'ministere' ? 'avatar-accent' : 'avatar-primary'}">${u.avatar}</div></td>
              <td style="font-weight:600;">${u.name}</td>
              <td style="font-size:12px;">${u.email}</td>
              <td><span class="badge ${roleColors[u.role] || 'badge-muted'}">${u.role}</span></td>
              <td>${u.zone}</td>
              <td>⭐ ${u.points}</td>
              <td>${u.signalements}</td>
              <td style="font-size:12px;">${DDR.formatDate(u.joined)}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-ghost btn-sm" onclick="showEditUserModal('${u.id}')" title="Modifier">✏️</button>
                  ${u.id !== DDR.state.currentUser.id ? `<button class="btn btn-danger btn-sm" onclick="deleteUserConfirm('${u.id}')" title="Supprimer">🗑️</button>` : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.filterUsersTable = function() {
  const q = document.getElementById('user-search') ? document.getElementById('user-search').value.toLowerCase() : '';
  document.querySelectorAll('#users-tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};

window.showAddUserModal = function() {
  DDR.showModal(`
    <form onsubmit="submitAddUser(event)">
      <div style="display:flex;flex-direction:column;gap:var(--space-md);">
        <div class="form-group"><div class="form-label">Nom complet</div><input type="text" class="form-input" id="new-user-name" required placeholder="Prénom Nom" /></div>
        <div class="form-group"><div class="form-label">Email</div><input type="email" class="form-input" id="new-user-email" required placeholder="email@example.sn" /></div>
        <div class="form-group"><div class="form-label">Mot de passe</div><input type="password" class="form-input" id="new-user-pwd" required placeholder="Mot de passe" /></div>
        <div class="form-group"><div class="form-label">Rôle</div>
          <select class="form-input form-select" id="new-user-role">
            <option value="citoyen">Citoyen</option>
            <option value="ministere">Ministère</option>
            <option value="admin">Super Admin</option>
          </select>
        </div>
        <div class="form-group"><div class="form-label">Zone</div>
          <select class="form-input form-select" id="new-user-zone">
            ${['Plateau','Médina','Fann','Point E','Almadies','Ouakam','Yoff','Pikine','Liberté','National','Global'].map(z => `<option>${z}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button type="submit" class="btn btn-primary flex-1">✅ Créer l'utilisateur</button>
          <button type="button" class="btn btn-ghost" onclick="DDR.hideModal()">Annuler</button>
        </div>
      </div>
    </form>
  `, 'Ajouter un utilisateur');
};

window.submitAddUser = function(e) {
  e.preventDefault();
  const name = document.getElementById('new-user-name').value;
  const email = document.getElementById('new-user-email').value;
  const password = document.getElementById('new-user-pwd').value;
  const role = document.getElementById('new-user-role').value;
  const zone = document.getElementById('new-user-zone').value;
  const avatar = name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  DDR.addUser({ name, email, password, role, zone, avatar });
  DDR.hideModal();
  DDR.showToast('✅ Utilisateur ' + name + ' créé avec succès', 'success');
  DDR.renderAdmin({ sidebar: 'users' });
};

window.showEditUserModal = function(id) {
  const u = DDR.state.users.find(us => us.id === id);
  if (!u) return;
  DDR.showModal(`
    <div style="display:flex;flex-direction:column;gap:var(--space-md);">
      <div class="form-group"><div class="form-label">Nom</div><input type="text" class="form-input" id="edit-user-name" value="${u.name}" /></div>
      <div class="form-group"><div class="form-label">Email</div><input type="email" class="form-input" id="edit-user-email" value="${u.email}" /></div>
      <div class="form-group"><div class="form-label">Rôle</div>
        <select class="form-input form-select" id="edit-user-role">
          <option value="citoyen" ${u.role==='citoyen'?'selected':''}>Citoyen</option>
          <option value="ministere" ${u.role==='ministere'?'selected':''}>Ministère</option>
          <option value="admin" ${u.role==='admin'?'selected':''}>Super Admin</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn btn-primary flex-1" onclick="submitEditUser('${id}')">💾 Enregistrer</button>
        <button class="btn btn-ghost" onclick="DDR.hideModal()">Annuler</button>
      </div>
    </div>
  `, 'Modifier: ' + u.name);
};

window.submitEditUser = function(id) {
  const idx = DDR.state.users.findIndex(u => u.id === id);
  if (idx === -1) return;
  const name = document.getElementById('edit-user-name') ? document.getElementById('edit-user-name').value : '';
  const email = document.getElementById('edit-user-email') ? document.getElementById('edit-user-email').value : '';
  const role = document.getElementById('edit-user-role') ? document.getElementById('edit-user-role').value : '';
  if (name) DDR.state.users[idx].name = name;
  if (email) DDR.state.users[idx].email = email;
  if (role) DDR.state.users[idx].role = role;
  DDR.saveToStorage();
  DDR.hideModal();
  DDR.showToast('✅ Utilisateur modifié', 'success');
  DDR.renderAdmin({ sidebar: 'users' });
};

window.deleteUserConfirm = function(id) {
  const u = DDR.state.users.find(us => us.id === id);
  if (!u) return;
  DDR.showModal(`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">Supprimer ${u.name} ?</div>
      <div style="font-size:13px;color:var(--text-secondary);">Cette action est irréversible. Tous les signalements de cet utilisateur seront conservés.</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-danger flex-1 btn-lg" onclick="confirmDeleteUser('${id}')">🗑️ Supprimer</button>
      <button class="btn btn-ghost btn-lg flex-1" onclick="DDR.hideModal()">Annuler</button>
    </div>
  `, 'Confirmation');
};

window.confirmDeleteUser = function(id) {
  DDR.deleteUser(id);
  DDR.hideModal();
  DDR.showToast('🗑️ Utilisateur supprimé', 'warning');
  DDR.renderAdmin({ sidebar: 'users' });
};

/* ==================== MAP & IA ==================== */
function renderAdminMap() {
  return `
    <div class="page-header">
      <div class="page-title">🗺️ Carte & Intelligence Artificielle</div>
      <div class="page-subtitle">Visualisation géographique + IA prédictive temps réel</div>
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--space-lg);height:calc(100vh - 180px);min-height:500px;">
      <div id="admin-map" style="border-radius:var(--radius);overflow:hidden;"></div>
      <div style="display:flex;flex-direction:column;gap:var(--space-md);overflow-y:auto;">
        <div class="ai-panel">
          <div class="ai-header">
            <span class="ai-icon">🤖</span>
            <div>
              <div class="ai-title">IA Prédictive DDR</div>
              <div class="ai-subtitle">Analyse temps réel — modèle v2.3</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:var(--space-md);padding:8px 12px;background:var(--glass);border-radius:8px;">
            <div class="status-dot online"></div>
            <span style="font-size:12px;">Modèle actif</span>
            <div class="ai-confidence">87% confiance</div>
          </div>
          <div class="risk-zones">
            <div class="risk-zone"><div class="risk-level risk-high">CRITIQUE</div><div class="risk-name">Pikine Est</div><div class="risk-prob">91%</div></div>
            <div class="risk-zone"><div class="risk-level risk-high">ÉLEVÉ</div><div class="risk-name">Guédiawaye N.</div><div class="risk-prob">78%</div></div>
            <div class="risk-zone"><div class="risk-level risk-med">MOYEN</div><div class="risk-name">Parcelles Ass.</div><div class="risk-prob">62%</div></div>
            <div class="risk-zone"><div class="risk-level risk-med">MOYEN</div><div class="risk-name">Médina Centre</div><div class="risk-prob">55%</div></div>
            <div class="risk-zone"><div class="risk-level risk-low">FAIBLE</div><div class="risk-name">Almadies</div><div class="risk-prob">21%</div></div>
            <div class="risk-zone"><div class="risk-level risk-low">FAIBLE</div><div class="risk-name">Plateau</div><div class="risk-prob">15%</div></div>
          </div>
          <button class="btn btn-accent w-full" style="margin-top:var(--space-md);" onclick="DDR.showToast('🤖 Analyse IA relancée — Résultats dans 30s','info')">🔄 Relancer l'analyse</button>
        </div>

        <div class="card">
          <div class="section-title mb-md">📍 Statistiques carte</div>
          ${[['Total markers', DDR.state.reports.length], ['En attente', DDR.state.reports.filter(r=>r.status==='en_attente').length], ['Zones à risque IA', '6'], ['Caméras actives', '7/8']].map(([lbl, val]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;">
              <span style="color:var(--text-secondary);">${lbl}</span>
              <span style="font-weight:700;color:var(--primary);">${val}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initAdminMap() {
  if (DDR.state.leafletMap) { DDR.state.leafletMap.remove(); DDR.state.leafletMap = null; }
  const mapEl = document.getElementById('admin-map');
  if (!mapEl) return;
  const map = L.map('admin-map').setView([14.6928, -17.4467], 12);
  DDR.state.leafletMap = map;
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© DDR Admin', maxZoom: 19 }).addTo(map);

  // AI risk zones (colored circles)
  const riskZones = [
    { latlng: [14.7488, -17.3928], r: 1500, color: '#FF4757', zone: 'Pikine Est — Risque CRITIQUE (91%)' },
    { latlng: [14.7580, -17.4000], r: 1200, color: '#FF6B2B', zone: 'Guédiawaye N. — Risque ÉLEVÉ (78%)' },
    { latlng: [14.7650, -17.4200], r: 1000, color: '#FFD93D', zone: 'Parcelles Ass. — Risque MOYEN (62%)' },
    { latlng: [14.6850, -17.4467], r: 800, color: '#FFD93D', zone: 'Médina — Risque MOYEN (55%)' },
  ];
  riskZones.forEach(function(z) {
    L.circle(z.latlng, { radius: z.r, color: z.color, fillColor: z.color, fillOpacity: 0.12, weight: 1.5, dashArray: '6,4' }).addTo(map).bindPopup('<div class="map-popup"><div class="map-popup-title">🤖 Zone IA</div><div class="map-popup-desc">' + z.zone + '</div></div>');
  });

  // All reports
  const colors = { en_attente: '#FFD93D', validé: '#00D4AA', rejeté: '#FF4757', en_cours: '#FF6B2B', terminé: '#8888AA' };
  DDR.state.reports.forEach(function(r) {
    const color = colors[r.status] || '#FF6B2B';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.4);box-shadow:0 3px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:12px;">${DDR.getTypeEmoji(r.type)}</span></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30]
    });
    L.marker([r.lat, r.lng], { icon }).addTo(map).bindPopup(`<div class="map-popup"><div class="map-popup-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div><div class="map-popup-desc">${r.description}</div><div class="map-popup-meta">${DDR.getStatusBadge(r.status)}<span class="badge badge-muted">${r.zone}</span></div></div>`);
  });
}

/* ==================== ANALYTICS ==================== */
function renderAdminAnalytics() {
  return `
    <div class="page-header">
      <div class="page-title">📈 Analytics</div>
      <div class="page-subtitle">Analyse avancée des données DDR</div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:var(--space-lg);">
      ${['7 derniers jours','30 jours','3 mois','Tout'].map((p,i) => `<button class="filter-btn ${i===1?'active':''}" onclick="DDR.showToast('Période modifiée: ${p}','info')">${p}</button>`).join('')}
    </div>

    <div class="charts-grid mb-xl">
      <div class="chart-card" style="grid-column:span 2;">
        <div class="chart-title">Évolution mensuelle (2026)</div>
        <div class="chart-container"><canvas id="analytics-monthly"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Top zones signalements</div>
        <div class="chart-container"><canvas id="analytics-zones"></canvas></div>
      </div>

      <div class="chart-card" style="grid-column:span 2;">
        <div class="chart-title">Signalements par type</div>
        <div class="chart-container"><canvas id="analytics-types"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">Répartition statuts</div>
        <div class="chart-container"><canvas id="analytics-status"></canvas></div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="section-header mb-md">
      <div class="section-title">🏆 Top Citoyens — Classement</div>
    </div>
    <div class="leaderboard">
      ${DDR.getStats().leaderboard.slice(0, 5).map((u, i) => {
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        return `
          <div class="leaderboard-item">
            <div class="leaderboard-rank ${i < 3 ? 'top3' : ''}">${medals[i+1] || (i+1)}</div>
            <div class="avatar avatar-primary" style="width:32px;height:32px;font-size:12px;">${u.avatar}</div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:600;">${u.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${u.zone} · ${u.signalements} signalements</div>
            </div>
            <div class="leaderboard-pts">⭐ ${u.points}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function initAnalyticsCharts() {
  const s = DDR.getStats();
  const chartDefaults = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9898B8', font: { family: 'Outfit', size: 11 } } } } };

  const monthlyCtx = document.getElementById('analytics-monthly');
  if (monthlyCtx) new Chart(monthlyCtx, {
    type: 'line',
    data: { labels: ['Jan','Fév','Mar','Avr','Mai','Juin'], datasets: [
      { label: 'Signalements', data: [8,14,11,19,15,DDR.state.reports.length], borderColor:'#FF6B2B', backgroundColor:'rgba(255,107,43,0.1)', tension:0.4, fill:true, pointRadius:5 },
      { label: 'Validations', data: [5,9,8,13,11,s.validated], borderColor:'#00D4AA', backgroundColor:'rgba(0,212,170,0.1)', tension:0.4, fill:true, pointRadius:5 },
      { label: 'Citoyens actifs', data: [12,18,22,28,31,s.totalUsers], borderColor:'#54A0FF', tension:0.4, pointRadius:5 },
    ]},
    options: { ...chartDefaults, scales: { x:{ ticks:{color:'#9898B8',font:{family:'Outfit'}}, grid:{color:'rgba(255,255,255,0.04)'} }, y:{ticks:{color:'#9898B8',font:{family:'Outfit'}}, grid:{color:'rgba(255,255,255,0.04)'}} } }
  });

  const zonesCtx = document.getElementById('analytics-zones');
  if (zonesCtx) new Chart(zonesCtx, {
    type: 'bar',
    data: { labels: ['Pikine','Plateau','Liberté','Ouakam','Médina','Fann'], datasets: [{ label:'Signalements', data:[4,3,2,2,2,1], backgroundColor:'rgba(255,107,43,0.7)', borderRadius:6, borderSkipped:false }] },
    options: { ...chartDefaults, indexAxis:'y', scales: { x:{ticks:{color:'#9898B8',font:{family:'Outfit'}},grid:{color:'rgba(255,255,255,0.04)'}}, y:{ticks:{color:'#9898B8',font:{family:'Outfit'}},grid:{color:'rgba(255,255,255,0.04)'}} } }
  });

  const typesCtx = document.getElementById('analytics-types');
  if (typesCtx) new Chart(typesCtx, {
    type: 'bar',
    data: { labels: Object.keys(s.byType), datasets: [{ label:'Occurrences', data:Object.values(s.byType), backgroundColor:['#FF6B2B','#FFD93D','#00D4AA','#54A0FF','#FF4757','#9898B8'], borderRadius:6, borderSkipped:false }] },
    options: { ...chartDefaults, scales: { x:{ticks:{color:'#9898B8',font:{family:'Outfit',size:10}},grid:{color:'rgba(255,255,255,0.04)'}}, y:{ticks:{color:'#9898B8',font:{family:'Outfit'}},grid:{color:'rgba(255,255,255,0.04)'}} } }
  });

  const statusCtx = document.getElementById('analytics-status');
  if (statusCtx) new Chart(statusCtx, {
    type: 'doughnut',
    data: { labels: ['En attente','Validé','Rejeté','En cours','Terminé'], datasets: [{ data:[s.pending,s.validated,s.rejected,s.inProgress,s.done], backgroundColor:['#FFD93D','#00D4AA','#FF4757','#FF6B2B','#8888AA'], borderColor:'#0A0A16', borderWidth:3 }] },
    options: { ...chartDefaults, cutout:'65%' }
  });
}

/* ==================== CAMERAS ==================== */
function renderAdminCameras() {
  const cameras = [
    { id:'CAM-01', zone:'Plateau — Av. République', online:true },
    { id:'CAM-02', zone:'Médina — Marché Tilène', online:true },
    { id:'CAM-03', zone:'Corniche Ouest', online:true },
    { id:'CAM-04', zone:'Pikine — Carrefour', online:false },
    { id:'CAM-05', zone:'Ouakam — Rond-point', online:true },
    { id:'CAM-06', zone:'Almadies — Cité Keur Gorgui', online:true },
    { id:'CAM-07', zone:'Parcelles Ass.', online:true },
    { id:'CAM-08', zone:'Yoff — Aéroport Route', online:true },
  ];
  return `
    <div class="page-header">
      <div class="page-title">🎥 Caméras IP</div>
      <div class="page-subtitle">${cameras.filter(c=>c.online).length}/${cameras.length} caméras en ligne · Surveillance temps réel</div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:var(--space-lg);">
      <span class="badge badge-accent">✅ ${cameras.filter(c=>c.online).length} En ligne</span>
      <span class="badge badge-danger">❌ ${cameras.filter(c=>!c.online).length} Hors ligne</span>
    </div>

    <div class="camera-grid">
      ${cameras.map(cam => `
        <div class="${cam.online ? '' : 'camera-offline'}">
          <div class="camera-feed">
            <div class="camera-static">${cam.online ? '🎥' : '📵'}</div>
            <div class="camera-overlay">
              <div>
                <div class="camera-info">${cam.id}</div>
                <div style="font-size:9px;color:#fff;opacity:0.7;margin-top:2px;">${cam.zone}</div>
              </div>
              <div class="camera-status-row">
                ${cam.online ? `<div class="cam-live">● LIVE</div><div class="status-dot online"></div>` : `<div style="font-size:9px;background:rgba(0,0,0,0.7);color:#FF4757;padding:3px 8px;border-radius:3px;font-weight:800;">OFFLINE</div>`}
              </div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:11px;color:var(--text-muted);">
            <span>${cam.zone}</span>
            <button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:10px;" onclick="DDR.showToast('Caméra ${cam.id}: ${cam.online ? 'Connexion directe...':'Tentative de reconnexion...'}','info')">${cam.online ? '🔍 Voir plein écran' : '🔄 Reconnecter'}</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==================== LOGS ==================== */
function renderAdminLogs() {
  return `
    <div class="page-header">
      <div class="page-title">📋 Logs Système</div>
      <div class="page-subtitle">${DDR.state.logs.length} événements enregistrés</div>
    </div>

    <div class="filters-bar mb-lg">
      ${['Tous','INFO','SUCCESS','WARNING','ERROR'].map((t,i) => `<button class="filter-btn ${i===0?'active':''}" onclick="filterLogs('${t}',this)">${t}</button>`).join('')}
      <div class="search-input-wrapper" style="flex:1;">
        <span class="search-icon">🔍</span>
        <input class="form-input" placeholder="Rechercher dans les logs..." id="log-search" oninput="searchLogs()" style="padding-left:40px;" />
      </div>
      <button class="btn btn-ghost btn-sm" onclick="DDR.showToast('Export logs CSV en cours...','info')">📥 Export CSV</button>
    </div>

    <div class="log-list" id="log-list">
      ${DDR.state.logs.map(l => `
        <div class="log-item" data-type="${l.type}">
          <span class="log-time">${l.time}</span>
          <span class="log-type log-${l.type}">${l.type}</span>
          <span class="log-msg">${l.msg}</span>
        </div>
      `).join('')}
    </div>
  `;
}

window.filterLogs = function(type, btn) {
  document.querySelectorAll('.filters-bar .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#log-list .log-item').forEach(item => {
    item.style.display = (type === 'Tous' || item.dataset.type === type) ? '' : 'none';
  });
};

window.searchLogs = function() {
  const q = document.getElementById('log-search') ? document.getElementById('log-search').value.toLowerCase() : '';
  document.querySelectorAll('#log-list .log-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};

/* ==================== SETTINGS ==================== */
function renderAdminSettings() {
  return `
    <div class="page-header">
      <div class="page-title">⚙️ Paramètres</div>
      <div class="page-subtitle">Configuration globale de l'application DDR</div>
    </div>

    <div style="max-width:640px;">
      <!-- General -->
      <div class="card mb-lg">
        <div class="section-title mb-md">🌐 Configuration générale</div>
        ${[
          ['Nom de l\'application', 'DDR — Day Daw Rek'],
          ['Version', 'v1.0.0'],
          ['Pays', 'Sénégal 🇸🇳'],
          ['Langue par défaut', 'Français'],
          ['Fuseau horaire', 'UTC+0 (Dakar)'],
        ].map(([lbl, val]) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:13px;color:var(--text-secondary);">${lbl}</span>
            <span style="font-size:13px;font-weight:600;">${val}</span>
          </div>
        `).join('')}
      </div>

      <!-- Features -->
      <div class="card mb-lg">
        <div class="section-title mb-md">🔧 Fonctionnalités</div>
        ${[
          ['Système de récompenses', true],
          ['IA prédictive', true],
          ['Alertes automatiques', true],
          ['Caméras IP', true],
          ['Mode maintenance', false],
          ['Inscriptions ouvertes', true],
        ].map(([lbl, on]) => `
          <div class="settings-item">
            <span style="font-size:14px;font-weight:500;">${lbl}</span>
            <div class="toggle-switch ${on ? 'on' : ''}" onclick="this.classList.toggle('on');DDR.showToast('Paramètre modifié','info')"></div>
          </div>
        `).join('')}
      </div>

      <!-- IA Config -->
      <div class="card mb-lg">
        <div class="section-title mb-md">🤖 Configuration IA</div>
        <div class="form-group mb-md">
          <div class="form-label">Seuil d'alerte automatique (%)</div>
          <input type="range" min="50" max="95" value="75" style="width:100%;accent-color:var(--primary);" oninput="document.getElementById('ai-threshold').textContent=this.value+'%'" />
          <div style="text-align:center;color:var(--primary);font-weight:700;margin-top:4px;" id="ai-threshold">75%</div>
        </div>
        <div class="form-group">
          <div class="form-label">Rayon d'analyse (km)</div>
          <select class="form-input form-select">
            <option>3 km</option><option>5 km</option><option>10 km</option><option>50 km (National)</option>
          </select>
        </div>
        <button class="btn btn-accent w-full" style="margin-top:var(--space-md);" onclick="DDR.showToast('✅ Configuration IA sauvegardée','success')">💾 Sauvegarder configuration IA</button>
      </div>

      <button class="btn btn-primary btn-lg w-full mb-md" onclick="DDR.showToast('✅ Tous les paramètres sauvegardés','success')">💾 Sauvegarder tous les paramètres</button>
      <button class="btn btn-danger btn-lg w-full" onclick="DDR.showToast('⚠️ Réinitialisation annulée — Action protégée','warning')">🔄 Réinitialiser l'application</button>
    </div>
  `;
}
