/* ============================================================
   DDR — Citoyen Pages
   Tabs: Accueil, Carte, Signaler, Récompenses, Profil
   ============================================================ */

DDR.renderCitoyen = function(params) {
  const tab = (params && params.tab) || DDR.state.currentTab || 'home';
  DDR.state.currentTab = tab;
  const user = DDR.state.currentUser;
  if (!user) { DDR.renderLogin(); return; }

  const topnav = DDR.buildTopNav('citoyen');
  const bottomNav = DDR.buildBottomNav(tab);

  let content = '';
  switch(tab) {
    case 'home':    content = renderHome(user); break;
    case 'map':     content = renderMap(); break;
    case 'signal':  content = renderSignal(); break;
    case 'rewards': content = renderRewards(user); break;
    case 'profile': content = renderProfile(user); break;
    default:        content = renderHome(user);
  }

  document.getElementById('app').innerHTML = topnav + '<div id="citoyen-main" class="page-content-bottom">' + content + '</div>' + bottomNav;

  // Post-render hooks
  if (tab === 'map') initCitoyenMap();
  if (tab === 'signal') initSignalForm();
  if (tab === 'rewards') animatePoints(user.points);
};

/* ==================== HOME ==================== */
function renderHome(user) {
  const myReports = DDR.state.reports.filter(r => r.reportedBy === user.id);
  const nearbyAlerts = DDR.state.alerts.filter(a => a.active).slice(0, 3);
  const nearbyReports = DDR.state.reports.filter(r => r.status === 'en_attente' || r.status === 'en_cours').slice(0, 4);

  return `
    <div style="padding:var(--space-lg);max-width:600px;margin:0 auto;">
      <!-- Welcome card -->
      <div style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:var(--radius-xl);padding:var(--space-xl);margin-bottom:var(--space-lg);position:relative;overflow:hidden;">
        <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;background:rgba(255,255,255,0.08);border-radius:50%;"></div>
        <div style="position:absolute;bottom:-30px;right:30px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
        <div style="font-size:13px;opacity:0.8;font-weight:500;margin-bottom:4px;">Bienvenue 👋</div>
        <div style="font-size:24px;font-weight:800;color:#fff;">${user.name}</div>
        <div style="font-size:13px;opacity:0.7;margin-top:4px;">Zone: ${user.zone}</div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:var(--space-lg);">
          <div>
            <div style="font-size:28px;font-weight:900;color:#fff;">${user.points}</div>
            <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:0.5px;">Points</div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.2);"></div>
          <div>
            <div style="font-size:28px;font-weight:900;color:#fff;">${myReports.length}</div>
            <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:0.5px;">Signalements</div>
          </div>
          <div style="width:1px;height:40px;background:rgba(255,255,255,0.2);"></div>
          <div>
            <div style="font-size:28px;font-weight:900;color:#fff;">${myReports.filter(r => r.status === 'validé').length}</div>
            <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:0.5px;">Validés</div>
          </div>
        </div>
      </div>

      <!-- Alertes actives -->
      ${nearbyAlerts.length ? `
      <div class="section-header">
        <div class="section-title">🚨 Alertes dans ma zone</div>
        <span class="badge badge-danger" style="animation:pulse-dot 2s infinite;">${nearbyAlerts.length} actives</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);margin-bottom:var(--space-xl);">
        ${nearbyAlerts.map(a => `
          <div class="alert-card ${a.type === 'danger' ? 'urgent' : a.type === 'warning' ? 'warn' : 'info'}">
            <span style="font-size:24px;">${a.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;">${a.title}</div>
              <div style="font-size:12px;opacity:0.8;margin-top:2px;">${a.message}</div>
              <div style="font-size:10px;margin-top:4px;opacity:0.6;">${DDR.timeAgo(a.time)} — ${a.zone}</div>
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Signalements proches -->
      <div class="section-header">
        <div class="section-title">📍 Signalements proches</div>
        <button class="btn btn-ghost btn-sm" onclick="DDR.navigate('citoyen',{tab:'map'})">Voir carte →</button>
      </div>
      <div class="report-list">
        ${nearbyReports.map(r => `
          <div class="report-card ${r.status}" onclick="showReportDetail('${r.id}')">
            <div class="report-card-header">
              <div>
                <div class="report-card-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${r.zone} · ${DDR.timeAgo(r.date)}</div>
              </div>
              ${DDR.getStatusBadge(r.status)}
            </div>
            <div class="report-card-body">${r.description}</div>
            <div class="report-card-footer">
              <div class="report-meta">👤 ${r.reportedByName}</div>
              <div class="report-meta">👍 ${r.upvotes}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- FAB to Signal -->
      <div style="position:fixed;bottom:calc(var(--bottom-nav-height) + 24px);right:20px;z-index:200;">
        <button class="map-fab" onclick="DDR.navigate('citoyen',{tab:'signal'})" title="Signaler un problème">➕</button>
      </div>
    </div>
  `;
}

/* ==================== MAP ==================== */
function renderMap() {
  return `
    <div style="position:fixed;top:var(--top-nav-height);left:0;right:0;bottom:var(--bottom-nav-height);z-index:10;">
      <div id="citoyen-map" style="width:100%;height:100%;"></div>
      <button class="map-fab" onclick="DDR.navigate('citoyen',{tab:'signal'})" title="Signaler ici" style="bottom:${24}px;">➕</button>
      <div class="map-legend">
        <div class="legend-item"><div class="legend-dot" style="background:#FF6B2B;"></div>Signalé</div>
        <div class="legend-item"><div class="legend-dot" style="background:#FFD93D;"></div>En cours</div>
        <div class="legend-item"><div class="legend-dot" style="background:#00D4AA;"></div>Validé</div>
        <div class="legend-item"><div class="legend-dot" style="background:#8888AA;"></div>Terminé</div>
        <div class="legend-item"><div class="legend-dot" style="background:#54A0FF;box-shadow:0 0 0 4px rgba(84,160,255,0.2);"></div>Ma position</div>
      </div>
    </div>
  `;
}

function initCitoyenMap() {
  if (DDR.state.leafletMap) { DDR.state.leafletMap.remove(); DDR.state.leafletMap = null; }
  var mapEl = document.getElementById('citoyen-map');
  if (!mapEl) return;
  mapEl.style.background = '#0A0A1A';

  var map = L.map('citoyen-map', { zoomControl: false }).setView([14.6928, -17.4467], 13);
  DDR.state.leafletMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© DDR Sénégal | © CartoDB',
    maxZoom: 19,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // My position marker
  var myIcon = L.divIcon({ className: '', html: '<div class="my-location-marker"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
  L.marker([14.6928, -17.4467], { icon: myIcon }).addTo(map).bindPopup('<div class="map-popup"><b>📍 Ma position</b></div>');

  // 3km radius circle
  L.circle([14.6928, -17.4467], {
    radius: 3000,
    color: '#FF6B2B',
    fillColor: '#FF6B2B',
    fillOpacity: 0.04,
    weight: 1.5,
    dashArray: '8, 6',
  }).addTo(map);

  // Reports markers
  const colorsMap = { en_attente: '#FF6B2B', validé: '#00D4AA', rejeté: '#FF4757', en_cours: '#FFD93D', terminé: '#8888AA' };
  DDR.state.reports.forEach(function(r) {
    var color = colorsMap[r.status] || '#FF6B2B';
    var markerIcon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid rgba(255,255,255,0.4);box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;">${DDR.getTypeEmoji(r.type)}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -38],
    });
    L.marker([r.lat, r.lng], { icon: markerIcon }).addTo(map).bindPopup(`
      <div class="map-popup">
        <div class="map-popup-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div>
        <div class="map-popup-desc">${r.description}</div>
        <div class="map-popup-meta">
          ${DDR.getStatusBadge(r.status)}
          <span class="badge badge-muted">${r.zone}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Par ${r.reportedByName} · ${DDR.formatDate(r.date)}</div>
      </div>
    `);
  });
}

/* ==================== SIGNAL FORM ==================== */
function renderSignal() {
  const types = [
    { id: 'Nid de poule', icon: '🕳️' }, { id: 'Travaux de voirie', icon: '🚧' },
    { id: 'Caniveau bouché', icon: '🌊' }, { id: 'Route inondée', icon: '🌧️' },
    { id: 'Feux tricolores défectueux', icon: '🚦' }, { id: 'Panneaux manquants', icon: '⚠️' },
    { id: 'Pont endommagé', icon: '🌉' }, { id: 'Autre', icon: '📍' },
  ];
  return `
    <div class="signal-form-container" style="padding:var(--space-lg);">
      <div class="page-header">
        <div class="page-title">🚧 Nouveau signalement</div>
        <div class="page-subtitle">Aidez votre communauté en signalant un problème</div>
      </div>

      <!-- Points hint -->
      <div style="display:flex;align-items:center;gap:8px;background:var(--primary-alpha);border:1px solid var(--border-accent);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:var(--space-lg);font-size:13px;color:var(--primary);">
        <span>⭐</span> Gagnez <strong>+10 pts</strong> pour ce signalement, <strong>+50 pts</strong> si validé !
      </div>

      <form id="signal-form" onsubmit="submitSignal(event)">
        <!-- Type -->
        <div class="form-group mb-lg">
          <div class="form-label">Type de problème</div>
          <div class="signal-type-grid" id="type-grid">
            ${types.map(t => `
              <button type="button" class="signal-type-btn" id="type-${t.id.replace(/\s/g,'_')}" onclick="selectType('${t.id}')">
                <span class="signal-type-icon">${t.icon}</span>
                <span>${t.id}</span>
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="signal-type" required />
        </div>

        <!-- GPS -->
        <div class="form-group mb-lg">
          <div class="form-label">Localisation</div>
          <div class="gps-indicator" id="gps-status">
            <span>📡</span>
            <div>
              <div style="font-weight:600;">Localisation automatique</div>
              <div id="gps-coords" style="font-size:11px;opacity:0.8;">En cours de détection...</div>
            </div>
          </div>
        </div>

        <!-- Zone -->
        <div class="form-group mb-lg">
          <div class="form-label">Zone / Quartier</div>
          <select class="form-input form-select" id="signal-zone" required>
            <option value="">Sélectionnez votre zone</option>
            ${['Plateau','Médina','Fann','Point E','Almadies','Ouakam','Yoff','Ngor','Mermoz','Liberté','Grand Dakar','Parcelles Assainies','Grand Yoff','Pikine','Guédiawaye','Rufisque'].map(z => `<option value="${z}">${z}</option>`).join('')}
          </select>
        </div>

        <!-- Severity -->
        <div class="form-group mb-lg">
          <div class="form-label">Niveau de dangerosité</div>
          <select class="form-input form-select" id="signal-severity" required>
            <option value="">Choisir le niveau</option>
            <option value="low">🟢 Faible — Gêne mineure</option>
            <option value="medium">🟡 Modéré — Ralentissement</option>
            <option value="high">🔴 Élevé — Danger pour usagers</option>
            <option value="critical">🆘 Critique — Urgence absolue</option>
          </select>
        </div>

        <!-- Description -->
        <div class="form-group mb-lg">
          <div class="form-label">Description</div>
          <textarea class="form-input" id="signal-desc" rows="4" placeholder="Décrivez le problème en détail : longueur, profondeur, impact sur la circulation..." required></textarea>
        </div>

        <!-- Photo (simulated) -->
        <div class="form-group mb-xl">
          <div class="form-label">Photo (optionnel)</div>
          <div class="photo-upload" id="photo-upload-zone" onclick="simulatePhotoUpload()">
            <div class="photo-upload-icon">📸</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary);" id="photo-label">Appuyez pour prendre une photo</div>
            <div style="font-size:11px;color:var(--text-muted);">ou sélectionnez depuis la galerie</div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full" id="signal-submit">
          🚀 Envoyer le signalement
        </button>
      </form>
    </div>
  `;
}

function initSignalForm() {
  // Simulate GPS
  setTimeout(function() {
    const coordsEl = document.getElementById('gps-coords');
    if (coordsEl) {
      const lat = 14.6928 + (Math.random() - 0.5) * 0.02;
      const lng = -17.4467 + (Math.random() - 0.5) * 0.02;
      coordsEl.textContent = 'Lat: ' + lat.toFixed(4) + ', Lng: ' + lng.toFixed(4) + ' ✓';
      window._signalLat = lat;
      window._signalLng = lng;
    }
  }, 1200);
}

window.selectType = function(type) {
  document.querySelectorAll('.signal-type-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('type-' + type.replace(/\s/g, '_'));
  if (btn) btn.classList.add('active');
  const inp = document.getElementById('signal-type');
  if (inp) inp.value = type;
};

window.simulatePhotoUpload = function() {
  const label = document.getElementById('photo-label');
  const zone = document.getElementById('photo-upload-zone');
  if (label) {
    label.textContent = '✅ Photo ajoutée avec succès';
    zone.style.borderColor = 'var(--accent)';
    zone.style.background = 'var(--accent-alpha)';
  }
};

window.submitSignal = function(e) {
  e.preventDefault();
  const type = document.getElementById('signal-type').value;
  const zone = document.getElementById('signal-zone').value;
  const severity = document.getElementById('signal-severity').value;
  const desc = document.getElementById('signal-desc').value;
  if (!type) { DDR.showToast('Veuillez sélectionner un type de problème', 'warning'); return; }
  const btn = document.getElementById('signal-submit');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  setTimeout(function() {
    const report = DDR.addReport({ type, zone, severity, description: desc, lat: window._signalLat, lng: window._signalLng });
    DDR.showToast('✅ Signalement envoyé ! +10 points gagnés 🌟', 'success');
    DDR.navigate('citoyen', { tab: 'home' });
  }, 1000);
};

/* ==================== REWARDS ==================== */
function renderRewards(user) {
  const stats = DDR.getStats();
  const leaderboard = stats.leaderboard;
  const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;
  const nextBadgePoints = user.points < 100 ? 100 : user.points < 250 ? 250 : user.points < 500 ? 500 : user.points < 1000 ? 1000 : 2000;
  const prevBadgePoints = user.points < 100 ? 0 : user.points < 250 ? 100 : user.points < 500 ? 250 : user.points < 1000 ? 500 : 1000;
  const progressPct = Math.min(100, Math.round(((user.points - prevBadgePoints) / (nextBadgePoints - prevBadgePoints)) * 100));

  const badges = [
    { emoji: '🌱', name: 'Débutant', pts: 0, req: 0 },
    { emoji: '🛣️', name: 'Sentinelle', pts: 100, req: 100 },
    { emoji: '🦺', name: 'Veilleur', pts: 250, req: 250 },
    { emoji: '🏆', name: 'Gardien', pts: 500, req: 500 },
    { emoji: '🌟', name: 'Champion', pts: 1000, req: 1000 },
    { emoji: '👑', name: 'Légende', pts: 2000, req: 2000 },
  ];

  return `
    <div style="padding:var(--space-lg);max-width:600px;margin:0 auto;">
      <!-- Points Hero -->
      <div class="points-hero">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;">Votre score</div>
        <div class="points-total" id="points-counter">0</div>
        <div class="points-label">Points DDR</div>
        ${userRank > 0 ? `<div style="margin-top:12px;font-size:13px;color:var(--text-secondary);">🏅 Rang #${userRank} classement national</div>` : ''}
        
        <!-- Progress to next badge -->
        <div class="progress-bar-container" style="margin-top:var(--space-lg);">
          <div class="progress-bar-label">
            <span>${user.points} pts</span>
            <span>Prochain badge: ${nextBadgePoints} pts</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-fill" style="width:0%"></div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="section-header mb-md">
        <div class="section-title">🎖️ Badges</div>
      </div>
      <div class="badges-grid mb-xl">
        ${badges.map(b => {
          const earned = user.points >= b.req;
          return `
            <div class="badge-card ${earned ? 'earned' : 'locked'}">
              <div class="badge-emoji">${b.emoji}</div>
              <div class="badge-name">${b.name}</div>
              <div class="badge-pts">${b.pts > 0 ? b.pts + ' pts' : 'Départ'}</div>
              ${earned ? '<div style="font-size:9px;color:var(--accent);margin-top:4px;font-weight:700;">OBTENU ✓</div>' : '<div style="font-size:9px;color:var(--text-muted);margin-top:4px;">🔒 Verrouillé</div>'}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Tableau des actions -->
      <div class="section-header mb-md">
        <div class="section-title">⭐ Comment gagner des points</div>
      </div>
      <div class="card mb-xl" style="padding:0;overflow:hidden;">
        ${[
          ['Soumettre un signalement', '+10 pts', '📝'],
          ['Signalement validé par le Ministère', '+50 pts', '✅'],
          ['Premier signalement du jour', '+20 pts bonus', '🌅'],
          ['5 signalements validés', 'Badge Sentinelle', '🏅'],
          ['20 signalements validés', 'Badge Gardien', '🏆'],
        ].map((row, i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;${i > 0 ? 'border-top:1px solid var(--border);' : ''}">
            <span style="font-size:20px;">${row[2]}</span>
            <span style="flex:1;font-size:13px;color:var(--text-secondary);">${row[0]}</span>
            <span style="font-size:13px;font-weight:700;color:var(--primary);">${row[1]}</span>
          </div>
        `).join('')}
      </div>

      <!-- Leaderboard -->
      <div class="section-header mb-md">
        <div class="section-title">🏆 Classement national</div>
      </div>
      <div class="leaderboard">
        ${leaderboard.map((u, i) => {
          const rank = i + 1;
          const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
          const isMe = u.id === user.id;
          return `
            <div class="leaderboard-item ${isMe ? 'me' : ''}">
              <div class="leaderboard-rank ${rank <= 3 ? 'top3' : ''}">${medals[rank] || rank}</div>
              <div class="avatar avatar-primary" style="width:32px;height:32px;font-size:12px;">${u.avatar}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;">${u.name} ${isMe ? '(Moi)' : ''}</div>
                <div style="font-size:11px;color:var(--text-muted);">${u.zone} · ${u.signalements} signalements</div>
              </div>
              <div class="leaderboard-pts">⭐ ${u.points}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function animatePoints(target) {
  setTimeout(function() {
    const el = document.getElementById('points-counter');
    const fill = document.getElementById('progress-fill');
    if (!el) return;
    let current = 0;
    const duration = 1000;
    const step = Math.ceil(target / (duration / 16));
    const interval = setInterval(function() {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(interval);
    }, 16);
    if (fill) {
      setTimeout(function() {
        const user = DDR.state.currentUser;
        const nextBadgePoints = user.points < 100 ? 100 : user.points < 250 ? 250 : user.points < 500 ? 500 : user.points < 1000 ? 1000 : 2000;
        const prevBadgePoints = user.points < 100 ? 0 : user.points < 250 ? 100 : user.points < 500 ? 250 : user.points < 1000 ? 500 : 1000;
        const progressPct = Math.min(100, Math.round(((user.points - prevBadgePoints) / (nextBadgePoints - prevBadgePoints)) * 100));
        fill.style.width = progressPct + '%';
      }, 100);
    }
  }, 200);
}

/* ==================== PROFILE ==================== */
function renderProfile(user) {
  const myReports = DDR.state.reports.filter(r => r.reportedBy === user.id);
  return `
    <div style="padding:var(--space-lg);max-width:600px;margin:0 auto;">
      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="profile-avatar-lg">${user.avatar}</div>
        <div style="font-size:22px;font-weight:800;">${user.name}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${user.email}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">📍 ${user.zone} · Membre depuis ${DDR.formatDate(user.joined)}</div>
        <div class="profile-stat-row">
          <div class="profile-stat"><div class="profile-stat-val">⭐ ${user.points}</div><div class="profile-stat-lbl">Points</div></div>
          <div class="profile-stat"><div class="profile-stat-val">${myReports.length}</div><div class="profile-stat-lbl">Signalements</div></div>
          <div class="profile-stat"><div class="profile-stat-val">${myReports.filter(r=>r.status==='validé').length}</div><div class="profile-stat-lbl">Validés</div></div>
        </div>
      </div>

      <!-- Mes signalements -->
      <div class="section-header mb-md">
        <div class="section-title">📋 Mes signalements</div>
        <span class="badge badge-muted">${myReports.length}</span>
      </div>
      <div class="report-list mb-xl">
        ${myReports.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Aucun signalement</div><div class="empty-text">Signalez votre premier problème routier !</div></div>' :
          myReports.slice(0, 5).map(r => `
            <div class="report-card ${r.status}">
              <div class="report-card-header">
                <div>
                  <div class="report-card-title">${DDR.getTypeEmoji(r.type)} ${r.type}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${r.zone} · ${DDR.formatDate(r.date)}</div>
                </div>
                ${DDR.getStatusBadge(r.status)}
              </div>
              <div class="report-card-body">${r.description}</div>
              ${r.status === 'rejeté' && r.rejectionReason ? `<div style="font-size:11px;color:var(--danger);margin-top:4px;background:var(--danger-alpha);padding:6px 8px;border-radius:4px;">Motif: ${r.rejectionReason}</div>` : ''}
            </div>
          `).join('')
        }
      </div>

      <!-- Settings -->
      <div class="section-header mb-md"><div class="section-title">⚙️ Paramètres</div></div>
      <div class="mb-xl">
        ${[
          ['🔔 Notifications push', true],
          ['📍 Partage de position', true],
          ['📧 Alertes par email', false],
          ['🌙 Mode sombre', true],
        ].map(([lbl, on]) => `
          <div class="settings-item">
            <span style="font-size:14px;font-weight:500;">${lbl}</span>
            <div class="toggle-switch ${on ? 'on' : ''}" onclick="this.classList.toggle('on')"></div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-danger btn-lg w-full" onclick="DDR.logout()">🚪 Se déconnecter</button>
    </div>
  `;
}

/* ==================== REPORT DETAIL MODAL ==================== */
window.showReportDetail = function(id) {
  const r = DDR.state.reports.find(rep => rep.id === id);
  if (!r) return;
  DDR.showModal(`
    <div style="text-align:center;font-size:40px;margin-bottom:12px;">${DDR.getTypeEmoji(r.type)}</div>
    <div style="font-size:14px;font-weight:700;margin-bottom:8px;">${r.type} — ${r.zone}</div>
    <div style="margin-bottom:12px;">${DDR.getStatusBadge(r.status)}</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">${r.description}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
      <div style="background:var(--glass);border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">Signalé par</div>
        <div style="font-size:13px;font-weight:600;">${r.reportedByName}</div>
      </div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">Date</div>
        <div style="font-size:13px;font-weight:600;">${DDR.formatDate(r.date)}</div>
      </div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">Zone</div>
        <div style="font-size:13px;font-weight:600;">${r.zone}</div>
      </div>
      <div style="background:var(--glass);border-radius:8px;padding:10px;text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">Votes</div>
        <div style="font-size:13px;font-weight:600;">👍 ${r.upvotes}</div>
      </div>
    </div>
    ${r.status === 'rejeté' && r.rejectionReason ? `<div style="background:var(--danger-alpha);border:1px solid rgba(255,71,87,0.2);border-radius:8px;padding:10px;font-size:12px;color:var(--danger);">❌ Motif de rejet: ${r.rejectionReason}</div>` : ''}
    <button class="btn btn-ghost btn-lg w-full" onclick="DDR.hideModal()" style="margin-top:16px;">Fermer</button>
  `, r.type);
};
