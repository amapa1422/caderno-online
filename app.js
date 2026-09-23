import {
  auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  collection, doc, setDoc, deleteDoc, onSnapshot
} from "./firebase.js";
import { normalizarCor, hsvParaHex, hexParaHSV } from "./color.js";
const $ = id => document.getElementById(id);
const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
const STORAGE_KEY = "meu-caderno-diario-v1", MIGRATION_KEY = "meu-caderno-diario-migrado-firebase-v1";
const state = {
  usuario: null, data: hojeISO(), cor: normalizarCor(preference("caderno-marker-color")) || "#E85D75",
  registros: {}, unsubscribe: null, ready: false, pending: 0, error: false, cached: false,
  session: 0, addPromise: null, drafts: new Map(), busyItems: new Set(), marking: new Set(),
  editing: null, turning: false, paletteAnchor: null, deletion: null,
  month: hojeISO().slice(0, 7), drawer: null
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const mobileSidebar = matchMedia("(max-width: 900px)");
const floatingAgenda = matchMedia("(max-width: 1180px)");
let editTimer, toastTimer, panelReturnFocus;
let sidebarCollapsed = preference("caderno-sidebar") === "closed";
let agendaCollapsed = preference("caderno-agenda") === "closed";
function preference(key, value) {
  try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); } catch {}
  return null;
}
function hojeISO() { return dataISO(new Date()); }
function dataISO(date) { return String(date.getFullYear()).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0"); }
function isoParaData(iso) {
  const [year, month, day] = iso.split("-").map(Number), date = new Date(0);
  date.setHours(12, 0, 0, 0); date.setFullYear(year, month - 1, day); return date;
}
function dataValida(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= "0001-01-01" && value <= "9999-12-31" && dataISO(isoParaData(value)) === value; }
function moverData(iso, delta) { const date = isoParaData(iso); date.setDate(date.getDate() + delta); return dataISO(date); }
function dataLonga(iso) { return isoParaData(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function escaparHTML(value = "") { return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function gerarId() { return window.crypto?.randomUUID?.() || Date.now() + "-" + Math.random().toString(16).slice(2); }
function itensDoDia() { return state.registros[state.data] || []; }
function encontrarItem(id) { return Object.values(state.registros).flat().find(item => item.id === id); }
function mostrarToast(message, type = "") {
  clearTimeout(toastTimer); $("toast").textContent = message; $("toast").className = "toast " + type; $("toast").hidden = false;
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, type === "erro" ? 6000 : 2800);
}
function atualizarStatus() {
  let text = "Salvo", status = "saved";
  if (state.error) { text = "Falha ao salvar"; status = "error"; }
  else if (!navigator.onLine) { text = state.pending ? "Salvamento pendente" : "Sem conexão"; status = "offline"; }
  else if (state.pending) { text = "Salvando…"; status = "saving"; }
  else if (state.editing && state.editing.value.trim() !== state.editing.savedText) { text = "Editando…"; status = "saving"; }
  else if (!state.ready) { text = "Sincronizando…"; status = "loading"; }
  else if (state.cached) { text = "Conectando…"; status = "loading"; }
  $("statusSalvamento").textContent = text; $("statusSalvamento").dataset.state = status;
  $("btnAdicionar").disabled = !state.ready || !!state.addPromise || !state.usuario || !$("novoItem").value.trim();
  $("listaItens").setAttribute("aria-busy", String(!state.ready));
}
/* Firebase configuration, collection paths and legacy fields remain unchanged. */
function referenciaItem(id, uid = state.usuario?.uid) { if (!uid) throw new Error("Sessão encerrada."); return doc(db, "users", uid, "caderno", id); }
async function gravar(operation) {
  const session = state.session; state.pending++; state.error = false; atualizarStatus();
  try { return await operation(); }
  catch (error) {
    if (session === state.session) { state.error = true; mostrarToast("Não foi possível salvar. Seu texto foi mantido; tente novamente.", "erro"); }
    throw error;
  } finally { if (session === state.session) { state.pending = Math.max(0, state.pending - 1); atualizarStatus(); } }
}
function salvarItem(item, incluirConclusao = false) {
  const reference = referenciaItem(item.id), payload = {
    data: item.data, texto: item.texto,
    criadoEm: item.criadoEm || Date.now(), atualizadoEm: Date.now()
  };
  if (incluirConclusao) payload.concluido = Boolean(item.concluido);
  // Optional substring ranges; no migration or replacement of legacy documents.
  if (Array.isArray(item.grifos)) {
    payload.grifos = normalizarGrifos(item.grifos, item.texto.length);
    payload.versaoGrifos = 2;
  }
  return gravar(() => setDoc(reference, payload, { merge: true }));
}
function pararSincronizacao() { state.unsubscribe?.(); state.unsubscribe = null; }
function iniciarSincronizacao(session) {
  pararSincronizacao();
  state.unsubscribe = onSnapshot(collection(db, "users", state.usuario.uid, "caderno"), { includeMetadataChanges: true }, snapshot => {
    if (session !== state.session) return;
    const records = {};
    snapshot.docs.forEach(documento => {
      const item = { ...documento.data(), id: documento.id };
      if (!dataValida(item.data)) return;
      item.texto = String(item.texto || ""); (records[item.data] ||= []).push(item);
    });
    Object.values(records).forEach(items => items.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0)));
    state.registros = records; state.ready = true; state.cached = Boolean(snapshot.metadata?.fromCache);
    if (!state.turning) renderizar(); else { renderizarCalendario(); renderizarPaginas(); atualizarStatus(); }
  }, () => {
    if (session !== state.session) return;
    state.error = true; $("statusSalvamento").textContent = "Falha na sincronização"; $("statusSalvamento").dataset.state = "error";
    $("listaItens").setAttribute("aria-busy", "false");
    mostrarToast("Não foi possível carregar o caderno. Verifique a conexão e entre novamente.", "erro");
  });
}
async function migrarLocalStorageParaFirebase(uid) {
  let old;
  try { if (localStorage.getItem(MIGRATION_KEY) === "1") return; old = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return; }
  if (!old || typeof old !== "object") { preference(MIGRATION_KEY, "1"); return; }
  try {
    const operations = [];
    Object.entries(old).forEach(([date, items]) => {
      if (!Array.isArray(items)) return;
      items.forEach(item => operations.push(setDoc(referenciaItem(item.id || gerarId(), uid), {
        data: date, texto: String(item.texto || ""), concluido: Boolean(item.concluido), ...(item.cor ? { cor: item.cor } : {}),
        criadoEm: item.criadoEm || Date.now(), atualizadoEm: Date.now()
      }, { merge: true })));
    });
    await Promise.all(operations); preference(MIGRATION_KEY, "1");
    if (operations.length && state.usuario?.uid === uid) mostrarToast("Anotações antigas importadas.");
  } catch { if (state.usuario?.uid === uid) mostrarToast("Não foi possível importar as anotações antigas. Elas continuam neste navegador.", "erro"); }
}
$("formLogin").addEventListener("submit", async event => {
  event.preventDefault(); if ($("btnEntrar").disabled) return;
  $("btnEntrar").disabled = true; $("btnEntrar").textContent = "Entrando…"; $("mensagemLogin").textContent = "";
  try { await signInWithEmailAndPassword(auth, $("emailLogin").value.trim(), $("senhaLogin").value); }
  catch (error) {
    const messages = { "auth/invalid-credential": "E-mail ou senha incorretos.", "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.", "auth/network-request-failed": "Falha de conexão. Verifique sua internet." };
    $("mensagemLogin").textContent = messages[error.code] || "Não foi possível entrar. Tente novamente.";
  } finally { $("btnEntrar").disabled = false; $("btnEntrar").innerHTML = "Entrar no caderno" + icon("right"); }
});
$("btnSair").addEventListener("click", async () => {
  if ($("btnSair").disabled) return; $("btnSair").disabled = true;
  try {
    if (!await finalizarEdicao(true)) return;
    if (state.addPromise && !await state.addPromise) return;
    if (state.pending) { mostrarToast("Aguarde o salvamento antes de sair."); return; }
    await signOut(auth);
  } catch { mostrarToast("Não foi possível sair. Tente novamente.", "erro"); }
  finally { $("btnSair").disabled = false; }
});
onAuthStateChanged(auth, async usuario => {
  const session = ++state.session;
  pararSincronizacao(); clearTimeout(editTimer);
  state.usuario = usuario; state.ready = false; state.registros = {}; state.pending = 0; state.error = false;
  state.addPromise = null; state.editing = null; state.drafts.clear(); state.busyItems.clear(); state.marking.clear();
  state.deletion = null; $("confirmarExclusao").close();
  $("novoItem").value = ""; $("buscaPaginas").value = ""; $("senhaLogin").value = "";
  fecharPaleta(false); fecharPainel(false); $("telaLogin").hidden = !!usuario; $("aplicativo").hidden = !usuario;
  renderizar();
  if (!usuario) return;
  const name = usuario.displayName || usuario.email?.split("@")[0] || "Meu caderno";
  $("nomeUsuario").textContent = name; $("emailUsuario").textContent = usuario.email || ""; $("avatarUsuario").textContent = name[0].toUpperCase();
  await migrarLocalStorageParaFirebase(usuario.uid);
  if (session === state.session) iniciarSincronizacao(session);
});
/* Each draft belongs to its date; an in-flight save never clears newer typing. */
async function adicionarItem() {
  const text = $("novoItem").value.trim();
  if (!text || !state.usuario || !state.ready || state.addPromise) return false;
  const day = state.data, originalInput = $("novoItem").value, session = state.session;
  const item = { id: gerarId(), data: day, texto: text, concluido: false, criadoEm: Date.now(), grifos: [] };
  const operation = (async () => {
    try {
      await salvarItem(item, true);
      if (session !== state.session) return false;
      if (state.drafts.get(day) === originalInput) state.drafts.delete(day);
      if (state.data === day && $("novoItem").value === originalInput) { $("novoItem").value = ""; if (!state.turning) $("novoItem").focus(); }
      return true;
    } catch { state.marking.delete(item.id); return false; }
    finally { if (session === state.session) { state.addPromise = null; atualizarStatus(); } }
  })();
  state.addPromise = operation; atualizarStatus(); return operation;
}
$("formAnotacao").addEventListener("submit", event => { event.preventDefault(); adicionarItem(); });
$("novoItem").addEventListener("input", () => { state.drafts.set(state.data, $("novoItem").value); atualizarStatus(); });
$("novoItem").addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); adicionarItem(); } });
function normalizarGrifos(highlights, length) {
  if (!Array.isArray(highlights)) return [];
  return highlights.filter(range => range && Number.isInteger(range.inicio) && Number.isInteger(range.fim))
    .map(range => ({ inicio: Math.max(0, range.inicio), fim: Math.min(length, range.fim), cor: normalizarCor(range.cor) }))
    .filter(range => range.cor && range.fim > range.inicio).sort((a, b) => a.inicio - b.inicio);
}
function grifosDoItem(item) {
  // Read-only compatibility: the old app coupled whole-line ink to concluido.
  // v2 makes ranges authoritative without clearing old fields. Prior releases
  // could combine whole-line ink with partial ranges, including an empty array.
  const ranges = normalizarGrifos(item.grifos, item.texto.length);
  if (item.versaoGrifos === 2) return ranges;
  const color = normalizarCor(item.cor);
  const legacyInk = item.concluido === true || (item.concluido === undefined && color);
  let result = color && legacyInk ? [{ inicio: 0, fim: item.texto.length, cor: color }] : [];
  for (const range of ranges) result = aplicarTrecho(result, range.inicio, range.fim, range.cor);
  return result;
}
function aplicarTrecho(highlights, start, end, color) {
  const result = [];
  highlights.forEach(range => {
    if (range.fim <= start || range.inicio >= end) result.push(range);
    else { if (range.inicio < start) result.push({ ...range, fim: start }); if (range.fim > end) result.push({ ...range, inicio: end }); }
  });
  if (color) result.push({ inicio: start, fim: end, cor: color });
  return result.sort((a, b) => a.inicio - b.inicio);
}
function ajustarGrifos(before, after, highlights) {
  // Whole-note ink follows the entire edited text, including appended characters.
  if (highlights.length === 1 && highlights[0].inicio === 0 && highlights[0].fim === before.length) {
    return [{ inicio: 0, fim: after.length, cor: highlights[0].cor }];
  }
  // Retain historical partial highlights until an explicit Grifar/Remover action.
  let prefix = 0, suffix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;
  while (suffix < before.length - prefix && suffix < after.length - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const oldEnd = before.length - suffix, newEnd = after.length - suffix, delta = after.length - before.length;
  return normalizarGrifos(highlights.map(range => ({
    ...range, inicio: range.inicio <= prefix ? range.inicio : range.inicio >= oldEnd ? range.inicio + delta : prefix,
    fim: range.fim <= prefix ? range.fim : range.fim >= oldEnd ? range.fim + delta : newEnd
  })), after.length);
}
function textoComGrifos(item) {
  let result = "", offset = 0;
  grifosDoItem(item).forEach(range => {
    const start = Math.max(offset, range.inicio); if (range.fim <= start) return;
    result += escaparHTML(item.texto.slice(offset, start)) + '<mark style="--highlight:' + range.cor + '">' + escaparHTML(item.texto.slice(start, range.fim)) + "</mark>"; offset = range.fim;
  });
  return result + escaparHTML(item.texto.slice(offset));
}
function renderizarItens() {
  const list = $("listaItens"), items = itensDoDia();
  if (!items.length && !state.editing) {
    list.innerHTML = state.ready ? '<div class="empty-state"><strong>Uma página em branco. Muitas possibilidades.</strong>Comece com o que está na sua cabeça.</div>' : '<div class="loading-state" aria-label="Carregando anotações"><span class="loading-line"></span><span class="loading-line"></span></div>';
    return;
  }
  list.querySelectorAll(".empty-state, .loading-state").forEach(node => node.remove());
  const ids = new Set(items.map(item => item.id));
  list.querySelectorAll(".note-row").forEach(row => { if (!ids.has(row.dataset.id) && state.editing?.id !== row.dataset.id) row.remove(); });
  items.forEach((item, index) => {
    let row = [...list.children].find(node => node.dataset.id === item.id);
    if (!row) { row = document.createElement("article"); row.dataset.id = item.id; row.className = "note-row"; }
    const signature = JSON.stringify([item.texto, Boolean(item.concluido), grifosDoItem(item)]);
    if (state.editing?.id !== item.id && row.dataset.signature !== signature) {
      row.dataset.signature = signature; row.className = "note-row" + (item.concluido ? " done" : "");
      row.innerHTML = '<div class="note-body" tabindex="0" aria-describedby="dicaInteracao"><span class="note-text">' + textoComGrifos(item) + '</span></div><div class="note-actions"><button class="icon-button complete-button" type="button" data-action="toggle" aria-label="' + (item.concluido ? "Desfazer conclusão" : "Marcar como feito") + '" aria-pressed="' + Boolean(item.concluido) + '">' + icon("check") + '</button><button class="icon-button delete-button" type="button" data-action="delete" aria-label="Excluir anotação">' + icon("close") + '</button></div><div class="note-context" aria-label="Ações da anotação"><button class="btn btn-ghost" type="button" data-action="edit">Editar</button><button class="btn btn-ghost" type="button" data-action="mark">' + icon("marker") + '<span>Grifar</span></button><button class="btn btn-ghost" type="button" data-action="unmark">Remover grifo</button></div>';
    }
    if (state.marking.delete(item.id) && !reducedMotion.matches) {
      row.classList.remove("is-marking"); void row.offsetWidth;
      row.classList.add("is-marking");
    }
    row.querySelectorAll("[data-action]").forEach(button => {
      button.disabled = state.busyItems.has(item.id) || (button.dataset.action === "unmark" && !grifosDoItem(item).length);
    });
    if (list.children[index] !== row) list.insertBefore(row, list.children[index] || null);
  });
}
$("listaItens").addEventListener("animationend", event => { if (event.animationName === "marker-stroke") event.target.closest(".note-row")?.classList.remove("is-marking"); });
$("listaItens").addEventListener("click", async event => {
  const button = event.target.closest("[data-action]"), row = button?.closest("[data-id]");
  if (!button || button.disabled || !row || state.busyItems.has(row.dataset.id)) return;
  let item = encontrarItem(row.dataset.id); if (!item) return;
  const action = button.dataset.action;
  if (action === "edit") { await iniciarEdicao(item); return; }
  if (action === "finish-edit") { await finalizarEdicao(true); return; }
  if (action === "mark" || action === "unmark") {
    await aplicarMarca(item.id, action === "mark" ? state.cor : null); return;
  }
  const session = state.session;
  if (!["delete", "toggle"].includes(action) || !await finalizarEdicao(true) || session !== state.session) return;
  item = encontrarItem(item.id); if (!item) return;
  if (action === "delete") { pedirExclusao(item, button); return; }
  state.busyItems.add(item.id); renderizarItens();
  try {
    await salvarItem({ ...item, concluido: !item.concluido, grifos: grifosDoItem(item) }, true);
    if (session === state.session && !reducedMotion.matches) {
      const control = [...$("listaItens").children].find(node => node.dataset.id === item.id)?.querySelector(".complete-button");
      control?.animate([{ transform: "scale(.8)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 180 });
    }
  } catch { state.marking.delete(item.id); }
  finally { if (session === state.session) { state.busyItems.delete(item.id); renderizar(); } }
});
function pedirExclusao(item, anchor) {
  state.deletion = { id: item.id, session: state.session, anchor, saving: false };
  $("trechoExclusao").textContent = item.texto;
  $("erroExclusao").textContent = "";
  $("confirmarExclusao").showModal(); $("cancelarExclusao").focus();
}
function cancelarExclusao() {
  const deletion = state.deletion; if (deletion?.saving) return;
  state.deletion = null; $("confirmarExclusao").close();
  if (deletion?.anchor?.isConnected) deletion.anchor.focus({ preventScroll: true });
}
$("cancelarExclusao").addEventListener("click", cancelarExclusao);
$("confirmarExclusao").addEventListener("cancel", event => { event.preventDefault(); cancelarExclusao(); });
$("excluirConfirmado").addEventListener("click", async () => {
  const deletion = state.deletion;
  if (!deletion || deletion.saving || deletion.session !== state.session) return;
  deletion.saving = true; $("excluirConfirmado").disabled = true; $("cancelarExclusao").disabled = true;
  $("erroExclusao").textContent = "";
  try {
    const reference = referenciaItem(deletion.id);
    await gravar(() => deleteDoc(reference));
    if (deletion.session === state.session) {
      state.deletion = null; $("confirmarExclusao").close();
      mostrarToast("Anotação excluída."); $("novoItem").focus({ preventScroll: true });
    }
  } catch {
    if (deletion.session === state.session) $("erroExclusao").textContent = "Não foi possível excluir. A anotação foi mantida; tente novamente.";
  }
  finally { deletion.saving = false; $("excluirConfirmado").disabled = false; $("cancelarExclusao").disabled = false; }
});
async function iniciarEdicao(item) {
  if (state.editing?.id === item.id || !await finalizarEdicao(true)) return;
  const row = [...$("listaItens").children].find(node => node.dataset.id === item.id); if (!row) return;
  state.editing = { id: item.id, value: item.texto, savedText: item.texto, grifos: grifosDoItem(item), inFlight: null, session: state.session };
  row.classList.add("is-editing");
  row.querySelector(".note-body").innerHTML = '<label class="sr-only" for="editarItem">Editar anotação</label><textarea id="editarItem" class="inline-editor" maxlength="140" rows="3"></textarea><div class="editing-footer"><span>As alterações são salvas automaticamente.</span><button type="button" class="btn btn-ghost" data-action="finish-edit">Fechar edição</button></div>';
  $("editarItem").value = item.texto; $("editarItem").focus(); $("editarItem").setSelectionRange(item.texto.length, item.texto.length);
  $("editarItem").addEventListener("input", event => {
    if (!state.editing) return;
    state.editing.value = event.target.value; clearTimeout(editTimer);
    editTimer = setTimeout(() => finalizarEdicao(false), 650); atualizarStatus();
  });
  $("editarItem").addEventListener("keydown", event => {
    if ((event.key === "Enter" && !event.shiftKey && !event.isComposing) || event.key === "Escape") { event.preventDefault(); finalizarEdicao(true); }
  });
}
async function finalizarEdicao(close) {
  clearTimeout(editTimer);
  const editing = state.editing; if (!editing) return true;
  if (editing.session !== state.session) return false;
  if (editing.inFlight) {
    const ok = await editing.inFlight;
    if (!ok || editing.session !== state.session) return false;
    return finalizarEdicao(close);
  }
  const text = editing.value.trim();
  if (!text) { if (close) mostrarToast("Escreva algo antes de fechar a edição.", "erro"); return false; }
  if (text !== editing.savedText) {
    const current = encontrarItem(editing.id);
    if (!current) { mostrarToast("Esta anotação foi excluída em outro dispositivo. Copie seu texto antes de sair.", "erro"); return false; }
    const highlights = ajustarGrifos(editing.savedText, text, normalizarGrifos(editing.grifos, editing.savedText.length));
    editing.inFlight = (async () => {
      try {
        const updated = { ...current, texto: text, grifos: highlights };
        await salvarItem(updated); editing.savedText = text; editing.grifos = highlights; return true;
      } catch { return false; }
      finally { editing.inFlight = null; atualizarStatus(); }
    })();
    if (!await editing.inFlight || editing.session !== state.session) return false;
    if (editing.value.trim() !== editing.savedText) return finalizarEdicao(close);
  }
  if (close && state.editing === editing) {
    state.editing = null;
    const row = [...$("listaItens").children].find(node => node.dataset.id === editing.id);
    if (row) row.dataset.signature = ""; renderizarItens(); row?.querySelector('[data-action="edit"]')?.focus();
  }
  atualizarStatus(); return true;
}

/* Flush editing before turning the sheet. The document identity never depends on the animation. */
async function navegarPara(day) {
  if (!dataValida(day) || state.turning) return false;
  if (day === state.data) { fecharPainel(); return true; }
  const session = state.session;
  // Reserve the transition before awaiting writes, so repeated clicks cannot race.
  state.turning = true;
  const editSaved = await finalizarEdicao(true);
  if (!editSaved || session !== state.session) { state.turning = false; renderizar(); return false; }
  const addSaved = state.addPromise ? await state.addPromise : true;
  if (!addSaved || session !== state.session) { state.turning = false; renderizar(); return false; }
  const forward = day > state.data, page = $("pagina");
  state.drafts.set(state.data, $("novoItem").value);
  fecharPaleta(false); fecharPainel(false);
  page.inert = true; page.classList.add("turning"); page.classList.toggle("turning-back", !forward);
  [$("diaAnterior"), $("proximoDia"), $("irHoje")].forEach(button => { button.disabled = true; });
  try {
    const short = reducedMotion.matches, duration = short ? 40 : 220;
    await page.animate(short ? [{ opacity: 1 }, { opacity: .25 }] : [
      { transform: "rotateY(0deg)", opacity: 1 },
      { transform: "rotateY(" + (forward ? -58 : 58) + "deg)", opacity: .12 }
    ], { duration, easing: "cubic-bezier(.2,.65,.25,1)", fill: "forwards" }).finished;
    if (session !== state.session) return false;
    state.data = day; state.month = day.slice(0, 7);
    $("novoItem").value = state.drafts.get(day) || ""; renderizar();
    page.getAnimations().forEach(animation => animation.cancel());
    await page.animate(short ? [{ opacity: .25 }, { opacity: 1 }] : [
      { transform: "rotateY(" + (forward ? 28 : -28) + "deg)", opacity: .25 },
      { transform: "rotateY(0deg)", opacity: 1 }
    ], { duration, easing: "cubic-bezier(.2,.65,.25,1)" }).finished;
    return true;
  } catch (error) { if (error.name !== "AbortError") mostrarToast("A página foi atualizada sem animação."); return false; }
  finally {
    page.getAnimations().forEach(animation => animation.cancel());
    page.classList.remove("turning", "turning-back"); page.inert = false; state.turning = false;
    [$("diaAnterior"), $("proximoDia"), $("irHoje")].forEach(button => { button.disabled = false; }); renderizar();
  }
}
$("diaAnterior").addEventListener("click", () => navegarPara(moverData(state.data, -1)));
$("proximoDia").addEventListener("click", () => navegarPara(moverData(state.data, 1)));
$("irHoje").addEventListener("click", () => navegarPara(hojeISO()));
$("navHoje").addEventListener("click", () => navegarPara(hojeISO()));
$("novaAnotacao").addEventListener("click", () => { fecharPainel(false); $("novoItem").focus(); });
$("dataSelecionada").addEventListener("change", async event => { await navegarPara(event.target.value); event.target.value = state.data; });
function renderizar() {
  const date = isoParaData(state.data), items = itensDoDia();
  $("dataSelecionada").value = state.data;
  $("dataExtenso").textContent = date.toLocaleDateString("pt-BR", { weekday: "long" });
  $("anoData").textContent = date.getFullYear();
  $("tituloData").textContent = date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  $("dataTopbar").textContent = state.data === hojeISO() ? "Hoje" : date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  $("contadorItens").textContent = items.length + (items.length === 1 ? " item" : " itens");
  $("numeroPagina").textContent = date.toLocaleDateString("pt-BR");
  $("totalDia").textContent = items.length;
  $("resumoTexto").textContent = !items.length ? "Seu dia começa com uma anotação." : "Ideias e memórias guardadas nesta página.";
  $("paginaContexto").textContent = state.data === hojeISO() ? "Uma página para o seu hoje" : "Cada dia tem sua própria história";
  $("navHoje").classList.toggle("active", state.data === hojeISO());
  $("navHoje").setAttribute("aria-current", state.data === hojeISO() ? "date" : "false");
  renderizarItens(); renderizarPaginas(); renderizarCalendario(); atualizarStatus();
}
function renderizarPaginas() {
  const query = $("buscaPaginas").value.trim().toLocaleLowerCase("pt-BR");
  const dates = Object.keys(state.registros).filter(date => state.registros[date].length).sort().reverse();
  $("totalPaginas").textContent = dates.length; $("contagemHoje").textContent = (state.registros[hojeISO()] || []).length;
  const visible = dates.filter(date => !query || (date + " " + dataLonga(date) + " " + state.registros[date].map(item => item.texto).join(" ")).toLocaleLowerCase("pt-BR").includes(query));
  $("listaPaginas").innerHTML = visible.length ? visible.map(date => {
    const d = isoParaData(date), items = state.registros[date];
    return '<button class="page-link' + (state.data === date ? " active" : "") + '" type="button" data-date="' + date + '" aria-current="' + (state.data === date ? "date" : "false") + '"><span class="page-day">' + String(d.getDate()).padStart(2, "0") + '</span><span><strong>' + escaparHTML(d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })) + "</strong><small>" + escaparHTML(items[0].texto) + "</small></span></button>";
  }).join("") : '<p class="sidebar-empty">' + (query ? "Nenhuma página encontrada." : state.ready ? "Suas páginas aparecem aqui quando você começa a escrever." : "Carregando suas páginas…") + "</p>";
}
$("buscaPaginas").addEventListener("input", renderizarPaginas);
$("listaPaginas").addEventListener("click", event => { const button = event.target.closest("[data-date]"); if (button) navegarPara(button.dataset.date); });
function renderizarCalendario(focusDate) {
  const previousFocus = document.activeElement?.closest("#calendario [data-date]")?.dataset.date;
  const first = isoParaData(state.month + "-01"), start = moverData(dataISO(first), -first.getDay());
  $("mesCalendario").textContent = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const selectedFocus = focusDate || previousFocus || (state.data.startsWith(state.month) ? state.data : dataISO(first));
  let html = "";
  for (let index = 0; index < 42; index++) {
    const day = moverData(start, index), date = isoParaData(day), hasNote = Boolean(state.registros[day]?.length);
    html += '<button type="button" class="cal-day' + (day.slice(0, 7) !== state.month ? " outside" : "") + (day === hojeISO() ? " today" : "") + (day === state.data ? " selected" : "") + '" data-date="' + day + '" tabindex="' + (day === selectedFocus ? "0" : "-1") + '" aria-label="' + escaparHTML(dataLonga(day) + (hasNote ? ", com anotações" : "")) + '" aria-pressed="' + (day === state.data) + '"' + (day === hojeISO() ? ' aria-current="date"' : "") + (!dataValida(day) ? " disabled" : "") + ">" + date.getDate() + (hasNote ? '<span class="cal-dot" aria-hidden="true"></span>' : "") + "</button>";
  }
  $("calendario").innerHTML = html;
  $("mesAnterior").disabled = state.month === "0001-01"; $("proximoMes").disabled = state.month === "9999-12";
  if (previousFocus) $("calendario").querySelector('[data-date="' + selectedFocus + '"]')?.focus({ preventScroll: true });
}
function mudarMes(delta) {
  const date = isoParaData(state.month + "-01"); date.setMonth(date.getMonth() + delta);
  const iso = dataISO(date); if (!dataValida(iso)) return;
  state.month = iso.slice(0, 7); renderizarCalendario();
  if (!reducedMotion.matches) $("calendario").animate([{ opacity: .3, transform: "translateX(" + (delta > 0 ? 5 : -5) + "px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 150 });
}
$("mesAnterior").addEventListener("click", () => mudarMes(-1));
$("proximoMes").addEventListener("click", () => mudarMes(1));
$("calendario").addEventListener("click", event => { const day = event.target.closest("[data-date]"); if (day) navegarPara(day.dataset.date); });
$("calendario").addEventListener("keydown", event => {
  const button = event.target.closest("[data-date]"), deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  if (!button || !(event.key in deltas)) return;
  event.preventDefault();
  const day = moverData(button.dataset.date, deltas[event.key]); if (!dataValida(day)) return;
  state.month = day.slice(0, 7); renderizarCalendario(day); $("calendario").querySelector('[data-date="' + day + '"]')?.focus();
});
const picker = { color: "#E85D75", ...hexParaHSV("#E85D75"), pointer: null };
let recentColors = [];
try { const saved = JSON.parse(preference("caderno-recent-colors") || "[]"); if (Array.isArray(saved)) recentColors = [...new Set(saved.map(normalizarCor).filter(Boolean))].slice(0, 6); } catch {}
function atualizarAmostra() {
  $("amostraCor").style.backgroundColor = state.cor || "";
  $("amostraCor").classList.toggle("is-none", !state.cor);
  $("amostraCor").setAttribute("aria-label", state.cor || "Sem marca-texto");
}
function renderizarRecentes() {
  $("coresRecentes").innerHTML = recentColors.length ? recentColors.map(color => '<button type="button" class="recent-color" data-color="' + color + '" style="--marker:' + color + '" aria-label="Usar ' + color + '" title="' + color + '"></button>').join("") : '<span class="recent-empty">As cores que você usar ficam aqui.</span>';
}
function lembrarCor(color) {
  if (!color) return;
  recentColors = [color, ...recentColors.filter(old => old !== color)].slice(0, 6);
  preference("caderno-recent-colors", JSON.stringify(recentColors)); renderizarRecentes();
}
function atualizarPicker(color, fromHSV = false) {
  picker.color = color;
  if (!fromHSV) Object.assign(picker, hexParaHSV(color));
  $("campoCor").style.setProperty("--hue", hsvParaHex(picker.h, 1, 1));
  $("cursorCor").style.left = picker.s * 100 + "%";
  $("cursorCor").style.top = (1 - picker.v) * 100 + "%";
  $("campoCor").setAttribute("aria-label", "Saturação " + Math.round(picker.s * 100) + "%, brilho " + Math.round(picker.v * 100) + "%");
  $("tonalidadeCor").value = picker.h;
  $("tonalidadeCor").setAttribute("aria-valuetext", Math.round(picker.h) + " graus");
  $("hexCor").value = color; $("hexCor").setAttribute("aria-invalid", "false");
  $("erroCor").textContent = ""; $("aplicarGrifo").disabled = false;
  $("corNativa").value = color.toLowerCase();
  $("previewGrifo").style.setProperty("--highlight", color);
  $("corSelecionadaTexto").textContent = color;
  state.cor = color; preference("caderno-marker-color", color); atualizarAmostra();
}
function posicionarPaleta() {
  if ($("paleta").hidden) return;
  const anchor = state.paletteAnchor?.isConnected ? state.paletteAnchor : $("abrirPaleta");
  const bounds = anchor.getBoundingClientRect(), palette = $("paleta"), viewport = window.visualViewport;
  const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
  const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
  const style = getComputedStyle(palette), gap = edge => parseFloat(style.getPropertyValue("scroll-margin-" + edge)) || 12;
  palette.style.maxHeight = Math.max(80, height - gap("top") - gap("bottom")) + "px";
  palette.style.left = Math.max(left + gap("left"), Math.min(bounds.right - palette.offsetWidth, left + width - palette.offsetWidth - gap("right"))) + "px";
  palette.style.top = Math.max(top + gap("top"), Math.min(bounds.bottom + 8, top + height - palette.offsetHeight - gap("bottom"))) + "px";
}
function abrirPaleta() {
  state.paletteAnchor = $("abrirPaleta");
  atualizarPicker(state.cor);
  $("paleta").hidden = false; $("abrirPaleta").setAttribute("aria-expanded", "true");
  renderizarRecentes(); posicionarPaleta(); $("campoCor").focus({ preventScroll: true });
}
function fecharPaleta(restoreFocus = true) {
  const wasOpen = !$("paleta").hidden;
  $("paleta").hidden = true; $("abrirPaleta").setAttribute("aria-expanded", "false");
  if (wasOpen) lembrarCor(state.cor);
  if (restoreFocus && wasOpen) $("abrirPaleta").focus({ preventScroll: true });
  picker.pointer = null;
}
$("abrirPaleta").addEventListener("pointerdown", event => { if (event.pointerType === "mouse") event.preventDefault(); });
$("abrirPaleta").addEventListener("click", () => { if ($("paleta").hidden) abrirPaleta($("abrirPaleta")); else fecharPaleta(); });
$("fecharPaleta").addEventListener("click", () => fecharPaleta());
function escolherNoCampo(event) {
  const bounds = $("campoCor").getBoundingClientRect();
  picker.s = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  picker.v = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
  atualizarPicker(hsvParaHex(picker.h, picker.s, picker.v), true);
}
$("campoCor").addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  event.preventDefault(); picker.pointer = event.pointerId;
  $("campoCor").setPointerCapture(event.pointerId); $("campoCor").focus(); escolherNoCampo(event);
});
$("campoCor").addEventListener("pointermove", event => { if (picker.pointer === event.pointerId) escolherNoCampo(event); });
for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) $("campoCor").addEventListener(name, event => {
  if (picker.pointer === event.pointerId) { if (name === "pointerup") escolherNoCampo(event); picker.pointer = null; }
});
$("campoCor").addEventListener("keydown", event => {
  const delta = event.shiftKey ? .1 : .01;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "ArrowLeft") picker.s -= delta;
  if (event.key === "ArrowRight") picker.s += delta;
  if (event.key === "ArrowUp") picker.v += delta;
  if (event.key === "ArrowDown") picker.v -= delta;
  picker.s = Math.max(0, Math.min(1, picker.s)); picker.v = Math.max(0, Math.min(1, picker.v));
  atualizarPicker(hsvParaHex(picker.h, picker.s, picker.v), true);
});
$("tonalidadeCor").addEventListener("input", event => { picker.h = Number(event.target.value); atualizarPicker(hsvParaHex(picker.h, picker.s, picker.v), true); });
$("hexCor").addEventListener("input", event => {
  const raw = event.target.value.trim(), color = /^#?[\da-f]{6}$/i.test(raw) ? normalizarCor("#" + raw.replace(/^#/, "")) : null;
  if (color) atualizarPicker(color);
  else { $("hexCor").setAttribute("aria-invalid", "true"); $("erroCor").textContent = "Use 6 dígitos HEX, como #E85D75."; $("aplicarGrifo").disabled = true; }
});
$("corNativa").addEventListener("input", event => atualizarPicker(normalizarCor(event.target.value)));
$("coresRecentes").addEventListener("click", event => { const button = event.target.closest("[data-color]"); if (button) atualizarPicker(button.dataset.color); });
async function aplicarMarca(noteId, color) {
  const session = state.session;
  if (!await finalizarEdicao(true) || session !== state.session) return;
  let item = encontrarItem(noteId);
  if (!item || state.busyItems.has(item.id)) return;
  state.busyItems.add(noteId);
  renderizarItens();
  const animations = [];
  try {
    if (!color && !reducedMotion.matches) {
      const row = [...$("listaItens").children].find(node => node.dataset.id === noteId);
      row?.classList.remove("is-marking");
      row?.querySelectorAll(".note-text mark").forEach(mark => {
        animations.push(mark.animate([{ backgroundSize: "100% 76%" }, { backgroundSize: "0% 76%" }], { duration: 200, easing: "ease-out", fill: "forwards" }));
      });
      await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    }
    if (session !== state.session) return;
    item = encontrarItem(noteId); if (!item) return;
    const grifos = color ? [{ inicio: 0, fim: item.texto.length, cor: color }] : [];
    if (color) state.marking.add(noteId);
    await salvarItem({ ...item, grifos });
    if (session === state.session) lembrarCor(color);
  } catch { if (session === state.session) state.marking.delete(noteId); }
  finally {
    animations.forEach(animation => animation.cancel());
    if (session === state.session) { state.busyItems.delete(noteId); renderizar(); }
  }
}
$("aplicarGrifo").addEventListener("click", () => fecharPaleta());
document.addEventListener("pointerdown", event => {
  if (!$("paleta").hidden && !event.target.closest("#paleta, #abrirPaleta")) fecharPaleta(false);
});
$("workspace").addEventListener("scroll", posicionarPaleta, { passive: true });
function atualizarViewport() {
  const viewport = window.visualViewport;
  document.documentElement.style.setProperty("--visible-height", (viewport?.height || innerHeight) + "px");
  posicionarPaleta();
  if (document.activeElement === $("novoItem")) requestAnimationFrame(() => $("btnAdicionar").scrollIntoView({ block: "nearest" }));
}
window.visualViewport?.addEventListener("resize", atualizarViewport);
window.visualViewport?.addEventListener("scroll", posicionarPaleta);
/* Off-canvas panels use focus containment and inert backgrounds. */
function atualizarPaineis() {
  const app = $("aplicativo");
  app.classList.toggle("sidebar-collapsed", sidebarCollapsed); app.classList.toggle("agenda-collapsed", agendaCollapsed);
  app.classList.toggle("sidebar-open", state.drawer === "sidebar"); app.classList.toggle("agenda-open", state.drawer === "agenda");
  const sidebarVisible = mobileSidebar.matches ? state.drawer === "sidebar" : !sidebarCollapsed;
  const agendaVisible = floatingAgenda.matches ? state.drawer === "agenda" : !agendaCollapsed;
  $("sidebar").inert = !sidebarVisible || !!(state.drawer && state.drawer !== "sidebar");
  $("agenda").inert = !agendaVisible || !!(state.drawer && state.drawer !== "agenda");
  $("sidebar").setAttribute("aria-hidden", String(!sidebarVisible)); $("agenda").setAttribute("aria-hidden", String(!agendaVisible));
  $("sidebarToggle").setAttribute("aria-expanded", String(sidebarVisible)); $("agendaToggle").setAttribute("aria-expanded", String(agendaVisible));
  $("panelBackdrop").hidden = !state.drawer; $("workspace").inert = !!state.drawer;
  for (const panel of ["sidebar", "agenda"]) {
    if (state.drawer === panel) { $(panel).setAttribute("role", "dialog"); $(panel).setAttribute("aria-modal", "true"); }
    else { $(panel).removeAttribute("role"); $(panel).removeAttribute("aria-modal"); }
  }
}
function fecharPainel(restoreFocus = true) { const open = !!state.drawer; state.drawer = null; atualizarPaineis(); if (open && restoreFocus) panelReturnFocus?.focus(); }
function alternarPainel(panel) {
  fecharPaleta(false);
  const floating = panel === "sidebar" ? mobileSidebar.matches : floatingAgenda.matches;
  if (floating) {
    if (state.drawer === panel) { fecharPainel(); return; }
    panelReturnFocus = document.activeElement; state.drawer = panel; atualizarPaineis(); $(panel).querySelector("button, input")?.focus();
  } else {
    if (panel === "sidebar") { sidebarCollapsed = !sidebarCollapsed; preference("caderno-sidebar", sidebarCollapsed ? "closed" : "open"); }
    else { agendaCollapsed = !agendaCollapsed; preference("caderno-agenda", agendaCollapsed ? "closed" : "open"); }
    atualizarPaineis();
    if (!reducedMotion.matches) $("workspace").animate([{ opacity: .75, transform: "translateX(" + (panel === "sidebar" ? 5 : -5) + "px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: 200 });
  }
}
$("sidebarToggle").addEventListener("click", () => alternarPainel("sidebar"));
$("agendaToggle").addEventListener("click", () => alternarPainel("agenda"));
document.querySelectorAll("[data-close-panel]").forEach(button => button.addEventListener("click", () => {
  if (state.drawer) fecharPainel(); else { alternarPainel(button.dataset.closePanel); $(button.dataset.closePanel === "sidebar" ? "sidebarToggle" : "agendaToggle").focus(); }
}));
$("panelBackdrop").addEventListener("click", () => fecharPainel());
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!$("paleta").hidden) { event.preventDefault(); fecharPaleta(); }
    else if (state.drawer) { event.preventDefault(); fecharPainel(); }
  }
  const container = !$("paleta").hidden ? $("paleta") : state.drawer ? $(state.drawer) : null;
  if (event.key !== "Tab" || !container) return;
  const focusables = [...container.querySelectorAll("button:not(:disabled), input, [tabindex='0']")].filter(node => node.getClientRects().length);
  const first = focusables[0], last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
for (const media of [mobileSidebar, floatingAgenda]) media.addEventListener("change", () => { fecharPainel(false); atualizarPaineis(); });
window.addEventListener("resize", posicionarPaleta, { passive: true });
function aplicarTema(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#1f1f1f" : "#ffffff";
  document.querySelectorAll("[data-theme-toggle]").forEach(button => {
    button.setAttribute("aria-label", theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro");
    button.querySelector("use").setAttribute("href", theme === "dark" ? "#i-sun" : "#i-moon");
  });
  document.querySelectorAll("[data-theme-label]").forEach(label => { label.textContent = theme === "dark" ? "Modo claro" : "Modo escuro"; });
}
document.querySelectorAll("[data-theme-toggle]").forEach(button => button.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; preference("caderno-theme", theme); aplicarTema(theme);
}));
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => { if (!preference("caderno-theme")) aplicarTema(event.matches ? "dark" : "light"); });
window.addEventListener("online", atualizarStatus);
window.addEventListener("offline", atualizarStatus);
window.addEventListener("beforeunload", event => {
  if (state.pending || [...state.drafts.values()].some(value => value.trim()) || (state.editing && state.editing.value.trim() !== state.editing.savedText)) { event.preventDefault(); event.returnValue = ""; }
});
aplicarTema(document.documentElement.dataset.theme);
atualizarAmostra(); atualizarViewport();
atualizarPaineis();
renderizar();
