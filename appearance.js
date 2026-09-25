// Local appearance only. No application, account or wallpaper state is accessed.
(() => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const modes = ['light', 'dark', 'liquid-glass'];
  const preference = (key, value) => {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch { /* The controls still work for this visit when storage is blocked. */ }
    return null;
  };
  const normalizeIntensity = value => {
    if (value === null || String(value).trim() === '' || !Number.isFinite(Number(value))) return 60;
    return Math.max(0, Math.min(100, Math.round(Number(value))));
  };
  const saved = preference('caderno-theme');
  let explicit = modes.includes(saved);
  let appearance = explicit ? saved : (system.matches ? 'dark' : 'light');
  let intensity = normalizeIntensity(preference('caderno-glass-intensity'));

  function render() {
    // Glass uses the existing dark typography/ink baseline; wallpapers stay independent.
    const dark = appearance !== 'light';
    root.dataset.appearance = appearance;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.setProperty('--glass-level', String(intensity / 100));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#1f1f1f' : '#ffffff';
    const picker = document.getElementById('appearanceMode');
    if (picker) picker.value = appearance;
    const controls = document.getElementById('glassControls');
    if (controls) controls.hidden = appearance !== 'liquid-glass';
    const slider = document.getElementById('glassIntensity');
    if (slider) slider.value = String(intensity);
    const output = document.getElementById('glassIntensityValue');
    if (output) output.value = String(intensity);
    // Retain the existing quick light/dark button on the login screen.
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
      button.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    });
  }
  function choose(value) {
    if (!modes.includes(value)) return;
    appearance = value;
    explicit = true;
    preference('caderno-theme', appearance);
    render();
  }
  render(); // Apply before stylesheets, including the saved glass intensity.
  system.addEventListener('change', event => {
    if (!explicit) { appearance = event.matches ? 'dark' : 'light'; render(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById('appearanceMode').addEventListener('change', event => choose(event.target.value));
    document.getElementById('glassIntensity').addEventListener('input', event => {
      intensity = normalizeIntensity(event.target.value);
      preference('caderno-glass-intensity', String(intensity));
      render();
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => choose(appearance === 'light' ? 'dark' : 'light'));
    });
  }, { once: true });
})();
