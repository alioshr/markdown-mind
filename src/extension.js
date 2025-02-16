const vscode = require("vscode");
const { getNotesFolder } = require("./utils/fsUtils");
const { getGlobalDirectories, setupWorkspaceExcludes } = require("./utils/configUtils");
const LocalNoteTreeProvider = require("./providers/LocalNoteTreeProvider");
const GlobalNoteTreeProvider = require("./providers/GlobalNoteTreeProvider");
const { registerCommands } = require("./commands");

/**
 * Extension activation event handler
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    // Initialize notes folder and workspace settings
    const notesFolder = getNotesFolder();
    setupWorkspaceExcludes();

    // Get global directories configuration
    const globalDirectories = getGlobalDirectories();

    // Create providers for both local and global notes
    const localNoteProvider = new LocalNoteTreeProvider(notesFolder);
    const globalNoteProvider = new GlobalNoteTreeProvider(globalDirectories);

    // Register tree data providers
    vscode.window.registerTreeDataProvider("localNotepads", localNoteProvider);
    vscode.window.registerTreeDataProvider("globalNotepads", globalNoteProvider);

    // Register all commands
    registerCommands(context, { localNoteProvider, globalNoteProvider });

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to activate extension: ${error.message}`);
  }
}

/**
 * Extension deactivation event handler
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
