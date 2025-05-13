// mobile/src/services/api.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Config from '../config';

// Create axios instance
const api = axios.create({
  baseURL: Config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all notes from the server
 * @returns {Promise<Array>} Array of notes
 */
export const fetchNotes = async () => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

/**
 * Create a new note on the server
 * @param {Object} note Note object to create
 * @returns {Promise<Object>} Created note with server ID
 */
export const createNote = async (note) => {
  try {
    // Ensure the note has a UUID
    const noteWithUuid = {
      ...note,
      uuid: note.uuid || uuidv4()
    };
    
    const response = await api.post('/notes', noteWithUuid);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

/**
 * Update note on the server
 * @param {Object} note Note object to update
 * @returns {Promise<Object>} Updated note
 */
export const updateNoteOnServer = async (note) => {
  try {
    // Since we don't have a specific update endpoint, we'll use the same
    // create endpoint which handles updates when UUID exists
    const response = await api.post('/notes', note);
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

/**
 * Delete note from server
 * @param {string} noteId Note ID to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteNoteFromServer = async (noteId) => {
  try {
    // Since we didn't implement a delete endpoint in our API,
    // we should add one or handle this case appropriately
    
    // This is a placeholder for future implementation
    console.warn('Delete functionality not implemented in API');
    return { success: false, message: 'Delete not implemented in API' };
    
    // Once implemented, it would look like:
    // const response = await api.delete(`/notes/${noteId}`);
    // return response.data;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

/**
 * Sync multiple notes with the server
 * @param {Array} notes Array of notes to sync
 * @returns {Promise<Array>} Array of synced notes
 */
export const syncNotes = async (notes) => {
  try {
    if (!notes || notes.length === 0) {
      return [];
    }
    
    // Use the batch endpoint for syncing multiple notes
    const response = await api.post('/notes/batch', { notes });
    
    // Process the results and mark notes as synced
    const results = response.data.results;
    
    // Map original notes with sync status
    return notes.map(note => {
      const result = results.find(r => r.uuid === note.uuid);
      return {
        ...note,
        synced: result ? true : note.synced,
        syncStatus: result ? result.status : 'unknown'
      };
    });
  } catch (error) {
    console.error('Error syncing notes:', error);
    throw error;
  }
};

export default {
  fetchNotes,
  createNote,
  updateNoteOnServer,
  deleteNoteFromServer,
  syncNotes
};