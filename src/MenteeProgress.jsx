/**
 * ============================================================
 * ACCIONES PARA "GESTIONÁ TU MENTORÍA" (fase 2)
 * ============================================================
 * v6: agrega:
 *  - acceso_gestion en mentorship_progress (columna manual, la
 *    edita Gustavo para dar acceso a mentores que no pasaron por
 *    el asistente de 4 semanas pero ya están en su red)
 *  - hoja nueva "session_logs" con el registro de sesiones
 *    mentor-mentee, y las acciones para leer/escribir ahí.
 * ============================================================
 */

var MENTORSHIP_SHEET_NAME = "mentorship_progress";
var SESSION_LOGS_SHEET_NAME = "session_logs";

function getMentorshipSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(MENTORSHIP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MENTORSHIP_SHEET_NAME);
    sheet.appendRow([
      "email", "mentorship_key", "semana_actual",
      "module1_output", "module2_output", "module3_output", "module4_output",
      "conversation_history", "last_updated", "gap_match_raw",
      "semana_desbloqueada_en", "requiere_pago", "acceso_gestion", "nombre"
    ]);
  }
  ["gap_match_raw", "semana_desbloqueada_en", "requiere_pago", "acceso_gestion", "nombre"].forEach(function (colName) {
    var headerRowNow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headerRowNow.indexOf(colName) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(colName);
    }
  });
  return sheet;
}

function getSessionLogsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SESSION_LOGS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SESSION_LOGS_SHEET_NAME);
    sheet.appendRow([
      "log_id", "mentor_email", "mentee_name", "fecha",
      "temas_vistos", "que_se_llevo", "proximos_pasos", "created_at",
      "mentee_email", "total_sesiones_programa", "mentor_nombre", "feedback_mentee"
    ]);
  }
  ["mentee_email", "total_sesiones_programa", "mentor_nombre", "feedback_mentee"].forEach(function (colName) {
    var headerRowNow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headerRowNow.indexOf(colName) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(colName);
    }
  });
  return sheet;
}

var MENTORSHIP_COL = {
  EMAIL: 1,
  MENTORSHIP_KEY: 2,
  SEMANA_ACTUAL: 3,
  MODULE1: 4,
  MODULE2: 5,
  MODULE3: 6,
  MODULE4: 7,
  CONVERSATION_HISTORY: 8,
  LAST_UPDATED: 9,
  GAP_MATCH_RAW: 10,
  SEMANA_DESBLOQUEADA_EN: 11,
  REQUIERE_PAGO: 12,
  ACCESO_GESTION: 13,
  NOMBRE: 14
};

var LOG_COL = {
  LOG_ID: 1,
  MENTOR_EMAIL: 2,
  MENTEE_NAME: 3,
  FECHA: 4,
  TEMAS_VISTOS: 5,
  QUE_SE_LLEVO: 6,
  PROXIMOS_PASOS: 7,
  CREATED_AT: 8,
  MENTEE_EMAIL: 9,
  TOTAL_SESIONES_PROGRAMA: 10,
  MENTOR_NOMBRE: 11,
  FEEDBACK_MENTEE: 12
};

