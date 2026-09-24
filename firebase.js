/* =====================================================
   FIREBASE - CADERNO ONLINE
===================================================== */

import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/* =====================================================
   CONFIGURAÇÃO
===================================================== */
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVKZP5x488m6p63VZVPTi8tJsKsPmNAJE",
  authDomain: "caderno-online-e5b1f.firebaseapp.com",
  projectId: "caderno-online-e5b1f",
  storageBucket: "caderno-online-e5b1f.firebasestorage.app",
  messagingSenderId: "936024384733",
  appId: "1:936024384733:web:6e38f64f720a60166ee734"
};

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "southamerica-east1");
const createCadernoUser = httpsCallable(functions, "createCadernoUser");

/* =====================================================
   LOGIN PERSISTENTE
===================================================== */

setPersistence(auth, browserLocalPersistence)
.catch(erro => {
    console.error("Erro na persistência:", erro);
});

/* =====================================================
   EXPORTAÇÕES
===================================================== */

export {
    app,
    auth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    db,
    createCadernoUser,
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot
};
