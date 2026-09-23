async function () {
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
  return { ok: true, tests: results.length, results };
}
