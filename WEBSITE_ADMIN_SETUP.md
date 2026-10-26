# Secure website and tracker admin setup

The editor uses Firebase Authentication, an admin-only custom claim, and a separate Realtime Database path. Admins can sign in with email/password or SMS OTP after linking their verified phone to the same Firebase account. Passwords and service-account keys are not stored in this repository. There is no public sign-up form.

Student and teacher records are stored separately under the Firebase `schools/school_01` path. Website notices and editable page content are stored under `siteContent/school_01`. No Google Sheet is needed. To let the same two administrators manage both, each account needs both the `websiteAdmin` claim and a PMS staff claim with the `admin` role.

## One-time Firebase setup

1. In Firebase Console, open the `bapujihss` project and enable **Authentication → Sign-in method → Email/Password** and **Phone**. Configure the allowed SMS regions to the countries where the two admins live, and add the deployed website domain under **Authentication → Settings → Authorized domains**. Phone authentication requires a live web origin for reCAPTCHA; test on the deployed HTTPS site, not by opening the HTML as a local file. Firebase may require a billing plan and SMS charges or quotas may apply.
2. Create one Firebase Authentication account for each of the two existing school administrators, using email addresses they control. Choose new private passwords. The previous PMS tracker source exposed weak default passwords, so never reuse any password that may have been used there.
3. Verify both email addresses. For each account, make sure its exact PMS username already has an `admin` teacher record in the tracker. A trusted Firebase administrator must assign both sets of claims. From a trusted computer, install the Admin SDK and authenticate it with a service account that has Firebase Authentication privileges:
   ```powershell
   npm install firebase-admin
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\secure\firebase-service-account.json"
   node scripts/grant-website-admin-claim.mjs <first-user-uid> <second-user-uid>
   node scripts/grant-pms-staff-claim.mjs <first-user-uid> <first-tracker-username> admin
   node scripts/grant-pms-staff-claim.mjs <second-user-uid> <second-tracker-username> admin
   ```
   Get each UID from the Firebase Console Authentication Users list. Use the exact tracker usernames in the PMS commands. These scripts preserve existing claims. Keep the service-account file outside this repository and unset `GOOGLE_APPLICATION_CREDENTIALS` after use. The website command grants editor access only to the two supplied accounts.
4. Publish `database.rules.json` to **Realtime Database → Rules**. The public site can read `/siteContent/school_01`; only a signed-in user carrying the `websiteAdmin: true` claim can write there. The PMS staff claims separately authorize access to student/teacher records.
5. Deploy the updated hosting files. Each administrator first signs in at `website-admin-login.html` using email/password, expands **Link your phone to your existing admin account**, enters their own phone in international format (India: `+91...`), and verifies the SMS. This links the phone to the existing Firebase account; do not create a second phone-only account. After linking, both email/password and phone OTP can be used for both the website editor and PMS tracker. Signing out and back in refreshes updated claims.

Only the two administrators whose UIDs receive the website claim can edit site content. Do not share admin passwords or service-account keys, and do not change the `siteContent` write rule to public access.
