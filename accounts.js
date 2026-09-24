import { createCadernoUser } from "./firebase.js";

const $ = id => document.getElementById(id);
const dialog = $("administrarContas");
const form = $("formConta");
const ADMIN_EMAIL = "caderno@gmail.com";

let currentUser = null;
let generation = 0;
let allowed = false;
let busy = false;
let requestId = null;

function isAdmin(user) {
  return user?.email?.trim().toLowerCase() === ADMIN_EMAIL;
}

function clear() {
  generation++;
  allowed = false;
  busy = false;
  requestId = null;
  $("abrirContas").hidden = true;
  if (dialog?.open) dialog.close();
  form?.reset();
  form?.querySelectorAll("input").forEach(input => { input.readOnly = false; });
  if ($("resultadoConta")) $("resultadoConta").textContent = "";
  if ($("criarConta")) $("criarConta").disabled = false;
}

export function resetAccounts() {
  currentUser = null;
  clear();
}

export function setAccountsUser(user) {
  currentUser = user;
  allowed = isAdmin(user);
  $("abrirContas").hidden = !allowed;
}

$("abrirContas").addEventListener("click", () => {
  if (!allowed || !currentUser) return;
  form.reset();
  $("resultadoConta").textContent = "";
  requestId = crypto.randomUUID();
  dialog.showModal();
  $("nomeConta").focus();
});

$("fecharContas").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  form.reset();
  $("resultadoConta").textContent = "";
  requestId = null;
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!allowed || !currentUser || busy || !form.reportValidity()) return;

  const epoch = generation;
  const operationId = requestId || crypto.randomUUID();
  requestId = operationId;
  busy = true;
  $("criarConta").disabled = true;
  $("resultadoConta").textContent = "Criando conta…";

  const fields = [...form.querySelectorAll("input")];
  fields.forEach(input => { input.readOnly = true; });

  try {
    await createCadernoUser({
      displayName: $("nomeConta").value.trim(),
      email: $("emailConta").value.trim(),
      password: $("senhaConta").value,
      requestId: operationId
    });

    if (epoch !== generation || requestId !== operationId) return;
    form.reset();
    requestId = crypto.randomUUID();
    $("resultadoConta").textContent = "Conta criada. Esse login terá um caderno privado e independente.";
  } catch (error) {
    if (epoch !== generation || requestId !== operationId) return;
    const messages = {
      "functions/already-exists": "Este e-mail já possui uma conta.",
      "functions/permission-denied": "Somente caderno@gmail.com pode criar contas.",
      "functions/unauthenticated": "Sua sessão expirou. Entre novamente.",
      "functions/invalid-argument": "Confira nome, e-mail e senha. Use uma senha com pelo menos 6 caracteres.",
      "functions/internal": "Não foi possível criar a conta agora. Tente novamente."
    };
    $("resultadoConta").textContent = messages[error.code] || "Não foi possível criar a conta. Tente novamente.";
  } finally {
    if (epoch === generation) {
      busy = false;
      $("criarConta").disabled = !allowed;
    }
    fields.forEach(input => { input.readOnly = false; });
  }
});
