document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initNav();

  const grid = document.getElementById('links-grid');
  const p = getProfile();

  // Build category sections
  LINKS_DATA.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'cat-section';
    section.id = cat.id;

    const header = document.createElement('div');
    header.className = 'cat-section-header';
    header.innerHTML = `
      <div class="cat-header-left">
        <span class="cat-section-emoji">${cat.emoji}</span>
        <span class="cat-section-name">${cat.label}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="cat-section-count">${cat.links.length}</span>
        <div class="cat-toggle"></div>
      </div>
    `;
    header.addEventListener('click', () => section.classList.toggle('collapsed'));

    const body = document.createElement('div');
    body.className = 'cat-section-body';

    cat.links.forEach(url => {
      const visitCount = (p.linkVisits || {})[url] || 0;
      const bookmarked = isBookmarked(url);
      const host = url.replace(/^https?:\/\//, '');

      const row = document.createElement('div');
      row.className = 'link-row';
      row.dataset.url = url;

      const anchor = document.createElement('a');
      anchor.className = 'link-anchor';
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.title = url;
      anchor.textContent = host;
      anchor.addEventListener('click', () => {
        const pts = recordLinkVisit(url);
        refreshPoints();
        // Update count display
        const vc = row.querySelector('.link-visit-count');
        const newCount = (p.linkVisits[url] || 0);
        if (vc) vc.textContent = newCount > 0 ? `×${newCount}` : '';
        showToast(`+2 pts`, 'success');
      });

      const visitEl = document.createElement('span');
      visitEl.className = 'link-visit-count';
      visitEl.textContent = visitCount > 0 ? `×${visitCount}` : '';

      const bmBtn = document.createElement('button');
      bmBtn.className = `bm-btn${bookmarked ? ' bookmarked' : ''}`;
      bmBtn.title = bookmarked ? 'Remove bookmark' : 'Bookmark';
      bmBtn.textContent = bookmarked ? '🔖' : '🔖';
      bmBtn.style.opacity = bookmarked ? '1' : '';
      bmBtn.addEventListener('click', () => {
        const added = toggleBookmark(url);
        bmBtn.classList.toggle('bookmarked', added);
        bmBtn.style.opacity = added ? '1' : '';
        showToast(added ? '🔖 Bookmarked!' : 'Bookmark removed', added ? 'success' : 'info');
        const profile = getProfile();
        checkRewards(profile);
        saveProfile(profile);
      });

      row.appendChild(anchor);
      row.appendChild(visitEl);
      row.appendChild(bmBtn);
      body.appendChild(row);
    });

    section.appendChild(header);
    section.appendChild(body);
    grid.appendChild(section);
  });

  // Scroll to hash
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
  }

  // Filter pills
  const pillsContainer = document.getElementById('filter-pills');
  LINKS_DATA.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.dataset.filter = cat.id;
    pill.textContent = `${cat.emoji} ${cat.label}`;
    pill.addEventListener('click', () => filterByCategory(cat.id, pill));
    pillsContainer.appendChild(pill);
  });

  function filterByCategory(id, clickedPill) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    clickedPill.classList.add('active');
    document.querySelectorAll('.cat-section').forEach(s => {
      if (id === 'all' || s.id === id) {
        s.classList.remove('hidden-search');
      } else {
        s.classList.add('hidden-search');
      }
    });
    document.getElementById('search-input').value = '';
  }

  document.querySelector('.pill[data-filter="all"]').addEventListener('click', function() {
    filterByCategory('all', this);
  });

  // Search
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.pill[data-filter="all"]').classList.add('active');

    document.querySelectorAll('.cat-section').forEach(section => {
      const catLabel = section.querySelector('.cat-section-name')?.textContent.toLowerCase() || '';
      const rows = section.querySelectorAll('.link-row');
      let anyVisible = false;

      rows.forEach(row => {
        const url = row.dataset.url?.toLowerCase() || '';
        const match = !q || url.includes(q) || catLabel.includes(q);
        row.classList.toggle('hidden-search', !match);
        if (match) anyVisible = true;
      });

      section.classList.toggle('hidden-search', !anyVisible && q !== '');
      if (q && anyVisible) section.classList.remove('collapsed');
    });
  });
});