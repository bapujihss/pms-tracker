import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, onAuthStateChanged, RecaptchaVerifier, signInWithEmailAndPassword, signInWithPhoneNumber, linkWithPhoneNumber, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
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
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let phoneSignInConfirmation = null;
let phoneLinkConfirmation = null;

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
  return token.claims.websiteAdmin === true && token.claims.email_verified === true;
}

export function createSiteAdminRecaptchaVerifier(containerId) {
  return new RecaptchaVerifier(auth, containerId, { size: 'normal' });
}

async function adminLabel(user) {
  if (!await isAuthorizedSiteAdmin(user)) return null;
  return { name: 'Authorized administrator', username: 'website-admin', uid: user.uid };
}

export async function getCurrentSiteAdmin() {
  return adminLabel(await waitForCurrentUser());
}

const SITE_ADMIN_USERNAME_EMAILS = Object.freeze({
  hemantkm98: 'hemantmajhi2015@gmail.com'
});

export async function signInSiteAdmin(username, password) {
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const normalizedEmail = SITE_ADMIN_USERNAME_EMAILS[normalizedUsername];
  if (!normalizedEmail || !password) throw new Error('Invalid username or password.');
  const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
  if (!await isAuthorizedSiteAdmin(credential.user, true)) {
    await signOut(auth);
    throw new Error('Invalid email or password.');
  }
  return adminLabel(credential.user);
}

export async function sendSiteAdminPhoneCode(phoneNumber, verifier) {
  const normalizedPhone = String(phoneNumber || '').trim();
  if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
    throw new Error('Enter a phone number with country code, for example +919876543210.');
  }
  phoneSignInConfirmation = await signInWithPhoneNumber(auth, normalizedPhone, verifier);
}

export async function confirmSiteAdminPhoneCode(code) {
  if (!phoneSignInConfirmation) throw new Error('Request a verification code first.');
  const credential = await phoneSignInConfirmation.confirm(String(code || '').trim());
  phoneSignInConfirmation = null;
  if (!await isAuthorizedSiteAdmin(credential.user, true)) {
    await signOut(auth);
    throw new Error('This phone number is not linked to an authorized administrator account.');
  }
  return adminLabel(credential.user);
}

export async function sendSiteAdminPhoneLinkCode(phoneNumber, verifier) {
  const user = auth.currentUser;
  if (!await isAuthorizedSiteAdmin(user, true)) throw new Error('Sign in with your authorized admin email and password first.');
  const normalizedPhone = String(phoneNumber || '').trim();
  if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
    throw new Error('Enter a phone number with country code, for example +919876543210.');
  }
  phoneLinkConfirmation = await linkWithPhoneNumber(user, normalizedPhone, verifier);
}

export async function confirmSiteAdminPhoneLinkCode(code) {
  if (!phoneLinkConfirmation) throw new Error('Request a verification code first.');
  const credential = await phoneLinkConfirmation.confirm(String(code || '').trim());
  phoneLinkConfirmation = null;
  if (!await isAuthorizedSiteAdmin(credential.user, true)) {
    await signOut(auth);
    throw new Error('Administrator access could not be verified.');
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
