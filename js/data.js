/* ============================================================
   DDR — Data Layer & Global State
   All mock data, localStorage operations, and state management
   ============================================================ */

window.DDR = (function() {

  /* ===================== MOCK DATA ===================== */
  const USERS_DEFAULT = [
    { id: 'u1', name: 'Moussa Diallo', email: 'moussa@ddr.sn', password: 'demo123', role: 'citoyen', points: 420, zone: 'Plateau', avatar: 'MD', signalements: 12, validated: 9, joined: '2026-01-15' },
    { id: 'u2', name: 'Fatou Ndoye', email: 'fatou@ddr.sn', password: 'demo123', role: 'citoyen', points: 380, zone: 'Médina', avatar: 'FN', signalements: 10, validated: 7, joined: '2026-02-03' },
    { id: 'u3', name: 'Ousmane Seck', email: 'ousmane@ddr.sn', password: 'demo123', role: 'citoyen', points: 290, zone: 'Fann', avatar: 'OS', signalements: 8, validated: 6, joined: '2026-01-28' },
    { id: 'u4', name: 'Aïssatou Ba', email: 'aissatou@ddr.sn', password: 'demo123', role: 'citoyen', points: 240, zone: 'Almadies', avatar: 'AB', signalements: 7, validated: 5, joined: '2026-02-10' },
    { id: 'u5', name: 'Ibrahima Fall', email: 'ibrahima@ddr.sn', password: 'demo123', role: 'citoyen', points: 180, zone: 'Ouakam', avatar: 'IF', signalements: 5, validated: 4, joined: '2026-03-01' },
    { id: 'u6', name: 'Mariama Touré', email: 'mariama@ddr.sn', password: 'demo123', role: 'citoyen', points: 150, zone: 'Yoff', avatar: 'MT', signalements: 4, validated: 3, joined: '2026-03-15' },
    { id: 'u7', name: 'Cheikh Sarr', email: 'cheikh@ddr.sn', password: 'demo123', role: 'citoyen', points: 120, zone: 'Pikine', avatar: 'CS', signalements: 3, validated: 2, joined: '2026-03-22' },
    { id: 'u8', name: 'Awa Ndiaye', email: 'awa@ddr.sn', password: 'demo123', role: 'citoyen', points: 90, zone: 'Liberté', avatar: 'AN', signalements: 3, validated: 2, joined: '2026-04-01' },
    { id: 'u9', name: 'Dr. Amadou Diouf', email: 'ministere@ddr.sn', password: 'admin123', role: 'ministere', points: 0, zone: 'National', avatar: 'AD', signalements: 0, validated: 0, joined: '2025-12-01' },
    { id: 'u10', name: 'Mme. Khadidjatou Ly', email: 'khadija@ministere.sn', password: 'admin123', role: 'ministere', points: 0, zone: 'National', avatar: 'KL', signalements: 0, validated: 0, joined: '2025-12-01' },
    { id: 'u11', name: 'Super Admin', email: 'admin@ddr.sn', password: 'superadmin123', role: 'admin', points: 0, zone: 'Global', avatar: 'SA', signalements: 0, validated: 0, joined: '2025-11-01' },
  ];

  const REPORTS_DEFAULT = [
    { id: 'r1', type: 'Travaux de voirie', description: 'Réfection complète de la chaussée sur 200m avec déviation de circulation. Les travaux ont démarré lundi.', lat: 14.6823, lng: -17.4430, status: 'en_cours', reportedBy: 'u1', reportedByName: 'Moussa Diallo', date: '2026-04-20', validatedBy: 'u9', photos: [], zone: 'Plateau', severity: 'high', upvotes: 12 },
    { id: 'r2', type: 'Nid de poule', description: 'Gros nid de poule au carrefour Liberté 6. Très dangereux pour les motos et véhicules légers.', lat: 14.7050, lng: -17.4550, status: 'validé', reportedBy: 'u2', reportedByName: 'Fatou Ndoye', date: '2026-04-18', validatedBy: 'u9', photos: [], zone: 'Liberté', severity: 'medium', upvotes: 8 },
    { id: 'r3', type: 'Caniveau bouché', description: 'Caniveau obstrué de déchets causant une inondation partielle de la chaussée lors des pluies.', lat: 14.6892, lng: -17.4620, status: 'en_attente', reportedBy: 'u3', reportedByName: 'Ousmane Seck', date: '2026-04-22', validatedBy: null, photos: [], zone: 'Fann', severity: 'medium', upvotes: 5 },
    { id: 'r4', type: 'Feux tricolores défectueux', description: 'Les feux tricolores au croisement Route de Ouakam sont hors service depuis 3 jours.', lat: 14.7280, lng: -17.4890, status: 'en_attente', reportedBy: 'u4', reportedByName: 'Aïssatou Ba', date: '2026-04-21', validatedBy: null, photos: [], zone: 'Ouakam', severity: 'high', upvotes: 15 },
    { id: 'r5', type: 'Route inondée', description: 'Route complètement inondée suite aux pluies d\'hier soir. Passage impossible pour les véhicules.', lat: 14.7520, lng: -17.4870, status: 'terminé', reportedBy: 'u5', reportedByName: 'Ibrahima Fall', date: '2026-04-15', validatedBy: 'u9', photos: [], zone: 'Yoff', severity: 'high', upvotes: 20 },
    { id: 'r6', type: 'Panneaux manquants', description: 'Panneaux de signalisation manquants à l\'entrée du rond-point des Almadies. Risque d\'accident.', lat: 14.7458, lng: -17.5073, status: 'validé', reportedBy: 'u6', reportedByName: 'Mariama Touré', date: '2026-04-19', validatedBy: 'u10', photos: [], zone: 'Almadies', severity: 'medium', upvotes: 6 },
    { id: 'r7', type: 'Nid de poule', description: 'Multiple nids de poule sur l\'axe Pikine-Guédiawaye. La route est en très mauvais état.', lat: 14.7488, lng: -17.3928, status: 'en_attente', reportedBy: 'u7', reportedByName: 'Cheikh Sarr', date: '2026-04-23', validatedBy: null, photos: [], zone: 'Pikine', severity: 'high', upvotes: 18 },
    { id: 'r8', type: 'Travaux de voirie', description: 'Travaux de pose de canalisations d\'eau potable. La chaussée est défoncée sur 300m.', lat: 14.7183, lng: -17.4780, status: 'en_cours', reportedBy: 'u8', reportedByName: 'Awa Ndiaye', date: '2026-04-17', validatedBy: 'u9', photos: [], zone: 'Mermoz', severity: 'medium', upvotes: 9 },
    { id: 'r9', type: 'Pont endommagé', description: 'Fissures importantes sur le pont de la corniche. Inspection urgente requise.', lat: 14.6730, lng: -17.4590, status: 'en_attente', reportedBy: 'u1', reportedByName: 'Moussa Diallo', date: '2026-04-24', validatedBy: null, photos: [], zone: 'Corniche', severity: 'critical', upvotes: 31 },
    { id: 'r10', type: 'Caniveau bouché', description: 'Point d\'eau stagnante suite à un caniveau bouché. Risque sanitaire.', lat: 14.7003, lng: -17.4712, status: 'rejeté', reportedBy: 'u3', reportedByName: 'Ousmane Seck', date: '2026-04-16', validatedBy: 'u10', photos: [], zone: 'Point E', severity: 'low', upvotes: 2, rejectionReason: 'Travaux déjà en cours, signalement en doublon.' },
    { id: 'r11', type: 'Nid de poule', description: 'Nid de poule profond devant l\'école primaire. Danger pour les enfants.', lat: 14.6923, lng: -17.4467, status: 'validé', reportedBy: 'u2', reportedByName: 'Fatou Ndoye', date: '2026-04-14', validatedBy: 'u9', photos: [], zone: 'Médina', severity: 'medium', upvotes: 14 },
    { id: 'r12', type: 'Route inondée', description: 'Inondation au carrefour Grand Yoff. Déviation conseillée.', lat: 14.7350, lng: -17.4580, status: 'terminé', reportedBy: 'u4', reportedByName: 'Aïssatou Ba', date: '2026-04-10', validatedBy: 'u9', photos: [], zone: 'Grand Yoff', severity: 'medium', upvotes: 11 },
  ];

  const ALERTS_DEFAULT = [
    { id: 'a1', type: 'danger', icon: '🚧', title: 'Travaux majeurs détectés', message: 'Zone Plateau : travaux de voirie en cours sur 200m. Déviation recommandée par la rue Blanchot.', lat: 14.6823, lng: -17.4430, zone: 'Plateau', time: '2026-04-25T06:30:00Z', active: true },
    { id: 'a2', type: 'warning', icon: '⚠️', title: 'Feux défectueux signalés', message: 'Carrefour Ouakam : 3 signalements confirmés de feux tricolores hors service.', lat: 14.7280, lng: -17.4890, zone: 'Ouakam', time: '2026-04-25T05:45:00Z', active: true },
    { id: 'a3', type: 'danger', icon: '🌊', title: 'Zone inondable identifiée', message: 'IA prédictive : risque d\'inondation élevé à Pikine en cas de pluie dans les 24h.', lat: 14.7488, lng: -17.3928, zone: 'Pikine', time: '2026-04-25T04:00:00Z', active: true },
    { id: 'a4', type: 'info', icon: '🔧', title: 'Pont Corniche — Inspection', message: 'Inspection technique du pont en cours. Limitation de charge à 5 tonnes.', lat: 14.6730, lng: -17.4590, zone: 'Corniche', time: '2026-04-25T08:00:00Z', active: true },
  ];

  const LOGS_DEFAULT = [
    { id: 'l1', time: '2026-04-25 06:51', type: 'SUCCESS', msg: 'Signalement r9 validé par Dr. Amadou Diouf' },
    { id: 'l2', time: '2026-04-25 06:30', type: 'WARNING', msg: 'Alerte automatique envoyée à 247 usagers (zone Plateau)' },
    { id: 'l3', time: '2026-04-25 05:45', type: 'INFO', msg: 'Connexion: Moussa Diallo (citoyen) — IP: 196.203.x.x' },
    { id: 'l4', time: '2026-04-25 05:30', type: 'SUCCESS', msg: 'Nouveau signalement r12 soumis par Cheikh Sarr' },
    { id: 'l5', time: '2026-04-25 04:00', type: 'INFO', msg: 'IA prédictive: analyse zones à risque — 3 zones identifiées' },
    { id: 'l6', time: '2026-04-24 23:15', type: 'ERROR', msg: 'Caméra CAM-04 (Pikine) — perte de signal' },
    { id: 'l7', time: '2026-04-24 22:00', type: 'INFO', msg: 'Sauvegarde automatique des données effectuée' },
    { id: 'l8', time: '2026-04-24 20:30', type: 'SUCCESS', msg: 'Signalement r11 validé — Points attribués à Fatou Ndoye (+50 pts)' },
    { id: 'l9', time: '2026-04-24 18:45', type: 'WARNING', msg: 'Signalement r10 rejeté (doublon) par Mme. Khadidjatou Ly' },
    { id: 'l10', time: '2026-04-24 16:00', type: 'INFO', msg: 'Mise à jour IA prédictive complétée — modèle v2.3' },
  ];

  /* ===================== STATE ===================== */
  let state = {
    currentUser: null,
    currentTab: 'home',
    currentSidebarTab: 'dashboard',
    reports: [...REPORTS_DEFAULT],
    users: [...USERS_DEFAULT],
    alerts: [...ALERTS_DEFAULT],
    logs: [...LOGS_DEFAULT],
    alertInterval: null,
    leafletMap: null,
    charts: {},
  };

  /* ===================== LOCAL STORAGE ===================== */
  function saveToStorage() {
    try {
      localStorage.setItem('ddr_reports', JSON.stringify(state.reports));
      localStorage.setItem('ddr_users', JSON.stringify(state.users));
      localStorage.setItem('ddr_current_user', JSON.stringify(state.currentUser));
    } catch(e) {}
  }

  function loadFromStorage() {
    try {
      const reports = localStorage.getItem('ddr_reports');
      const users = localStorage.getItem('ddr_users');
      const currentUser = localStorage.getItem('ddr_current_user');
      if (reports) state.reports = JSON.parse(reports);
      if (users) state.users = JSON.parse(users);
      if (currentUser) state.currentUser = JSON.parse(currentUser);
    } catch(e) {}
  }

  /* ===================== AUTH ===================== */
  function login(email, password) {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      state.currentUser = user;
      const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'INFO', msg: `Connexion: ${user.name} (${user.role}) — IP: 196.203.x.x` };
      state.logs.unshift(log);
      saveToStorage();
      return { success: true, user };
    }
    return { success: false, error: 'Identifiants incorrects' };
  }

  function logout() {
    state.currentUser = null;
    if (state.alertInterval) clearInterval(state.alertInterval);
    state.alertInterval = null;
    if (state.leafletMap) { state.leafletMap.remove(); state.leafletMap = null; }
    state.charts = {};
    localStorage.removeItem('ddr_current_user');
    window.location.reload();
  }

  /* ===================== REPORTS ===================== */
  function addReport(data) {
    const user = state.currentUser;
    const newReport = {
      id: 'r' + Date.now(),
      type: data.type,
      description: data.description,
      lat: data.lat || (14.6928 + (Math.random() - 0.5) * 0.05),
      lng: data.lng || (-17.4467 + (Math.random() - 0.5) * 0.05),
      status: 'en_attente',
      reportedBy: user.id,
      reportedByName: user.name,
      date: new Date().toISOString().split('T')[0],
      validatedBy: null,
      photos: [],
      zone: data.zone || user.zone,
      severity: data.severity || 'medium',
      upvotes: 0,
    };
    state.reports.unshift(newReport);
    // Update user stats & points
    const userIdx = state.users.findIndex(u => u.id === user.id);
    if (userIdx !== -1) {
      state.users[userIdx].signalements++;
      state.users[userIdx].points += 10;
      state.currentUser = state.users[userIdx];
    }
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'SUCCESS', msg: `Nouveau signalement soumis par ${user.name}: ${data.type}` };
    state.logs.unshift(log);
    saveToStorage();
    return newReport;
  }

  function validateReport(id, ministereUser) {
    const idx = state.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    state.reports[idx].status = 'validé';
    state.reports[idx].validatedBy = ministereUser ? ministereUser.id : null;
    // Award points to reporter
    const reporterIdx = state.users.findIndex(u => u.id === state.reports[idx].reportedBy);
    if (reporterIdx !== -1) {
      state.users[reporterIdx].points += 50;
      state.users[reporterIdx].validated++;
      if (state.currentUser && state.currentUser.id === state.users[reporterIdx].id) {
        state.currentUser = state.users[reporterIdx];
      }
    }
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'SUCCESS', msg: `Signalement ${id} validé par ${ministereUser ? ministereUser.name : 'Ministère'} (+50 pts attribués)` };
    state.logs.unshift(log);
    saveToStorage();
    return true;
  }

  function rejectReport(id, reason, ministereUser) {
    const idx = state.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    state.reports[idx].status = 'rejeté';
    state.reports[idx].validatedBy = ministereUser ? ministereUser.id : null;
    state.reports[idx].rejectionReason = reason || 'Signalement non conforme.';
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'WARNING', msg: `Signalement ${id} rejeté par ${ministereUser ? ministereUser.name : 'Ministère'}: ${reason}` };
    state.logs.unshift(log);
    saveToStorage();
    return true;
  }

  function deleteReport(id) {
    state.reports = state.reports.filter(r => r.id !== id);
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'WARNING', msg: `Signalement ${id} supprimé par Super Admin` };
    state.logs.unshift(log);
    saveToStorage();
  }

  /* ===================== USERS ===================== */
  function addUser(data) {
    const newUser = { id: 'u' + Date.now(), ...data, points: 0, signalements: 0, validated: 0, joined: new Date().toISOString().split('T')[0] };
    state.users.push(newUser);
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'INFO', msg: `Nouvel utilisateur créé: ${data.name} (${data.role})` };
    state.logs.unshift(log);
    saveToStorage();
    return newUser;
  }

  function deleteUser(id) {
    state.users = state.users.filter(u => u.id !== id);
    const log = { id: 'l' + Date.now(), time: formatDateTime(new Date()), type: 'WARNING', msg: `Utilisateur ${id} supprimé par Super Admin` };
    state.logs.unshift(log);
    saveToStorage();
  }

  /* ===================== STATS ===================== */
  function getStats() {
    const reports = state.reports;
    const users = state.users;
    return {
      totalReports: reports.length,
      pending: reports.filter(r => r.status === 'en_attente').length,
      validated: reports.filter(r => r.status === 'validé').length,
      rejected: reports.filter(r => r.status === 'rejeté').length,
      inProgress: reports.filter(r => r.status === 'en_cours').length,
      done: reports.filter(r => r.status === 'terminé').length,
      totalUsers: users.filter(u => u.role === 'citoyen').length,
      totalMinistere: users.filter(u => u.role === 'ministere').length,
      byType: {
        'Nid de poule': reports.filter(r => r.type === 'Nid de poule').length,
        'Travaux de voirie': reports.filter(r => r.type === 'Travaux de voirie').length,
        'Caniveau bouché': reports.filter(r => r.type === 'Caniveau bouché').length,
        'Route inondée': reports.filter(r => r.type === 'Route inondée').length,
        'Feux tricolores': reports.filter(r => r.type === 'Feux tricolores défectueux').length,
        'Autres': reports.filter(r => !['Nid de poule','Travaux de voirie','Caniveau bouché','Route inondée','Feux tricolores défectueux'].includes(r.type)).length,
      },
      byZone: {},
      leaderboard: [...users].filter(u => u.role === 'citoyen').sort((a, b) => b.points - a.points).slice(0, 10),
    };
  }

  /* ===================== UTILS ===================== */
  function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Il y a ' + diff + 's';
    if (diff < 3600) return 'Il y a ' + Math.floor(diff/60) + ' min';
    if (diff < 86400) return 'Il y a ' + Math.floor(diff/3600) + 'h';
    return 'Il y a ' + Math.floor(diff/86400) + 'j';
  }

  function getStatusBadge(status) {
    const map = {
      'en_attente': '<span class="badge badge-warning">⏳ En attente</span>',
      'validé': '<span class="badge badge-accent">✅ Validé</span>',
      'rejeté': '<span class="badge badge-danger">❌ Rejeté</span>',
      'en_cours': '<span class="badge badge-primary">🔧 En cours</span>',
      'terminé': '<span class="badge badge-muted">✔ Terminé</span>',
    };
    return map[status] || '<span class="badge badge-muted">' + status + '</span>';
  }

  function getSeverityColor(severity) {
    const map = { critical: '#FF4757', high: '#FF6B2B', medium: '#FFD93D', low: '#00D4AA' };
    return map[severity] || '#FF6B2B';
  }

  function getTypeEmoji(type) {
    const map = {
      'Nid de poule': '🕳️',
      'Travaux de voirie': '🚧',
      'Caniveau bouché': '🌊',
      'Route inondée': '🌧️',
      'Feux tricolores défectueux': '🚦',
      'Panneaux manquants': '⚠️',
      'Pont endommagé': '🌉',
    };
    return map[type] || '📍';
  }

  /* ===================== INIT ===================== */
  loadFromStorage();

  return {
    state,
    login,
    logout,
    addReport,
    validateReport,
    rejectReport,
    deleteReport,
    addUser,
    deleteUser,
    getStats,
    formatDate,
    formatDateTime,
    timeAgo,
    getStatusBadge,
    getSeverityColor,
    getTypeEmoji,
    saveToStorage,
  };

})();
