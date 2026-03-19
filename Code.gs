const PROJECT_FOLDER_PROPERTY_KEY = 'ProjectFolderId';
const PROJECT_FOLDER_NAME = 'EdTechProjects App';
const SESSIONS_FILE_NAME = 'sessions.json';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('edTechDecisionGuide')
    .setTitle('EdTech Decision Making Guide');
}

function getAppData() {
  const folder = getOrCreateProjectFolder_();
  const sessions = readSessions_();

  return {
    folderId: folder.getId(),
    folderName: folder.getName(),
    sessions: sessions,
  };
}

function saveSessions(sessions) {
  if (!sessions || typeof sessions !== 'object') {
    throw new Error('Invalid sessions payload.');
  }

  const folder = getOrCreateProjectFolder_();
  const content = JSON.stringify(sessions, null, 2);
  const file = getOrCreateSessionsFile_(folder);
  file.setContent(content);

  return {
    ok: true,
    folderId: folder.getId(),
    updatedAt: new Date().toISOString(),
  };
}

function getProjectFolderStatus() {
  const folder = getOrCreateProjectFolder_();
  return {
    folderId: folder.getId(),
    folderName: folder.getName(),
  };
}

function readSessions_() {
  const folder = getOrCreateProjectFolder_();
  const fileIter = folder.getFilesByName(SESSIONS_FILE_NAME);
  if (!fileIter.hasNext()) {
    return {};
  }

  const file = fileIter.next();
  const content = file.getBlob().getDataAsString();
  if (!content || !content.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to parse sessions.json:', error);
    return {};
  }
}

function getOrCreateSessionsFile_(folder) {
  const fileIter = folder.getFilesByName(SESSIONS_FILE_NAME);
  if (fileIter.hasNext()) {
    return fileIter.next();
  }

  return folder.createFile(SESSIONS_FILE_NAME, '{}', MimeType.PLAIN_TEXT);
}

function getOrCreateProjectFolder_() {
  const userProps = PropertiesService.getUserProperties();
  const savedFolderId = userProps.getProperty(PROJECT_FOLDER_PROPERTY_KEY);

  if (savedFolderId) {
    try {
      const folder = DriveApp.getFolderById(savedFolderId);
      folder.getName();
      return folder;
    } catch (error) {
      console.warn('Saved ProjectFolderId is invalid. Creating or finding folder by name.', error);
    }
  }

  const folder = findOrCreateProjectFolderByName_();
  userProps.setProperty(PROJECT_FOLDER_PROPERTY_KEY, folder.getId());
  return folder;
}

function findOrCreateProjectFolderByName_() {
  const folders = DriveApp.getFoldersByName(PROJECT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(PROJECT_FOLDER_NAME);
}
