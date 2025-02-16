const fs = require("fs");
const path = require("path");
const vscode = require("vscode");

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - Path to create directory
 */
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Recursively deletes a directory and its contents
 * @param {string} dirPath - Path to directory to delete
 */
function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

/**
 * Creates a new note file
 * @param {string} notesFolder - Directory to create note in
 * @param {string} noteName - Name of the note
 * @returns {Promise<string>} Path to the created note
 */
async function createNote(notesFolder, noteName) {
  let finalName = noteName;
  let counter = 1;
  
  while (fs.existsSync(path.join(notesFolder, finalName + ".md"))) {
    finalName = `${noteName}_${counter}`;
    counter++;
  }

  const notePath = path.join(notesFolder, finalName + ".md");
  fs.writeFileSync(notePath, "");
  return notePath;
}

/**
 * Deletes a note file
 * @param {string} notePath - Path to note to delete
 */
function deleteNote(notePath) {
  fs.unlinkSync(notePath);
}

/**
 * Renames a file
 * @param {string} oldPath - Current path of the file
 * @param {string} newPath - New path for the file
 */
function renameFile(oldPath, newPath) {
  fs.renameSync(oldPath, newPath);
}

/**
 * Gets base notes folder for the workspace
 * @returns {string} Path to notes folder
 */
function getNotesFolder() {
  const baseFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 
    process.env.HOME || 
    process.env.USERPROFILE;
  const notesFolder = path.join(baseFolder, ".mdnotes");
  createDirectory(notesFolder);
  return notesFolder;
}

module.exports = {
  createDirectory,
  deleteFolderRecursive,
  createNote,
  deleteNote,
  renameFile,
  getNotesFolder
};
