document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initNav();

  const totalLinks = LINKS_DATA.reduce((a, c) => a + c.links.length, 0);
  document.getElementById('total-links-count').textContent = totalLinks;
  document.getElementById('total-cats-count').textContent = LINKS_DATA.length;

  const p = getProfile();
  document.getElementById('user-pts-count').textContent = p.points || 0;

  // Category grid
  const catGrid = document.getElementById('cat-grid');
  LINKS_DATA.forEach(cat => {
    const a = document.createElement('a');
    a.className = 'cat-card';
    a.href = `pages/links.html#${cat.id}`;
    a.innerHTML = `
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-name">${cat.label}</span>
      <span class="cat-count">${cat.links.length} link${cat.links.length !== 1 ? 's' : ''}</span>
    `;
    catGrid.appendChild(a);
  });

  // Bookmarks quick view
  const bms = p.bookmarks || [];
  const bmContainer = document.getElementById('quick-bookmarks');
  const bmEmpty = document.getElementById('bm-empty');
  if (bms.length > 0) {
    bmEmpty.remove();
    bms.slice(0, 8).forEach(url => {
      const a = document.createElement('a');
      a.className = 'quick-bm';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const host = url.replace(/^https?:\/\//, '');
      a.innerHTML = `<span>🔖</span><span>${host}</span>`;
      bmContainer.appendChild(a);
    });
  }

  // Most visited
  const visits = p.linkVisits || {};
  const sorted = Object.entries(visits).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const mvContainer = document.getElementById('most-visited');
  const mvEmpty = document.getElementById('mv-empty');
  if (sorted.length > 0) {
    mvEmpty.remove();
    sorted.forEach(([url, count], i) => {
      const a = document.createElement('a');
      a.className = 'mv-item';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const host = url.replace(/^https?:\/\//, '');
      a.innerHTML = `
        <span class="mv-rank">#${i+1}</span>
        <span class="mv-url">${host}</span>
        <span class="mv-count">${count} visit${count !== 1 ? 's' : ''}</span>
      `;
      a.addEventListener('click', () => { recordLinkVisit(url); refreshPoints(); });
      mvContainer.appendChild(a);
    });
  }
});

function openCodeModal() {
  document.getElementById('code-modal').classList.add('open');
  setTimeout(() => document.getElementById('code-input').focus(), 200);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function submitCode() {
  const code = document.getElementById('code-input').value;
  const result = redeemCode(code);
  const el = document.getElementById('code-result');
  if (result.success) {
    el.style.color = 'var(--accent)';
    el.textContent = `✓ Title "${result.title}" unlocked! +${result.bonus} pts`;

    const tb = document.getElementById('title-badge');
    if (tb) {
      tb.textContent = result.title;
      tb.style.display = 'inline-block';
    }
    refreshPoints();
    document.getElementById('user-pts-count').textContent = result.points;
    showToast(`🎉 Code redeemed! Title: ${result.title}`, 'success');
  } else {
    el.style.color = 'var(--accent3)';
    el.textContent = `✗ ${result.msg}`;
  }
}

// Close modal on overlay click
document.getElementById('code-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal('code-modal');
});