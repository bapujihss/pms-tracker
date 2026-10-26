# Secure PMS staff access

The tracker requires a Firebase Authentication account and trusted custom claims for each staff member. Do not enable public or anonymous database access. Student records are no longer bundled into the public tracker source; use the secured Firebase database or import a verified school backup if the database is empty.

For the same two administrators to manage both student records and website notices/content, also assign each of their accounts the `websiteAdmin: true` claim using the instructions in [WEBSITE_ADMIN_SETUP.md](./WEBSITE_ADMIN_SETUP.md). The two data areas remain separate in Firebase; a Google Sheet is not required.

## Provision a staff member

1. In Firebase Console, open the `bapujihss` project and enable **Authentication → Sign-in method → Email/Password**.
2. Create the staff member's Firebase Authentication account with an email address they control, then verify that email.
3. Make sure the matching teacher record already exists in the PMS tracker. The claim's username and role must match that record.
4. From a trusted computer, install the Firebase Admin SDK and authenticate with a Firebase service account that can manage Authentication:
   ```powershell
   npm install firebase-admin
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-service-account.json"
   node scripts/grant-pms-staff-claim.mjs <user-uid> <tracker-username> <admin-or-teacher>
   ```
   Replace the angle-bracket values with the user's Firebase Auth UID, the exact tracker username, and either `admin` or `teacher`. For example, do not include the angle brackets in the command.
5. Keep the service-account file outside this repository and unset `GOOGLE_APPLICATION_CREDENTIALS` after provisioning. The user should sign out and sign in again to refresh their token.
6. Publish `database.rules.json` from the Firebase Console. The rules allow school data access only to authenticated PMS staff with matching school and role claims.

Run the command once for each authorized staff account. Never share the service-account key or grant claims to an account you have not verified.
