// ============================
// BACKGROUND CANVAS
// ============================

function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#00f5c4' : '#7b2fff'
      });
    }
    stars = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 0.9 + 0.1,
        alpha: Math.random() * 0.6 + 0.1,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // nebula blobs
    const nebulae = [
      { x: W * 0.15, y: H * 0.2, r: 350, color: 'rgba(123,47,255,0.04)' },
      { x: W * 0.85, y: H * 0.75, r: 400, color: 'rgba(0,245,196,0.03)' },
      { x: W * 0.5, y: H * 0.5, r: 300, color: 'rgba(255,47,160,0.02)' }
    ];
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // stars
    stars.forEach(s => {
      s.twinkle += 0.01;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // particles + connections
    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba').replace('#00f5c4', 'rgba(0,245,196').replace('#7b2fff', 'rgba(123,47,255');
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,245,196,${0.06 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    t++;
    requestAnimationFrame(draw);
  }

  resize();
  initParticles();
  draw();
  window.addEventListener('resize', () => { resize(); initParticles(); });
}

// ============================
// TOAST
// ============================

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ============================
// NAV INIT
// ============================

function initNav() {
  const p = getProfile();

  // Points display
  const pd = document.getElementById('points-display');
  if (pd) pd.textContent = `⚡ ${p.points || 0} pts`;

  // Title badge
  const tb = document.getElementById('title-badge');
  if (tb && p.title) {
    tb.textContent = p.title;
    tb.style.display = 'inline-block';
  }

  // Daily visit bonus
  const result = checkDailyVisit();
  if (result.awarded) {
    setTimeout(() => {
      showToast(`🌟 Daily login bonus! +10 pts | Streak: ${result.streak} day${result.streak !== 1 ? 's' : ''}`, 'success');
      if (pd) pd.textContent = `⚡ ${result.points} pts`;
    }, 800);
  }

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') && path.endsWith(a.getAttribute('href').replace('../', '').replace('./', ''))) {
      a.classList.add('active');
    }
  });
}

function refreshPoints() {
  const p = getProfile();
  const pd = document.getElementById('points-display');
  if (pd) pd.textContent = `⚡ ${p.points || 0} pts`;
}