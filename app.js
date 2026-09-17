/* =====================================================
   CADERNO ONLINE - FIREBASE
===================================================== */

import {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "./firebase.js";

const STORAGE_KEY = "meu-caderno-diario-v1";
const MIGRATION_KEY = "meu-caderno-diario-migrado-firebase-v1";

const state = {
  usuario: null,
  data: hojeISO(),
  cor: "#f3a7d8",
  corNome: "Rosa",
  registros: {},
  unsubscribe: null
};

/* =====================================================
   ELEMENTOS
===================================================== */

const telaLogin = document.getElementById("telaLogin");
const aplicativo = document.getElementById("aplicativo");
const formLogin = document.getElementById("formLogin");
const emailLogin = document.getElementById("emailLogin");
const senhaLogin = document.getElementById("senhaLogin");
const btnEntrar = document.getElementById("btnEntrar");
const btnSair = document.getElementById("btnSair");
const mensagemLogin = document.getElementById("mensagemLogin");

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

/* =====================================================
   DATAS E UTILIDADES
===================================================== */

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

function escaparHTML(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarToast(mensagem, tipo = "sucesso") {
  toast.textContent = mensagem;
  toast.className = `toast ${tipo}`;
  toast.hidden = false;
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 1900);
}

function itensDoDia() {
  return state.registros[state.data] || [];
}

/* =====================================================
   LOGIN
===================================================== */

formLogin.addEventListener("submit", async event => {
  event.preventDefault();
  mensagemLogin.textContent = "";
  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  try {
    await signInWithEmailAndPassword(
      auth,
      emailLogin.value.trim(),
      senhaLogin.value
    );
  } catch (erro) {
    console.error("Erro no login:", erro);

    if (erro.code === "auth/invalid-credential") {
      mensagemLogin.textContent = "E-mail ou senha incorretos.";
    } else if (erro.code === "auth/too-many-requests") {
      mensagemLogin.textContent = "Muitas tentativas. Aguarde um pouco e tente novamente.";
    } else if (erro.code === "auth/network-request-failed") {
      mensagemLogin.textContent = "Falha de conexão. Verifique sua internet.";
    } else {
      mensagemLogin.textContent = "Não foi possível entrar.";
    }
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
  }
});

btnSair.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error("Erro ao sair:", erro);
  }
});

onAuthStateChanged(auth, async usuario => {
  if (usuario) {
    state.usuario = usuario;
    telaLogin.hidden = true;
    aplicativo.hidden = false;

    await migrarLocalStorageParaFirebase();
    iniciarSincronizacao();
  } else {
    pararSincronizacao();
    state.usuario = null;
    state.registros = {};
    aplicativo.hidden = true;
    telaLogin.hidden = false;
    renderizar();
  }
});

/* =====================================================
   FIRESTORE
===================================================== */

function colecaoItens() {
  return collection(db, "users", state.usuario.uid, "caderno");
}

function referenciaItem(id) {
  return doc(db, "users", state.usuario.uid, "caderno", id);
}

function pararSincronizacao() {
  if (state.unsubscribe) {
    state.unsubscribe();
    state.unsubscribe = null;
  }
}

function iniciarSincronizacao() {
  if (!state.usuario?.uid) return;

  pararSincronizacao();

  state.unsubscribe = onSnapshot(
    colecaoItens(),
    snapshot => {
      const registros = {};

      snapshot.docs.forEach(documento => {
        const item = {
          id: documento.id,
          ...documento.data()
        };

        if (!item.data) return;

        if (!registros[item.data]) {
          registros[item.data] = [];
        }

        registros[item.data].push(item);
      });

      Object.values(registros).forEach(itens => {
        itens.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0));
      });

      state.registros = registros;
      renderizar();
    },
    erro => {
      console.error("Erro ao sincronizar caderno:", erro);
      mostrarToast("Erro ao sincronizar com o Firebase.", "erro");
    }
  );
}

async function salvarItem(item) {
  if (!state.usuario?.uid) return;

  await setDoc(
    referenciaItem(item.id),
    {
      data: item.data,
      texto: item.texto,
      concluido: Boolean(item.concluido),
      cor: item.cor || state.cor,
      criadoEm: item.criadoEm || Date.now(),
      atualizadoEm: Date.now()
    },
    { merge: true }
  );
}

async function excluirItem(id) {
  if (!state.usuario?.uid) return;
  await deleteDoc(referenciaItem(id));
}

/* =====================================================
   MIGRAÇÃO DO LOCALSTORAGE ANTIGO
===================================================== */

async function migrarLocalStorageParaFirebase() {
  if (!state.usuario?.uid) return;
  if (localStorage.getItem(MIGRATION_KEY) === "1") return;

  let antigo = null;

  try {
    antigo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    antigo = null;
  }

  if (!antigo || typeof antigo !== "object") {
    localStorage.setItem(MIGRATION_KEY, "1");
    return;
  }

  const operacoes = [];

  Object.entries(antigo).forEach(([data, itens]) => {
    if (!Array.isArray(itens)) return;

    itens.forEach(item => {
      const id = item.id || gerarId();

      operacoes.push(
        setDoc(
          referenciaItem(id),
          {
            data,
            texto: String(item.texto || ""),
            concluido: Boolean(item.concluido),
            cor: item.cor || "#f3a7d8",
            criadoEm: item.criadoEm || Date.now(),
            atualizadoEm: Date.now()
          },
          { merge: true }
        )
      );
    });
  });

  try {
    await Promise.all(operacoes);
    localStorage.setItem(MIGRATION_KEY, "1");

    if (operacoes.length > 0) {
      mostrarToast("Anotações antigas importadas para o Firebase.");
    }
  } catch (erro) {
    console.error("Erro na migração:", erro);
  }
}

/* =====================================================
   RENDERIZAÇÃO
===================================================== */

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

/* =====================================================
   AÇÕES DO CADERNO
===================================================== */

async function adicionarItem() {
  const texto = novoItem.value.trim();
  if (!texto || !state.usuario?.uid) return;

  const item = {
    id: gerarId(),
    data: state.data,
    texto,
    concluido: false,
    cor: state.cor,
    criadoEm: Date.now()
  };

  btnAdicionar.disabled = true;

  try {
    await salvarItem(item);
    novoItem.value = "";
    novoItem.focus();
  } catch (erro) {
    console.error("Erro ao adicionar item:", erro);
    mostrarToast("Não foi possível salvar.", "erro");
  } finally {
    btnAdicionar.disabled = false;
  }
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

listaItens.addEventListener("click", async event => {
  const linha = event.target.closest("[data-id]");
  const acao = event.target.closest("[data-action]");
  if (!linha || !acao) return;

  const itens = itensDoDia();
  const item = itens.find(registro => registro.id === linha.dataset.id);
  if (!item) return;

  if (acao.dataset.action === "toggle") {
    const atualizado = {
      ...item,
      concluido: !item.concluido,
      cor: !item.concluido ? state.cor : (item.cor || state.cor)
    };

    try {
      await salvarItem(atualizado);
      mostrarToast(atualizado.concluido ? "Finalizado e grifado." : "Marca removida.");
    } catch (erro) {
      console.error("Erro ao atualizar item:", erro);
      mostrarToast("Não foi possível atualizar.", "erro");
    }
  }

  if (acao.dataset.action === "delete") {
    try {
      await excluirItem(item.id);
      mostrarToast("Item excluído.");
    } catch (erro) {
      console.error("Erro ao excluir item:", erro);
      mostrarToast("Não foi possível excluir.", "erro");
    }
  }
});

renderizar();
