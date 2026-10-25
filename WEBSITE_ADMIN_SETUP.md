# Secure website editor setup

The editor uses Firebase Authentication, verified email addresses, an admin-only custom claim, and a separate Realtime Database path. Passwords and service-account keys are not stored in this repository. There is no sign-up form.

## One-time Firebase setup

1. In Firebase Console, open the `bapujihss` project and enable **Authentication → Sign-in method → Email/Password**.
2. Create one Firebase Authentication account for each of the two existing school administrators, using email addresses they control. Choose new private passwords; the old PMS tracker passwords are embedded in its public HTML and must not be reused.
3. Verify both email addresses. From a trusted computer, install the Admin SDK and authenticate it with a service account that has Firebase Authentication privileges:
   ```powershell
   npm install firebase-admin
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-service-account.json"
   node scripts/grant-website-admin-claim.mjs <first-user-uid> <second-user-uid>
   ```
   Get each UID from the Firebase Console Users list. Keep the service-account file outside this repository and unset the environment variable after use. The script grants the editor claim to exactly the two supplied, verified accounts.
4. Publish `database.rules.json` to **Realtime Database → Rules**. The public site can read `/siteContent/school_01`; only a signed-in user carrying the `websiteAdmin: true` custom claim can write there.
5. Deploy the updated hosting files. Sign in using each administrator's email and new private password. Confirm unauthenticated writes to `/siteContent/school_01.json` fail.

Only the two administrators whose UIDs receive the trusted custom claim can edit the site. Do not change the `siteContent` write rule to public access.
