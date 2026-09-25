async function (removed = false) {
  const $ = id => document.getElementById(id), results = [];
  const assert = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
  const start = performance.now();
  while (!window.__mock || $('statusSalvamento').textContent !== 'Salvo') {
    if (performance.now() - start > 5000) throw new Error('Reload initialization timeout');
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  const notes = [...document.querySelectorAll('.note-text')];
  const colored = notes.find(node => node.textContent.includes('Curta & <segura>'));
  assert(colored?.querySelector('mark').style.getPropertyValue('--highlight') === '#19A7CE', 'reload: saved arbitrary color renders again');
  assert(!document.querySelector('[data-id="named-color"] mark'), 'reload: removal persists despite preserved legacy flag');
  assert(document.querySelector('[data-id="legacy-empty-ranges"] mark'), 'reload: untouched old highlights still render');
  assert(notes.some(node => node.textContent === 'Anotação sem marca-texto' && !node.querySelector('mark')), 'reload: plain note persists');
  $('abrirPaleta').click();
  assert(document.querySelectorAll('.recent-color').length === 6 && document.querySelector('.recent-color').dataset.color === '#DF4A73', 'reload: recent colors restored from preference');
  assert($('hexCor').value === '#DF4A73' && $('amostraCor').getAttribute('aria-label') === '#DF4A73', 'reload: global color restored in picker and top indicator');
  $('fecharPaleta').click();
  assert(!document.querySelector('.note-check, [role="checkbox"], [data-action="options"]'), 'reload: no checkbox or ellipsis menu');
  assert(colored.closest('.note-row').classList.contains('done'), 'reload: completion persists alongside saved highlight');
  const a = document.querySelector('[data-id="duplicate-a"]'), b = document.querySelector('[data-id="duplicate-b"]'), c = document.querySelector('[data-id="duplicate-c"]');
  assert(removed ? !a.querySelector('mark') : a.querySelector('mark')?.style.getPropertyValue('--highlight') === '#53C7C5', removed ? 'second reload: explicitly removed note remains plain' : 'first reload: note A keeps cyan');
  assert(b.querySelector('mark')?.style.getPropertyValue('--highlight') === '#EC6686' && !c.querySelector('mark'), 'reload: same-text notes B pink and C plain remain independent');
  if (!removed) {
    a.querySelector('[data-action="unmark"]').click();
    const removalStart = performance.now();
    while (a.querySelector('mark') || $('statusSalvamento').textContent !== 'Salvo') {
      if (performance.now() - removalStart > 4000) throw new Error('Remove after reload timeout');
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert(localStorage.getItem('caderno-marker-color') === '#DF4A73' && a.querySelector('.note-text').textContent === 'Texto igual', 'reload: direct removal keeps text and global color before second reload');
  }
  return { ok: true, tests: results.length, results };
}
