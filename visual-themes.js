// Independent local appearance preference. No imports or application/data events.
(() => {
  const key = 'caderno-visual-theme';
  const root = document.documentElement;
  const normalize = value => ['spider', 'venom', 'espetacular', 'santos', 'flamengo', 'sao-paulo', 'bolsonaro'].includes(value) ? value : 'normal';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage may be unavailable. */ }
  root.dataset.visualTheme = normalize(saved);

  document.addEventListener('DOMContentLoaded', () => {
    const picker = document.getElementById('visualTheme');
    picker.value = root.dataset.visualTheme;
    picker.addEventListener('change', () => {
      const theme = normalize(picker.value);
      root.dataset.visualTheme = theme;
      picker.value = theme;
      try { localStorage.setItem(key, theme); } catch { /* Still works for this visit. */ }
    });
  }, { once: true });
})();
