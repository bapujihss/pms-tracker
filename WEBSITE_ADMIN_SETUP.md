# Secure website editor setup

The editor uses Firebase Authentication, an admin-only custom claim, and a separate Realtime Database path. Passwords and service-account keys are not stored in this repository. There is no sign-up form.

## One-time Firebase setup

1. In Firebase Console, open the `bapujihss` project and enable **Authentication → Sign-in method → Email/Password**.
2. Create the two editor accounts under **Authentication → Users** with these internal sign-in email addresses:
   - `hemant@pms-admin.bapujihss.school`
   - `bapujihss@pms-admin.bapujihss.school`
3. Set new private passwords and share each one directly with its administrator. The old PMS tracker passwords are embedded in its public HTML and must not be reused.
4. From a trusted computer, install the Admin SDK and authenticate it with a service account that has Firebase Authentication privileges:
   ```powershell
   npm install firebase-admin
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-service-account.json"
   node scripts/grant-website-admin-claim.mjs <first-user-uid> <second-user-uid>
   ```
   Get each UID from the Firebase Console Users list. Keep the service-account file outside this repository and unset the environment variable after use.
5. Publish `database.rules.json` to **Realtime Database → Rules**. The public site can read `/siteContent/school_01`; only a signed-in user carrying the `websiteAdmin: true` custom claim can write there.
6. Deploy the updated hosting files. Sign in as each admin and confirm the editor works. Confirm unauthenticated writes to `/siteContent/school_01.json` fail.

The login page maps the existing two admin usernames to these Firebase Auth identities. It does not contain passwords, and the claim is granted only by the trusted Admin SDK script. Do not change the `siteContent` write rule to public access.
