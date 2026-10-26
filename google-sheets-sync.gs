/**
 * PMS Tracker — Legacy Google Sheets Sync Example
 *
 * SECURITY: doGet exposes the full student roster and doPost accepts database
 * replacements without authentication. Never deploy this as a public web app
 * or use it with identifiable student data. Prefer the secured Firebase sync.
 */

const STUDENT_HEADERS = [
  'id', 'name', 'rollNo', 'className', 'section', 'category', 'teacher',
  'phone', 'aadhaar', 'aadhaarSeeded', 'income', 'caste', 'passbook',
  'bankAcc', 'ifsc', 'aadhaarNo', 'incomeCertNo', 'casteCertNo', 'updatedAt'
];

const TEACHER_HEADERS = [
  'id', 'name', 'username', 'role'
];

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#eef2ff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRecords(sheet, headers) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const head = values[0].map(h => String(h).trim());
  const records = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (!row.some(cell => String(cell).trim() !== '')) continue;
    const obj = {};
    headers.forEach(key => {
      const idx = head.indexOf(key);
      obj[key] = idx >= 0 ? row[idx] : '';
    });
    records.push(obj);
  }
  return records;
}

function writeRecords(sheet, headers, records) {
  sheet.clearContents();
  const matrix = [headers];
  (records || []).forEach(item => {
    matrix.push(headers.map(k => (item[k] !== undefined && item[k] !== null) ? item[k] : ''));
  });
  sheet.getRange(1, 1, matrix.length, headers.length).setValues(matrix);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#eef2ff');
  sheet.setFrozenRows(1);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const studentSheet = ensureSheet(ss, 'Students', STUDENT_HEADERS);
    const teacherSheet = ensureSheet(ss, 'Teachers', TEACHER_HEADERS);

    const students = readRecords(studentSheet, STUDENT_HEADERS);
    const teachers = readRecords(teacherSheet, TEACHER_HEADERS);

    return jsonResponse({
      ok: true,
      updatedAt: new Date().toISOString(),
      students: students,
      teachers: teachers
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);
    const action = body.action || 'syncAll';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const studentSheet = ensureSheet(ss, 'Students', STUDENT_HEADERS);
    const teacherSheet = ensureSheet(ss, 'Teachers', TEACHER_HEADERS);

    if (action === 'syncAll') {
      if (Array.isArray(body.students)) {
        writeRecords(studentSheet, STUDENT_HEADERS, body.students);
      }
      if (Array.isArray(body.teachers)) {
        writeRecords(teacherSheet, TEACHER_HEADERS, body.teachers);
      }
    } else if (action === 'upsertStudent' && body.student) {
      const current = readRecords(studentSheet, STUDENT_HEADERS);
      const idx = current.findIndex(s => String(s.id) === String(body.student.id) || String(s.rollNo) === String(body.student.rollNo));
      if (idx >= 0) current[idx] = body.student;
      else current.push(body.student);
      writeRecords(studentSheet, STUDENT_HEADERS, current);
    } else if (action === 'deleteStudent' && body.studentId) {
      const current = readRecords(studentSheet, STUDENT_HEADERS).filter(s => String(s.id) !== String(body.studentId));
      writeRecords(studentSheet, STUDENT_HEADERS, current);
    } else if (action === 'bulkDeleteStudents' && Array.isArray(body.studentIds)) {
      const removeSet = new Set(body.studentIds.map(String));
      const current = readRecords(studentSheet, STUDENT_HEADERS).filter(s => !removeSet.has(String(s.id)));
      writeRecords(studentSheet, STUDENT_HEADERS, current);
    } else if (action === 'upsertTeacher' && body.teacher) {
      const current = readRecords(teacherSheet, TEACHER_HEADERS);
      const idx = current.findIndex(t => String(t.id) === String(body.teacher.id) || String(t.username) === String(body.teacher.username));
      if (idx >= 0) current[idx] = body.teacher;
      else current.push(body.teacher);
      writeRecords(teacherSheet, TEACHER_HEADERS, current);
    } else if (action === 'deleteTeacher' && body.teacherId) {
      const current = readRecords(teacherSheet, TEACHER_HEADERS).filter(t => String(t.id) !== String(body.teacherId));
      writeRecords(teacherSheet, TEACHER_HEADERS, current);
    }

    return jsonResponse({
      ok: true,
      action: action,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
