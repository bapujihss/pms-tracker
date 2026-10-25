import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

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

// Login identifiers only. Passwords are entered by administrators and are never stored in this file.
const ADMIN_LOGIN_EMAILS = Object.freeze({
  hemant: 'hemant@pms-admin.bapujihss.school',
  bapujihss: 'bapujihss@pms-admin.bapujihss.school'
});
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

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

async function isAuthorizedSiteAdmin(user, refreshToken = false) {
  if (!user) return false;
  const token = await user.getIdTokenResult(refreshToken);
  return token.claims.websiteAdmin === true;
}

async function adminLabel(user) {
  if (!await isAuthorizedSiteAdmin(user)) return null;
  return { name: 'Authorized administrator', username: 'website-admin', uid: user.uid };
}

export async function getCurrentSiteAdmin() {
  return adminLabel(await waitForCurrentUser());
}

export async function signInSiteAdmin(username, password) {
  const email = ADMIN_LOGIN_EMAILS[String(username || '').trim().toLowerCase()];
  if (!email || !password) throw new Error('Invalid username or password.');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!await isAuthorizedSiteAdmin(credential.user, true)) {
    await signOut(auth);
    throw new Error('Invalid username or password.');
  }
  return adminLabel(credential.user);
}

export async function saveSiteContent(content) {
  const user = auth.currentUser;
  if (!await isAuthorizedSiteAdmin(user, true)) throw new Error('Administrator sign-in required.');
  await set(ref(database, 'siteContent/school_01'), content);
}

export async function signOutSiteAdmin() {
  await signOut(auth);
}
