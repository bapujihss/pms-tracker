import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const userIds = process.argv.slice(2).filter(Boolean);
if (userIds.length !== 2) {
  console.error('Usage: node scripts/grant-website-admin-claim.mjs <first-user-uid> <second-user-uid>');
  process.exit(1);
}
if (new Set(userIds).size !== 2) {
  console.error('Provide two different Firebase Auth user UIDs.');
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();

for (const uid of userIds) {
  const user = await auth.getUser(uid);
  if (!user.email || !user.emailVerified) {
    throw new Error('Each admin account must have a verified email address before it receives the website admin claim.');
  }
  const existingClaims = user.customClaims || {};
  await auth.setCustomUserClaims(uid, { ...existingClaims, websiteAdmin: true });
  console.log('Granted websiteAdmin claim to verified Firebase Auth UID ' + uid);
}
