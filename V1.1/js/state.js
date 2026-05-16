// ============================
// STATE MANAGER
// ============================

const STATE = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem('raji_' + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('raji_' + key, JSON.stringify(value)); } catch {}
  }
};

// ============================
// USER PROFILE
// ============================

function getProfile() {
  return STATE.get('profile', {
    title: null,
    points: 0,
    lastVisit: null,
    visitStreak: 0,
    bookmarks: [],
    linkVisits: {},   // url -> count
    unlockedRewards: [],
    codesUsed: []
  });
}

function saveProfile(p) {
  STATE.set('profile', p);
}

function checkDailyVisit() {
  const p = getProfile();
  const today = new Date().toDateString();
  if (p.lastVisit !== today) {
    p.points = (p.points || 0) + 10;
    p.lastVisit = today;
    p.visitStreak = (p.visitStreak || 0) + 1;
    saveProfile(p);
    return { awarded: true, streak: p.visitStreak, points: p.points };
  }
  return { awarded: false };
}

function recordLinkVisit(url) {
  const p = getProfile();
  p.linkVisits = p.linkVisits || {};
  p.linkVisits[url] = (p.linkVisits[url] || 0) + 1;
  p.points = (p.points || 0) + 2;
  checkRewards(p);
  saveProfile(p);
  return p.points;
}

function toggleBookmark(url) {
  const p = getProfile();
  p.bookmarks = p.bookmarks || [];
  const idx = p.bookmarks.indexOf(url);
  if (idx === -1) {
    p.bookmarks.push(url);
    saveProfile(p);
    return true; // added
  } else {
    p.bookmarks.splice(idx, 1);
    saveProfile(p);
    return false; // removed
  }
}

function isBookmarked(url) {
  const p = getProfile();
  return (p.bookmarks || []).includes(url);
}

function redeemCode(code) {
  const p = getProfile();
  p.codesUsed = p.codesUsed || [];
  const upperCode = code.toUpperCase().trim();

  const CODES = {
    'RAJIIBOIII': { title: 'OG', bonus: 500 },
    'INDIAN': { title: 'BRO', bonus: 250 }
  };

  if (!CODES[upperCode]) return { success: false, msg: 'Invalid code.' };
  if (p.codesUsed.includes(upperCode)) return { success: false, msg: 'Code already used.' };

  p.title = CODES[upperCode].title;
  p.points = (p.points || 0) + CODES[upperCode].bonus;
  p.codesUsed.push(upperCode);
  saveProfile(p);
  return { success: true, title: p.title, points: p.points, bonus: CODES[upperCode].bonus };
}

const REWARDS = [
  { id: 'first_steps', label: 'First Steps', desc: 'Visit 5 links', icon: '👣', condition: p => Object.values(p.linkVisits || {}).reduce((a,b) => a+b, 0) >= 5 },
  { id: 'explorer', label: 'Explorer', desc: 'Visit 25 links', icon: '🗺️', condition: p => Object.values(p.linkVisits || {}).reduce((a,b) => a+b, 0) >= 25 },
  { id: 'veteran', label: 'Veteran', desc: 'Visit 100 links', icon: '🏆', condition: p => Object.values(p.linkVisits || {}).reduce((a,b) => a+b, 0) >= 100 },
  { id: 'streak3', label: '3-Day Streak', desc: 'Visit 3 days in a row', icon: '🔥', condition: p => (p.visitStreak || 0) >= 3 },
  { id: 'streak7', label: 'Week Warrior', desc: 'Visit 7 days in a row', icon: '⚡', condition: p => (p.visitStreak || 0) >= 7 },
  { id: 'bookmarker', label: 'Bookmarker', desc: 'Bookmark 5 links', icon: '🔖', condition: p => (p.bookmarks || []).length >= 5 },
  { id: 'rich', label: 'Rich', desc: 'Earn 1000 points', icon: '💎', condition: p => (p.points || 0) >= 1000 },
];

function checkRewards(p) {
  p.unlockedRewards = p.unlockedRewards || [];
  REWARDS.forEach(r => {
    if (!p.unlockedRewards.includes(r.id) && r.condition(p)) {
      p.unlockedRewards.push(r.id);
      p.points = (p.points || 0) + 100;
      showToast(`🏆 Achievement: ${r.label} (+100 pts)`, 'achievement');
    }
  });
}