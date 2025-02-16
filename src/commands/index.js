const vscode = require("vscode");
const {
  createRootFolder,
  addSubfolder,
  addGlobalDirectory,
  removeGlobalDirectory,
  renameGlobalDirectory,
  editGlobalDirectoryPath,
  deleteFolder,
} = require("./directoryCommands");

const {
  addLocalNote,
  addGlobalNote,
  openNote,
  deleteNote,
  renameNote,
} = require("./noteCommands");

/**
 * Registers all extension commands
 * @param {vscode.ExtensionContext} context
 * @param {Object} providers - Object containing note providers
 * @returns {vscode.Disposable[]} Array of registered commands
 */
function registerCommands(context, { localNoteProvider, globalNoteProvider }) {
  const commands = [
    vscode.commands.registerCommand("notepads.createRootFolder", (dir) =>
      createRootFolder(dir)
    ),
    vscode.commands.registerCommand("notepads.addSubfolder", (dir) =>
      addSubfolder(dir)
    ),
    vscode.commands.registerCommand("notepads.addGlobalDirectory", () =>
      addGlobalDirectory(globalNoteProvider)
    ),
    vscode.commands.registerCommand("notepads.removeGlobalDirectory", (dir) =>
      removeGlobalDirectory(dir)
    ),
    vscode.commands.registerCommand("notepads.renameGlobalDirectory", (dir) =>
      renameGlobalDirectory(dir)
    ),
    vscode.commands.registerCommand("notepads.editGlobalDirectoryPath", (dir) =>
      editGlobalDirectoryPath(dir)
    ),
    vscode.commands.registerCommand("notepads.deleteFolder", (dir) =>
      deleteFolder(dir)
    ),
    vscode.commands.registerCommand("notepads.addLocalNote", () =>
      addLocalNote(localNoteProvider)
    ),
    vscode.commands.registerCommand("notepads.addFileToFolder", (dir) =>
      addGlobalNote(dir, globalNoteProvider)
    ),
    vscode.commands.registerCommand("notepads.openNote", (note) =>
      openNote(note)
    ),
    vscode.commands.registerCommand("notepads.deleteNote", (note) =>
      deleteNote(note)
    ),
    vscode.commands.registerCommand("notepads.renameNote", (note) =>
      renameNote(note)
    ),
  ];

  context.subscriptions.push(...commands);
  return commands;
}

module.exports = {
  registerCommands,
};
