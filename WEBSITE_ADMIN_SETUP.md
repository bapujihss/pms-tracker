# Secure website editor setup

The website editor uses Firebase Authentication. Passwords are never placed in the website files, and there is no public account-registration flow.

## One-time Firebase setup

1. In Firebase Console, open the `bapujihss` project and enable **Authentication → Sign-in method → Email/Password**.
2. Under **Authentication → Users**, create the two administrator accounts used by the editor:
   - `hemant@pms-admin.bapujihss.school`
   - `bapujihss@pms-admin.bapujihss.school`
3. Set private passwords for those two accounts. The old PMS tracker passwords are embedded in its public HTML, so they should not be reused. Keep the new passwords private and share them with the administrators directly.
4. Publish the rules in `database.rules.json` to **Realtime Database → Rules**. The public site can read the website content, while only those two authenticated email accounts can write it.
5. Deploy the updated hosting files. Verify that unauthenticated writes to `/siteContent/school_01.json` are denied and that both admin accounts can save the editor.

The two usernames are entered on the sign-in page and mapped to the Firebase Auth accounts above. Do not add a public sign-up form or weaken the `siteContent` write rule.
