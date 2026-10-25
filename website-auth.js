import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA8HX-nCadL5uuvnEyiQBgv5eRHrTJD5uo',
  authDomain: 'bapujihss.firebaseapp.com',
  databaseURL: 'https://bapujihss-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'bapujihss',
  storageBucket: 'bapujihss.firebasestorage.app',
  messagingSenderId: '174183270330',
  appId: '1:174183270330:web:0d10fb4e6f31096f55bf83',
  measurementId: 'G-526Z0V4CES'
};

// These are login identifiers only; passwords are entered by each administrator and are never stored in this file.
const ADMIN_LOGIN_EMAILS = Object.freeze({
  hemant: 'hemant@pms-admin.bapujihss.school',
  bapujihss: 'bapujihss@pms-admin.bapujihss.school'
});
const ADMIN_EMAIL_SET = new Set(Object.values(ADMIN_LOGIN_EMAILS));
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

function waitForCurrentUser() {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, () => {
      unsubscribe();
      resolve(null);
    });
  });
}

function isAllowedAdmin(user) {
  return Boolean(user && user.email && ADMIN_EMAIL_SET.has(user.email.toLowerCase()));
}

function adminLabel(user) {
  if (!isAllowedAdmin(user)) return null;
  return { name: 'Authorized administrator', username: 'website-admin', uid: user.uid };
}

export async function getCurrentSiteAdmin() {
  const user = await waitForCurrentUser();
  return adminLabel(user);
}

export async function signInSiteAdmin(username, password) {
  const email = ADMIN_LOGIN_EMAILS[String(username || '').trim().toLowerCase()];
  if (!email || !password) throw new Error('Invalid username or password.');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!isAllowedAdmin(credential.user)) {
    await signOut(auth);
    throw new Error('Invalid username or password.');
  }
  return adminLabel(credential.user);
}

export async function getSiteAdminToken() {
  const user = auth.currentUser;
  if (!isAllowedAdmin(user)) throw new Error('Administrator sign-in required.');
  return user.getIdToken();
}

export async function signOutSiteAdmin() {
  await signOut(auth);
}
