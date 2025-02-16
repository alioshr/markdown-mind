const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const { createNote } = require("../utils/fsUtils");

/**
 * Adds a new note to the specified folder
 */
async function addLocalNote(provider) {
  await provider.addNote();
}

/**
 * Adds a note to a global directory
 */
async function addGlobalNote(directory, provider) {
  await provider.addNote(directory);
}

/**
 * Opens a note in the editor
 */
async function openNote(note) {
  await note.provider.openNote(note);
}

/**
 * Deletes a note after confirmation
 */
async function deleteNote(note) {
  await note.provider.deleteNote(note);
}

/**
 * Renames a note
 */
async function renameNote(note) {
  await note.provider.renameNote(note);
}

module.exports = {
  addLocalNote,
  addGlobalNote,
  openNote,
  deleteNote,
  renameNote,
};
