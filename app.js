const STORAGE_KEY = "meu-caderno-diario-v1";

const state = {
  data: hojeISO(),
  cor: "#f3a7d8",
  corNome: "Rosa",
  registros: carregarRegistros()
};

const dataSelecionada = document.getElementById("dataSelecionada");
const novoItem = document.getElementById("novoItem");
const btnAdicionar = document.getElementById("btnAdicionar");
const markerColors = document.getElementById("markerColors");
const corSelecionadaTexto = document.getElementById("corSelecionadaTexto");
const dataExtenso = document.getElementById("dataExtenso");
const tituloData = document.getElementById("tituloData");
const contadorItens = document.getElementById("contadorItens");
const listaItens = document.getElementById("listaItens");
const toast = document.getElementById("toast");

function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function isoParaData(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarDataBR(iso) {
  return isoParaData(iso).toLocaleDateString("pt-BR");
}

function formatarDataLonga(iso) {
  return isoParaData(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function gerarId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function carregarRegistros() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : {};
  } catch {
    return {};
  }
}

function salvar() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.registros));
}

function itensDoDia() {
  return state.registros[state.data] || [];
}

function garantirDia() {
  if (!state.registros[state.data]) state.registros[state.data] = [];
}

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

function renderizar() {
  dataSelecionada.value = state.data;
  dataExtenso.textContent = formatarDataLonga(state.data);
  tituloData.textContent = formatarDataBR(state.data);

  const itens = itensDoDia();
  contadorItens.textContent = `${itens.length} ${itens.length === 1 ? "item" : "itens"}`;

  if (!itens.length) {
    listaItens.innerHTML = '<div class="empty-state">Comece escrevendo o primeiro assunto do dia.</div>';
    return;
  }

  listaItens.innerHTML = itens.map(item => `
    <article class="note-row ${item.concluido ? "done" : ""}" data-id="${item.id}" style="--highlight:${item.cor || state.cor}">
      <div class="note-text">${escaparHTML(item.texto)}</div>
      <div class="note-actions">
        <button class="icon-btn done-btn" type="button" data-action="toggle" title="${item.concluido ? "Desmarcar" : "Finalizar e grifar"}">
          ${item.concluido ? "↶" : "✓"}
        </button>
        <button class="icon-btn delete-btn" type="button" data-action="delete" title="Excluir">×</button>
      </div>
    </article>
  `).join("");
}

function adicionarItem() {
  const texto = novoItem.value.trim();
  if (!texto) return;

  garantirDia();
  state.registros[state.data].push({
    id: gerarId(),
    texto,
    concluido: false,
    cor: state.cor,
    criadoEm: Date.now()
  });

  salvar();
  novoItem.value = "";
  novoItem.focus();
  renderizar();
}

dataSelecionada.addEventListener("change", () => {
  if (!dataSelecionada.value) return;
  state.data = dataSelecionada.value;
  renderizar();
});

btnAdicionar.addEventListener("click", adicionarItem);

novoItem.addEventListener("keydown", event => {
  if (event.key === "Enter") adicionarItem();
});

markerColors.addEventListener("click", event => {
  const botao = event.target.closest("[data-color]");
  if (!botao) return;

  state.cor = botao.dataset.color;
  state.corNome = botao.dataset.name;
  corSelecionadaTexto.textContent = state.corNome;

  markerColors.querySelectorAll(".marker-color").forEach(item => item.classList.remove("active"));
  botao.classList.add("active");
});

listaItens.addEventListener("click", event => {
  const linha = event.target.closest("[data-id]");
  const acao = event.target.closest("[data-action]");
  if (!linha || !acao) return;

  const itens = itensDoDia();
  const item = itens.find(registro => registro.id === linha.dataset.id);
  if (!item) return;

  if (acao.dataset.action === "toggle") {
    item.concluido = !item.concluido;
    if (item.concluido) item.cor = state.cor;
    salvar();
    renderizar();
    mostrarToast(item.concluido ? "Finalizado e grifado." : "Marca removida.");
  }

  if (acao.dataset.action === "delete") {
    state.registros[state.data] = itens.filter(registro => registro.id !== item.id);
    salvar();
    renderizar();
  }
});

renderizar();
