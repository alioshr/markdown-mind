const vscode = require("vscode");

class DirectoryNode extends vscode.TreeItem {
  constructor(name, actualPath, provider) {
    super(name, vscode.TreeItemCollapsibleState.Expanded);
    this.actualPath = actualPath;
    this.provider = provider;
    this.contextValue = "folderWithActions";
    this.iconPath = new vscode.ThemeIcon("folder");
    this.id = actualPath; // Unique ID for tracking expand/collapse state
    this.tooltip = name;
  }
}

module.exports = DirectoryNode;
