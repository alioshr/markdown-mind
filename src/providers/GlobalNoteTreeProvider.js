const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const DirectoryNode = require("../models/DirectoryNode");
const NoteNode = require("../models/NoteNode");
const { createNote, deleteNote, renameFile } = require("../utils/fsUtils");

class GlobalNoteTreeProvider {
  constructor(directories) {
    this.directories = directories;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  getTreeItem(element) {
    return element;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getChildren(element) {
    if (!element) {
      if (!this.directories || this.directories.length === 0) {
        const addDirectoryItem = new vscode.TreeItem(
          "Add Global Directory",
          vscode.TreeItemCollapsibleState.None
        );
        addDirectoryItem.command = {
          command: "notepads.addGlobalDirectory",
          title: "Add Global Directory",
        };
        addDirectoryItem.iconPath = new vscode.ThemeIcon("add");
        addDirectoryItem.contextValue = "addDirectory";
        return [addDirectoryItem];
      }

      // Return root level directories with all actions enabled
      return this.directories.map((dir) => {
        const node = new DirectoryNode(dir.name, dir.path, this);
        // Add both folder actions and global directory operations
        node.contextValue = "folderWithActions globalDirectory";
        return node;
      });
    }

    if (element instanceof DirectoryNode) {
      try {
        const entries = fs.readdirSync(element.actualPath, {
          withFileTypes: true,
        });
        const items = [];

        // First add directories
        items.push(
          ...entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => {
              const fullPath = path.join(element.actualPath, entry.name);
              const subNode = new DirectoryNode(entry.name, fullPath, this);
              subNode.contextValue = "folderWithActions";
              return subNode;
            })
        );

        // Then add markdown files
        items.push(
          ...entries
            .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
            .map((entry) => {
              const fullPath = path.join(element.actualPath, entry.name);
              return new NoteNode(entry.name, fullPath, this);
            })
        );

        if (items.length === 0) {
          const createNoteItem = new vscode.TreeItem(
            "Create new note",
            vscode.TreeItemCollapsibleState.None
          );
          createNoteItem.command = {
            command: "notepads.addFileToFolder",
            title: "New Note",
            arguments: [element],
          };
          createNoteItem.iconPath = new vscode.ThemeIcon("add");
          createNoteItem.contextValue = "createNote";
          return [createNoteItem];
        }

        return items;
      } catch (error) {
        return [];
      }
    }

    return [];
  }

  async addNote(directory) {
    const notesFolder = directory.actualPath;
    const noteName = await vscode.window.showInputBox({
      prompt: "Enter note name",
      placeHolder: "New Note",
      validateInput: (value) => {
        if (!value) return "Note name is required";
        if (value.includes("/") || value.includes("\\")) 
          return "Note name cannot contain path separators";
        return null;
      }
    });

    if (noteName) {
      const notePath = await createNote(notesFolder, noteName);
      this._onDidChangeTreeData.fire();
      
      // Open and focus the new note
      const doc = await vscode.workspace.openTextDocument(notePath);
      await vscode.window.showTextDocument(doc);
    }
  }

  async openNote(note) {
    const doc = await vscode.workspace.openTextDocument(note.actualPath);
    await vscode.window.showTextDocument(doc);
  }

  async deleteNote(note) {
    const response = await vscode.window.showWarningMessage(
      `Are you sure you want to delete "${note.label}"?`,
      { modal: true },
      "Delete"
    );

    if (response === "Delete") {
      deleteNote(note.actualPath);
      this._onDidChangeTreeData.fire();
    }
  }

  async renameNote(note) {
    const newName = await vscode.window.showInputBox({
      prompt: "Enter new name for the note",
      value: path.parse(note.label).name,
    });

    if (newName) {
      const dir = path.dirname(note.actualPath);
      const newPath = path.join(dir, newName + ".md");
      renameFile(note.actualPath, newPath);
      this._onDidChangeTreeData.fire();
    }
  }
}

module.exports = GlobalNoteTreeProvider;
