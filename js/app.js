/* ============================================================
   DDR — App Core: Router, Toast, Modal, Navigation, Alerts
   ============================================================ */

(function() {

  /* ==================== ROUTER ==================== */
  DDR.navigate = function(page, params) {
    DDR.state.currentTab = params && params.tab ? params.tab : page;
    DDR.state.currentSidebarTab = params && params.sidebar ? params.sidebar : DDR.state.currentSidebarTab;
    render(page, params);
  };

  function render(page, params) {
    const user = DDR.state.currentUser;
    if (!user) { DDR.renderLogin(); return; }
    switch(user.role) {
      case 'citoyen':
        if (typeof DDR.renderCitoyen === 'function') DDR.renderCitoyen(params);
        break;
      case 'ministere':
        if (typeof DDR.renderMinistere === 'function') DDR.renderMinistere(params);
        break;
      case 'admin':
        if (typeof DDR.renderAdmin === 'function') DDR.renderAdmin(params);
        break;
      default:
        DDR.renderLogin();
    }
  }

  /* ==================== TOAST ==================== */
  DDR.showToast = function(message, type) {
    type = type || 'info';
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + icons[type] + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  };

  /* ==================== MODAL ==================== */
  DDR.showModal = function(contentHtml, title) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = (title ? '<div class="modal-handle"></div><div class="modal-title">' + title + '</div>' : '<div class="modal-handle"></div>') + contentHtml;
    overlay.classList.remove('hidden');
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) DDR.hideModal();
    }, { once: true });
  };

  DDR.hideModal = function() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  };

  /* ==================== ALERT BANNER ==================== */
  DDR.showAlertBanner = function(message, type) {
    const banner = document.getElementById('alert-banner');
    if (!banner) return;
    const icons = { danger: '🚨', warning: '⚠️', info: '💡' };
    banner.innerHTML = '<span>' + (icons[type] || '🔔') + '</span><span>' + message + '</span><button class="alert-close" onclick="document.getElementById(\'alert-banner\').classList.add(\'hidden\')">✕</button>';
    banner.style.background = type === 'danger' ? 'linear-gradient(135deg,#FF4757,#C0392B)' : type === 'warning' ? 'linear-gradient(135deg,#F39C12,#D68910)' : 'linear-gradient(135deg,#2980b9,#1a5276)';
    banner.classList.remove('hidden');
    setTimeout(() => { if (!banner.classList.contains('hidden')) banner.classList.add('hidden'); }, 8000);
  };

  /* ==================== SIMULATED REAL-TIME ALERTS ==================== */
  DDR.startAlerts = function() {
    if (DDR.state.alertInterval) return;
    const messages = [
      ['🚧 Nouveau signalement à Parcelles Assainies — Nid de poule signalé.', 'warning'],
      ['🚨 Alerte IA : Zone Guédiawaye identifiée à risque d\'inondation.', 'danger'],
      ['✅ Votre signalement a été validé par le Ministère ! +50 points.', 'info'],
      ['🌊 Forte pluie prévue : Évitez la zone basse de Pikine.', 'warning'],
      ['🔧 Travaux terminés sur l\'axe Corniche. Route ouverte.', 'info'],
    ];
    let idx = 0;
    DDR.state.alertInterval = setInterval(function() {
      const [msg, type] = messages[idx % messages.length];
      DDR.showAlertBanner(msg, type);
      idx++;
    }, 30000);
  };

  /* ==================== BUILD TOPNAV ==================== */
  DDR.buildTopNav = function(role) {
    const user = DDR.state.currentUser;
    const roleLabel = { citoyen: 'Citoyen', ministere: 'Ministère', admin: 'Super Admin' }[role] || role;
    const avatarClass = { citoyen: 'avatar-primary', ministere: 'avatar-accent', admin: 'avatar-info' }[role] || 'avatar-primary';
    const pointsHTML = role === 'citoyen' ? '<div class="points-display"><span>⭐</span><span>' + (user ? user.points : 0) + ' pts</span></div>' : '';
    const pendingCount = DDR.state.reports.filter(r => r.status === 'en_attente').length;
    return `<nav class="topnav">
      <div class="topnav-logo">DDR</div>
      <div class="flex items-center gap-sm" style="margin-left:8px;">
        <span class="badge badge-muted" style="font-size:10px;">${roleLabel}</span>
      </div>
      ${pointsHTML}
      <div class="topnav-user">
        <button class="topnav-btn" id="topnav-notif-btn" title="Alertes">
          🔔
          ${pendingCount > 0 ? '<span class="notif-badge">' + Math.min(pendingCount, 9) + '</span>' : ''}
        </button>
        <div class="avatar ${avatarClass}" title="${user ? user.name : ''}">${user ? user.avatar : 'U'}</div>
        <button class="btn btn-ghost btn-sm" id="logout-btn" onclick="DDR.logout()">Déconnexion</button>
      </div>
    </nav>`;
  };

  /* ==================== BUILD BOTTOM NAV ==================== */
  DDR.buildBottomNav = function(activeTab) {
    const tabs = [
      { id: 'home', icon: '🏠', label: 'Accueil' },
      { id: 'map', icon: '🗺️', label: 'Carte' },
      { id: 'signal', icon: '➕', label: 'Signaler', center: true },
      { id: 'rewards', icon: '🏆', label: 'Points' },
      { id: 'profile', icon: '👤', label: 'Profil' },
    ];
    const items = tabs.map(t => `
      <button class="nav-item ${t.center ? 'nav-item-center' : ''} ${activeTab === t.id ? 'active' : ''}"
        onclick="DDR.navigate('citoyen', { tab: '${t.id}' })" id="nav-tab-${t.id}">
        <div class="nav-icon">${t.icon}</div>
        <span class="nav-label">${t.label}</span>
      </button>
    `).join('');
    return '<nav class="bottom-nav">' + items + '</nav>';
  };

  /* ==================== BUILD SIDEBAR ==================== */
  DDR.buildSidebar = function(activeTab, role) {
    const user = DDR.state.currentUser;
    const avatarClass = { ministere: 'avatar-accent', admin: 'avatar-info' }[role] || 'avatar-primary';
    const roleLabel = { ministere: 'Ministère des Travaux Publics', admin: 'Super Administrateur' }[role] || role;
    const navigateTo = role === 'ministere' ? 'ministere' : 'admin';

    let navItems;
    if (role === 'ministere') {
      navItems = [
        { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
        { id: 'reports', icon: '📋', label: 'Signalements' },
        { id: 'map', icon: '🗺️', label: 'Carte nationale' },
        { id: 'rapports', icon: '📄', label: 'Rapports' },
        { id: 'alerts', icon: '🔔', label: 'Alertes' },
      ];
    } else {
      navItems = [
        { id: 'dashboard', icon: '📊', label: 'Vue globale' },
        { id: 'users', icon: '👥', label: 'Utilisateurs' },
        { id: 'map', icon: '🗺️', label: 'Carte & IA' },
        { id: 'analytics', icon: '📈', label: 'Analytics' },
        { id: 'cameras', icon: '🎥', label: 'Caméras IP' },
        { id: 'logs', icon: '📋', label: 'Logs système' },
        { id: 'settings', icon: '⚙️', label: 'Paramètres' },
      ];
    }

    const items = navItems.map(item => `
      <div class="sidebar-item ${activeTab === item.id ? 'active' : ''}"
        onclick="DDR.navigate('${navigateTo}', { sidebar: '${item.id}' })" id="sidebar-${item.id}">
        <span class="s-icon">${item.icon}</span>
        <span>${item.label}</span>
      </div>
    `).join('');

    return `<aside class="sidebar">
      <div class="sidebar-logo">
        <div class="app-name">DDR</div>
        <div class="app-role">${roleLabel}</div>
      </div>
      <nav class="sidebar-nav">
        ${items}
      </nav>
      <div class="sidebar-user">
        <div class="avatar ${avatarClass}">${user ? user.avatar : 'U'}</div>
        <div>
          <div class="sidebar-user-name">${user ? user.name : ''}</div>
          <div class="sidebar-user-role">${roleLabel}</div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="DDR.logout()" title="Déconnexion" style="margin-left:auto;padding:6px;">🚪</button>
      </div>
    </aside>`;
  };

  /* ==================== INIT ==================== */
  window.addEventListener('DOMContentLoaded', function() {
    if (DDR.state.currentUser) {
      DDR.navigate(DDR.state.currentUser.role);
    } else {
      DDR.renderLogin();
    }
  });

})();
