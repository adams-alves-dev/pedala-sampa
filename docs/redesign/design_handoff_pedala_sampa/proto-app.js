/* proto-app.js — Pedala Sampa clickable prototype (Home D + QV2 + routing). */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const PS = window.PS;
  const state = { filters: PS.emptyFilters(), selected: null, results: PS.GROUPS.slice() };

  let map, markerLayer, markers = {}, groupMap, baseTile;

  // ---------------- Map ----------------
  function tileVariant() {
    return document.documentElement.getAttribute('data-theme') === 'noturno' ? 'dark_all' : 'light_all';
  }
  function tileLayer() {
    return L.tileLayer(`https://{s}.basemaps.cartocdn.com/${tileVariant()}/{z}/{x}/{y}{r}.png`, {
      attribution: '© OpenStreetMap · © CARTO', subdomains: 'abcd', maxZoom: 19,
    });
  }
  function pinIcon(num, selected) {
    return L.divIcon({
      className: 'pin-wrap',
      html: `<div class="ps-pin ${selected ? 'ps-pin--selected' : ''}"><span>${num}</span></div>`,
      iconSize: selected ? [36, 36] : [28, 28],
      iconAnchor: selected ? [18, 34] : [14, 26],
    });
  }
  function initMap() {
    map = L.map('map', { zoomControl: false, attributionControl: true }).setView(PS.CENTER, PS.ZOOM);
    baseTile = tileLayer().addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    map.on('click', () => clearSelection());
  }
  function renderMarkers() {
    markerLayer.clearLayers(); markers = {};
    state.results.forEach((g, i) => {
      const sel = g.slug === state.selected;
      const m = L.marker([g.lat, g.lng], { icon: pinIcon(i + 1, sel), riseOnHover: true, zIndexOffset: sel ? 1000 : 0 });
      m.on('click', (e) => { L.DomEvent.stopPropagation(e); selectGroup(g.slug, { fly: true }); });
      m.addTo(markerLayer); markers[g.slug] = m;
    });
  }

  // ---------------- Builders ----------------
  function badgesHTML(g) {
    const s = g.schedules[0];
    const b = (k, v) => `<div class="ps-badge"><span class="ps-badge__ic">${PS.icon(PS.BADGE_ICON[k] || 'info', { size: 15 })}</span><div><div class="ps-badge__k">${k}</div><div class="ps-badge__v">${v}</div></div></div>`;
    return `<div class="ps-badges">${b('Dia', s.day)}${b('Saída', s.startHour)}${b('Nível', s.effort)}${b('Distância', s.distanceKm + ' km')}${b('Ritmo', s.rhythmKmH + ' km/h')}</div>`;
  }
  function cardHTML(g, i, selected) {
    return `<button class="ps-card ${selected ? 'ps-card--selected' : ''}" data-slug="${g.slug}" aria-pressed="${selected}">
      <span class="ps-card__rail"></span>
      <span class="ps-card__body">
        ${selected ? `<span class="ps-card__tag">${PS.icon('check', { size: 14 })} Selecionado</span>` : ''}
        <span class="ps-card__name">${g.name}</span>
        <span class="ps-card__loc">${PS.icon('pin', { size: 14 })} ${g.region || g.departureAddress || 'Ponto de saída no mapa'}</span>
        ${badgesHTML(g)}
      </span>
    </button>`;
  }
  function quickViewHTML(g) {
    const s = g.schedules[0];
    const dur = PS.lapDuration(s.distanceKm, s.rhythmKmH);
    const ext = g.link && g.link.url
      ? `<a class="ps-btn ps-btn--sm" href="${g.link.url}" target="_blank" rel="noopener noreferrer">${PS.icon('chat', { size: 15 })} ${g.link.label || 'Contato'} ${PS.icon('arrowUR', { size: 14 })}</a>`
      : `<span class="ps-btn ps-btn--sm ps-btn--ghost" style="opacity:.5;cursor:not-allowed">Sem link</span>`;
    return `
      <button class="qv__close" data-act="close-qv">${PS.icon('x', { size: 14 })} Fechar</button>
      <span class="ps-quickview__sun"></span>
      <h2 class="qv__name">${g.name}</h2>
      <p class="qv__loc">${PS.icon('pin', { size: 15 })} ${g.region || g.departureAddress || ''}</p>
      ${badgesHTML(g)}
      <p class="qv__dur">${PS.icon('compass', { size: 16 })} Tempo médio da volta: <strong>${dur}</strong></p>
      <div class="qv__actions">
        <a class="ps-btn ps-btn--sm ps-btn--solid" data-act="goto-group" data-slug="${g.slug}" href="#/grupo/${g.slug}">Página completa ${PS.icon('chevronRight', { size: 14 })}</a>
        ${ext}
        <a class="ps-cta" href="${PS.CONTRIBUTION_URL}" target="_blank" rel="noopener noreferrer">${PS.icon('pencil', { size: 15 })} Sugerir correção</a>
      </div>`;
  }

  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

  // ---------------- Selection ----------------
  function selectGroup(slug, opts = {}) {
    state.selected = slug;
    renderMarkers();
    renderCarousel();
    const g = PS.bySlug(slug);
    // desktop quick view (hidden on mobile via CSS)
    const qv = $('#qv');
    qv.innerHTML = `<div class="ps-quickview">${quickViewHTML(g)}</div>`;
    qv.classList.add('open');
    // carousel scroll into view (no scrollIntoView)
    const card = $(`.carousel__track .ps-card[data-slug="${slug}"]`);
    const track = $('.carousel__track');
    if (card && track) track.scrollTo({ left: card.offsetLeft - 8, behavior: 'smooth' });
    // mobile: just highlight the matching card in the sheet (no preview modal)
    if (isMobile()) {
      if (currentSnap() === 'peek') setSnap('half');
      const sc = $(`#sheetList .ps-card[data-slug="${slug}"]`);
      const body = $('.sheet__body');
      if (sc && body) body.scrollTo({ top: Math.max(0, sc.offsetTop - 8), behavior: 'smooth' });
    }
    if (opts.fly && map && g) map.flyTo([g.lat, g.lng], 14, { duration: 0.6 });
  }
  function clearSelection() {
    state.selected = null;
    $('#qv').classList.remove('open');
    renderMarkers(); renderCarousel();
  }

  // ---------------- Render results ----------------
  function renderCarousel() {
    const track = $('.carousel__track');
    track.innerHTML = state.results.map((g, i) => cardHTML(g, i, g.slug === state.selected)).join('');
    $('#carCount').textContent = state.results.length;
    // mobile list
    const listHTML = state.results.length
      ? state.results.map((g, i) => cardHTML(g, i, g.slug === state.selected)).join('')
      : `<div class="sheet__empty">${PS.icon('search', { size: 26 })}<strong>Nenhum grupo com esses filtros.</strong><button class="ps-btn ps-btn--sm" id="sheetEmptyClear">Limpar filtros</button></div>`;
    $('#sheetList').innerHTML = listHTML;
    $('#sheetCount').textContent = state.results.length;
    requestAnimationFrame(updateCarNav);
  }
  function scrollCarousel(dir) {
    const track = $('.carousel__track');
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: 'smooth' });
  }
  function updateCarNav() {
    const track = $('.carousel__track');
    const prev = $('#carPrev'), next = $('#carNext');
    if (!track || !prev || !next) return;
    const overflow = track.scrollWidth - track.clientWidth > 4;
    prev.disabled = !overflow || track.scrollLeft <= 2;
    next.disabled = !overflow || track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  function renderCount() {
    const active = PS.activeCount(state.filters);
    const btn = $('#filtersBtn');
    btn.classList.toggle('has-active', active > 0);
    $('#filtersBtn .count-pill').textContent = active;
    $('#applyCount').textContent = state.results.length;
    // mobile filtros button
    const sf = $('#sheetFiltros');
    if (sf) { sf.classList.toggle('has-active', active > 0); $('#sheetFilterCount').textContent = active; }
  }
  function renderEmpty() {
    $('#empty').classList.toggle('show', state.results.length === 0);
    $('.carousel').style.display = state.results.length === 0 ? 'none' : '';
  }
  function renderAll() {
    state.results = PS.applyFilters(state.filters);
    if (state.selected && !state.results.some((g) => g.slug === state.selected)) clearSelection();
    renderMarkers(); renderCarousel(); renderCount(); renderEmpty(); renderFilterChips();
  }

  // ---------------- Filters UI ----------------
  const FILTER_DEFS = [
    { key: 'day', label: 'Dia da semana', opts: () => PS.DAYS.map((d) => [d, d]) },
    { key: 'effort', label: 'Nível', opts: () => PS.EFFORTS.map((e) => [e, e]) },
    { key: 'distanceRange', label: 'Distância', opts: () => Object.entries(PS.DIST_LABEL) },
    { key: 'period', label: 'Período', opts: () => Object.entries(PS.PERIOD_LABEL) },
    { key: 'rhythm', label: 'Ritmo', opts: () => Object.entries(PS.RHYTHM_LABEL) },
  ];
  function chip(key, value, label, active) {
    return `<button class="ps-chip ${active ? 'ps-chip--active' : ''}" data-fkey="${key}" data-fval="${value}" aria-pressed="${active}">${label}</button>`;
  }
  function renderFilterChips() {
    // drawer (full)
    $('#drawerBody').innerHTML = FILTER_DEFS.map((def) => `
      <div class="filter-group">
        <span class="ps-fieldlabel">${def.label}</span>
        <div class="chip-row">${def.opts().map(([v, l]) => chip(def.key, v, l, state.filters[def.key] === v)).join('')}</div>
      </div>`).join('');
    // mobile sheet quick chips (effort + period + distance)
    const quick = FILTER_DEFS.filter((d) => ['effort', 'period', 'distanceRange'].includes(d.key));
    $('#sheetChips').innerHTML = quick.flatMap((def) => def.opts().map(([v, l]) => chip(def.key, v, l, state.filters[def.key] === v))).join('');
  }
  function toggleFilter(key, value) {
    state.filters[key] = state.filters[key] === value ? '' : value;
    renderAll();
  }
  function clearFilters() {
    const q = state.filters.query;
    state.filters = PS.emptyFilters();
    state.filters.query = q; // clear resets filters but keeps search (spec §11.5)
    renderAll();
  }

  // ---------------- Routing ----------------
  function show(view) {
    $$('.view').forEach((v) => (v.hidden = v.id !== view));
    if (view === 'homeView' && map) setTimeout(() => map.invalidateSize(), 60);
    $$('.ps-nav a[data-route]').forEach((a) => a.setAttribute('aria-current', a.dataset.route === location.hash ? 'page' : 'false'));
    window.scrollTo(0, 0);
  }
  function renderGroupPage(slug) {
    const g = PS.bySlug(slug);
    const doc = $('#groupDoc');
    if (!g) { doc.innerHTML = `<div class="doc__inner"><a class="back-link" href="#/">‹ Voltar ao mapa</a><h1 class="ps-h1" style="margin-top:24px">Grupo não encontrado</h1><p class="ps-lead">Esse grupo pode ter sido removido. <a href="#/" style="text-decoration:underline">Volte ao mapa</a> para explorar os demais.</p></div>`; return; }
    const s = g.schedules[0];
    const dur = PS.lapDuration(s.distanceKm, s.rhythmKmH);
    const ext = g.link && g.link.url
      ? `<a class="ps-btn ps-btn--solid ps-btn--block" href="${g.link.url}" target="_blank" rel="noopener noreferrer">${PS.icon('chat', { size: 16 })} ${g.link.label || 'Perfil / contato'} ${PS.icon('arrowUR', { size: 15 })}</a>`
      : `<p class="ps-body" style="color:var(--color-asphalt-55);margin:0">Este grupo ainda não tem link de contato cadastrado.</p>`;
    doc.innerHTML = `
      <div class="doc__inner">
        <a class="back-link" href="#/">${PS.icon('chevronRight', { size: 15, cls: 'flip' })} Voltar ao mapa</a>
        <div class="group-head">
          <span class="ps-pin ps-pin--selected" style="position:static"><span>${PS.icon('bike', { size: 18 })}</span></span>
          <h1 class="ps-h1" style="font-size:var(--text-2xl)">${g.name}</h1>
        </div>
        ${badgesHTML(g)}
        <div class="group-grid">
          <div style="display:grid;gap:24px">
            <div>
              <h2 class="section-title">${PS.icon('calendar', { size: 16 })} Agenda</h2>
              <div class="meta-grid">
                <div class="meta-cell"><div class="ps-label">Dia &amp; saída</div><div class="v">${s.day} · ${s.startHour}</div></div>
                <div class="meta-cell"><div class="ps-label">Ponto de saída</div><div class="v" style="font-size:var(--text-base)">${g.departureAddress || g.region}</div></div>
                <div class="meta-cell"><div class="ps-label">Distância</div><div class="v">${s.distanceKm} km</div></div>
                <div class="meta-cell"><div class="ps-label">Ritmo médio</div><div class="v">${s.rhythmKmH} km/h</div></div>
                <div class="meta-cell"><div class="ps-label">Nível</div><div class="v">${s.effort}</div></div>
                <div class="meta-cell"><div class="ps-label">Volta média</div><div class="v">${dur}</div></div>
              </div>
            </div>
            <div>
              <h2 class="section-title">${PS.icon('users', { size: 16 })} Contato &amp; contribuição</h2>
              <div style="display:grid;gap:12px">
                ${ext}
                <a class="ps-cta" style="justify-content:center" href="${PS.CONTRIBUTION_URL}" target="_blank" rel="noopener noreferrer">${PS.icon('pencil', { size: 15 })} Sugerir correção neste grupo</a>
              </div>
            </div>
          </div>
          <div>
            <h2 class="section-title">${PS.icon('pin', { size: 16 })} Ponto de saída</h2>
            <div class="group-map" id="groupMapEl"></div>
            <p class="ps-body" style="color:var(--color-asphalt-55);margin:8px 0 0;font-size:var(--text-base)">${g.departureAddress || g.region}, São Paulo</p>
          </div>
        </div>
      </div>`;
    // mini map
    setTimeout(() => {
      const el = $('#groupMapEl'); if (!el) return;
      if (groupMap) { groupMap.remove(); groupMap = null; }
      groupMap = L.map(el, { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false }).setView([g.lat, g.lng], 14);
      tileLayer().addTo(groupMap);
      L.marker([g.lat, g.lng], { icon: pinIcon('★', true) }).addTo(groupMap);
      groupMap.invalidateSize();
    }, 80);
  }
  function route() {
    const h = location.hash || '#/';
    if (h.startsWith('#/grupo/')) { renderGroupPage(h.slice(8)); show('groupView'); }
    else if (h === '#/sobre') { show('sobreView'); }
    else { show('homeView'); }
  }

  // ---------------- Events ----------------
  function wire() {
    // search (live)
    $('#search').addEventListener('input', (e) => { state.filters.query = e.target.value; renderAll(); });
    // filters button / drawer
    $('#filtersBtn').addEventListener('click', () => openDrawer(true));
    $('#drawerClose').addEventListener('click', () => openDrawer(false));
    $('#scrim').addEventListener('click', () => openDrawer(false));
    $('#applyBtn').addEventListener('click', () => openDrawer(false));
    $('#clearBtn').addEventListener('click', () => { clearFilters(); });
    // delegated chip + card + actions
    document.addEventListener('click', (e) => {
      const chipEl = e.target.closest('.ps-chip[data-fkey]');
      if (chipEl) { toggleFilter(chipEl.dataset.fkey, chipEl.dataset.fval); return; }
      const card = e.target.closest('.ps-card[data-slug]');
      if (card) {
        if (isMobile()) { location.hash = '#/grupo/' + card.dataset.slug; }
        else { selectGroup(card.dataset.slug, { fly: true }); }
        return;
      }
      if (e.target.closest('[data-act="close-qv"]')) { clearSelection(); return; }
      const emptyClear = e.target.closest('#emptyClear') || e.target.closest('#sheetEmptyClear');
      if (emptyClear) { clearFilters(); return; }
    });
    // nav menu
    const menu = $('#menu');
    $('#burger').addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('open'); });
    menu.addEventListener('click', () => menu.classList.remove('open'));
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && e.target.id !== 'burger') menu.classList.remove('open');
    });
    // mobile sheet: filtros opens full drawer
    $('#sheetFiltros').addEventListener('click', () => openDrawer(true));
    initSheetDrag();
    window.addEventListener('hashchange', route);
    // carousel arrows
    $('#carPrev').addEventListener('click', () => scrollCarousel(-1));
    $('#carNext').addEventListener('click', () => scrollCarousel(1));
    $('.carousel__track').addEventListener('scroll', updateCarNav, { passive: true });
    window.addEventListener('resize', updateCarNav);
    // light/dark toggle (Ciclovia <-> Noturno)
    $('#themeToggle').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'noturno' ? 'ciclovia' : 'noturno';
      window.dispatchEvent(new CustomEvent('ps-set-theme', { detail: next }));
    });
  }
  function openDrawer(open) {
    $('#drawer').classList.toggle('open', open);
    $('#scrim').classList.toggle('open', open);
  }

  // ---------------- Mobile bottom sheet (drag + snap) ----------------
  const SNAPS = ['peek', 'half', 'full'];
  function setSnap(name) {
    const sheet = $('#sheet');
    if (!sheet) return;
    sheet.setAttribute('data-snap', name);
    const grab = $('#sheetGrab');
    if (grab) grab.setAttribute('aria-label', name === 'full' ? 'Recolher lista' : 'Expandir lista');
  }
  function currentSnap() { return $('#sheet').getAttribute('data-snap') || 'half'; }
  function initSheetDrag() {
    const sheet = $('#sheet');
    const grab = $('#sheetGrab');
    if (!sheet || !grab) return;
    let startY = 0, startTop = 0, dragging = false, moved = false;
    const snapTop = () => sheet.getBoundingClientRect().top;
    const parentTop = () => sheet.offsetParent ? sheet.offsetParent.getBoundingClientRect().top : 0;

    function down(e) {
      dragging = true; moved = false;
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
      startTop = snapTop();
      sheet.classList.add('dragging');
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up);
    }
    function move(e) {
      if (!dragging) return;
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      const dy = y - startY;
      if (Math.abs(dy) > 4) moved = true;
      const min = parentTop();                       // full (top of view region)
      const max = parentTop() + sheet.offsetParent.clientHeight - 132; // peek
      let top = Math.min(Math.max(startTop + dy, min), max);
      sheet.style.transform = `translateY(${top - parentTop()}px)`;
      e.preventDefault();
    }
    function up() {
      dragging = false;
      sheet.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (!moved) { cycleSnap(); sheet.style.transform = ''; return; }
      // snap to nearest of peek/half/full by current position ratio
      const region = sheet.offsetParent.clientHeight;
      const rel = (snapTop() - parentTop()) / region; // 0 = full, ~0.45 = half, ~big = peek
      sheet.style.transform = '';
      if (rel < 0.25) setSnap('full');
      else if (rel < 0.65) setSnap('half');
      else setSnap('peek');
    }
    function cycleSnap() {
      // tap on grab cycles up, or collapses from full
      const i = SNAPS.indexOf(currentSnap());
      setSnap(i >= SNAPS.length - 1 ? 'peek' : SNAPS[i + 1]);
    }
    grab.addEventListener('pointerdown', down);
    grab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleSnap(); }
    });
  }

  // ---------------- Tweaks (theme / font / icons / density) ----------------
  function applyTweaks(t) {
    const html = document.documentElement;
    if (t.theme) html.setAttribute('data-theme', t.theme);
    if (t.font) html.setAttribute('data-font', t.font);
    html.setAttribute('data-icons', t.icons === false ? 'off' : 'on');
    html.setAttribute('data-density', t.density || 'comfortable');
    // light/dark toggle icon reflects the NEXT state
    const tog = $('#themeToggle');
    if (tog) tog.innerHTML = PS.icon(t.theme === 'noturno' ? 'sun' : 'moon', { size: 18 });
    // swap basemap tiles to match theme (light / dark)
    if (map && baseTile) {
      map.removeLayer(baseTile);
      baseTile = tileLayer().addTo(map);
      baseTile.bringToBack();
    }
    if (groupMap) { route(); } // re-render group mini-map with right tiles
  }
  window.PSTweaks = { apply: applyTweaks };

  function fillStaticIcons() {
    $$('[data-icon]').forEach((el) => {
      if (el.dataset.iconFilled) return;
      el.insertAdjacentHTML('afterbegin', PS.icon(el.dataset.icon, { size: Number(el.dataset.iconSize) || 16 }));
      el.dataset.iconFilled = '1';
    });
    $$('[data-aic]').forEach((el) => {
      if (el.dataset.aicFilled) return;
      el.insertAdjacentHTML('beforebegin', `<span class="about-ic">${PS.icon(el.dataset.aic, { size: 22 })}</span>`);
      el.dataset.aicFilled = '1';
    });
  }

  // ---------------- Boot ----------------
  function boot() {
    initMap();
    renderFilterChips();
    renderAll();
    fillStaticIcons();
    wire();
    route();
    map.invalidateSize();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
