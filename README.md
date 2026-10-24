# PMS Tracker | Online Multi-User Scholarship Sync

PMS Tracker is a real-time multi-user scholarship and student document tracking web application for **Bapuji Higher Secondary School** (`bapujihss`). It supports:

1. **Real-Time Multi-User Firebase Realtime Database Sync** (granular per-student and per-teacher path updates, live presence tracking, offline mutation queue, and automatic reconnection).
2. **Two-Way Google Sheets Live Sync** (via a lightweight Google Apps Script Web App URL or direct Google Sheet ID / CSV pull).

---

## 1. Setting Up Firebase Realtime Database Rules & Permissions

If the app badge shows **Rules Blocked** or **Local Only**, your Firebase Realtime Database security rules are blocking reads/writes.

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
        ".read": true,
        ".write": true,
        "students": {
          "$studentId": {
            ".validate": "newData.hasChildren(['id', 'name', 'rollNo']) && newData.child('name').isString() && newData.child('rollNo').isString()"
          }
        },
        "teachers": {
          "$teacherId": {
            ".validate": "newData.hasChildren(['id', 'name', 'username', 'role']) && newData.child('username').isString()"
          }
        },
        "meta": {
          ".validate": "newData.hasChildren(['updatedAt'])"
        },
        "presence": {
          "$sessionId": {
            ".validate": "newData.hasChildren(['online', 'updatedAt'])"
          }
        }
      }
    }
  }
}
```

4. Click **Publish**.
5. Optional stricter mode: If you enable **Authentication → Sign-in method → Anonymous** in the Firebase Console, you can change `".read": true, ".write": true` to `".read": "auth != null", ".write": "auth != null"`. The app automatically calls `signInAnonymously()` on startup.

---

## 2. Setting Up Two-Way Google Sheets Live Sync (Optional / Alternative)

If you prefer keeping your master data in a live Google Sheet that updates automatically whenever any teacher or admin adds/edits a student:

1. Open a new or existing [Google Sheet](https://sheets.new).
2. Click **Extensions → Apps Script**.
3. Copy the code from `google-sheets-sync.gs` (or click **Copy Apps Script** inside the app's **Cloud Sync Setup → Google Sheets Sync** tab) and paste it into `Code.gs`.
4. Click **Deploy → New deployment**, choose **Web app**, set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
5. Click **Deploy**, authorize the script, and copy the **Web App URL** (`https://script.google.com/macros/s/.../exec`).
6. In **PMS Tracker**, click the **Cloud Sync** button in the top header → **Google Sheets Sync** tab, paste the Web App URL, and click **Save & Sync Sheet**.

You can also pull data read-only from any shared Google Sheet link/ID without Apps Script by pasting the Google Sheet URL or ID in the **Direct Sheet Pull** box.

---

## 3. Deploying Online

- **GitHub Pages**: Commit `index.html` to your GitHub repository and enable **Settings → Pages → Deploy from branch (`main` / root)**.
- **Firebase Hosting**: Run `firebase deploy` from this directory (configured via `firebase.json`).
