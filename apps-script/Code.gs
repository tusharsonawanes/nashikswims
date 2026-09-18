const CONFIG = {
  SHEET_ID: '1I4lZL1RlMu5NiDvIsOzmrkHNZAJuMxfmg3VtQLsIlq4',
  SHEET_NAME: 'Nashik Swims',
  DRIVE_FOLDER_NAME: 'Swimming Challenge 2026',
  DOCUMENTS_FOLDER_NAME: 'Participant Documents',
  FEE_PER_EVENT: 200,
  VALID_EVENTS: [
    '50m Freestyle',
    '50m Backstroke',
    '50m Breaststroke',
    '50m Butterfly'
  ]
};

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const callback = clean_(params.callback);
  const token = clean_(params.token);

  if (callback && token) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
      return ContentService.createTextOutput('Invalid callback.');
    }

    const result = getSubmissionStatus_(token);
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput('Swimming Challenge API');
}

function doPost(e) {
  let submissionToken = '';

  try {
    if (!e || !e.parameter) {
      throw new Error('No registration data received.');
    }

    const data = e.parameter;
    submissionToken = clean_(data.submissionToken);

    if (!/^[A-Za-z0-9_-]{16,100}$/.test(submissionToken)) {
      throw new Error('Invalid submission token.');
    }

    setSubmissionStatus_(submissionToken, { status: 'pending' });

    const name = clean_(data.name);
    const dob = clean_(data.dob);
    const gender = clean_(data.gender);
    const whatsapp = clean_(data.whatsapp);
    const paymentReference = clean_(data.paymentReference);

    if (!name) throw new Error('Name is required.');
    if (!dob) throw new Error('Date of birth is required.');
    if (!gender) throw new Error('Gender is required.');
    if (!/^[6-9]\d{9}$/.test(whatsapp)) {
      throw new Error('Invalid WhatsApp number.');
    }

    let events = [];
    if (data.events) {
      try {
        events = JSON.parse(data.events);
      } catch (err) {
        throw new Error('Invalid events data.');
      }
    }

    if (!Array.isArray(events)) {
      throw new Error('Invalid events.');
    }

    events = [...new Set(events)].filter(event => CONFIG.VALID_EVENTS.includes(event));

    if (events.length === 0) {
      throw new Error('At least one event must be selected.');
    }

    const eventCount = events.length;
    const totalFee = eventCount * CONFIG.FEE_PER_EVENT;

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
      const sheet = getResponseSheet_();

      if (submissionTokenExists_(sheet, submissionToken)) {
        throw new Error('This registration has already been submitted.');
      }

      const registrationId = getNextRegistrationId_(sheet);
      const documentsFolder = getDocumentsFolder_();

      let dobProofUrl = '';
      if (data.dobProofBase64) {
        dobProofUrl = saveBase64File_(
          data.dobProofBase64,
          data.dobProofMimeType || 'application/octet-stream',
          `${registrationId}_DOB_Proof`,
          documentsFolder
        );
      }

      let paymentScreenshotUrl = '';
      if (data.paymentScreenshotBase64) {
        paymentScreenshotUrl = saveBase64File_(
          data.paymentScreenshotBase64,
          data.paymentScreenshotMimeType || 'application/octet-stream',
          `${registrationId}_Payment`,
          documentsFolder
        );
      }

      sheet.appendRow([
        registrationId,
        new Date(),
        name,
        dob,
        gender,
        whatsapp,
        events.join(', '),
        eventCount,
        totalFee,
        paymentReference,
        dobProofUrl,
        paymentScreenshotUrl,
        'Pending',
        submissionToken
      ]);

      setSubmissionStatus_(submissionToken, {
        status: 'success',
        registrationId,
        totalFee
      });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);

    if (submissionToken) {
      setSubmissionStatus_(submissionToken, {
        status: 'error',
        message: error.message || 'Registration failed.'
      });
    }
  }

  return ContentService.createTextOutput('OK');
}

function getResponseSheet_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(CONFIG.SHEET_NAME);
  }

  const requiredHeaders = [
    'Registration ID',
    'Timestamp',
    'Name',
    'DOB',
    'Gender',
    'WhatsApp',
    'Events',
    'Event Count',
    'Total Fee',
    'UPI Transaction ID',
    'DOB Proof',
    'Payment Screenshot',
    'Payment Status',
    'Submission Token'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
  } else {
    const lastColumn = Math.max(1, sheet.getLastColumn());
    const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
      .map(value => String(value).trim());

    requiredHeaders.forEach(header => {
      if (!currentHeaders.includes(header)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
  }

  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function getDocumentsFolder_() {
  const properties = PropertiesService.getScriptProperties();
  const savedFolderId = properties.getProperty('DOCUMENTS_FOLDER_ID');

  if (savedFolderId) {
    try {
      return DriveApp.getFolderById(savedFolderId);
    } catch (err) {}
  }

  const parentFolders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  let parentFolder;

  if (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  } else {
    parentFolder = DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
  }

  const childFolders = parentFolder.getFoldersByName(CONFIG.DOCUMENTS_FOLDER_NAME);
  let documentsFolder;

  if (childFolders.hasNext()) {
    documentsFolder = childFolders.next();
  } else {
    documentsFolder = parentFolder.createFolder(CONFIG.DOCUMENTS_FOLDER_NAME);
  }

  properties.setProperty('DOCUMENTS_FOLDER_ID', documentsFolder.getId());
  return documentsFolder;
}

function saveBase64File_(base64Data, mimeType, filename, folder) {
  if (!base64Data) return '';

  const commaIndex = base64Data.indexOf(',');
  if (commaIndex >= 0) {
    base64Data = base64Data.substring(commaIndex + 1);
  }

  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(
    bytes,
    mimeType,
    makeSafeFilename_(filename, mimeType)
  );

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  return file.getUrl();
}

function getNextRegistrationId_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'SWIM-0001';

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  let highest = 0;

  ids.forEach(id => {
    const match = String(id).match(/^SWIM-(\d+)$/);
    if (match) highest = Math.max(highest, Number(match[1]));
  });

  return 'SWIM-' + String(highest + 1).padStart(4, '0');
}

function statusKey_(token) {
  return 'REG_STATUS_' + token;
}

function setSubmissionStatus_(token, result) {
  PropertiesService.getScriptProperties().setProperty(
    statusKey_(token),
    JSON.stringify({ ...result, updatedAt: new Date().toISOString() })
  );
}

function getSubmissionStatus_(token) {
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(token)) {
    return { status: 'error', message: 'Invalid submission token.' };
  }

  const value = PropertiesService.getScriptProperties().getProperty(statusKey_(token));
  if (!value) return { status: 'pending' };

  try {
    return JSON.parse(value);
  } catch (err) {
    return { status: 'pending' };
  }
}

function submissionTokenExists_(sheet, token) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const tokenColumn = headers.indexOf('Submission Token') + 1;

  if (tokenColumn === 0 || sheet.getLastRow() < 2) return false;

  const values = sheet.getRange(2, tokenColumn, sheet.getLastRow() - 1, 1)
    .getValues().flat();

  return values.some(value => String(value) === token);
}

function clean_(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function makeSafeFilename_(name, mimeType) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_') + getExtension_(mimeType);
}

function getExtension_(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf'
  };

  return extensions[mimeType] || '';
}

function setupSwimmingChallenge() {
  getResponseSheet_();
  getDocumentsFolder_();
}
