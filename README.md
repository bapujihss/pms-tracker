# PMS Tracker | Online Multi-User Scholarship Sync

PMS Tracker is a real-time multi-user scholarship and student document tracking web application for **Bapuji Higher Secondary School** (`bapujihss`). It supports:

1. **Real-Time Multi-User Firebase Realtime Database Sync** (granular per-student and per-teacher path updates, live presence tracking, offline mutation queue, and automatic reconnection).
2. **Legacy Google Sheet CSV import** (manual import only; this is not cloud sync).

---

## 1. Setting Up Firebase Realtime Database Rules & Permissions

If the app badge shows **Rules Blocked** or **Local Only**, your Firebase Realtime Database security rules are blocking reads/writes.

The earlier rules allowed anyone on the internet to read or change school records. Export a secure backup before changing rules, then publish the restricted rules below. The bundled public student roster has been removed; if your cloud database is empty, import the school's verified backup after staff access is configured.

1. Open the [Firebase Console](https://console.firebase.google.com/) and select project **`bapujihss`**.
2. In the left sidebar, go to **Build → Realtime Database** and click the **Rules** tab.
3. Paste the contents of `database.rules.json` (also available inside the app via the **Cloud Sync Setup** button in the top bar):

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "schools": {
      "$schoolId": {
        ".read": "auth != null && auth.token.email_verified == true && auth.token.pmsStaff == true && auth.token.pmsSchoolId == $schoolId && (auth.token.pmsRole == 'admin' || auth.token.pmsRole == 'teacher')",
        ".write": "auth != null && auth.token.email_verified == true && auth.token.pmsStaff == true && auth.token.pmsSchoolId == $schoolId && (auth.token.pmsRole == 'admin' || auth.token.pmsRole == 'teacher')"
      }
    },
    "siteContent": {
      "$schoolId": {
        ".read": true,
        ".write": "auth != null && auth.token.websiteAdmin == true"
      }
    }
  }
}
```

4. Before publishing, confirm every intended PMS account has the custom claims `pmsStaff: true`, `pmsSchoolId: "school_01"`, and `pmsRole: "admin"` or `"teacher"`. The username and role must also match a teacher record in the tracker.
5. Click **Publish**. These rules block public reads and writes. Do not enable anonymous access or replace these checks with public permissions.

For step-by-step account provisioning, follow [PMS_STAFF_SETUP.md](./PMS_STAFF_SETUP.md).
The two administrators can use either email/password or SMS OTP after linking their own verified phone to the same Firebase account. Follow [WEBSITE_ADMIN_SETUP.md](./WEBSITE_ADMIN_SETUP.md) for enabling Phone sign-in and linking phones securely.

---

## 2. Google Sheets sync warning

The old Apps Script web-app sync is disabled in the tracker because it has no authentication: its read endpoint exposes the complete student sheet and its write endpoint can replace student and teacher records. Use Firebase for automatic multi-device sync. If this Apps Script was already deployed, disable its web-app deployment and remove public sharing from the spreadsheet. The tracker still allows a one-time/manual CSV import from a shared Google Sheet; importing does not make that sheet secure or keep it in sync.

---

## 3. Deploying Online

- **GitHub Pages**: Commit `index.html` to your GitHub repository and enable **Settings → Pages → Deploy from branch (`main` / root)**.
- **Firebase Hosting**: Run `firebase deploy` from this directory (configured via `firebase.json`).
