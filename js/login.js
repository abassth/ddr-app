/* ============================================================
   DDR — Login Page
   ============================================================ */

DDR.renderLogin = function() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-page">
      <div class="login-orb login-orb-1"></div>
      <div class="login-orb login-orb-2"></div>
      <div class="login-orb login-orb-3"></div>

      <div class="login-card" id="login-card">
        <!-- Logo -->
        <div class="login-logo">
          <div class="login-logo-icon">🛣️</div>
          <div class="login-title">DDR</div>
          <div class="login-subtitle">Day Daw Rek — Ensemble pour nos routes</div>
        </div>

        <!-- Step 1: Role selection -->
        <div id="login-step-role">
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;font-weight:600;">Sélectionnez votre rôle</div>
          <div class="role-selector">
            <button class="role-btn" id="role-citoyen" onclick="selectRole('citoyen')">
              <div class="role-icon">👤</div>
              <div class="role-info">
                <div class="role-name">Citoyen</div>
                <div class="role-desc">Signaler un problème routier</div>
              </div>
              <span style="margin-left:auto;color:var(--text-muted);font-size:18px;">›</span>
            </button>
            <button class="role-btn" id="role-ministere" onclick="selectRole('ministere')">
              <div class="role-icon">🏛️</div>
              <div class="role-info">
                <div class="role-name">Ministère</div>
                <div class="role-desc">Gérer et valider les signalements</div>
              </div>
              <span style="margin-left:auto;color:var(--text-muted);font-size:18px;">›</span>
            </button>
            <button class="role-btn" id="role-admin" onclick="selectRole('admin')">
              <div class="role-icon">🔧</div>
              <div class="role-info">
                <div class="role-name">Super Admin</div>
                <div class="role-desc">Administration complète de l'application</div>
              </div>
              <span style="margin-left:auto;color:var(--text-muted);font-size:18px;">›</span>
            </button>
          </div>
          <div style="text-align:center;margin-top:24px;font-size:11px;color:var(--text-muted);">
            🇸🇳 Application de service public — Sénégal
          </div>
        </div>

        <!-- Step 2: Login form -->
        <div id="login-step-form" style="display:none;">
          <button onclick="backToRoles()" style="display:flex;align-items:center;gap:6px;color:var(--text-muted);font-size:13px;cursor:pointer;background:none;border:none;font-family:inherit;margin-bottom:20px;">
            ← Retour
          </button>
          <div id="login-role-display" style="display:flex;align-items:center;gap:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:20px;"></div>
          
          <div class="login-demo-hint" id="login-demo-hint">
            <span>💡</span>
            <div>
              <div style="font-weight:700;margin-bottom:2px;">Mode démo</div>
              <div id="demo-creds" style="opacity:0.8;"></div>
            </div>
            <button onclick="fillDemo()" class="btn btn-sm" style="margin-left:auto;background:rgba(84,160,255,0.2);color:var(--info);border:1px solid rgba(84,160,255,0.3);flex-shrink:0;">Auto-remplir</button>
          </div>

          <form class="login-form" onsubmit="submitLogin(event)" id="login-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="login-email" placeholder="votre@email.sn" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label class="form-label">Mot de passe</label>
              <input type="password" class="form-input" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
            </div>
            <div id="login-error" style="color:var(--danger);font-size:13px;display:none;padding:8px 12px;background:var(--danger-alpha);border-radius:var(--radius-sm);"></div>
            <button type="submit" class="btn btn-primary btn-lg w-full" id="login-submit">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Role state
  let selectedRole = null;
  const credentials = {
    citoyen: { email: 'moussa@ddr.sn', password: 'demo123', label: 'Email: moussa@ddr.sn | MDP: demo123' },
    ministere: { email: 'ministere@ddr.sn', password: 'admin123', label: 'Email: ministere@ddr.sn | MDP: admin123' },
    admin: { email: 'admin@ddr.sn', password: 'superadmin123', label: 'Email: admin@ddr.sn | MDP: superadmin123' },
  };
  const roleInfo = {
    citoyen: { icon: '👤', name: 'Citoyen', color: 'var(--primary)' },
    ministere: { icon: '🏛️', name: 'Ministère des Travaux Publics', color: 'var(--accent)' },
    admin: { icon: '🔧', name: 'Super Administrateur', color: 'var(--info)' },
  };

  window.selectRole = function(role) {
    selectedRole = role;
    document.getElementById('login-step-role').style.display = 'none';
    document.getElementById('login-step-form').style.display = 'block';
    const info = roleInfo[role];
    const creds = credentials[role];
    document.getElementById('login-role-display').innerHTML = `
      <span style="font-size:24px;">${info.icon}</span>
      <div>
        <div style="font-weight:700;font-size:14px;color:${info.color};">${info.name}</div>
        <div style="font-size:11px;color:var(--text-muted);">Accès ${role}</div>
      </div>
    `;
    document.getElementById('demo-creds').textContent = creds.label;
  };

  window.backToRoles = function() {
    selectedRole = null;
    document.getElementById('login-step-role').style.display = 'block';
    document.getElementById('login-step-form').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';
  };

  window.fillDemo = function() {
    if (!selectedRole) return;
    const creds = credentials[selectedRole];
    document.getElementById('login-email').value = creds.email;
    document.getElementById('login-password').value = creds.password;
  };

  window.submitLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit');
    btn.textContent = 'Connexion...';
    btn.disabled = true;
    setTimeout(function() {
      const result = DDR.login(email, password);
      if (result.success) {
        DDR.showToast('Bienvenue, ' + result.user.name + ' ! 👋', 'success');
        DDR.navigate(result.user.role);
        DDR.startAlerts();
      } else {
        const errEl = document.getElementById('login-error');
        errEl.textContent = '❌ ' + result.error + '. Vérifiez vos identifiants.';
        errEl.style.display = 'block';
        btn.textContent = 'Se connecter';
        btn.disabled = false;
      }
    }, 600);
  };
};
