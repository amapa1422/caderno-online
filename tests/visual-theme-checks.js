async function () {
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];
  const skins = ['spider', 'venom', 'espetacular', 'santos', 'flamengo', 'sao-paulo', 'bolsonaro', 'normal'];
  const assert = (condition, label) => { if (!condition) throw new Error(label); results.push(label); console.debug(label); };
  const input = (id, value) => { $(id).value = value; $(id).dispatchEvent(new Event('input', { bubbles: true })); };
  const until = async test => { for (let i = 0; i < 100; i++) { if (test()) return; await wait(25); } throw new Error('Initialization timeout'); };
  await until(() => window.__mock && $('tituloData').textContent);
  assert([...$('visualTheme').options].map(option => option.text).join('|') === 'Normal|Homem-Aranha|Venom|Espetacular-Homem Aranha|Santos|Flamengo|São Paulo|Bolsonaro', 'All eight named themes in the requested order');
  const mock = window.__mock;
  input('emailLogin', 'teste@example.com'); input('senhaLogin', 'test-password');
  $('formLogin').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await until(() => !$('aplicativo').hidden && $('statusSalvamento').textContent === 'Salvo');
  const day = $('dataSelecionada').value;
  mock.seed('skin-note', { data: day, texto: 'Ideias que merecem ficar no papel.', concluido: false, grifos: [], versaoGrifos: 2, criadoEm: 1 });
  mock.seed('skin-plain', { data: day, texto: 'Um espaço para pensar com calma.', concluido: false, grifos: [], versaoGrifos: 2, criadoEm: 2 });
  $('abrirPaleta').click(); input('hexCor', '#22AACC'); $('aplicarGrifo').click();
  document.querySelector('[data-id="skin-note"] [data-action="mark"]').click();
  await until(() => $('statusSalvamento').textContent === 'Salvo');
  await wait(400);
  const note = document.querySelector('[data-id="skin-note"] .note-text');
  const mark = note.querySelector('mark');
  assert(mark.style.getPropertyValue('--highlight') === '#22AACC', 'Free HEX selected in real picker and applied to note');
  input('novoItem', 'Rascunho preservado durante a troca');
  const savedDocs = JSON.stringify([...mock.documents]);
  const writes = mock.writes.length, deletes = mock.deletes.length, subscriptions = mock.subscriptions;
  const font = () => ['fontFamily', 'fontSize', 'fontWeight'].map(p => getComputedStyle(note)[p]).join('|');
  const setSkin = value => { $('visualTheme').value = value; $('visualTheme').dispatchEvent(new Event('change', { bubbles: true })); };
  const settle = async () => {
    await new Promise(requestAnimationFrame);
    // Finish finite CSS transitions in tests only, avoiding timing-dependent screenshots.
    for (const animation of document.getAnimations()) {
      if (Number.isFinite(animation.effect.getComputedTiming().endTime)) animation.finish();
    }
    await new Promise(requestAnimationFrame);
  };
  const baseFont = font();
  // Compare the actual ink paint, not just the stored HEX, within each light/dark mode.
  for (const mode of ['light', 'dark']) {
    document.documentElement.dataset.theme = mode;
    setSkin('normal'); await settle();
    const ink = getComputedStyle(mark).backgroundImage;
    const baseline = ['workspace', 'pagina', 'novoItem', 'sidebar', 'agenda', 'paleta'].map(id => {
      const s = getComputedStyle($(id));
      return [s.backgroundColor, s.color, s.fontFamily, s.fontSize, s.padding, s.border, s.zIndex];
    });
    for (const skin of skins) {
      setSkin(skin); await settle();
      assert(document.documentElement.dataset.theme === mode, skin + ': keeps ' + mode + ' preference');
      assert(getComputedStyle(mark).backgroundImage === ink, skin + ': identical highlight paint in ' + mode);
      assert(font() === baseFont, skin + ': note font preserved in ' + mode);
      assert($('novoItem').value === 'Rascunho preservado durante a troca' && $('dataSelecionada').value === day, skin + ': draft and day preserved');
      assert(JSON.stringify([...mock.documents]) === savedDocs && mock.writes.length === writes && mock.deletes.length === deletes && mock.subscriptions === subscriptions, skin + ': no data writes, deletes or auth resubscription');
      assert(localStorage.getItem('caderno-visual-theme') === skin, skin + ': saved local preference');
    }
    const restored = ['workspace', 'pagina', 'novoItem', 'sidebar', 'agenda', 'paleta'].map(id => {
      const s = getComputedStyle($(id));
      return [s.backgroundColor, s.color, s.fontFamily, s.fontSize, s.padding, s.border, s.zIndex];
    });
    assert(JSON.stringify(baseline) === JSON.stringify(restored), mode + ': Normal restores colors, borders, spacing, fonts and layers' + (JSON.stringify(baseline) !== JSON.stringify(restored) ? JSON.stringify({baseline,restored}) : ''));
  }
  input('novoItem', '');
  document.querySelector('[data-id="skin-plain"] [data-action="edit"]').click();
  await until(() => $('editarItem'));
  const editor = $('editarItem');
  const editValue = editor.value;
  for (const skin of skins) setSkin(skin);
  assert($('editarItem') === editor && editor.value === editValue, 'Theme switching preserves the active editor DOM and value');
  document.querySelector('[data-action="finish-edit"]').click();
  await wait(100);
  // All assets decode in the browser, including SVGs; HTTP status alone is insufficient.
  for (const file of ['bg-classic-ai.png', 'bg-venom-ai.png', 'web-pattern-classic.svg', 'web-pattern-venom.svg', 'spider-mark.svg']) {
    const url = './assets/themes/spider/' + file;
    const response = await fetch(url);
    assert(response.ok, file + ': HTTP ' + response.status);
    await response.arrayBuffer();
    const img = new Image(); img.src = url; await img.decode();
    assert(img.naturalWidth > 0, file + ': decoded');
  }
  for (const skin of skins.filter(skin => !['normal', 'spider', 'venom'].includes(skin))) {
    const url = './assets/themes/categories/' + skin + '.png';
    const response = await fetch(url);
    assert(response.ok, skin + ': background HTTP 200');
    // Drain the body before a second request to the single-threaded test server.
    await response.arrayBuffer();
    const img = new Image(); img.src = url; await img.decode();
    assert(img.naturalWidth > 0, skin + ': background decoded');
    setSkin(skin); await settle();
    assert(getComputedStyle(document.body, '::before').backgroundImage.includes('/categories/' + skin + '.png'), skin + ': correct background applied');
    if (['santos', 'flamengo', 'sao-paulo'].includes(skin)) assert(getComputedStyle(document.body, '::after').backgroundImage === 'none', skin + ': no spider webs');
  }
  window.__setTestSkin = setSkin;
  window.__skinLayoutCheck = async (skin, mode) => {
    document.documentElement.dataset.theme = mode; setSkin(skin);
    // Force a painted frame before waiting for existing CSS color transitions.
    await settle();
    const root = document.documentElement, workspace = $('workspace');
    const before = getComputedStyle(document.body, '::before'), after = getComputedStyle(document.body, '::after');
    const button = $('btnAdicionar');
    const colors = color => color.match(/[\d.]+/g).map(Number);
    const luminance = c => c.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const contrast = (fg, bg) => { const a = luminance(colors(fg)), b = luminance(colors(bg)); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
    const surface = getComputedStyle($('pagina')).backgroundColor;
    const rgb = colors(surface), alpha = rgb[3] ?? 1;
    // White underneath is a conservative bright-background case for these dark skins.
    const composite = 'rgb(' + rgb.slice(0, 3).map(v => v * alpha + 255 * (1 - alpha)).join(',') + ')';
    const bodyContrast = contrast(getComputedStyle(note).color, composite);
    const mutedContrast = contrast(getComputedStyle($('subtituloPagina')).color, composite);
    const primary = getComputedStyle(button);
    const buttonContrast = contrast(primary.color, primary.backgroundColor);
    let navigationContrast;
    if (!['normal', 'spider', 'venom'].includes(skin)) {
      const nav = colors(getComputedStyle(document.querySelector('.date-navigation')).backgroundColor);
      const navAlpha = nav[3] ?? 1;
      const navSurface = 'rgb(' + nav.slice(0, 3).map(v => v * navAlpha + 255 * (1 - navAlpha)).join(',') + ')';
      navigationContrast = Math.min(...['paginaContexto', 'irHoje', 'diaAnterior', 'proximoDia'].map(id => contrast(getComputedStyle($(id)).color, navSurface)));
      if (navigationContrast < 4.5) throw new Error('Day navigation contrast: ' + skin + ' ' + navigationContrast);
    }
    if (workspace.scrollWidth > workspace.clientWidth || root.scrollWidth > innerWidth) throw new Error('Overflow: ' + [skin, mode, innerWidth]);
    if (skin !== 'normal' && (before.position !== 'fixed' || before.pointerEvents !== 'none' || after.pointerEvents !== 'none' || before.zIndex !== '-2' || after.zIndex !== '-1')) throw new Error('Decoration layer order');
    if (skin === 'normal' && before.content !== 'none') throw new Error('Normal has decoration');
    if (skin !== 'normal' && (bodyContrast < 4.5 || mutedContrast < 4.5 || buttonContrast < 4.5)) throw new Error('Contrast ' + [skin, bodyContrast, mutedContrast, buttonContrast, primary.color, primary.backgroundColor]);
    return { skin, mode, width: innerWidth, height: innerHeight, bodyContrast, mutedContrast, buttonContrast, navigationContrast, overflow: false, decoration: before.backgroundImage, font: font() };
  };
  return { ok: true, tests: results.length, results };
}
