/**
 * THE OPTOM ARCHIVE — Core Application Engine
 * Pure Vanilla JavaScript & Hash Routing
 */

(function () {
  'use strict';

  // State
  const state = {
    categories: [],
    resources: [],
    activeView: 'home',
    filters: {
      type: 'all',
      year: 'all',
      subject: 'all',
      query: '',
      sort: 'newest'
    },
    globalSearchQuery: '',
    selectedResource: null
  };

  // DOM Elements
  const DOM = {
    navItems: document.querySelectorAll('.site-nav .nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    
    // Home View
    heroSearchInput: document.getElementById('heroSearchInput'),
    heroSearchSubmit: document.getElementById('heroSearchSubmit'),
    heroCategoryCards: document.querySelectorAll('.category-card'),
    quickTagChips: document.querySelectorAll('.quick-tag-chip'),
    homeSubjectPills: document.getElementById('homeSubjectPills'),
    recentResourcesList: document.getElementById('recentResourcesList'),

    // Category Counters
    countNotes: document.getElementById('count-notes'),
    countPresentation: document.getElementById('count-presentation'),
    countBooks: document.getElementById('count-books'),
    countQuestionBank: document.getElementById('count-question_bank'),
    countSeminar: document.getElementById('count-seminar'),
    countReference: document.getElementById('count-reference'),

    // Resources View
    resourceQueryInput: document.getElementById('resourceQueryInput'),
    clearResourceQuery: document.getElementById('clearResourceQuery'),
    typeFilterPills: document.querySelectorAll('#typeFilterPills .filter-pill'),
    yearFilterPills: document.querySelectorAll('#yearFilterPills .filter-pill'),
    subjectSelectFilter: document.getElementById('subjectSelectFilter'),
    sortSelect: document.getElementById('sortSelect'),
    resourcesCountDisplay: document.getElementById('resourcesCountDisplay'),
    activeChipsTray: document.getElementById('activeChipsTray'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    resourcesListContainer: document.getElementById('resourcesListContainer'),
    resourcesEmptyState: document.getElementById('resourcesEmptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),

    // Subjects View
    classificationCatalog: document.getElementById('classificationCatalog'),

    // Search View
    globalSearchInput: document.getElementById('globalSearchInput'),
    clearGlobalSearch: document.getElementById('clearGlobalSearch'),
    searchTermBtns: document.querySelectorAll('.search-term-btn'),
    searchResultsOutput: document.getElementById('searchResultsOutput'),

    // Modal
    resourceModal: document.getElementById('resourceModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalClassification: document.getElementById('modalClassification'),
    modalTitle: document.getElementById('modalTitle'),
    modalType: document.getElementById('modalType'),
    modalYear: document.getElementById('modalYear'),
    modalSubject: document.getElementById('modalSubject'),
    modalFormat: document.getElementById('modalFormat'),
    modalDesc: document.getElementById('modalDesc'),
    modalCurriculum: document.getElementById('modalCurriculum'),
    modalAuthor: document.getElementById('modalAuthor'),
    modalPages: document.getElementById('modalPages'),
    modalPath: document.getElementById('modalPath'),
    modalTagsList: document.getElementById('modalTagsList'),
    modalOpenBtn: document.getElementById('modalOpenBtn'),
    modalFilterSimilarBtn: document.getElementById('modalFilterSimilarBtn')
  };

  // =========================================================================
  // INITIALIZATION & DATA FETCHING
  // =========================================================================

  async function initApp() {
    try {
      const response = await fetch('data/resources.json');
      if (!response.ok) throw new Error('Could not load resources dataset.');
      const data = await response.json();

      state.categories = data.categories || [];
      state.resources = data.resources || [];

      setupSubjectDropdown();
      updateCategoryCounters();
      renderHomeSubjectsPreview();
      renderRecentResources();
      renderClassificationCatalog();

      setupEventListeners();
      handleRoute();
      window.addEventListener('hashchange', handleRoute);
    } catch (err) {
      console.error('Error initializing The Optom Archive:', err);
    }
  }

  // =========================================================================
  // ROUTING & NAVIGATION
  // =========================================================================

  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'home';
    const [viewName, queryString] = hash.split('?');

    const validViews = ['home', 'resources', 'subjects', 'search'];
    const targetView = validViews.includes(viewName) ? viewName : 'home';

    state.activeView = targetView;

    // Parse query params if any
    if (queryString) {
      const params = new URLSearchParams(queryString);
      if (params.has('type')) state.filters.type = params.get('type');
      if (params.has('year')) state.filters.year = params.get('year');
      if (params.has('subject')) state.filters.subject = params.get('subject');
      if (params.has('q')) {
        if (targetView === 'search') {
          state.globalSearchQuery = params.get('q');
        } else {
          state.filters.query = params.get('q');
        }
      }
    }

    // Switch view
    DOM.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${targetView}`);
    });

    // Update nav active item
    DOM.navItems.forEach(nav => {
      nav.classList.toggle('active', nav.dataset.view === targetView);
    });

    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger View Specific Render
    if (targetView === 'resources') {
      syncFilterControlsWithState();
      renderResourcesList();
    } else if (targetView === 'search') {
      if (DOM.globalSearchInput) {
        DOM.globalSearchInput.value = state.globalSearchQuery;
        if (state.globalSearchQuery) {
          executeGlobalSearch(state.globalSearchQuery);
        } else {
          renderEmptySearchState();
        }
      }
    }
  }

  function navigateTo(view, params = {}) {
    let hash = `#${view}`;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== 'all') query.set(key, val);
    });
    const qStr = query.toString();
    if (qStr) hash += `?${qStr}`;
    window.location.hash = hash;
  }

  // =========================================================================
  // HOME VIEW LOGIC
  // =========================================================================

  function updateCategoryCounters() {
    const counts = {
      notes: 0,
      presentation: 0,
      books: 0,
      question_bank: 0,
      seminar: 0,
      reference: 0
    };

    state.resources.forEach(r => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });

    if (DOM.countNotes) DOM.countNotes.textContent = `${counts.notes} resources`;
    if (DOM.countPresentation) DOM.countPresentation.textContent = `${counts.presentation} resources`;
    if (DOM.countBooks) DOM.countBooks.textContent = `${counts.books} references`;
    if (DOM.countQuestionBank) DOM.countQuestionBank.textContent = `${counts.question_bank} resources`;
    if (DOM.countSeminar) DOM.countSeminar.textContent = `${counts.seminar} resources`;
    if (DOM.countReference) DOM.countReference.textContent = `${counts.reference} resources`;
  }

  function renderHomeSubjectsPreview() {
    if (!DOM.homeSubjectPills) return;
    DOM.homeSubjectPills.innerHTML = '';

    state.categories.forEach(cat => {
      const block = document.createElement('div');
      block.className = 'editorial-subject-block';

      const subjectsHtml = cat.subjects.slice(0, 4).map(sub => {
        return `
          <li>
            <a href="#resources?subject=${encodeURIComponent(sub)}" class="subtopic-link">
              <span>${escapeHtml(sub)}</span>
              <span class="subtopic-arrow">→</span>
            </a>
          </li>
        `;
      }).join('');

      block.innerHTML = `
        <span class="subject-code-tag">${escapeHtml(cat.code)}</span>
        <h3 class="subject-group-title">${escapeHtml(cat.title)}</h3>
        <ul class="subject-subtopics-list">
          ${subjectsHtml}
        </ul>
      `;
      DOM.homeSubjectPills.appendChild(block);
    });
  }

  function renderRecentResources() {
    if (!DOM.recentResourcesList) return;
    DOM.recentResourcesList.innerHTML = '';

    const recent = [...state.resources]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 6);

    recent.forEach(r => {
      DOM.recentResourcesList.appendChild(createResourceCard(r));
    });
  }

  // =========================================================================
  // RESOURCES VIEW (THE ENGINE)
  // =========================================================================

  function setupSubjectDropdown() {
    if (!DOM.subjectSelectFilter) return;
    DOM.subjectSelectFilter.innerHTML = '<option value="all">All Subjects</option>';

    // Group subjects by category
    state.categories.forEach(cat => {
      const group = document.createElement('optgroup');
      group.label = `${cat.code} · ${cat.title}`;

      cat.subjects.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        group.appendChild(opt);
      });

      DOM.subjectSelectFilter.appendChild(group);
    });
  }

  function syncFilterControlsWithState() {
    // Type pills
    DOM.typeFilterPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.type === state.filters.type);
    });

    // Year pills
    DOM.yearFilterPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.year === state.filters.year);
    });

    // Subject dropdown
    if (DOM.subjectSelectFilter) {
      DOM.subjectSelectFilter.value = state.filters.subject;
    }

    // Search query
    if (DOM.resourceQueryInput) {
      DOM.resourceQueryInput.value = state.filters.query;
    }

    // Sort select
    if (DOM.sortSelect) {
      DOM.sortSelect.value = state.filters.sort;
    }
  }

  function renderResourcesList() {
    if (!DOM.resourcesListContainer) return;

    let filtered = state.resources.filter(r => {
      // Type Filter
      if (state.filters.type !== 'all' && r.type !== state.filters.type) {
        return false;
      }
      // Year Filter
      if (state.filters.year !== 'all' && r.year.toString() !== state.filters.year.toString()) {
        return false;
      }
      // Subject Filter
      if (state.filters.subject !== 'all' && r.subject.toLowerCase() !== state.filters.subject.toLowerCase()) {
        return false;
      }
      // Query Filter
      if (state.filters.query.trim()) {
        const q = state.filters.query.toLowerCase().trim();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchSub = r.subject.toLowerCase().includes(q);
        const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
        const matchAuthor = (r.author || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSub && !matchTags && !matchAuthor) {
          return false;
        }
      }
      return true;
    });

    // Sort
    if (state.filters.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } else if (state.filters.sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.filters.sort === 'year') {
      filtered.sort((a, b) => a.year - b.year);
    }

    // Update Counter & Active Filter Chips
    if (DOM.resourcesCountDisplay) {
      DOM.resourcesCountDisplay.textContent = filtered.length;
    }
    renderActiveFilterChips();

    // Render Cards or Empty State
    DOM.resourcesListContainer.innerHTML = '';
    if (filtered.length === 0) {
      DOM.resourcesEmptyState.classList.remove('hidden');
    } else {
      DOM.resourcesEmptyState.classList.add('hidden');
      filtered.forEach(r => {
        DOM.resourcesListContainer.appendChild(createResourceCard(r));
      });
    }
  }

  function renderActiveFilterChips() {
    if (!DOM.activeChipsTray) return;
    DOM.activeChipsTray.innerHTML = '';

    const addChip = (label, onRemove) => {
      const chip = document.createElement('span');
      chip.className = 'active-filter-chip';
      chip.innerHTML = `${escapeHtml(label)} <span class="chip-remove" role="button" aria-label="Remove filter">✕</span>`;
      chip.querySelector('.chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove();
      });
      DOM.activeChipsTray.appendChild(chip);
    };

    if (state.filters.type !== 'all') {
      addChip(`Type: ${formatTypeLabel(state.filters.type)}`, () => {
        state.filters.type = 'all';
        navigateTo('resources', state.filters);
      });
    }

    if (state.filters.year !== 'all') {
      addChip(`Year ${state.filters.year}`, () => {
        state.filters.year = 'all';
        navigateTo('resources', state.filters);
      });
    }

    if (state.filters.subject !== 'all') {
      addChip(`Subject: ${state.filters.subject}`, () => {
        state.filters.subject = 'all';
        navigateTo('resources', state.filters);
      });
    }

    if (state.filters.query.trim()) {
      addChip(`"${state.filters.query}"`, () => {
        state.filters.query = '';
        navigateTo('resources', state.filters);
      });
    }
  }

  function resetAllFilters() {
    state.filters = {
      type: 'all',
      year: 'all',
      subject: 'all',
      query: '',
      sort: 'newest'
    };
    navigateTo('resources');
  }

  // =========================================================================
  // CARD CREATOR (ACADEMIC EDITORIAL LAYOUT)
  // =========================================================================

  function createResourceCard(r) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.setAttribute('tabindex', '0');

    const typeBadgeClass = r.type || 'notes';

    card.innerHTML = `
      <div class="resource-card-header">
        <span class="badge-type ${escapeHtml(typeBadgeClass)}">${escapeHtml(formatTypeLabel(r.type))}</span>
        <span class="resource-meta-top">Year ${r.year} · ${escapeHtml(r.fileType || 'PDF')}</span>
      </div>
      <h3 class="resource-card-title">${escapeHtml(r.title)}</h3>
      <div class="resource-subject-line">${escapeHtml(r.subject)}</div>
      <p class="resource-card-desc">${escapeHtml(r.description)}</p>
      <div class="resource-card-footer">
        <span class="file-format-badge">${escapeHtml(r.fileType || 'PDF')} · ${escapeHtml(r.fileSize || '')}</span>
        <span class="resource-card-action">View details <span class="arrow">→</span></span>
      </div>
    `;

    card.addEventListener('click', () => openResourceModal(r));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openResourceModal(r);
    });

    return card;
  }

  // =========================================================================
  // SUBJECTS CLASSIFICATION CATALOG VIEW
  // =========================================================================

  function renderClassificationCatalog() {
    if (!DOM.classificationCatalog) return;
    DOM.classificationCatalog.innerHTML = '';

    state.categories.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'classification-section';

      let subjectsChipsHtml = '';
      cat.subjects.forEach(sub => {
        const count = state.resources.filter(r => r.subject.toLowerCase() === sub.toLowerCase()).length;
        subjectsChipsHtml += `
          <div class="subject-item-chip" data-subject="${escapeHtml(sub)}">
            <span class="subject-chip-name">${escapeHtml(sub)}</span>
            <span class="subject-chip-count">${count} items</span>
          </div>
        `;
      });

      section.innerHTML = `
        <div class="classification-header">
          <span class="class-num">${escapeHtml(cat.code)}</span>
          <h2 class="class-title">${escapeHtml(cat.title)}</h2>
        </div>
        <p class="class-desc">${escapeHtml(cat.description)}</p>
        <div class="classification-subjects-grid">
          ${subjectsChipsHtml}
        </div>
      `;

      // Attach clicks
      section.querySelectorAll('.subject-item-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const subName = chip.dataset.subject;
          navigateTo('resources', { subject: subName });
        });
      });

      DOM.classificationCatalog.appendChild(section);
    });
  }

  // =========================================================================
  // SEARCH ENGINE (METADATA-AWARE GROUPING)
  // =========================================================================

  function executeGlobalSearch(query) {
    state.globalSearchQuery = query;
    if (!DOM.searchResultsOutput) return;

    if (!query.trim()) {
      renderEmptySearchState();
      return;
    }

    const q = query.toLowerCase().trim();
    const results = state.resources.filter(r => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchSub = r.subject.toLowerCase().includes(q);
      const matchTags = (r.tags || []).some(t => t.toLowerCase().includes(q));
      const matchAuthor = (r.author || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSub || matchTags || matchAuthor;
    });

    if (results.length === 0) {
      DOM.searchResultsOutput.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⌕</div>
          <h3 class="empty-title">No search matches found for "${escapeHtml(query)}"</h3>
          <p class="empty-text">Try searching for broader keywords like "refraction", "optics", "contact lens", "glaucoma", or "biochemistry".</p>
        </div>
      `;
      return;
    }

    // Group results by resource type
    const grouped = {};
    const groupOrder = ['notes', 'presentation', 'question_bank', 'seminar', 'books', 'reference'];

    results.forEach(r => {
      const type = r.type || 'notes';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(r);
    });

    let outputHtml = `
      <div class="search-results-summary">
        <span class="search-query-highlight">${escapeHtml(query)}</span>
        <span class="search-total-count">${results.length} result${results.length === 1 ? '' : 's'} found</span>
      </div>
    `;

    groupOrder.forEach(typeKey => {
      if (grouped[typeKey] && grouped[typeKey].length > 0) {
        const typeLabel = formatTypeLabel(typeKey);
        outputHtml += `
          <div class="search-group-section">
            <h3 class="search-group-title">${escapeHtml(typeLabel)} (${grouped[typeKey].length})</h3>
            <div class="search-results-list">
              ${grouped[typeKey].map(r => `
                <div class="search-result-item" data-id="${escapeHtml(r.id)}">
                  <div class="search-item-info">
                    <h4 class="search-item-title">${highlightText(r.title, query)}</h4>
                    <span class="search-item-meta">Year ${r.year} · ${escapeHtml(r.subject)} · ${escapeHtml(r.fileType || 'PDF')}</span>
                  </div>
                  <span class="search-item-action">Open →</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    });

    DOM.searchResultsOutput.innerHTML = outputHtml;

    // Attach click listeners to open modals
    DOM.searchResultsOutput.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const res = state.resources.find(r => r.id === id);
        if (res) openResourceModal(res);
      });
    });
  }

  function renderEmptySearchState() {
    if (!DOM.searchResultsOutput) return;
    DOM.searchResultsOutput.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h3 class="empty-title">Ready to search the archive</h3>
        <p class="empty-text">Type any term or optometry topic above to query full text titles, clinical subjects, and syllabus tags.</p>
      </div>
    `;
  }

  // =========================================================================
  // RESOURCE MODAL DIALOG
  // =========================================================================

  function openResourceModal(resource) {
    state.selectedResource = resource;

    DOM.modalClassification.textContent = `${resource.classificationCode || '03'} · ${(resource.classification || 'Clinical Optometry').toUpperCase()}`;
    DOM.modalTitle.textContent = resource.title;
    DOM.modalType.textContent = formatTypeLabel(resource.type);
    DOM.modalYear.textContent = `Year ${resource.year}`;
    DOM.modalSubject.textContent = resource.subject;
    DOM.modalFormat.textContent = `${resource.fileType || 'PDF'} · ${resource.fileSize || ''}`;
    DOM.modalDesc.textContent = resource.description;
    DOM.modalCurriculum.textContent = 'TNMGRMU B.Optom Syllabus';
    DOM.modalAuthor.textContent = resource.author || 'Academic Board';
    DOM.modalPages.textContent = resource.pages ? `${resource.pages} pages / slides` : 'Complete Reference';
    DOM.modalPath.textContent = resource.filePath || `docs/year-${resource.year}/${resource.id}.pdf`;

    // Render tags
    DOM.modalTagsList.innerHTML = '';
    (resource.tags || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag-item';
      span.textContent = t;
      DOM.modalTagsList.appendChild(span);
    });

    // Configure open button: points to local path or shows alert if file to be added
    if (resource.filePath) {
      DOM.modalOpenBtn.href = resource.filePath;
    } else {
      DOM.modalOpenBtn.href = '#';
    }

    DOM.resourceModal.classList.add('active');
    DOM.resourceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeResourceModal() {
    DOM.resourceModal.classList.remove('active');
    DOM.resourceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.selectedResource = null;
  }

  // =========================================================================
  // EVENT LISTENERS & SHORTCUTS
  // =========================================================================

  function setupEventListeners() {
    // Brand link
    document.getElementById('brandLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('home');
    });

    // Hero search
    DOM.heroSearchSubmit?.addEventListener('click', () => {
      const q = DOM.heroSearchInput.value.trim();
      if (q) navigateTo('search', { q });
    });
    DOM.heroSearchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = DOM.heroSearchInput.value.trim();
        if (q) navigateTo('search', { q });
      }
    });

    // Hero quick tag chips
    DOM.quickTagChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const term = chip.dataset.search;
        navigateTo('search', { q: term });
      });
    });

    // Hero category cards
    DOM.heroCategoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.filterType;
        navigateTo('resources', { type });
      });
    });

    // Resources View: Filter pills
    DOM.typeFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        state.filters.type = pill.dataset.type;
        navigateTo('resources', state.filters);
      });
    });

    DOM.yearFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        state.filters.year = pill.dataset.year;
        navigateTo('resources', state.filters);
      });
    });

    DOM.subjectSelectFilter?.addEventListener('change', () => {
      state.filters.subject = DOM.subjectSelectFilter.value;
      navigateTo('resources', state.filters);
    });

    DOM.sortSelect?.addEventListener('change', () => {
      state.filters.sort = DOM.sortSelect.value;
      renderResourcesList();
    });

    // Inline resource query
    DOM.resourceQueryInput?.addEventListener('input', () => {
      state.filters.query = DOM.resourceQueryInput.value;
      renderResourcesList();
    });

    DOM.clearResourceQuery?.addEventListener('click', () => {
      state.filters.query = '';
      DOM.resourceQueryInput.value = '';
      renderResourcesList();
    });

    DOM.resetFiltersBtn?.addEventListener('click', resetAllFilters);
    DOM.emptyResetBtn?.addEventListener('click', resetAllFilters);

    // Global Search View
    DOM.globalSearchInput?.addEventListener('input', () => {
      executeGlobalSearch(DOM.globalSearchInput.value);
    });

    DOM.clearGlobalSearch?.addEventListener('click', () => {
      DOM.globalSearchInput.value = '';
      state.globalSearchQuery = '';
      renderEmptySearchState();
    });

    DOM.searchTermBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.query;
        DOM.globalSearchInput.value = q;
        executeGlobalSearch(q);
      });
    });

    // Modal Events
    DOM.modalCloseBtn?.addEventListener('click', closeResourceModal);
    DOM.resourceModal?.addEventListener('click', (e) => {
      if (e.target === DOM.resourceModal) closeResourceModal();
    });

    DOM.modalFilterSimilarBtn?.addEventListener('click', () => {
      if (state.selectedResource) {
        const sub = state.selectedResource.subject;
        closeResourceModal();
        navigateTo('resources', { subject: sub });
      }
    });

    // Global Keyboard Shortcuts (/ or Ctrl+K for search, Escape for modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.resourceModal.classList.contains('active')) {
          closeResourceModal();
        }
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        navigateTo('search');
        setTimeout(() => DOM.globalSearchInput?.focus(), 100);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigateTo('search');
        setTimeout(() => DOM.globalSearchInput?.focus(), 100);
      }
    });
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================

  function formatTypeLabel(type) {
    const labels = {
      notes: 'NOTES',
      presentation: 'PRESENTATION',
      books: 'BOOKS',
      question_bank: 'QUESTION BANK',
      seminar: 'SEMINAR',
      reference: 'REFERENCE',
      all: 'ALL'
    };
    return labels[type] || type.toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark style="background: rgba(18,178,193,0.25); color: #011C40; padding: 0 2px; border-radius: 2px;">$1</mark>');
  }

  // Start app
  document.addEventListener('DOMContentLoaded', initApp);
})();
