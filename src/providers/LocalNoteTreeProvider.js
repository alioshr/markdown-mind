const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const NoteNode = require("../models/NoteNode");
const { createNote, deleteNote, renameFile } = require("../utils/fsUtils");

class LocalNoteTreeProvider {
  constructor(notesFolder) {
    this.notesFolder = notesFolder;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  updateNotesFolder(newPath) {
    this.notesFolder = newPath;
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    try {
      const files = fs
        .readdirSync(this.notesFolder)
        .filter((file) => file.endsWith(".md"));

      if (files.length === 0) {
        const createNoteItem = new vscode.TreeItem(
          "Create new note",
          vscode.TreeItemCollapsibleState.None
        );
        createNoteItem.command = {
          command: "notepads.addLocalNote",
          title: "MarkdownMind: New Note",
        };
        createNoteItem.iconPath = new vscode.ThemeIcon("add");
        createNoteItem.contextValue = "createNote";
        return [createNoteItem];
      }

      return files.map((file) => {
        const fullPath = path.join(this.notesFolder, file);
        return new NoteNode(file, fullPath, this);
      });
    } catch (error) {
      return [];
    }
  }

  async addNote() {
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
      const notePath = await createNote(this.notesFolder, noteName);
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
      const newPath = path.join(this.notesFolder, newName + ".md");
      renameFile(note.actualPath, newPath);
      this._onDidChangeTreeData.fire();
    }
  }
}

module.exports = LocalNoteTreeProvider;