function doGet(e) {
  var action   = (e.parameter && e.parameter.action)   || "stats";
  var callback = (e.parameter && e.parameter.callback) || null;

  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var diag   = ss.getSheetByName(SHEET_NAME_DIAGNOSTICOS);
    var funnel = ss.getSheetByName(SHEET_NAME_FUNNEL);

    var result;
    if (action === "stats") {
      result = getStats(diag, funnel);
    } else if (action === "records") {
      var allStats = getStats(diag, funnel);
      result = { records: allStats.all_records || allStats.recent };
    } else if (action === "get_module_progress") {
      result = getModuleProgressResult_(e);
    } else if (action === "get_session_logs") {
      result = getSessionLogsResult_(e);
    } else if (action === "get_mentee_progress") {
      result = getMenteeProgressResult_(e);
    } else {
      result = { error: "Acción no reconocida" };
    }

    var json = JSON.stringify(result);

    if (callback) {
      return ContentService
        .createTextOutput(callback + "(" + json + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errJson = JSON.stringify({ error: err.message });
    if (callback) {
      return ContentService
        .createTextOutput(callback + "(" + errJson + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(errJson)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheets  = setupSheets();
    var action  = payload.action || "new_diagnosis";

    if (action === "new_diagnosis") {
      writeDiagnosis(sheets.diagSheet, payload);
      return jsonResponse({ ok: true, key: payload.diag_key });
    }

    if (action === "update_contact") {
      updateContact(sheets.diagSheet, payload);
      return jsonResponse({ ok: true });
    }

    if (action === "funnel_event") {
      writeFunnelEvent(sheets.funnelSheet, payload);
      return jsonResponse({ ok: true });
    }

    if (action === "save_module_progress") {
      saveModuleProgress_(payload);
      return jsonResponse({ ok: true });
    }

    if (action === "save_session_log") {
      saveSessionLog_(payload);
      return jsonResponse({ ok: true });
    }

    if (action === "save_mentee_feedback") {
      saveMenteeFeedback_(payload);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Acción no reconocida" });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function saveModuleProgress_(payload) {
  var email = (payload.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error("email es requerido");
  }

  var sheet = getMentorshipSheet_();
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    var rowEmail = (data[i][MENTORSHIP_COL.EMAIL - 1] || "").toString().trim().toLowerCase();
    if (rowEmail === email) {
      rowIndex = i;
      break;
    }
  }

  var moduleColByNumber = {
    1: MENTORSHIP_COL.MODULE1,
    2: MENTORSHIP_COL.MODULE2,
    3: MENTORSHIP_COL.MODULE3,
    4: MENTORSHIP_COL.MODULE4
  };

  var now = new Date().toISOString();

  if (rowIndex === -1) {
    var newRow = [];
    newRow[MENTORSHIP_COL.EMAIL - 1] = email;
    newRow[MENTORSHIP_COL.MENTORSHIP_KEY - 1] = payload.mentorship_key || ("mentorship:" + Date.now());
    newRow[MENTORSHIP_COL.SEMANA_ACTUAL - 1] = payload.semana_actual || payload.module_number || 1;
    newRow[MENTORSHIP_COL.MODULE1 - 1] = "";
    newRow[MENTORSHIP_COL.MODULE2 - 1] = "";
    newRow[MENTORSHIP_COL.MODULE3 - 1] = "";
    newRow[MENTORSHIP_COL.MODULE4 - 1] = "";
    newRow[MENTORSHIP_COL.CONVERSATION_HISTORY - 1] = payload.conversation_history ? JSON.stringify(payload.conversation_history) : "";
    newRow[MENTORSHIP_COL.GAP_MATCH_RAW - 1] = payload.gap_match_raw ? JSON.stringify(payload.gap_match_raw) : "";
    newRow[MENTORSHIP_COL.SEMANA_DESBLOQUEADA_EN - 1] = payload.semana_desbloqueada_en || "";
    newRow[MENTORSHIP_COL.REQUIERE_PAGO - 1] = "";
    newRow[MENTORSHIP_COL.ACCESO_GESTION - 1] = "";
    newRow[MENTORSHIP_COL.NOMBRE - 1] = payload.nombre || "";

    if (payload.module_number && moduleColByNumber[payload.module_number] && payload.module_output) {
      newRow[moduleColByNumber[payload.module_number] - 1] = JSON.stringify(payload.module_output);
    }
    newRow[MENTORSHIP_COL.LAST_UPDATED - 1] = now;
    sheet.appendRow(newRow);
  } else {
    var sheetRow = rowIndex + 1;

    if (payload.semana_actual !== undefined) {
      sheet.getRange(sheetRow, MENTORSHIP_COL.SEMANA_ACTUAL).setValue(payload.semana_actual);
    }
    if (payload.module_number && moduleColByNumber[payload.module_number] && payload.module_output !== undefined) {
      sheet.getRange(sheetRow, moduleColByNumber[payload.module_number]).setValue(JSON.stringify(payload.module_output));
    }
    if (payload.conversation_history !== undefined) {
      sheet.getRange(sheetRow, MENTORSHIP_COL.CONVERSATION_HISTORY).setValue(JSON.stringify(payload.conversation_history));
    }
    if (payload.gap_match_raw !== undefined) {
      sheet.getRange(sheetRow, MENTORSHIP_COL.GAP_MATCH_RAW).setValue(JSON.stringify(payload.gap_match_raw));
    }
    if (payload.semana_desbloqueada_en !== undefined) {
      sheet.getRange(sheetRow, MENTORSHIP_COL.SEMANA_DESBLOQUEADA_EN).setValue(payload.semana_desbloqueada_en);
    }
    if (payload.nombre !== undefined && payload.nombre !== "") {
      sheet.getRange(sheetRow, MENTORSHIP_COL.NOMBRE).setValue(payload.nombre);
    }
    sheet.getRange(sheetRow, MENTORSHIP_COL.LAST_UPDATED).setValue(now);
  }
}

function getModuleProgressResult_(e) {
  var email = ((e.parameter && e.parameter.email) || "").trim().toLowerCase();
  if (!email) {
    return { error: "email es requerido" };
  }

  var sheet = getMentorshipSheet_();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmail = (row[MENTORSHIP_COL.EMAIL - 1] || "").toString().trim().toLowerCase();
    if (rowEmail === email) {
      return {
        found: true,
        email: row[MENTORSHIP_COL.EMAIL - 1],
        mentorship_key: row[MENTORSHIP_COL.MENTORSHIP_KEY - 1],
        semana_actual: row[MENTORSHIP_COL.SEMANA_ACTUAL - 1],
        module1_output: safeParseJSON_(row[MENTORSHIP_COL.MODULE1 - 1]),
        module2_output: safeParseJSON_(row[MENTORSHIP_COL.MODULE2 - 1]),
        module3_output: safeParseJSON_(row[MENTORSHIP_COL.MODULE3 - 1]),
        module4_output: safeParseJSON_(row[MENTORSHIP_COL.MODULE4 - 1]),
        conversation_history: safeParseJSON_(row[MENTORSHIP_COL.CONVERSATION_HISTORY - 1]),
        last_updated: row[MENTORSHIP_COL.LAST_UPDATED - 1],
        gap_match_raw: safeParseJSON_(row[MENTORSHIP_COL.GAP_MATCH_RAW - 1]),
        semana_desbloqueada_en: row[MENTORSHIP_COL.SEMANA_DESBLOQUEADA_EN - 1] || null,
        requiere_pago: (row[MENTORSHIP_COL.REQUIERE_PAGO - 1] || "").toString().trim().toLowerCase(),
        acceso_gestion: (row[MENTORSHIP_COL.ACCESO_GESTION - 1] || "").toString().trim().toLowerCase(),
        nombre: row[MENTORSHIP_COL.NOMBRE - 1] || ""
      };
    }
  }

  return { found: false };
}

function getSessionLogsResult_(e) {
  var mentorEmail = ((e.parameter && e.parameter.mentor_email) || "").trim().toLowerCase();
  if (!mentorEmail) {
    return { error: "mentor_email es requerido" };
  }

  var sheet = getSessionLogsSheet_();
  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowMentorEmail = (row[LOG_COL.MENTOR_EMAIL - 1] || "").toString().trim().toLowerCase();
    if (rowMentorEmail === mentorEmail) {
      logs.push({
        log_id: row[LOG_COL.LOG_ID - 1],
        mentee_name: row[LOG_COL.MENTEE_NAME - 1],
        mentee_email: row[LOG_COL.MENTEE_EMAIL - 1] || "",
        total_sesiones_programa: row[LOG_COL.TOTAL_SESIONES_PROGRAMA - 1] || null,
        mentor_nombre: row[LOG_COL.MENTOR_NOMBRE - 1] || "",
        fecha: formatearFecha_(row[LOG_COL.FECHA - 1]),
        temas_vistos: row[LOG_COL.TEMAS_VISTOS - 1],
        que_se_llevo: row[LOG_COL.QUE_SE_LLEVO - 1],
        proximos_pasos: row[LOG_COL.PROXIMOS_PASOS - 1],
        created_at: row[LOG_COL.CREATED_AT - 1],
        feedback_mentee: row[LOG_COL.FEEDBACK_MENTEE - 1] || ""
      });
    }
  }

  logs.sort(function (a, b) {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  return { logs: logs };
}

/**
 * Uso (GET): ?action=get_mentee_progress&mentee_email=alguien@mail.com
 * Vista del MENTEE: todas sus sesiones, sin importar qué mentor se las cargó.
 */
function getMenteeProgressResult_(e) {
  var menteeEmail = ((e.parameter && e.parameter.mentee_email) || "").trim().toLowerCase();
  if (!menteeEmail) {
    return { error: "mentee_email es requerido" };
  }

  var sheet = getSessionLogsSheet_();
  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowMenteeEmail = (row[LOG_COL.MENTEE_EMAIL - 1] || "").toString().trim().toLowerCase();
    if (rowMenteeEmail === menteeEmail) {
      logs.push({
        log_id: row[LOG_COL.LOG_ID - 1],
        mentor_email: row[LOG_COL.MENTOR_EMAIL - 1],
        mentor_nombre: row[LOG_COL.MENTOR_NOMBRE - 1] || "",
        mentee_name: row[LOG_COL.MENTEE_NAME - 1],
        total_sesiones_programa: row[LOG_COL.TOTAL_SESIONES_PROGRAMA - 1] || null,
        fecha: formatearFecha_(row[LOG_COL.FECHA - 1]),
        temas_vistos: row[LOG_COL.TEMAS_VISTOS - 1],
        que_se_llevo: row[LOG_COL.QUE_SE_LLEVO - 1],
        proximos_pasos: row[LOG_COL.PROXIMOS_PASOS - 1],
        feedback_mentee: row[LOG_COL.FEEDBACK_MENTEE - 1] || ""
      });
    }
  }

  logs.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  return { logs: logs };
}

function saveSessionLog_(payload) {
  var mentorEmail = (payload.mentor_email || "").trim().toLowerCase();
  var menteeName = (payload.mentee_name || "").trim();
  if (!mentorEmail || !menteeName) {
    throw new Error("mentor_email y mentee_name son requeridos");
  }

  var sheet = getSessionLogsSheet_();
  var newRow = [];
  newRow[LOG_COL.LOG_ID - 1] = "log:" + Date.now();
  newRow[LOG_COL.MENTOR_EMAIL - 1] = mentorEmail;
  newRow[LOG_COL.MENTEE_NAME - 1] = menteeName;
  newRow[LOG_COL.FECHA - 1] = payload.fecha || new Date().toISOString().slice(0, 10);
  newRow[LOG_COL.TEMAS_VISTOS - 1] = payload.temas_vistos || "";
  newRow[LOG_COL.QUE_SE_LLEVO - 1] = payload.que_se_llevo || "";
  newRow[LOG_COL.PROXIMOS_PASOS - 1] = payload.proximos_pasos || "";
  newRow[LOG_COL.CREATED_AT - 1] = new Date().toISOString();
  newRow[LOG_COL.MENTEE_EMAIL - 1] = (payload.mentee_email || "").trim().toLowerCase();
  newRow[LOG_COL.TOTAL_SESIONES_PROGRAMA - 1] = payload.total_sesiones_programa || "";
  newRow[LOG_COL.MENTOR_NOMBRE - 1] = payload.mentor_nombre || "";
  newRow[LOG_COL.FEEDBACK_MENTEE - 1] = "";
  sheet.appendRow(newRow);
}

// Google Sheets convierte automáticamente un texto tipo "2026-09-07" en un
// objeto Date interno. Al leerlo de vuelta, Apps Script lo devuelve con hora
// y zona horaria pegadas (ej: "2026-09-07T03:00:00.000Z"). Esta función lo
// normaliza de vuelta a solo la fecha, sin importar cómo haya quedado guardado.
function formatearFecha_(valor) {
  if (!valor) return "";
  if (Object.prototype.toString.call(valor) === "[object Date]") {
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  var texto = valor.toString();
  var match = texto.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : texto;
}

/**
 * Uso (POST):
 * { action: "save_mentee_feedback", log_id, mentee_email, feedback }
 * Solo permite editar el feedback de una sesión si el mentee_email coincide
 * con el que quedó guardado en esa fila — evita que alguien edite el
 * feedback de una sesión que no es suya.
 */
function saveMenteeFeedback_(payload) {
  var logId = (payload.log_id || "").toString().trim();
  var menteeEmail = (payload.mentee_email || "").trim().toLowerCase();
  if (!logId || !menteeEmail) {
    throw new Error("log_id y mentee_email son requeridos");
  }

  var sheet = getSessionLogsSheet_();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if ((row[LOG_COL.LOG_ID - 1] || "").toString() === logId) {
      var emailDeEsaFila = (row[LOG_COL.MENTEE_EMAIL - 1] || "").toString().trim().toLowerCase();
      if (emailDeEsaFila !== menteeEmail) {
        throw new Error("No coincide el email con esta sesión");
      }
      sheet.getRange(i + 1, LOG_COL.FEEDBACK_MENTEE).setValue(payload.feedback || "");
      return;
    }
  }

  throw new Error("No se encontró la sesión");
}

function safeParseJSON_(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}
