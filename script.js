let filterData = { platform: {}, category: {}, difficulty: {}, language: {}, os: {}, status: {} };

/* NEW: Ensure all columns are visible on mobile by removing responsive hide classes */
function unhideResponsiveColumns() {
  const cells = document.querySelectorAll(
    '.writeup-table thead th.small-hide, .writeup-table thead th.medium-hide, ' +
    '.writeup-table tbody td.small-hide, .writeup-table tbody td.medium-hide'
  );
  cells.forEach(el => {
    el.classList.remove('small-hide', 'medium-hide');
  });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  try { localStorage.setItem('writeupz-dark', isDark ? '1' : '0'); } catch (_) {}
}

// Restore dark mode preference
(function restoreDark() {
  try { if (localStorage.getItem('writeupz-dark') === '1') document.body.classList.add('dark-mode'); } catch (_) {}
})();

// Update filters with unique values dynamically
function updateFilters() {
  const rows = document.querySelectorAll('#writeupTableBody tr');
  filterData = { platform: {}, category: {}, difficulty: {}, language: {}, os: {}, status: {} };

  rows.forEach(row => {
    const platform = row.getAttribute('data-platform') || '';
    const category = row.getAttribute('data-category') || '';
    const difficulty = row.getAttribute('data-difficulty') || '';
    const language = row.getAttribute('data-language') || '';
    const os = row.getAttribute('data-os') || '';
    const status = row.getAttribute('data-status') || '';

    filterData.platform[platform] = (filterData.platform[platform] || 0) + 1;
    filterData.category[category] = (filterData.category[category] || 0) + 1;
    filterData.difficulty[difficulty] = (filterData.difficulty[difficulty] || 0) + 1;
    filterData.language[language] = (filterData.language[language] || 0) + 1;
    filterData.os[os] = (filterData.os[os] || 0) + 1;
    filterData.status[status] = (filterData.status[status] || 0) + 1;
  });

  updateFilterOptions('platformFilter', filterData.platform);
  updateFilterOptions('categoryFilter', filterData.category);
  updateFilterOptions('difficultyFilter', filterData.difficulty);
  updateFilterOptions('languageFilter', filterData.language);
  updateFilterOptions('osFilter', filterData.os);
  updateFilterOptions('statusFilter', filterData.status);
}

function updateFilterOptions(filterId, items) {
  const filter = document.getElementById(filterId);
  const placeholder = filter.querySelector('option');
  const placeholderClone = placeholder.cloneNode(true);
  filter.innerHTML = '';
  filter.appendChild(placeholderClone);
  for (const [key, value] of Object.entries(items)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${key} (${value})`;
    filter.appendChild(option);
  }
}

function getDateValue(row) {
  const iso = row.getAttribute('data-date-completed');
  return iso ? new Date(iso).getTime() : 0;
}

const difficultyRank = { 'very easy': 1, 'easy': 2, 'medium': 3, 'hard': 4, 'insane': 5 };
function getDifficultyValue(row) {
  const d = (row.getAttribute('data-difficulty') || '').toLowerCase();
  return difficultyRank[d] ?? 999;
}

function sortWriteups() {
  const criterion = document.getElementById('sortSelect').value;
  const tbody = document.getElementById('writeupTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  if (criterion === 'none') return;

  rows.sort((a, b) => {
    switch (criterion) {
      case 'date-asc':
        return getDateValue(a) - getDateValue(b);
      case 'date-desc':
        return getDateValue(b) - getDateValue(a);
      case 'difficulty-asc':
        return getDifficultyValue(a) - getDifficultyValue(b);
      case 'difficulty-desc':
        return getDifficultyValue(b) - getDifficultyValue(a);
      default:
        return 0;
    }
  });

  rows.forEach(r => tbody.appendChild(r));
  filterWriteups();
  try { localStorage.setItem('writeupz-sort', criterion); } catch (_) {}
}

function resetSort() {
  document.getElementById('sortSelect').value = 'none';
  try { localStorage.removeItem('writeupz-sort'); } catch (_) {}

  const tbody = document.getElementById('writeupTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort((a, b) => parseInt(a.firstElementChild.textContent, 10) - parseInt(b.firstElementChild.textContent, 10));
  rows.forEach(r => tbody.appendChild(r));
  filterWriteups();
}

// Filter the table
function filterWriteups() {
  const searchInput = (document.getElementById('searchInput').value || '').toLowerCase();
  const platformFilter = (document.getElementById('platformFilter').value || '').toLowerCase();
  const categoryFilter = (document.getElementById('categoryFilter').value || '').toLowerCase();
  const difficultyFilter = (document.getElementById('difficultyFilter').value || '').toLowerCase();
  const languageFilter = (document.getElementById('languageFilter').value || '').toLowerCase();
  const osFilter = (document.getElementById('osFilter').value || '').toLowerCase();
  const statusFilter = (document.getElementById('statusFilter').value || '').toLowerCase();

  const rows = document.querySelectorAll('#writeupTableBody tr');
  rows.forEach(row => {
    const name = row.querySelector('td:nth-child(2) a').textContent.toLowerCase();
    const platform = (row.getAttribute('data-platform') || '').toLowerCase();
    const category = (row.getAttribute('data-category') || '').toLowerCase();
    const difficulty = (row.getAttribute('data-difficulty') || '').toLowerCase();
    const language = (row.getAttribute('data-language') || '').toLowerCase();
    const os = (row.getAttribute('data-os') || '').toLowerCase();
    const status = (row.getAttribute('data-status') || '').toLowerCase();

    const matchesSearch = name.includes(searchInput);
    const matchesPlatform = platform.includes(platformFilter);
    const matchesCategory = category.includes(categoryFilter);
    const matchesDifficulty = difficulty.includes(difficultyFilter);
    const matchesLanguage = language.includes(languageFilter);
    const matchesOs = os.includes(osFilter);
    const matchesStatus = status.includes(statusFilter);

    row.style.display = (matchesSearch && matchesPlatform && matchesCategory && matchesDifficulty && matchesLanguage && matchesOs && matchesStatus) ? '' : 'none';
  });
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('platformFilter').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('difficultyFilter').value = '';
  document.getElementById('languageFilter').value = '';
  document.getElementById('osFilter').value = '';
  document.getElementById('statusFilter').value = '';
  filterWriteups();
}

// Initialize on page load
window.addEventListener('load', function () {
  unhideResponsiveColumns();           // <-- NEW: make all columns visible on mobile
  updateFilters();
  filterWriteups();
  // Restore sort choice
  try {
    const savedSort = localStorage.getItem('writeupz-sort');
    if (savedSort) {
      const sel = document.getElementById('sortSelect');
      if (Array.from(sel.options).some(o => o.value === savedSort)) {
        sel.value = savedSort;
        sortWriteups();
      }
    }
  } catch (_) {}
});
