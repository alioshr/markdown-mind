const vscode = require("vscode");

/**
 * Gets global directories from configuration
 * @returns {Array} Array of global directory configurations
 */
function getGlobalDirectories() {
  const config = vscode.workspace.getConfiguration("notepads");
  return config.get("globalDirectories") || [];
}

/**
 * Updates global directories in configuration
 * @param {Array} directories - Array of directory configurations to save
 * @returns {Promise} Promise that resolves when configuration is updated
 */
async function updateGlobalDirectories(directories) {
  const config = vscode.workspace.getConfiguration("notepads");
  await config.update(
    "globalDirectories",
    directories,
    vscode.ConfigurationTarget.Global
  );
}

/**
 * Sets up workspace file exclusions for .mdnotes
 */
function setupWorkspaceExcludes() {
  const configWorkspace = vscode.workspace.getConfiguration("files");
  const exclude = configWorkspace.get("exclude");
  if (!exclude[".mdnotes"]) {
    exclude[".mdnotes"] = true;
    configWorkspace.update(
      "exclude",
      exclude,
      vscode.ConfigurationTarget.Workspace
    );
  }
}

module.exports = {
  getGlobalDirectories,
  updateGlobalDirectories,
  setupWorkspaceExcludes
};
