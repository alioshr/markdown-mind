const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const { createDirectory, deleteFolderRecursive } = require("../utils/fsUtils");
const { getGlobalDirectories, updateGlobalDirectories } = require("../utils/configUtils");

/**
 * Creates a new root folder in the specified directory
 */
async function createRootFolder(dir) {
  const folderName = await vscode.window.showInputBox({
    prompt: "Enter folder name",
    placeHolder: "New Folder",
    validateInput: (value) => {
      if (!value) return "Folder name is required";
      if (value.includes("/") || value.includes("\\"))
        return "Folder name cannot contain path separators";
      return null;
    },
  });

  if (folderName) {
    try {
      const folderPath = path.join(dir.actualPath, folderName);
      if (!fs.existsSync(folderPath)) {
        createDirectory(folderPath);
        dir.provider.refresh();
      } else {
        vscode.window.showErrorMessage(`Folder '${folderName}' already exists.`);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create folder: ${error.message}`);
    }
  }
}

/**
 * Creates a subfolder in the specified directory
 */
async function addSubfolder(dir) {
  const folderName = await vscode.window.showInputBox({
    prompt: "Enter folder name",
    placeHolder: "New Folder",
  });

  if (folderName) {
    const folderPath = path.join(dir.actualPath, folderName);
    if (!fs.existsSync(folderPath)) {
      createDirectory(folderPath);
      dir.provider.refresh();
    } else {
      vscode.window.showErrorMessage(`Folder '${folderName}' already exists.`);
    }
  }
}

/**
 * Adds a new global directory
 */
async function addGlobalDirectory(globalNoteProvider) {
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select Global Notes Location",
  });

  if (result && result[0]) {
    const folderPath = result[0].fsPath;
    const name = await vscode.window.showInputBox({
      prompt: "Enter a name for this directory",
      placeHolder: "e.g., Work Notes",
    });

    if (name) {
      const globalDirectories = getGlobalDirectories();
      const newDir = { name, path: folderPath, enabled: true };
      globalDirectories.push(newDir);
      await updateGlobalDirectories(globalDirectories);
      globalNoteProvider.refresh();
    }
  }
}

/**
 * Removes a global directory
 */
async function removeGlobalDirectory(dir) {
  const response = await vscode.window.showWarningMessage(
    `Are you sure you want to remove "${dir.label}"? (Files will not be deleted)`,
    { modal: true },
    "Remove"
  );

  if (response === "Remove") {
    const globalDirectories = getGlobalDirectories().filter(
      (d) => d.path !== dir.actualPath
    );
    await updateGlobalDirectories(globalDirectories);
    dir.provider.refresh();
  }
}

/**
 * Renames a global directory
 */
async function renameGlobalDirectory(dir) {
  const newName = await vscode.window.showInputBox({
    prompt: "Enter new name for the directory",
    value: dir.label,
  });

  if (newName) {
    const globalDirectories = getGlobalDirectories();
    const dirIndex = globalDirectories.findIndex(
      (d) => d.path === dir.actualPath
    );
    if (dirIndex !== -1) {
      globalDirectories[dirIndex].name = newName;
      await updateGlobalDirectories(globalDirectories);
      dir.provider.refresh();
    }
  }
}

/**
 * Changes the location of a global directory
 */
async function editGlobalDirectoryPath(dir) {
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    title: "Select New Location",
  });

  if (result && result[0]) {
    const globalDirectories = getGlobalDirectories();
    const dirIndex = globalDirectories.findIndex(
      (d) => d.path === dir.actualPath
    );
    if (dirIndex !== -1) {
      globalDirectories[dirIndex].path = result[0].fsPath;
      await updateGlobalDirectories(globalDirectories);
      dir.provider.refresh();
    }
  }
}

/**
 * Deletes a folder and its contents
 */
async function deleteFolder(dir) {
  try {
    const hasContents = fs.readdirSync(dir.actualPath).length > 0;
    const message = hasContents
      ? `Are you sure you want to delete folder "${dir.label}" and all its contents?`
      : `Are you sure you want to delete empty folder "${dir.label}"?`;

    const response = await vscode.window.showWarningMessage(
      message,
      { modal: true },
      "Delete"
    );

    if (response === "Delete") {
      deleteFolderRecursive(dir.actualPath);
      dir.provider.refresh();
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to delete folder: ${error.message}`);
  }
}

module.exports = {
  createRootFolder,
  addSubfolder,
  addGlobalDirectory,
  removeGlobalDirectory,
  renameGlobalDirectory,
  editGlobalDirectoryPath,
  deleteFolder,
};
