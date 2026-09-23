async function () {
  const $ = id => document.getElementById(id), results = [];
  const assert = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
  const key = (target, value, shiftKey = false) => target.dispatchEvent(new KeyboardEvent('keydown', { key: value, shiftKey, bubbles: true, cancelable: true }));
  $('sidebarToggle').focus(); $('sidebarToggle').click();
  assert(!$('sidebar').inert && $('workspace').inert && $('sidebar').getAttribute('aria-modal') === 'true', 'mobile: sidebar is modal and background inert');
  const first = $('sidebar').querySelector('button');
  assert(document.activeElement === first, 'mobile: opening drawer focuses first control');
  first.focus(); key(first, 'Tab', true);
  assert(document.activeElement === $('btnSair'), 'mobile: Shift+Tab stays inside drawer');
  key($('btnSair'), 'Tab');
  assert(document.activeElement === first, 'mobile: Tab wraps to first control');
  key(first, 'Escape');
  assert($('sidebar').inert && !$('workspace').inert && document.activeElement === $('sidebarToggle'), 'mobile: Escape closes and restores focus');
  $('agendaToggle').focus(); $('agendaToggle').click();
  assert(!$('agenda').inert && $('workspace').inert && $('agenda').getAttribute('aria-modal') === 'true', 'mobile: calendar drawer opens');
  const day = $('calendario').querySelector('[tabindex="0"]');
  day.focus(); key(day, 'ArrowRight');
  assert(document.activeElement.dataset.date !== day.dataset.date && document.activeElement.closest('#calendario'), 'calendar: keyboard moves between days');
  $('panelBackdrop').click();
  assert($('agenda').inert && !$('workspace').inert && document.activeElement === $('agendaToggle'), 'mobile: backdrop closes and restores focus');
  $('abrirPaleta').click();
  const bounds = $('paleta').getBoundingClientRect();
  assert(bounds.left >= 0 && bounds.right <= innerWidth, 'mobile: palette fits viewport');
  key(document.activeElement, 'Escape');
  assert($('paleta').hidden && document.activeElement === $('abrirPaleta'), 'palette: Escape restores focus');
  return { ok: true, tests: results.length, results };
}
