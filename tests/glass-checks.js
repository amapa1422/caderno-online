async function () {
  const $ = id => document.getElementById(id), root = document.documentElement;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async test => { for (let i = 0; i < 200; i++) { if (test()) return; await wait(25); } throw Error('Glass setup timeout'); };
  const assert = (condition, label) => { if (!condition) throw Error(label); };
  const change = (id, value, type = 'change') => { $(id).value = String(value); $(id).dispatchEvent(new Event(type, { bubbles: true })); };
  const settle = async () => {
    await new Promise(requestAnimationFrame);
    for (const a of document.getAnimations()) if (Number.isFinite(a.effect.getComputedTiming().endTime)) a.finish();
    await new Promise(requestAnimationFrame);
  };
  await until(() => window.__mock && $('tituloData').textContent);
  const mock = window.__mock;
  await mock.changeUser({uid:'test-user',email:'teste@example.com'});
  await until(() => $('statusSalvamento').textContent === 'Salvo');
  const day = $('dataSelecionada').value;
  mock.seed('glass-note', {data:day,texto:'O fundo aparece. Minhas ideias continuam legíveis.',concluido:false,grifos:[{inicio:0,fim:7,cor:'#22AACC'}],versaoGrifos:2});
  change('novoItem','Rascunho mantido no vidro','input');
  const note = document.querySelector('[data-id="glass-note"] .note-text');
  const saved = JSON.stringify([...mock.documents]), writes = mock.writes.length, subscriptions = mock.subscriptions;
  assert([...$('appearanceMode').options].map(o=>o.text).join('|') === 'Claro|Escuro|Liquid Glass','Three appearance options');
  assert($('visualTheme').options.length === 8,'Eight wallpaper categories remain');
  assert($('glassIntensity').value === '60','Default intensity 60');
  const snapshots = new Map();
  let checks = 0;
  const capture = () => ['sidebar','pagina','agenda','novoItem'].map(id => {
    const s = getComputedStyle($(id)); return [s.background,s.color,s.font,s.padding,s.border,s.backdropFilter];
  });
  const ink = () => getComputedStyle(note.querySelector('mark')).backgroundImage;
  for (const option of $('visualTheme').options) {
    change('visualTheme',option.value);
    for (const mode of ['dark','light']) {
      change('appearanceMode',mode); await settle(); snapshots.set(option.value+mode,JSON.stringify(capture()));
    }
    change('appearanceMode','dark'); await settle(); const darkInk=ink();
    const wallpaper=getComputedStyle(root).getPropertyValue('--visual-background');
    for (const mode of ['liquid-glass','light','liquid-glass','dark','liquid-glass']) {
      change('appearanceMode',mode); await settle();
      assert(root.dataset.appearance===mode,'Appearance applied');
      assert(root.dataset.visualTheme===option.value,'Independent wallpaper');
      assert(getComputedStyle(root).getPropertyValue('--visual-background')===wallpaper,'Wallpaper URL unchanged');
      assert($('glassControls').hidden === (mode!=='liquid-glass'),'Conditional slider');
      if (mode==='liquid-glass') assert(ink()===darkInk,'Unchanged dark ink paint');
      else assert(JSON.stringify(capture())===snapshots.get(option.value+mode),'Classic appearance fully restored');
      assert($('novoItem').value==='Rascunho mantido no vidro' && $('dataSelecionada').value===day,'Draft and date unchanged');
      assert(JSON.stringify([...mock.documents])===saved && mock.writes.length===writes && mock.subscriptions===subscriptions,'No database or session side effects');
      checks+=8;
    }
  }
  change('novoItem','','input');
  document.querySelector('[data-id="glass-note"] [data-action="edit"]').click();
  await until(()=>$('editarItem'));
  const editor=$('editarItem'), font=getComputedStyle(editor).fontFamily;
  change('glassIntensity',72,'input'); change('visualTheme','spider'); change('appearanceMode','light'); change('appearanceMode','liquid-glass');
  assert($('editarItem')===editor && getComputedStyle(editor).fontFamily===font,'Active editor and handwriting unchanged');
  document.querySelector('[data-action="finish-edit"]').click(); await wait(100);

  window.__glassCheck = async (skin, intensity) => {
    change('visualTheme',skin); change('appearanceMode','liquid-glass'); change('glassIntensity',intensity,'input'); await settle();
    assert(root.scrollWidth<=innerWidth && $('workspace').scrollWidth<=$('workspace').clientWidth,'No overflow '+skin+' '+innerWidth);
    const rgba = color => color.match(/[\d.]+/g).map(Number);
    const composite = (fg,bg) => fg.slice(0,3).map((v,i)=>v*(fg[3]??1)+bg[i]*(1-(fg[3]??1)));
    const lum = rgb => rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const ratio = (fg,bg) => {const a=lum(fg.slice(0,3)),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
    // Worst-case white wallpaper, reduced global overlay, then the surface and top reflection.
    const backdrop=skin==='normal' ? [16,23,36] : [234.6,234.6,234.6];
    const reflection=Number(getComputedStyle(root).getPropertyValue('--glass-highlight').replace(/[^\d.]/g,''));
    // Resolve calc() opacity through a real color, not by parsing the expression.
    const probe=document.createElement('span'); probe.style.color='rgba(255,255,255,var(--glass-highlight))'; document.body.append(probe);
    const highlight=rgba(getComputedStyle(probe).color); probe.remove();
    const surfaces=[];
    for (const [container, text] of [['sidebar','tituloPaginas'],['pagina','subtituloPagina'],['agenda','agendaTitulo']]) {
      const el=$(container), style=getComputedStyle(el), color=rgba(style.backgroundColor);
      const bg=composite(highlight,composite(color,backdrop));
      const fg=rgba(getComputedStyle($(text)||el).color), contrast=ratio(fg,bg);
      assert(color[3]>.5 && color[3]<.85,'Translucent '+container);
      assert(contrast>=4.5,'Contrast '+skin+' '+container+' '+contrast);
      assert(style.backdropFilter!=='none','Blur on '+container);
      surfaces.push({container,opacity:color[3],contrast,blur:style.backdropFilter});
    }
    assert(getComputedStyle($('novoItem')).backdropFilter==='none','No per-input blur');
    assert(getComputedStyle(note).fontFamily.includes('Segoe Print'),'Handwriting retained');
    return {skin,intensity,width:innerWidth,surfaces};
  };
  window.__glassChange=change;
  return {ok:true,checks:checks+4};
}
