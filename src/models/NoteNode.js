const vscode = require("vscode");

class NoteNode extends vscode.TreeItem {
  constructor(name, actualPath, provider) {
    super(name, vscode.TreeItemCollapsibleState.None);
    this.actualPath = actualPath;
    this.provider = provider;
    this.contextValue = "note";
    this.command = {
      command: "notepads.openNote",
      title: "Open Note",
      arguments: [this],
    };
  }
}

module.exports = NoteNode;
