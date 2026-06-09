/* proto-data.js — Pedala Sampa prototype data layer.
   Mirrors the spec's normalized Group model + centralized derivation utils
   (period / rhythm / distance thresholds) and lap-duration formatting.
   Exposes everything on window.PS. */
(function () {
  // ---- Groups (representative SP pedal groups, real-ish coordinates) ----
  const GROUPS = [
    { id: 'g1', slug: 'pedal-da-paulista', name: 'Pedal da Paulista', region: 'Bela Vista', departureAddress: 'Av. Paulista, 900', lat: -23.5614, lng: -46.6559,
      link: { label: 'Instagram', url: 'https://instagram.com' },
      schedules: [{ day: 'Sábado', startHour: '06:30', effort: 'Leve', distanceKm: 18, rhythmKmH: 15 }] },
    { id: 'g2', slug: 'bike-night-sp', name: 'Bike Night SP', region: 'Centro', departureAddress: 'Pç. da República', lat: -23.5430, lng: -46.6420,
      link: { label: 'WhatsApp', url: 'https://wa.me' },
      schedules: [{ day: 'Quarta', startHour: '20:00', effort: 'Moderado', distanceKm: 32, rhythmKmH: 20 }] },
    { id: 'g3', slug: 'role-zona-sul', name: 'Rolê Zona Sul', region: 'Santo Amaro', departureAddress: 'Largo Treze de Maio', lat: -23.6520, lng: -46.7080,
      link: { label: 'Strava', url: 'https://strava.com' },
      schedules: [{ day: 'Domingo', startHour: '07:00', effort: 'Forte', distanceKm: 54, rhythmKmH: 24 }] },
    { id: 'g4', slug: 'ciclo-pinheiros', name: 'Ciclo Pinheiros', region: 'Pinheiros', departureAddress: 'Largo da Batata', lat: -23.5670, lng: -46.6940,
      link: { label: 'Instagram', url: 'https://instagram.com' },
      schedules: [{ day: 'Terça', startHour: '06:00', effort: 'Moderado', distanceKm: 26, rhythmKmH: 19 }] },
    { id: 'g5', slug: 'pedal-das-minas', name: 'Pedal das Minas', region: 'Vila Madalena', departureAddress: 'Praça Benedito Calixto', lat: -23.5540, lng: -46.6900,
      link: { label: 'Instagram', url: 'https://instagram.com' },
      schedules: [{ day: 'Sábado', startHour: '08:00', effort: 'Leve', distanceKm: 16, rhythmKmH: 14 }] },
    { id: 'g6', slug: 'giro-ibirapuera', name: 'Giro Ibirapuera', region: 'Moema', departureAddress: 'Portão 9 — Ibirapuera', lat: -23.5874, lng: -46.6576,
      link: { label: 'Site', url: 'https://example.com' },
      schedules: [{ day: 'Domingo', startHour: '08:30', effort: 'Leve', distanceKm: 22, rhythmKmH: 17 }] },
    { id: 'g7', slug: 'mooca-bikers', name: 'Mooca Bikers', region: 'Mooca', departureAddress: 'Rua da Mooca, 2000', lat: -23.5560, lng: -46.6000,
      link: { label: 'WhatsApp', url: 'https://wa.me' },
      schedules: [{ day: 'Quinta', startHour: '19:30', effort: 'Moderado', distanceKm: 30, rhythmKmH: 21 }] },
    { id: 'g8', slug: 'speed-lapa', name: 'Speed Lapa', region: 'Lapa', departureAddress: 'Praça Mq. de Queluz', lat: -23.5180, lng: -46.7030,
      link: null,
      schedules: [{ day: 'Sábado', startHour: '05:30', effort: 'Forte', distanceKm: 62, rhythmKmH: 26 }] },
    { id: 'g9', slug: 'tatuape-noturno', name: 'Tatuapé Noturno', region: 'Tatuapé', departureAddress: 'Praça Sílvio Romero', lat: -23.5400, lng: -46.5760,
      link: { label: 'Instagram', url: 'https://instagram.com' },
      schedules: [{ day: 'Sexta', startHour: '21:00', effort: 'Leve', distanceKm: 14, rhythmKmH: 15 }] },
  ];

  const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const EFFORTS = ['Leve', 'Moderado', 'Forte'];

  // ---- Centralized derivation (spec §12.4 thresholds) ----
  function periodFromHour(startHour) {
    const h = Number(String(startHour).split(':')[0]);
    if (Number.isNaN(h)) return 'night';
    if (h >= 5 && h <= 11) return 'morning';
    if (h >= 12 && h <= 17) return 'afternoon';
    return 'night';
  }
  function rhythmCategory(kmh) {
    if (kmh < 16) return 'light';
    if (kmh <= 22) return 'moderate';
    return 'strong';
  }
  function distanceRange(km) {
    if (km <= 20) return 'up-to-20';
    if (km <= 40) return '20-to-40';
    return 'over-40';
  }
  function lapDuration(distanceKm, rhythmKmH) {
    if (!distanceKm || !rhythmKmH || rhythmKmH <= 0) return '00h:00m';
    const total = Math.round((distanceKm / rhythmKmH) * 60);
    const h = Math.floor(total / 60), m = total % 60;
    return `${String(h).padStart(2, '0')}h:${String(m).padStart(2, '0')}m`;
  }

  const PERIOD_LABEL = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' };
  const RHYTHM_LABEL = { light: 'Leve', moderate: 'Moderado', strong: 'Forte' };
  const DIST_LABEL = { 'up-to-20': 'Até 20 km', '20-to-40': '20 a 40 km', 'over-40': 'Acima de 40 km' };

  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // ---- Filtering (client-side, spec §12.3 / §12.4) ----
  function emptyFilters() {
    return { query: '', day: '', effort: '', distanceRange: '', period: '', rhythm: '' };
  }
  function matches(group, f) {
    const s = group.schedules[0] || {};
    if (f.query) {
      const q = norm(f.query);
      const hay = [group.name, group.region, group.departureAddress, s.day, s.effort].map(norm).join(' ');
      if (!hay.includes(q)) return false;
    }
    if (f.day && s.day !== f.day) return false;
    if (f.effort && s.effort !== f.effort) return false;
    if (f.distanceRange && distanceRange(s.distanceKm) !== f.distanceRange) return false;
    if (f.period && periodFromHour(s.startHour) !== f.period) return false;
    if (f.rhythm && rhythmCategory(s.rhythmKmH) !== f.rhythm) return false;
    return true;
  }
  function applyFilters(f) { return GROUPS.filter((g) => matches(g, f)); }
  function activeCount(f) {
    return ['day', 'effort', 'distanceRange', 'period', 'rhythm'].filter((k) => f[k]).length + (f.query ? 1 : 0);
  }
  function bySlug(slug) { return GROUPS.find((g) => g.slug === slug) || null; }

  window.PS = Object.assign(window.PS || {}, {
    GROUPS, DAYS, EFFORTS, PERIOD_LABEL, RHYTHM_LABEL, DIST_LABEL,
    periodFromHour, rhythmCategory, distanceRange, lapDuration,
    emptyFilters, applyFilters, activeCount, matches, bySlug,
    CONTRIBUTION_URL: 'https://example.com/sugerir', // configurável (spec §7)
    CENTER: [-23.5760, -46.6550], ZOOM: 12,
  });
})();
