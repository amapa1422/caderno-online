// Only the local test server substitutes this module. Production never imports it.
export const auth = {}, db = {};
let authListener, snapshotListener, currentUid;
// Test-only persistence permits a real page reload; never imported in production.
const saved = JSON.parse(sessionStorage.getItem('caderno-test-backend') || 'null');
const documents = new Map(saved?.documents || []);
const pending = [];
const clone = value => JSON.parse(JSON.stringify(value));
const pause = () => new Promise(resolve => setTimeout(resolve, 10));
const key = reference => reference.parts.join('/');
const mock = window.__mock = {
  writes: [], deletes: [], subscriptions: 0, failNext: false, hold: false, loginFailure: false,
  user: saved?.user || null, documents,
  release() { this.hold = false; pending.splice(0).forEach(resolve => resolve()); },
  emit() {
    sessionStorage.setItem('caderno-test-backend', JSON.stringify({ documents: [...documents], user: this.user }));
    if (!snapshotListener) return;
    const prefix = 'users/' + currentUid + '/caderno/';
    snapshotListener({ docs: [...documents].filter(([id]) => id.startsWith(prefix)).map(([id, data]) => ({ id: id.split('/').at(-1), data: () => clone(data) })), metadata: { fromCache: false } });
  },
  seed(id, data, uid = 'test-user') { documents.set('users/' + uid + '/caderno/' + id, clone(data)); this.emit(); },
  async changeUser(user) { this.user = user; await authListener(user); }
};
export function collection(_db, ...parts) { return { parts }; }
export function doc(_db, ...parts) { return { parts }; }
export function onAuthStateChanged(_auth, callback) { authListener = callback; queueMicrotask(() => callback(mock.user)); return () => {}; }
export async function signInWithEmailAndPassword(_auth, email, password) {
  await pause();
  if (mock.loginFailure || password !== 'test-password') throw { code: 'auth/invalid-credential' };
  mock.user = { uid: 'test-user', email, displayName: 'Caderno de teste' };
  await authListener(mock.user);
}
export async function signOut() { await pause(); mock.user = null; await authListener(null); }
export function onSnapshot(reference, _options, callback) {
  currentUid = reference.parts[1]; snapshotListener = callback; mock.subscriptions++;
  queueMicrotask(() => mock.emit());
  return () => { mock.subscriptions--; snapshotListener = null; };
}
export async function setDoc(reference, value, options) {
  mock.writes.push({ path: key(reference), value: clone(value), options: clone(options) });
  if (mock.hold) await new Promise(resolve => pending.push(resolve)); else await pause();
  if (mock.failNext) { mock.failNext = false; throw { code: 'permission-denied' }; }
  const next = options?.merge ? { ...documents.get(key(reference)), ...clone(value) } : clone(value);
  documents.set(key(reference), next); mock.emit();
}
export async function deleteDoc(reference) {
  if (mock.hold) await new Promise(resolve => pending.push(resolve)); else await pause();
  if (mock.failNext) { mock.failNext = false; throw { code: 'permission-denied' }; }
  mock.deletes.push(key(reference)); documents.delete(key(reference)); mock.emit();
}
