async function () {
  const results = [], $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const assert = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
  async function until(test, label, timeout = 4000) {
    const start = performance.now();
    while (!test()) { if (performance.now() - start > timeout) throw new Error('Timeout: ' + label); await wait(25); }
  }
  function input(id, value) { $(id).value = value; $(id).dispatchEvent(new Event('input', { bubbles: true })); }
  async function go(day) {
    $('dataSelecionada').value = day;
    $('dataSelecionada').dispatchEvent(new Event('change', { bubbles: true }));
    await until(() => !$('pagina').inert && $('numeroPagina').textContent === day.slice(8) + '/' + day.slice(5, 7) + '/' + day.slice(0, 4), 'go ' + day);
  }
  function selectText(row, start, end) {
    const text = row.querySelector('.note-text'), walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT), nodes = [];
    let node;
    while (node = walker.nextNode()) nodes.push(node);
    function point(offset) { for (const n of nodes) { if (offset <= n.length) return [n, offset]; offset -= n.length; } return [text, text.childNodes.length]; }
    const range = document.createRange(); range.setStart(...point(start)); range.setEnd(...point(end));
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  }
  try {
    await until(() => window.__mock && document.querySelectorAll('.marker-color').length === 13, 'app initialization');
    const mock = window.__mock;
    assert(!$('telaLogin').hidden && $('aplicativo').hidden, 'login: initial visibility');
    input('emailLogin', 'teste@example.com'); input('senhaLogin', 'incorrect');
    $('formLogin').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await until(() => $('mensagemLogin').textContent.includes('incorretos'), 'invalid login');
    assert(!$('btnEntrar').disabled, 'login: error enables retry');
    localStorage.setItem('meu-caderno-diario-v1', JSON.stringify({ '2024-02-29': [{ id: 'legacy', texto: 'Página antiga preservada', cor: '#f3a7d8', concluido: true, criadoEm: 1 }] }));
    input('senhaLogin', 'test-password');
    $('formLogin').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await until(() => !$('aplicativo').hidden && $('statusSalvamento').textContent === 'Salvo', 'authenticated snapshot');
    const today = $('dataSelecionada').value;
    assert(mock.documents.has('users/test-user/caderno/legacy'), 'migration: existing path and data imported');
    assert(mock.subscriptions === 1, 'sync: one active listener');
    mock.seed('first', { data: today, texto: 'Planejar a semana com calma', concluido: false, cor: '#f3a7d8', criadoEm: 2, extraField: 'keep' });
    mock.seed('second', { data: today, texto: 'Uma ideia que merece ficar no papel.', concluido: true, cor: '#fff08c', criadoEm: 3 });
    assert(document.querySelectorAll('.note-row').length === 2, 'sync: snapshot renders existing notes');
    assert($('calendario').querySelector('[data-date="' + today + '"] .cal-dot'), 'calendar: real note indicator');
    const baseWrites = mock.writes.length;
    mock.hold = true;
    input('novoItem', 'Nota única'); $('btnAdicionar').click();
    $('novoItem').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    $('novoItem').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert(mock.writes.length === baseWrites + 1, 'save: repeated Enter cannot duplicate pending note');
    input('novoItem', 'Novo rascunho durante o salvamento');
    mock.release(); await until(() => $('statusSalvamento').textContent === 'Salvo', 'pending note saved');
    assert($('novoItem').value === 'Novo rascunho durante o salvamento', 'save: newer draft is preserved');
    input('novoItem', '');
    mock.failNext = true; input('novoItem', 'Texto protegido em caso de erro'); $('btnAdicionar').click();
    await until(() => $('statusSalvamento').dataset.state === 'error', 'save failure');
    assert($('novoItem').value.includes('Texto protegido'), 'save: failure keeps draft');
    $('btnAdicionar').click(); await until(() => !$('novoItem').value, 'retry save');
    assert($('statusSalvamento').textContent === 'Salvo', 'save: retry succeeds');
    let row = document.querySelector('[data-id="first"]');
    row.querySelector('[data-action="edit"]').click(); await until(() => $('editarItem'), 'editor opened');
    input('editarItem', 'Planejar a semana com mais calma');
    await until(() => mock.documents.get('users/test-user/caderno/first').texto.includes('mais'), 'debounced autosave');
    assert($('editarItem') && document.activeElement === $('editarItem'), 'editor: snapshot does not steal focus');
    assert(mock.documents.get('users/test-user/caderno/first').extraField === 'keep', 'save: merge preserves unknown fields');
    row.querySelector('[data-action="finish-edit"]').click(); await until(() => !$('editarItem'), 'editor closed');
    row.querySelector('[data-action="toggle"]').click(); await until(() => row.classList.contains('done'), 'completion');
    assert(row.classList.contains('is-marking'), 'highlight: completion triggers stroke');
    await wait(450); mock.emit();
    assert(!row.classList.contains('is-marking'), 'highlight: snapshot does not replay animation');
    row.querySelector('[data-action="toggle"]').click(); await until(() => !row.classList.contains('done'), 'uncomplete');
    selectText(row, 0, 8); $('abrirPaleta').click();
    assert(!$('paleta').hidden && !$('removerGrifo').disabled, 'highlight: selection opens actionable palette');
    document.querySelector('[data-name="Verde"]').click();
    await until(() => mock.documents.get('users/test-user/caderno/first').grifos?.length === 1, 'partial highlight');
    assert(row.querySelector('mark').textContent === 'Planejar', 'highlight: exact selected substring persisted');
    selectText(row, 0, 8); $('abrirPaleta').click(); document.querySelector('[data-name="Azul"]').click();
    await until(() => $('paleta').hidden, 'recolor');
    assert(mock.documents.get('users/test-user/caderno/first').grifos[0].cor === document.querySelector('[data-name="Azul"]').dataset.color, 'highlight: recolor replaces overlapping range');
    selectText(row, 0, 8); $('abrirPaleta').click(); $('removerGrifo').click();
    await until(() => mock.documents.get('users/test-user/caderno/first').grifos.length === 0, 'remove range');
    assert(!row.querySelector('mark'), 'highlight: removal persists');
    row.querySelector('[data-action="mark"]').click(); document.querySelector('[data-name="Lilás"]').click();
    await until(() => row.classList.contains('done'), 'whole annotation highlight');
    row.querySelector('[data-action="mark"]').click(); $('removerGrifo').click();
    await until(() => !row.classList.contains('done'), 'whole annotation removal');
    assert(mock.documents.get('users/test-user/caderno/first').cor === document.querySelector('[data-name="Lilás"]').dataset.color, 'highlight: legacy whole-note color preserved');
    input('novoItem', 'Rascunho de hoje');
    $('proximoDia').click(); await until(() => !$('pagina').inert && $('dataSelecionada').value !== today, 'next day');
    const tomorrow = $('dataSelecionada').value;
    assert($('novoItem').value === '', 'navigation: distinct daily draft');
    $('diaAnterior').click(); await until(() => !$('pagina').inert && $('dataSelecionada').value === today, 'previous day');
    assert($('novoItem').value === 'Rascunho de hoje', 'navigation: previous draft recovered');
    input('novoItem', 'Salvar antes de virar a folha'); mock.hold = true; $('btnAdicionar').click(); $('proximoDia').click();
    await wait(100); assert($('dataSelecionada').value === today, 'navigation: waits for pending creation');
    mock.release(); await until(() => !$('pagina').inert && $('dataSelecionada').value === tomorrow, 'navigation after save');
    assert(mock.writes.at(-1).value.data === today, 'navigation: pending save keeps original date');
    await go('2024-02-29');
    assert(document.querySelector('.note-text').textContent === 'Página antiga preservada', 'legacy: old note and leap date load');
    $('proximoDia').click(); await until(() => !$('pagina').inert && $('dataSelecionada').value === '2024-03-01', 'leap boundary');
    await go(today);
    input('buscaPaginas', 'antiga');
    assert($('listaPaginas').querySelectorAll('.page-link').length === 1 && $('listaPaginas').querySelector('[data-date="2024-02-29"]'), 'search: matches actual historical content');
    input('buscaPaginas', '');
    const originalTheme = document.documentElement.dataset.theme;
    document.querySelector('.sidebar [data-theme-toggle]').click();
    assert(document.documentElement.dataset.theme !== originalTheme && localStorage.getItem('caderno-theme') === document.documentElement.dataset.theme, 'theme: toggle and persistence');
    $('sidebarToggle').click(); assert($('sidebar').inert && $('sidebarToggle').getAttribute('aria-expanded') === 'false', 'sidebar: desktop collapse accessible');
    $('sidebarToggle').click(); $('agendaToggle').click(); assert($('agenda').inert, 'agenda: desktop collapse'); $('agendaToggle').click();
    const beforeDelete = mock.documents.size;
    document.querySelector('[data-id="second"] [data-action="delete"]').click(); await until(() => mock.documents.size === beforeDelete - 1, 'delete');
    assert(!document.querySelector('[data-id="second"]'), 'delete: realtime UI updated');
    input('novoItem', 'Rascunho privado'); $('btnSair').click(); await until(() => !$('telaLogin').hidden, 'logout');
    assert($('novoItem').value === '' && mock.subscriptions === 0, 'logout: clears drafts and listener');
    input('senhaLogin', 'test-password'); $('formLogin').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await until(() => !$('aplicativo').hidden && $('statusSalvamento').textContent === 'Salvo', 'relogin');
    assert(mock.subscriptions === 1 && $('novoItem').value === '', 'relogin: no stale draft or duplicate listeners');
    assert(mock.writes.every(write => write.path.startsWith('users/test-user/caderno/') && write.options.merge === true), 'Firestore: original collection and merge contract');
    return { ok: true, tests: results.length, results };
  } catch (error) { return { ok: false, tests: results.length, results, error: error.message, stack: error.stack }; }
}
