const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const ADMIN_EMAIL = "caderno@gmail.com";

function cleanText(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

exports.createCadernoUser = onCall({ region: "southamerica-east1" }, async request => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Entre novamente para criar uma conta.");
  }

  const callerEmail = String(request.auth.token.email || "").trim().toLowerCase();
  if (callerEmail !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Somente o administrador principal pode criar contas.");
  }

  const displayName = cleanText(request.data?.displayName, 80);
  const email = cleanText(request.data?.email, 254).toLowerCase();
  const password = typeof request.data?.password === "string" ? request.data.password : "";

  if (!displayName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
    throw new HttpsError("invalid-argument", "Nome, e-mail ou senha inválidos.");
  }

  try {
    const user = await getAuth().createUser({
      email,
      password,
      displayName,
      disabled: false
    });

    await getFirestore().doc(`users/${user.uid}`).set({
      uid: user.uid,
      email,
      displayName,
      role: "user",
      active: true,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { uid: user.uid, email, displayName };
  } catch (error) {
    if (error?.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Este e-mail já possui uma conta.");
    }
    if (error?.code === "auth/invalid-password" || error?.code === "auth/invalid-email") {
      throw new HttpsError("invalid-argument", "Dados de acesso inválidos.");
    }
    console.error("createCadernoUser failed", error?.code || error?.message || error);
    throw new HttpsError("internal", "Não foi possível criar a conta.");
  }
});
